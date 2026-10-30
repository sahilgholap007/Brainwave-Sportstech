"use client"
import { useState, useEffect, useMemo } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { Check, Plus, Trash2, RefreshCw, Search, Filter, X, CheckSquare, Square, Building2, Package } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "react-toastify"
import { generateStandardInvoicePDF } from "@/utils/generateStandardInvoicePDF"
import { convertNumberToWords } from "../utils/numberToWords"

function getServiceDescription(category) {
  if (!category) return "Technical testing and analysis services"
  const cat = category.toLowerCase()
  if (cat.includes("paddle") || cat.includes("pickleball")) {
    return "Technical testing and analysis services for Pickleball Paddle certification"
  }
  if (cat.includes("ball")) {
    return "Technical testing and analysis services for Pickleball Ball certification"
  }
  if (cat.includes("court") || cat.includes("surface")) {
    return "Technical testing and analysis services for Court Surface certification"
  }
  if (cat.includes("net")) {
    return "Technical testing and analysis services for Net System certification"
  }
  return `Technical testing and analysis services for ${category}`
}

const ManualBillGenerator = ({ customers = [], orders = [], initialSelectedOrderIds = [], onSuccess }) => {
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0)
  const [financialYear, setFinancialYear] = useState("")
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState("")
  const [selectedOrderIds, setSelectedOrderIds] = useState(initialSelectedOrderIds || [])
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("uninvoiced") // 'uninvoiced' | 'all' | 'invoiced'
  const [otherReferences, setOtherReferences] = useState("")
  const [savedDocId, setSavedDocId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const [customerInfo, setCustomerInfo] = useState({
    company: "",
    name: "",
    address: "",
    shippingAddress: "",
    contact: "",
    email: "",
    gstin: "",
    country: "India",
    state: "Maharashtra",
  })

  const [items, setItems] = useState([
    {
      id: uuidv4(),
      description: "Technical testing and analysis services",
      quantity: 1,
      rate: 0,
      hsn: "998346",
      gst: 18,
    },
  ])

  const [paymentInfo, setPaymentInfo] = useState({
    paymentType: "Direct",
    isInternational: false,
  })

  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setInvoiceDate(formattedDate)

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    let startYear, endYear
    if (currentMonth < 3) {
      startYear = currentYear - 1
      endYear = currentYear
    } else {
      startYear = currentYear
      endYear = currentYear + 1
    }

    const formattedFinancialYear = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`
    setFinancialYear(formattedFinancialYear)
    fetchLastInvoiceNumber(formattedFinancialYear, formattedDate)
  }, [])

  // Sync initialSelectedOrderIds if passed from parent
  useEffect(() => {
    if (initialSelectedOrderIds && initialSelectedOrderIds.length > 0 && orders.length > 0) {
      setSelectedOrderIds(initialSelectedOrderIds)
      const firstOrder = orders.find((o) => (o.id || o.orderId) === initialSelectedOrderIds[0])
      if (firstOrder) {
        if (firstOrder.email) {
          setSelectedCustomerEmail(firstOrder.email)
        }
        setCustomerInfo((prev) => ({
          ...prev,
          company: firstOrder.companyName || firstOrder.company || firstOrder.facilityName || firstOrder.name || prev.company,
          name: firstOrder.contactPerson || firstOrder.name || prev.name,
          address: firstOrder.mailingAddress || firstOrder.address || prev.address,
          shippingAddress: firstOrder.mailingAddress || firstOrder.address || prev.shippingAddress,
          contact: firstOrder.contactNumber || firstOrder.phone || prev.contact,
          email: firstOrder.email || prev.email,
          gstin: firstOrder.gstin || prev.gstin,
          state: firstOrder.state || prev.state,
        }))
      }
      syncItemsFromSelectedOrders(initialSelectedOrderIds)
    }
  }, [initialSelectedOrderIds, orders])

  const fetchLastInvoiceNumber = async (fyYear, targetDate) => {
    try {
      const dateQuery = targetDate || invoiceDate || ""
      const url = `/api/getNextInvoiceNumber?type=standard${dateQuery ? `&date=${dateQuery}` : ""}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.invoiceNumber) {
          const numberPart = data.invoiceNumber.split("/")[1]
          const num = Number.parseInt(numberPart, 10)
          if (!isNaN(num)) {
            setLastInvoiceNumber(num - 1)
            if (data.financialYear) {
              setFinancialYear(data.financialYear)
            }
            return
          }
        }
      }
    } catch (error) {
      console.error("Error fetching last invoice number:", error)
      toast.error("Failed to fetch next invoice number.")
    }
  }

  const generateInvoiceNumber = () => {
    const nextNumber = lastInvoiceNumber + 1
    return `${financialYear}/${nextNumber.toString().padStart(3, "0")}`
  }

  const invoiceNumber = manualInvoiceNumber.trim() || generateInvoiceNumber()

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Filtered orders list based on customer selection, status filter, and search query
  const filteredOrdersList = useMemo(() => {
    return orders.filter((ord) => {
      const ordId = ord.id || ord.orderId || ""
      const isSelected = selectedOrderIds.includes(ordId)

      // 1. Customer email filter (if customer is selected)
      if (selectedCustomerEmail && ord.email && ord.email.toLowerCase() !== selectedCustomerEmail.toLowerCase() && !isSelected) {
        return false
      }

      // 2. Status filter
      const hasInvoice = Boolean(ord.invoiceNumber)
      if (orderStatusFilter === "uninvoiced" && hasInvoice && !isSelected) {
        return false
      }
      if (orderStatusFilter === "invoiced" && !hasInvoice && !isSelected) {
        return false
      }

      // 3. Search query filter
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim()
        const matchId = ordId.toLowerCase().includes(q)
        const matchCompany = (ord.companyName || ord.company || ord.facilityName || "").toLowerCase().includes(q)
        const matchName = (ord.name || ord.contactPerson || "").toLowerCase().includes(q)
        const matchEmail = (ord.email || "").toLowerCase().includes(q)
        const matchModel = (ord.paddleModel || ord.modelName || "").toLowerCase().includes(q)
        const matchCat = (ord.category || "").toLowerCase().includes(q)
        const matchInvoice = (ord.invoiceNumber || "").toLowerCase().includes(q)
        if (!matchId && !matchCompany && !matchName && !matchEmail && !matchModel && !matchCat && !matchInvoice) {
          return false
        }
      }

      return true
    })
  }, [orders, selectedCustomerEmail, orderStatusFilter, orderSearchQuery, selectedOrderIds])

  // Handle customer selection from dropdown
  const handleCustomerSelection = (customerEmail) => {
    setSelectedCustomerEmail(customerEmail)
    setSavedDocId(null)

    if (customerEmail) {
      const selected = customers.find((c) => c.email === customerEmail)
      if (selected) {
        setCustomerInfo((prev) => ({
          ...prev,
          company: selected.company || selected.companyName || prev.company,
          name: selected.name || selected.customerName || prev.name,
          address: selected.address || prev.address,
          shippingAddress: selected.shippingAddress || selected.address || prev.shippingAddress,
          contact: selected.contact || selected.phone || prev.contact,
          email: selected.email || customerEmail,
          gstin: selected.gstin || prev.gstin,
          country: selected.country || "India",
          state: selected.state || "Maharashtra",
        }))
      }
    }
  }

  // Toggle order in bulk selection
  const handleToggleOrder = (orderId) => {
    setSavedDocId(null)
    const alreadySelected = selectedOrderIds.includes(orderId)
    const newSelected = alreadySelected
      ? selectedOrderIds.filter((id) => id !== orderId)
      : [...selectedOrderIds, orderId]

    setSelectedOrderIds(newSelected)

    // Auto-fill customer info if empty
    if (!alreadySelected) {
      const order = orders.find((o) => (o.id || o.orderId) === orderId)
      if (order) {
        if (!customerInfo.company && !customerInfo.email) {
          setCustomerInfo({
            company: order.companyName || order.company || order.facilityName || order.name || "",
            name: order.contactPerson || order.name || "",
            address: order.mailingAddress || order.address || "",
            shippingAddress: order.mailingAddress || order.address || "",
            contact: order.contactNumber || order.phone || "",
            email: order.email || "",
            gstin: order.gstin || "",
            country: order.country || "India",
            state: order.state || "Maharashtra",
          })
          if (order.email) {
            setSelectedCustomerEmail(order.email)
          }
        }
      }
    }

    syncItemsFromSelectedOrders(newSelected)
  }

  // Select all uninvoiced orders currently visible
  const handleSelectAllUninvoiced = () => {
    setSavedDocId(null)
    const uninvoicedOrderIds = filteredOrdersList
      .filter((o) => !o.invoiceNumber)
      .map((o) => o.id || o.orderId)

    const targetIds = uninvoicedOrderIds.length > 0
      ? uninvoicedOrderIds
      : filteredOrdersList.map((o) => o.id || o.orderId)

    const combined = Array.from(new Set([...selectedOrderIds, ...targetIds]))
    setSelectedOrderIds(combined)

    if (combined.length > 0 && (!customerInfo.company || !customerInfo.email)) {
      const firstOrder = orders.find((o) => (o.id || o.orderId) === combined[0])
      if (firstOrder) {
        setCustomerInfo({
          company: firstOrder.companyName || firstOrder.company || firstOrder.facilityName || firstOrder.name || "",
          name: firstOrder.contactPerson || firstOrder.name || "",
          address: firstOrder.mailingAddress || firstOrder.address || "",
          shippingAddress: firstOrder.mailingAddress || firstOrder.address || "",
          contact: firstOrder.contactNumber || firstOrder.phone || "",
          email: firstOrder.email || "",
          gstin: firstOrder.gstin || "",
          country: firstOrder.country || "India",
          state: firstOrder.state || "Maharashtra",
        })
        if (firstOrder.email) {
          setSelectedCustomerEmail(firstOrder.email)
        }
      }
    }

    syncItemsFromSelectedOrders(combined)
  }

  // Clear order selection
  const handleClearOrders = () => {
    setSavedDocId(null)
    setSelectedOrderIds([])
    setItems([
      {
        id: uuidv4(),
        description: "Technical testing and analysis services",
        quantity: 1,
        rate: 0,
        hsn: "998346",
        gst: 18,
      },
    ])
  }

  // Populate line items automatically from selected orders
  const syncItemsFromSelectedOrders = (orderIds) => {
    if (!orderIds || orderIds.length === 0) {
      return
    }

    const newItems = orderIds.map((orderId) => {
      const order = orders.find((o) => (o.id || o.orderId) === orderId)
      if (!order) {
        return {
          id: uuidv4(),
          description: `Technical testing and analysis services (Order ${orderId})`,
          quantity: 1,
          rate: 0,
          hsn: "998346",
          gst: 18,
        }
      }

      const rateVal = parseFloat(order.totalPriceINR || order.convertedPriceINR || order.convertedPrice || 0)
      const desc = getServiceDescription(order.category) +
        (order.paddleModel ? ` - Model: ${order.paddleModel}` : "") +
        ` (Order ${order.id || order.orderId})`

      return {
        id: uuidv4(),
        description: desc,
        quantity: 1,
        rate: rateVal,
        hsn: "998346",
        gst: 18,
      }
    })

    setItems(newItems)

    // Set invoice date to latest order date
    const latestOrder = orders.find((o) => (o.id || o.orderId) === orderIds[orderIds.length - 1])
    if (latestOrder && latestOrder.timestamp) {
      let orderDate
      if (latestOrder.timestamp instanceof Date) {
        orderDate = latestOrder.timestamp
      } else if (latestOrder.timestamp.toDate && typeof latestOrder.timestamp.toDate === "function") {
        orderDate = latestOrder.timestamp.toDate()
      } else if (latestOrder.timestamp.seconds) {
        orderDate = new Date(latestOrder.timestamp.seconds * 1000)
      } else {
        orderDate = new Date(latestOrder.timestamp)
      }
      if (!isNaN(orderDate.getTime())) {
        setInvoiceDate(orderDate.toISOString().split("T")[0])
      }
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        description: "",
        quantity: 1,
        rate: 0,
        hsn: "998346",
        gst: 18,
      },
    ])
  }

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    } else {
      toast.warning("At least one item is required")
    }
  }

  const calculateItemAmount = (item) => {
    return Number(item.quantity || 0) * Number(item.rate || 0)
  }

  const subtotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0)

  const calculateProcessingFees = () => {
    if (paymentInfo.paymentType !== "Razorpay") {
      return { processingFee: 0, totalProcessingFee: 0 }
    }
    const feeRate = paymentInfo.isInternational ? 0.03 : 0.02
    const processingFee = subtotal * feeRate
    return { processingFee, feeRate }
  }

  const processingFees = calculateProcessingFees()
  const isMaharashtra = (customerInfo?.state || "").toLowerCase().includes("maharashtra")

  // Calculate taxes item by item
  const calculateTaxes = () => {
    const result = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      taxableValues: [],
    }

    const taxableAmount = subtotal + processingFees.processingFee

    items.forEach((item) => {
      const amount = calculateItemAmount(item)
      const taxRate = item.gst === undefined || item.gst === null || item.gst === "" ? 18 : Number(item.gst)

      if (isMaharashtra) {
        const halfTaxRate = taxRate / 2
        const halfTaxAmount = (amount * halfTaxRate) / 100
        result.cgst += halfTaxAmount
        result.sgst += halfTaxAmount

        result.taxableValues.push({
          hsn: item.hsn || "998346",
          taxableValue: amount,
          cgstRate: halfTaxRate,
          cgstAmount: halfTaxAmount,
          sgstRate: halfTaxRate,
          sgstAmount: halfTaxAmount,
          totalTax: halfTaxAmount * 2,
        })
      } else {
        const taxAmount = (amount * taxRate) / 100
        result.igst += taxAmount

        result.taxableValues.push({
          hsn: item.hsn || "998346",
          taxableValue: amount,
          igstRate: taxRate,
          igstAmount: taxAmount,
          totalTax: taxAmount,
        })
      }
    })

    if (processingFees.processingFee > 0) {
      const processingHsn = "997158"
      if (isMaharashtra) {
        const halfTaxAmount = processingFees.processingFee * 0.09
        result.cgst += halfTaxAmount
        result.sgst += halfTaxAmount
        result.taxableValues.push({
          hsn: processingHsn,
          taxableValue: processingFees.processingFee,
          cgstRate: 9,
          cgstAmount: halfTaxAmount,
          sgstRate: 9,
          sgstAmount: halfTaxAmount,
          totalTax: halfTaxAmount * 2,
        })
      } else {
        const taxAmount = processingFees.processingFee * 0.18
        result.igst += taxAmount
        result.taxableValues.push({
          hsn: processingHsn,
          taxableValue: processingFees.processingFee,
          igstRate: 18,
          igstAmount: taxAmount,
          totalTax: taxAmount,
        })
      }
    }

    result.total = taxableAmount + result.cgst + result.sgst + result.igst
    result.total = Math.round(result.total * 100) / 100
    result.roundOff = Math.round(result.total) - result.total
    result.finalTotal = Math.round(result.total)

    return result
  }

  const taxes = calculateTaxes()

  // Group items by HSN/SAC code for tax summary
  const groupByHsn = () => {
    const groups = {}

    items.forEach((item) => {
      const amount = calculateItemAmount(item)
      const taxRate = item.gst === undefined || item.gst === null || item.gst === "" ? 18 : Number(item.gst)
      const hsnCode = item.hsn || "998346"

      if (!groups[hsnCode]) {
        groups[hsnCode] = {
          hsn: hsnCode,
          taxableValue: 0,
          cgstRate: isMaharashtra ? taxRate / 2 : 0,
          cgstAmount: 0,
          sgstRate: isMaharashtra ? taxRate / 2 : 0,
          sgstAmount: 0,
          igstRate: !isMaharashtra ? taxRate : 0,
          igstAmount: 0,
          totalTax: 0,
        }
      }

      groups[hsnCode].taxableValue += amount

      if (isMaharashtra) {
        const halfTaxRate = taxRate / 2
        const halfTaxAmount = (amount * halfTaxRate) / 100
        groups[hsnCode].cgstAmount += halfTaxAmount
        groups[hsnCode].sgstAmount += halfTaxAmount
        groups[hsnCode].totalTax += halfTaxAmount * 2
      } else {
        const taxAmount = (amount * taxRate) / 100
        groups[hsnCode].igstAmount += taxAmount
        groups[hsnCode].totalTax += taxAmount
      }
    })

    if (processingFees.processingFee > 0) {
      const processingHsn = "997158"
      if (!groups[processingHsn]) {
        groups[processingHsn] = {
          hsn: processingHsn,
          taxableValue: 0,
          cgstRate: isMaharashtra ? 9 : 0,
          cgstAmount: 0,
          sgstRate: isMaharashtra ? 9 : 0,
          sgstAmount: 0,
          igstRate: !isMaharashtra ? 18 : 0,
          igstAmount: 0,
          totalTax: 0,
        }
      }

      groups[processingHsn].taxableValue += processingFees.processingFee

      if (isMaharashtra) {
        const cgstAmount = processingFees.processingFee * 0.09
        const sgstAmount = processingFees.processingFee * 0.09
        groups[processingHsn].cgstAmount += cgstAmount
        groups[processingHsn].sgstAmount += sgstAmount
        groups[processingHsn].totalTax += cgstAmount + sgstAmount
      } else {
        const igstAmount = processingFees.processingFee * 0.18
        groups[processingHsn].igstAmount += igstAmount
        groups[processingHsn].totalTax += igstAmount
      }
    }

    return Object.values(groups)
  }

  const hsnSummary = groupByHsn()

  const handleSaveToFirebase = async () => {
    try {
      if (!customerInfo.company && !customerInfo.name) {
        toast.error("Please provide at least Company Name or Customer Name")
        return false
      }

      if (items.some((item) => !item.description || item.rate <= 0)) {
        toast.error("Please fill in all item details with valid rates")
        return false
      }

      if (!invoiceDate) {
        toast.error("Please select an invoice date")
        return false
      }

      setIsSaving(true)

      const billData = {
        customerInfo,
        items,
        paymentInfo,
        invoiceNumber,
        invoiceDate: formatDateForDisplay(invoiceDate),
        invoiceDateRaw: invoiceDate,
        financialYear,
        subtotal,
        processingFees,
        taxes,
        selectedOrderId: selectedOrderIds.length === 1 ? selectedOrderIds[0] : (selectedOrderIds.join(", ") || null),
        selectedOrderIds,
        otherReferences,
      }

      const response = await fetch("/api/saveManualBill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billData,
          existingDocId: savedDocId,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save manual bill")
      }

      setSavedDocId(result.docId)
      toast.success(savedDocId ? "Bill updated in Firebase!" : "Bill saved to Firebase successfully!")

      if (onSuccess) {
        onSuccess(result)
      }

      return true
    } catch (error) {
      console.error("Error saving bill:", error)
      toast.error(error.message || "Failed to save bill to Firebase.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    // If not saved yet, save once first to prevent missing record.
    // If already saved (savedDocId exists), do NOT re-call save or create duplicate doc!
    if (!savedDocId) {
      const saved = await handleSaveToFirebase()
      if (!saved) return
    }

    const billData = {
      customerInfo,
      items,
      paymentInfo,
      invoiceNumber,
      invoiceDate: formatDateForDisplay(invoiceDate),
      invoiceDateRaw: invoiceDate,
      financialYear,
      subtotal,
      processingFees,
      taxes,
      selectedOrderIds,
      otherReferences,
      hsnSummary,
    }

    try {
      const doc = generateStandardInvoicePDF(billData)
      doc.save(`${invoiceNumber.replace(/\//g, "-")}.pdf`)
      toast.success("Invoice PDF generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF")
    }
  }

  const handleReset = () => {
    setSavedDocId(null)
    setManualInvoiceNumber("")
    setSelectedCustomerEmail("")
    setCustomerOrders([])
    setSelectedOrderIds([])
    setOtherReferences("")
    setItems([
      {
        id: uuidv4(),
        description: "Technical testing and analysis services",
        quantity: 1,
        rate: 0,
        hsn: "998346",
        gst: 18,
      },
    ])
    fetchLastInvoiceNumber(financialYear)
    toast.info("Form reset. Ready to generate next invoice.")
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manual / Bulk Tax Invoice Generator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Consolidate multiple bulk orders or generate standalone domestic tax invoices with unified numbering.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
          title="Reset all fields to create a fresh invoice"
        >
          <RefreshCw size={14} />
          Reset Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Invoice Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                className="w-full p-2 border rounded font-mono font-bold text-gray-800"
                placeholder={generateInvoiceNumber()}
                value={manualInvoiceNumber}
                onChange={(e) => setManualInvoiceNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Auto: {generateInvoiceNumber()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date*</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={invoiceDate}
                onChange={(e) => {
                  setInvoiceDate(e.target.value)
                  fetchLastInvoiceNumber(financialYear, e.target.value)
                }}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Date printed on invoice</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCustomerEmail}
                onChange={(e) => handleCustomerSelection(e.target.value)}
              >
                <option value="">Select customer</option>
                {customers.map((cust) => (
                  <option key={cust.email} value={cust.email}>
                    {cust.company || cust.name} ({cust.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other References</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="e.g. PO-8921 / Contract"
                value={otherReferences}
                onChange={(e) => setOtherReferences(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bulk Order Multi-Select Section - Always Visible & Instant Search */}
        <div className="md:col-span-3 bg-blue-50/70 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div>
              <h4 className="font-semibold text-blue-950 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-700" />
                <span>Link Orders for Bulk / Consolidated Invoicing</span>
                <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                  {selectedOrderIds.length} selected
                </span>
              </h4>
              <p className="text-xs text-blue-800 mt-0.5">
                Check orders to consolidate into this tax invoice. Selected orders automatically generate line items and link directly in the database.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSelectAllUninvoiced}
                className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-sm transition-colors"
              >
                Select All Visible Uninvoiced
              </button>
              <button
                type="button"
                onClick={handleClearOrders}
                className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded font-medium transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID (BST-...), company, customer, email, model..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex rounded border border-blue-200 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setOrderStatusFilter("uninvoiced")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  orderStatusFilter === "uninvoiced"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Uninvoiced Only
              </button>
              <button
                type="button"
                onClick={() => setOrderStatusFilter("all")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  orderStatusFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Orders
              </button>
              <button
                type="button"
                onClick={() => setOrderStatusFilter("invoiced")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  orderStatusFilter === "invoiced"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Invoiced Only
              </button>
            </div>
          </div>

          {/* Active Customer Filter Banner */}
          {selectedCustomerEmail && (
            <div className="flex items-center justify-between bg-blue-100/70 border border-blue-200 text-blue-900 px-3 py-1.5 rounded mb-2 text-xs">
              <span className="font-medium truncate">
                Customer filter active: <strong>{selectedCustomerEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomerEmail("")}
                className="text-blue-700 hover:text-blue-900 underline font-semibold ml-2 whitespace-nowrap"
              >
                Show All Customers
              </button>
            </div>
          )}

          {/* Order List Table */}
          {filteredOrdersList.length === 0 ? (
            <div className="bg-white border border-blue-200 rounded p-6 text-center">
              <p className="text-xs text-gray-500 italic">
                No orders match your filter criteria. Try clearing the search or switching from &quot;Uninvoiced Only&quot; to &quot;All Orders&quot;.
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-blue-200 rounded bg-white shadow-inner">
              <table className="w-full text-xs text-left">
                <thead className="bg-blue-100/70 text-blue-950 border-b border-blue-200 sticky top-0 shadow-xs">
                  <tr>
                    <th className="p-2 w-10 text-center">Select</th>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Company / Customer</th>
                    <th className="p-2">Category & Model</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                    <th className="p-2 text-center">Invoice Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrdersList.map((ord) => {
                    const ordId = ord.id || ord.orderId
                    const isSelected = selectedOrderIds.includes(ordId)
                    const hasInvoice = Boolean(ord.invoiceNumber)
                    const custName = ord.companyName || ord.company || ord.facilityName || ord.name || ord.contactPerson || "N/A"

                    return (
                      <tr
                        key={ordId}
                        onClick={() => handleToggleOrder(ordId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/90 font-medium" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleOrder(ordId)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-2 font-mono font-bold text-gray-900">{ordId}</td>
                        <td className="p-2 text-gray-800">
                          <div className="truncate max-w-[180px] font-medium" title={custName}>
                            {custName}
                          </div>
                          <div className="text-2xs text-gray-500 truncate max-w-[180px]" title={ord.email || ""}>
                            {ord.email || ""}
                          </div>
                        </td>
                        <td className="p-2 text-gray-700">
                          <span className="font-medium">{ord.category || "Testing"}</span>
                          {ord.paddleModel && (
                            <span className="text-gray-500 text-2xs block">
                              Model: {ord.paddleModel}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right font-semibold text-gray-900 font-mono">
                          ₹{Number(ord.totalPriceINR || ord.convertedPriceINR || ord.convertedPrice || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-2 text-center">
                          {hasInvoice ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              {ord.invoiceNumber}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-green-100 text-green-800 border border-green-200">
                              Uninvoiced
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Customer & Billing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="e.g. Attivi Private Limited"
                value={customerInfo.company}
                onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="e.g. John Doe"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address*</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                placeholder="Billing address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                placeholder="Shipping address (leave empty to use billing address)"
                value={customerInfo.shippingAddress}
                onChange={(e) => setCustomerInfo({ ...customerInfo, shippingAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                className="w-full p-2 border rounded font-mono"
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={customerInfo.gstin}
                onChange={(e) => setCustomerInfo({ ...customerInfo, gstin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State & State Code*</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="e.g. Maharashtra"
                value={customerInfo.state}
                onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-2 border-b pb-1">
            <h3 className="text-lg font-semibold text-gray-700">Invoice Items</h3>
            <button
              type="button"
              className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium"
              onClick={addItem}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left w-12">#</th>
                  <th className="p-2 text-left">Description of Services</th>
                  <th className="p-2 text-left w-28">HSN/SAC</th>
                  <th className="p-2 text-center w-20">Qty</th>
                  <th className="p-2 text-right w-32">Rate (₹)</th>
                  <th className="p-2 text-center w-24">GST %</th>
                  <th className="p-2 text-right w-32">Amount (₹)</th>
                  <th className="p-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 text-center text-gray-500">{index + 1}</td>
                    <td className="p-2">
                      <input
                        className="w-full p-1.5 border rounded text-sm"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Description of Services"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="w-full p-1.5 border rounded text-sm font-mono"
                        value={item.hsn}
                        onChange={(e) => handleItemChange(index, "hsn", e.target.value)}
                        placeholder="998346"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        className="w-full p-1.5 border rounded text-sm text-center"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10) || 1)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full p-1.5 border rounded text-sm text-right"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <select
                        className="w-full p-1.5 border rounded text-sm text-center"
                        value={item.gst ?? 18}
                        onChange={(e) => handleItemChange(index, "gst", parseInt(e.target.value, 10))}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td className="p-2 text-right font-medium text-gray-900">
                      ₹{calculateItemAmount(item).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Payment & Pricing Breakdown</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>

            {isMaharashtra ? (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>CGST (9%):</span>
                  <span>₹{taxes.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST (9%):</span>
                  <span>₹{taxes.sgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-gray-600">
                <span>IGST (18%):</span>
                <span>₹{taxes.igst.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Round Off:</span>
              <span>₹{taxes.roundOff.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-bold pt-2 border-t text-gray-900">
              <span>Grand Total:</span>
              <span>₹{taxes.finalTotal.toFixed(2)}</span>
            </div>

            <div className="text-xs italic text-gray-500 pt-1">
              {convertNumberToWords(taxes.finalTotal)} Rupees Only
            </div>
          </div>
        </div>

        {/* Tax Summary by HSN */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Tax Summary (HSN/SAC)</h3>
          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b text-gray-700">
                <tr>
                  <th className="text-left py-1">HSN/SAC</th>
                  <th className="text-right py-1">Taxable Value</th>
                  {isMaharashtra ? (
                    <>
                      <th className="text-right py-1">CGST</th>
                      <th className="text-right py-1">SGST</th>
                    </>
                  ) : (
                    <th className="text-right py-1">IGST</th>
                  )}
                  <th className="text-right py-1">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hsnSummary.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 font-mono">{item.hsn}</td>
                    <td className="text-right py-1 font-mono">₹{item.taxableValue.toFixed(2)}</td>
                    {isMaharashtra ? (
                      <>
                        <td className="text-right py-1 font-mono">₹{item.cgstAmount.toFixed(2)}</td>
                        <td className="text-right py-1 font-mono">₹{item.sgstAmount.toFixed(2)}</td>
                      </>
                    ) : (
                      <td className="text-right py-1 font-mono">₹{item.igstAmount.toFixed(2)}</td>
                    )}
                    <td className="text-right py-1 font-mono font-medium">₹{item.totalTax.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t">
                  <td className="py-1">Total</td>
                  <td className="text-right py-1 font-mono">₹{subtotal.toFixed(2)}</td>
                  {isMaharashtra ? (
                    <>
                      <td className="text-right py-1 font-mono">₹{taxes.cgst.toFixed(2)}</td>
                      <td className="text-right py-1 font-mono">₹{taxes.sgst.toFixed(2)}</td>
                    </>
                  ) : (
                    <td className="text-right py-1 font-mono">₹{taxes.igst.toFixed(2)}</td>
                  )}
                  <td className="text-right py-1 font-mono">
                    ₹{(isMaharashtra ? taxes.cgst + taxes.sgst : taxes.igst).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          disabled={isSaving}
          className="w-full sm:w-1/2 bg-green-600 text-white py-2.5 rounded hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
          onClick={handleDownloadPDF}
        >
          {savedDocId ? "Download PDF (Saved)" : "Generate & Save Invoice PDF"}
        </button>
        <button
          type="button"
          disabled={isSaving}
          className="w-full sm:w-1/2 bg-indigo-600 text-white py-2.5 rounded hover:bg-indigo-700 font-semibold transition-colors disabled:opacity-50"
          onClick={handleSaveToFirebase}
        >
          {isSaving ? "Saving..." : savedDocId ? "Update in Firebase" : "Save to Firebase Only"}
        </button>
      </div>
    </div>
  )
}

export default ManualBillGenerator
