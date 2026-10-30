"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db } from "@/firebase/firebaseconfig"
import { getAuthToken } from "@/lib/getAuthToken"
import { generateIndependentInvoicePDF } from "@/utils/generateIndependentInvoicePDF"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import {
  FileText,
  Receipt,
  Upload,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  Download,
  RefreshCw,
  ExternalLink,
  Eye,
  X,
  Building,
  User,
  Mail,
  Phone,
  FileCheck,
  ShieldCheck,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function RequestedInvoicesPage() {
  const router = useRouter()
  const storage = getStorage()

  const [orders, setOrders] = useState([])
  const [independentBills, setIndependentBills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusTab, setStatusTab] = useState("all") // all, pending, awaiting_payment, overdue, paid

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Invoice Upload/Select State
  const [selectedBillId, setSelectedBillId] = useState("")
  const [invoiceFileInput, setInvoiceFileInput] = useState(null)
  const [invoiceNumberInput, setInvoiceNumberInput] = useState("")
  const [isDispatchingInvoice, setIsDispatchingInvoice] = useState(false)

  // Reminder State
  const [isSendingReminder, setIsSendingReminder] = useState(false)

  // Payment Confirmation State
  const [paymentProofFile, setPaymentProofFile] = useState(null)
  const [paymentRefNumber, setPaymentRefNumber] = useState("")
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)

  useEffect(() => {
    fetchOrdersAndBills()
  }, [])

  const fetchOrdersAndBills = async () => {
    try {
      setIsLoading(true)

      // Fetch certification orders
      const ordersRef = collection(db, "certification_orders")
      const ordersSnapshot = await getDocs(ordersRef)

      const fetchedOrders = []
      ordersSnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        // Capture orders with paymentType === "Request Invoice" OR in requested invoice workflow
        const isInvoiceOrder =
          data.paymentType === "Request Invoice" ||
          data.order_status === "Requested invoice" ||
          data.order_status === "Invoice sent, awaiting samples" ||
          Boolean(data.invoiceRequestedAt) ||
          Boolean(data.invoiceUrl)

        if (isInvoiceOrder) {
          const timestamp = data.timestamp
            ? data.timestamp.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp)
            : new Date()

          let invoiceSentAt = null
          if (data.invoiceSentAt) {
            invoiceSentAt = data.invoiceSentAt.toDate
              ? data.invoiceSentAt.toDate()
              : new Date(data.invoiceSentAt)
          }

          fetchedOrders.push({
            id: docSnap.id,
            ...data,
            timestamp,
            invoiceSentAt,
          })
        }
      })

      // Sort newest first
      fetchedOrders.sort((a, b) => b.timestamp - a.timestamp)
      setOrders(fetchedOrders)

      // Fetch Independent Bills for quick selection
      try {
        const billsRef = collection(db, "IndependentManualBills")
        const billsQuery = query(billsRef, orderBy("timestamp", "desc"))
        const billsSnapshot = await getDocs(billsQuery)
        const bills = billsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        setIndependentBills(bills)
      } catch (err) {
        console.warn("Could not fetch IndependentManualBills:", err)
      }
    } catch (error) {
      console.error("Error fetching requested invoice orders:", error)
      toast.error("Failed to load invoice orders.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Trigger automated overdue check and refresh
  const handleCheckOverdueAndRefresh = async () => {
    try {
      setIsRefreshing(true)
      const token = await getAuthToken()
      const res = await fetch("/api/admin/check-overdue-invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      const data = await res.json()
      if (res.ok) {
        if (data.remindersDispatched > 0) {
          toast.info(`Automated check: Dispatched ${data.remindersDispatched} overdue payment reminders.`)
        } else {
          toast.success("All invoices up to date. List refreshed.")
        }
      }
    } catch (err) {
      console.warn("Overdue check error:", err)
    } finally {
      await fetchOrdersAndBills()
    }
  }

  // Helper to compute 15-day credit stats
  const getInvoiceTiming = (order) => {
    if (!order.invoiceSentAt) {
      return { status: "pending", daysElapsed: 0, daysRemaining: 15, isOverdue: false }
    }

    const now = new Date()
    const diffMs = now.getTime() - order.invoiceSentAt.getTime()
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const daysRemaining = 15 - daysElapsed
    const isOverdue = daysRemaining < 0

    return {
      status: isOverdue ? "overdue" : "active",
      daysElapsed,
      daysRemaining: Math.max(0, daysRemaining),
      isOverdue,
    }
  }

  // Analytics KPIs
  const stats = useMemo(() => {
    const total = orders.length
    let pendingInvoice = 0
    let awaitingPayment = 0
    let overdue = 0
    let paid = 0

    orders.forEach((order) => {
      const isPaid =
        order.paymentStatus === "Paid" ||
        order.order_status === "Payment received, awaiting samples" ||
        order.order_status === "Samples received, testing in 72 hrs" ||
        order.order_status === "Certification Completed"

      if (isPaid) {
        paid++
      } else if (order.order_status === "Requested invoice" || !order.invoiceSentAt) {
        pendingInvoice++
      } else {
        const { isOverdue } = getInvoiceTiming(order)
        if (isOverdue) {
          overdue++
        } else {
          awaitingPayment++
        }
      }
    })

    return { total, pendingInvoice, awaitingPayment, overdue, paid }
  }, [orders])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        [
          order.orderId,
          order.id,
          order.companyName,
          order.contactPerson,
          order.name,
          order.email,
          order.contactNumber,
          order.productName,
          order.invoiceNumber,
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))

      if (!matchesSearch) return false

      // Tab filter
      const isPaid =
        order.paymentStatus === "Paid" ||
        order.order_status === "Payment received, awaiting samples" ||
        order.order_status === "Samples received, testing in 72 hrs" ||
        order.order_status === "Certification Completed"

      if (statusTab === "pending") {
        return !isPaid && (order.order_status === "Requested invoice" || !order.invoiceSentAt)
      }
      if (statusTab === "awaiting_payment") {
        if (isPaid || order.order_status === "Requested invoice" || !order.invoiceSentAt) return false
        const { isOverdue } = getInvoiceTiming(order)
        return !isOverdue
      }
      if (statusTab === "overdue") {
        if (isPaid || order.order_status === "Requested invoice" || !order.invoiceSentAt) return false
        const { isOverdue } = getInvoiceTiming(order)
        return isOverdue
      }
      if (statusTab === "paid") {
        return isPaid
      }

      return true
    })
  }, [orders, searchQuery, statusTab])

  // Open Upload/Select Invoice Modal
  const openInvoiceModal = (order) => {
    setSelectedOrder(order)
    setInvoiceNumberInput(order.invoiceNumber || "")
    setSelectedBillId("")
    setInvoiceFileInput(null)
    setIsInvoiceModalOpen(true)
  }

  // Handle Dispatch Invoice to Customer
  const handleDispatchInvoice = async () => {
    if (!selectedOrder) return

    let finalInvoiceUrl = selectedOrder.invoiceUrl || ""
    let finalInvoiceNumber = invoiceNumberInput.trim()

    try {
      setIsDispatchingInvoice(true)

      // 1. If an independent bill from Firestore is selected
      if (selectedBillId) {
        const selectedBill = independentBills.find((b) => b.id === selectedBillId)
        if (selectedBill) {
          finalInvoiceNumber = selectedBill.invoiceNumber || finalInvoiceNumber

          // Generate PDF Blob in-memory
          const pdfDoc = generateIndependentInvoicePDF(selectedBill)
          const pdfBlob = pdfDoc.output("blob")

          // Upload to Firebase Storage
          const storageFileName = `invoices/${selectedOrder.id || selectedOrder.orderId}_invoice_${Date.now()}.pdf`
          const storageReference = ref(storage, storageFileName)
          await uploadBytes(storageReference, pdfBlob)
          finalInvoiceUrl = await getDownloadURL(storageReference)
        }
      } else if (invoiceFileInput) {
        // 2. If a manual file was uploaded
        const fileExt = invoiceFileInput.name.split(".").pop() || "pdf"
        const storageFileName = `invoices/${selectedOrder.id || selectedOrder.orderId}_invoice_${Date.now()}.${fileExt}`
        const storageReference = ref(storage, storageFileName)
        await uploadBytes(storageReference, invoiceFileInput)
        finalInvoiceUrl = await getDownloadURL(storageReference)
      }

      if (!finalInvoiceUrl) {
        toast.error("Please upload an invoice PDF or select an invoice from the dropdown.")
        setIsDispatchingInvoice(false)
        return
      }

      if (!finalInvoiceNumber) {
        toast.error("Please provide an invoice number.")
        setIsDispatchingInvoice(false)
        return
      }

      const orderRef = doc(db, "certification_orders", selectedOrder.id || selectedOrder.orderId)
      const now = new Date()

      const updateData = {
        order_status: "Invoice sent, awaiting samples",
        invoiceStatus: "Invoice Sent",
        invoiceNumber: finalInvoiceNumber,
        invoiceUrl: finalInvoiceUrl,
        invoiceSentAt: serverTimestamp(),
        paymentDueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        autoReminderSent: false,
      }

      await updateDoc(orderRef, updateData)

      // 3. Dispatch Email to Client with attached PDF + download link
      const emailPayload = {
        ...selectedOrder,
        userEmail: selectedOrder.email,
        userName: selectedOrder.contactPerson || selectedOrder.name,
        orderId: selectedOrder.orderId || selectedOrder.id,
        invoiceNumber: finalInvoiceNumber,
        invoiceUrl: finalInvoiceUrl,
        category: selectedOrder.category || "Flooring",
        companyName: selectedOrder.companyName,
        productName: selectedOrder.productName,
        totalPriceINR: selectedOrder.totalPriceINR,
        convertedPriceWithSymbol: selectedOrder.convertedPriceWithSymbol,
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      }

      const token = await getAuthToken()
      const emailRes = await fetch("/api/sendInvoiceEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(emailPayload),
      })

      if (!emailRes.ok) {
        console.warn("Invoice email dispatch warning")
      }

      toast.success("Invoice uploaded & dispatched to customer successfully!")
      setIsInvoiceModalOpen(false)
      await fetchOrdersAndBills()
    } catch (error) {
      console.error("Error dispatching invoice:", error)
      toast.error(`Failed to dispatch invoice: ${error.message}`)
    } finally {
      setIsDispatchingInvoice(false)
    }
  }

  // Open Manual Reminder Modal
  const openReminderModal = (order) => {
    setSelectedOrder(order)
    setIsReminderModalOpen(true)
  }

  // Send Manual 15-Day Reminder
  const handleSendReminder = async () => {
    if (!selectedOrder) return

    try {
      setIsSendingReminder(true)
      const token = await getAuthToken()

      const emailPayload = {
        ...selectedOrder,
        userEmail: selectedOrder.email,
        userName: selectedOrder.contactPerson || selectedOrder.name,
        orderId: selectedOrder.orderId || selectedOrder.id,
        invoiceNumber: selectedOrder.invoiceNumber,
        invoiceUrl: selectedOrder.invoiceUrl,
        isReminder: true,
        category: selectedOrder.category || "Flooring",
        companyName: selectedOrder.companyName,
        productName: selectedOrder.productName,
        totalPriceINR: selectedOrder.totalPriceINR,
        convertedPriceWithSymbol: selectedOrder.convertedPriceWithSymbol,
      }

      const emailRes = await fetch("/api/sendInvoiceEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(emailPayload),
      })

      if (!emailRes.ok) {
        throw new Error("Failed to send reminder email")
      }

      // Update reminder count & timestamp
      const orderRef = doc(db, "certification_orders", selectedOrder.id || selectedOrder.orderId)
      await updateDoc(orderRef, {
        lastReminderSentAt: serverTimestamp(),
        reminderCount: (selectedOrder.reminderCount || 0) + 1,
      })

      toast.success("15-Day payment reminder dispatched successfully!")
      setIsReminderModalOpen(false)
      await fetchOrdersAndBills()
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast.error(`Failed to send reminder: ${error.message}`)
    } finally {
      setIsSendingReminder(false)
    }
  }

  // Open Payment Received Modal
  const openPaymentModal = (order) => {
    setSelectedOrder(order)
    setPaymentRefNumber("")
    setPaymentProofFile(null)
    setIsPaymentModalOpen(true)
  }

  // Confirm Payment Received
  const handleConfirmPayment = async () => {
    if (!selectedOrder) return

    try {
      setIsConfirmingPayment(true)

      let proofUrl = ""
      if (paymentProofFile) {
        const fileExt = paymentProofFile.name.split(".").pop() || "jpg"
        const storageFileName = `payment-receipts/${selectedOrder.id || selectedOrder.orderId}_receipt_${Date.now()}.${fileExt}`
        const storageReference = ref(storage, storageFileName)
        await uploadBytes(storageReference, paymentProofFile)
        proofUrl = await getDownloadURL(storageReference)
      }

      const orderRef = doc(db, "certification_orders", selectedOrder.id || selectedOrder.orderId)
      const updateData = {
        order_status: "Payment received, awaiting samples",
        paymentStatus: "Paid",
        paymentReceivedAt: serverTimestamp(),
        paymentProofNumber: paymentRefNumber.trim() || "N/A",
        ...(proofUrl ? { paymentReceipt: proofUrl } : {}),
      }

      await updateDoc(orderRef, updateData)

      // Notify customer that payment has been acknowledged
      try {
        const token = await getAuthToken()
        const emailPayload = {
          userEmail: selectedOrder.email,
          userName: selectedOrder.contactPerson || selectedOrder.name,
          orderId: selectedOrder.orderId || selectedOrder.id,
          newStatus: "Payment received, awaiting samples",
          paymentType: "Bank Transfer (Invoice Settled)",
          category: selectedOrder.category || "Flooring",
          companyName: selectedOrder.companyName,
          productName: selectedOrder.productName,
          totalPriceINR: selectedOrder.totalPriceINR,
          convertedPriceWithSymbol: selectedOrder.convertedPriceWithSymbol,
          timestamp: new Date().toISOString(),
        }

        await fetch("/api/sendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(emailPayload),
        })
      } catch (emailErr) {
        console.warn("Payment acknowledgement email note:", emailErr)
      }

      toast.success("Payment marked as received! Order transitioned into testing flow.")
      setIsPaymentModalOpen(false)
      await fetchOrdersAndBills()
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast.error(`Failed to confirm payment: ${error.message}`)
    } finally {
      setIsConfirmingPayment(false)
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Receipt className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Requested Invoices & Pay Later
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Manage corporate credit orders, attach official tax invoices, track 15-day payment countdowns, and reconcile payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCheckOverdueAndRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-slate-700 bg-white border-slate-300 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Check 15-Day Reminders & Refresh</span>
          </Button>

          <Link href="/admin/independent-invoice" target="_blank">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
              <span>Create Independent Invoice</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Generation</p>
              <h3 className="text-2xl font-bold text-amber-900 mt-1">{stats.pendingInvoice}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm bg-blue-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Awaiting Payment</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{stats.awaitingPayment}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-sm bg-red-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Overdue (&gt;15 Days)</p>
              <h3 className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-sm bg-emerald-50/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Settled & Paid</p>
              <h3 className="text-2xl font-bold text-emerald-900 mt-1">{stats.paid}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
        {/* Controls Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: `All Orders (${stats.total})` },
              { key: "pending", label: `Pending Invoice (${stats.pendingInvoice})` },
              { key: "awaiting_payment", label: `In 15d Window (${stats.awaitingPayment})` },
              { key: "overdue", label: `Overdue (${stats.overdue})` },
              { key: "paid", label: `Settled (${stats.paid})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusTab === tab.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by order, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white border-slate-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Company & Client</th>
                <th className="py-3.5 px-4">Flooring System</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status & 15-Day Countdown</th>
                <th className="py-3.5 px-4">Invoice Details</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Loading requested invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No requested invoice orders found</p>
                      <p className="text-xs text-slate-400">Orders placed with 'Request Invoice & Pay Later' will populate here automatically.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid =
                    order.paymentStatus === "Paid" ||
                    order.order_status === "Payment received, awaiting samples" ||
                    order.order_status === "Samples received, testing in 72 hrs" ||
                    order.order_status === "Certification Completed"

                  const timing = getInvoiceTiming(order)

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                    >
                      {/* Order ID & Date */}
                      <td className="py-4 px-4 font-mono font-bold text-xs text-blue-600">
                        <div className="flex flex-col">
                          <span
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsDetailsModalOpen(true)
                            }}
                            className="cursor-pointer hover:underline"
                          >
                            {order.orderId || order.id}
                          </span>
                          <span className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {order.timestamp?.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Company & Client */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-semibold text-slate-800 text-xs truncate" title={order.companyName}>
                            {order.companyName || "N/A"}
                          </span>
                          <span className="text-xs text-slate-500 truncate">{order.contactPerson || order.name}</span>
                          <span className="text-[11px] text-slate-400 truncate">{order.email}</span>
                        </div>
                      </td>

                      {/* Flooring Specs */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col max-w-[180px]">
                          <span className="font-medium text-slate-800 text-xs truncate">
                            {order.productName || "Sports Flooring"}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            {order.flooringType || order.flooringConstruction || "N/A"}
                          </span>
                          {order.totalThickness && (
                            <span className="text-[10px] text-slate-400">{order.totalThickness} mm</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-bold text-slate-900 text-xs">
                        <div className="flex flex-col">
                          <span>{order.convertedPriceWithSymbol || "₹ 70,800"}</span>
                          <span className="text-[10px] font-normal text-slate-400">(incl. 18% GST)</span>
                        </div>
                      </td>

                      {/* Status & 15-Day Countdown */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {isPaid ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-bold">
                              ✓ Payment Received
                            </Badge>
                          ) : order.order_status === "Requested invoice" || !order.invoiceSentAt ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[11px] font-bold">
                              ⏳ Awaiting Invoice Dispatch
                            </Badge>
                          ) : timing.isOverdue ? (
                            <Badge className="bg-red-100 text-red-900 border-red-300 text-[11px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Overdue ({timing.daysElapsed - 15}d past term)</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-900 border-blue-300 text-[11px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Day {timing.daysElapsed} of 15 ({timing.daysRemaining}d left)</span>
                            </Badge>
                          )}

                          <span className="text-[10px] text-slate-400">
                            {order.order_status}
                          </span>
                        </div>
                      </td>

                      {/* Invoice Details */}
                      <td className="py-4 px-4 text-xs">
                        {order.invoiceNumber ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800 text-xs">
                              {order.invoiceNumber}
                            </span>
                            {order.invoiceUrl && (
                              <a
                                href={order.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View PDF</span>
                              </a>
                            )}
                            {order.reminderCount > 0 && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {order.reminderCount} reminder(s) sent
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Not generated yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Upload / Send Invoice */}
                          <button
                            onClick={() => openInvoiceModal(order)}
                            title={order.invoiceNumber ? "Re-upload or Update Invoice" : "Upload & Send Invoice"}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{order.invoiceNumber ? "Edit Invoice" : "Send Invoice"}</span>
                          </button>

                          {/* 15-Day Reminder (Active if invoice sent & unpaid) */}
                          {!isPaid && order.invoiceSentAt && (
                            <button
                              onClick={() => openReminderModal(order)}
                              title="Send 15-Day Payment Reminder Email"
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                timing.isOverdue
                                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 animate-pulse"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Remind</span>
                            </button>
                          )}

                          {/* Payment Received Button */}
                          {!isPaid && (
                            <button
                              onClick={() => openPaymentModal(order)}
                              title="Mark Payment Received"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Upload & Send Invoice Modal */}
      {isInvoiceModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Attach & Send Official Invoice
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order ID: <span className="font-mono font-bold text-slate-800">{selectedOrder.orderId || selectedOrder.id}</span>
                </p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl text-xs text-blue-900 leading-relaxed">
                <p className="font-bold mb-1">Sending invoice to customer:</p>
                <p>
                  <strong>Recipient:</strong> {selectedOrder.contactPerson || selectedOrder.name} &lt;{selectedOrder.email}&gt;
                </p>
                <p>
                  <strong>Company:</strong> {selectedOrder.companyName || "N/A"}
                </p>
                <p className="mt-1 text-blue-800">
                  On sending, the invoice PDF will be attached to the email, with a direct download link and Brainwave bank details, initiating the 15-day payment countdown.
                </p>
              </div>

              {/* Option A: Pick from Independent Bills */}
              {independentBills.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Option A: Pick from Saved Independent Invoices
                  </label>
                  <select
                    value={selectedBillId}
                    onChange={(e) => {
                      setSelectedBillId(e.target.value)
                      const picked = independentBills.find((b) => b.id === e.target.value)
                      if (picked && picked.invoiceNumber) {
                        setInvoiceNumberInput(picked.invoiceNumber)
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Choose already generated bill from system --</option>
                    {independentBills.map((bill) => (
                      <option key={bill.id} value={bill.id}>
                        {bill.invoiceNumber || "No Num"} - {bill.customerInfo?.company || bill.customerInfo?.name || "Client"} (₹{bill.taxes?.finalTotal?.toLocaleString("en-IN") || "0"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Link to generate */}
              <div className="text-right">
                <Link
                  href="/admin/independent-invoice"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <span>Need to create a new invoice? Open Generator ↗</span>
                </Link>
              </div>

              {/* Option B: Manual PDF Upload */}
              <div className="space-y-2 border-t pt-4 border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  Option B: Or Upload Invoice PDF from Computer
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setInvoiceFileInput(e.target.files[0] || null)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />
              </div>

              {/* Invoice Number Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Invoice Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. BW/2026-27/042"
                  value={invoiceNumberInput}
                  onChange={(e) => setInvoiceNumberInput(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsInvoiceModalOpen(false)}
                disabled={isDispatchingInvoice}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDispatchInvoice}
                disabled={isDispatchingInvoice || (!selectedBillId && !invoiceFileInput && !selectedOrder.invoiceUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2"
              >
                {isDispatchingInvoice ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Invoice & Start 15d Term</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Send 15-Day Reminder Modal */}
      {isReminderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-amber-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Send 15-Day Payment Reminder
              </h3>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p>
                You are about to dispatch an official payment reminder to:
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p><strong>Customer:</strong> {selectedOrder.contactPerson || selectedOrder.name}</p>
                <p><strong>Company:</strong> {selectedOrder.companyName || "N/A"}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Order ID:</strong> {selectedOrder.orderId || selectedOrder.id}</p>
                <p><strong>Invoice No.:</strong> {selectedOrder.invoiceNumber || "N/A"}</p>
                <p><strong>Reminders Sent So Far:</strong> {selectedOrder.reminderCount || 0}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 leading-relaxed">
                This email politely reminds the client that the 15-day payment term has matured and invoice clearance is required to furnish official playability testing and certification reports.
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsReminderModalOpen(false)}
                disabled={isSendingReminder}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendReminder}
                disabled={isSendingReminder}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2"
              >
                {isSendingReminder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Dispatching Reminder...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reminder Now</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Mark Payment Received Modal */}
      {isPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-emerald-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Confirm Payment Receipt
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong>Order ID:</strong> {selectedOrder.orderId || selectedOrder.id}</p>
                <p><strong>Company:</strong> {selectedOrder.companyName || "N/A"}</p>
                <p><strong>Payable Fee:</strong> {selectedOrder.convertedPriceWithSymbol || "₹ 70,800"}</p>
                <p><strong>Invoice Number:</strong> {selectedOrder.invoiceNumber || "N/A"}</p>
              </div>

              {/* Transaction Ref */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Bank Reference / UTR Number (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. UTR1234567890"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              {/* Upload Proof */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Upload Payment Screenshot / Advice (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPaymentProofFile(e.target.files[0] || null)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-emerald-100 file:text-emerald-700"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                Marking this payment will transition the order to <strong>"Payment received, awaiting samples"</strong> and automatically notify the customer.
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={isConfirmingPayment}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isConfirmingPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
              >
                {isConfirmingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Recording Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Payment Received</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Order Details Drawer/Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Flooring Order Full Specifications</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrder.orderId || selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Client Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 border-b pb-2 text-sm">Client / Applicant Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>Company:</strong> {selectedOrder.companyName || "N/A"}</p>
                  <p><strong>Contact Person:</strong> {selectedOrder.contactPerson || selectedOrder.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.contactNumber}</p>
                  <p><strong>Country:</strong> {selectedOrder.country || "India"}</p>
                  <p><strong>State:</strong> {selectedOrder.state || "N/A"}</p>
                  <p><strong>GSTIN:</strong> {selectedOrder.gstin || "N/A"}</p>
                  <p><strong>Client Type:</strong> {Array.isArray(selectedOrder.clientType) ? selectedOrder.clientType.join(", ") : (selectedOrder.clientType || "N/A")}</p>
                </div>
              </div>

              {/* Sample Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 border-b pb-2 text-sm">Sample Technical Specifications</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>Product Name:</strong> {selectedOrder.productName || "N/A"}</p>
                  <p><strong>Manufacturer:</strong> {selectedOrder.flooringManufacturer || "N/A"}</p>
                  <p><strong>Brand:</strong> {selectedOrder.brandName || "N/A"}</p>
                  <p><strong>Flooring Type:</strong> {selectedOrder.flooringType || "N/A"}</p>
                  <p><strong>Construction:</strong> {selectedOrder.flooringConstruction || "N/A"}</p>
                  <p><strong>Total Thickness:</strong> {selectedOrder.totalThickness ? `${selectedOrder.totalThickness} mm` : "N/A"}</p>
                  <p><strong>Dimensions:</strong> {selectedOrder.sampleDimensions || "500mm x 500mm"}</p>
                  <p><strong>Colour / Finish:</strong> {selectedOrder.colorFinish || "N/A"}</p>
                  <p><strong>Batch / Lot:</strong> {selectedOrder.batchNumber || "N/A"}</p>
                  <p><strong>Manufacture Date:</strong> {selectedOrder.dateOfManufacture || "N/A"}</p>
                  <p><strong>Purpose of Testing:</strong> {selectedOrder.purposeOfTesting || "N/A"}</p>
                  <p><strong>Applicable Standard:</strong> {selectedOrder.standardsUsed || "Not specified"}</p>
                </div>
                {selectedOrder.layerDetails && (
                  <div className="pt-2 border-t mt-2">
                    <p className="font-semibold mb-1">Layer Details / Composition:</p>
                    <p className="bg-white p-2 rounded border border-slate-200 font-mono text-[11px] whitespace-pre-wrap">
                      {selectedOrder.layerDetails}
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Photo */}
              {selectedOrder.flooringImage && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 border-b pb-2 text-sm mb-3">Sample Specimen Photo</h4>
                  <div className="flex justify-center">
                    <img
                      src={selectedOrder.flooringImage}
                      alt="Flooring Specimen"
                      className="max-h-60 rounded-lg shadow-sm border object-contain bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
