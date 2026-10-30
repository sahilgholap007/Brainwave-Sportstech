"use client"
import { useState, useEffect } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { v4 as uuidv4 } from "uuid"
import { collection, addDoc, Timestamp, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig" // Centralized DB
import { toast } from "react-toastify"
import { generateIndependentInvoicePDF } from "@/utils/generateIndependentInvoicePDF"
import { convertNumberToWords } from "../utils/numberToWords"

const IndependentManualBillGenerator = ({ initialData, onUpdateComplete }) => {
  // const db = getFirestore() // Removed local init
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0)
  const [financialYear, setFinancialYear] = useState("")
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState("")
  const [customerOrders, setCustomerOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [exchangeRate, setExchangeRate] = useState(1)
  const [invoiceType, setInvoiceType] = useState("Domestic")
  const [validityDays, setValidityDays] = useState(15)
  const [showBrandName, setShowBrandName] = useState(true)
  const [otherReferences, setOtherReferences] = useState("")
  const [currentDocId, setCurrentDocId] = useState(initialData?.id || null)

  useEffect(() => {
    if (initialData) {
      setCurrentDocId(initialData.id || null)
      setManualInvoiceNumber(initialData.invoiceNumber || "")
      setInvoiceDate(initialData.invoiceDateRaw || initialData.invoiceDate || "")
      setCustomerInfo(initialData.customerInfo || {
        company: "", name: "", contactPerson: "", address: "", shippingAddress: "", contact: "", email: "", gstin: "", country: "", state: ""
      })
      setItems(initialData.items || [])
      setPaymentInfo(initialData.paymentInfo || { paymentType: "Direct", isInternational: false })
      setCurrency(initialData.currency || "INR")
      setExchangeRate(initialData.exchangeRate || 1)
      setInvoiceType(initialData.isInternational ? "International" : "Domestic")
      setValidityDays(initialData.validityDays || 15)
      setShowBrandName(initialData.showBrandName !== false)
      setSelectedOrderId(initialData.selectedOrderId || "")
      setOtherReferences(initialData.otherReferences || "")
    }
  }, [initialData])


  useEffect(() => {
    if (currency === "INR") {
      setExchangeRate(1)
      return
    }

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("https://openexchangerates.org/api/latest.json?app_id=b0d9986aef6641ba8961feb3f822d691")
        const data = await response.json()
        if (data && data.rates && data.rates.INR && data.rates[currency]) {
          const rate = data.rates.INR / data.rates[currency]
          setExchangeRate(rate)
          toast.success(`Exchange rate fetched: 1 ${currency} = ₹${rate.toFixed(2)}`)
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
        toast.error("Failed to fetch exchange rate. Please enter manually.")
      }
    }
    fetchExchangeRate()
  }, [currency])

  useEffect(() => {
    // Set default invoice date to current date in YYYY-MM-DD format for input
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setInvoiceDate(formattedDate)

    // Determine current financial year
    const currentMonth = today.getMonth() // 0-11
    const currentYear = today.getFullYear()

    // Financial year in India runs from April to March
    // If current month is January to March, financial year is previous year to current year
    // If current month is April to December, financial year is current year to next year
    let startYear, endYear

    if (currentMonth < 3) {
      // January to March
      startYear = currentYear - 1
      endYear = currentYear
    } else {
      // April to December
      startYear = currentYear
      endYear = currentYear + 1
    }

    // Format as YY-YY
    const formattedFinancialYear = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`
    setFinancialYear(formattedFinancialYear)

    // Fetch the last invoice number for this financial year
    fetchLastInvoiceNumber(formattedFinancialYear)
  }, [])

  const fetchLastInvoiceNumber = async (fyYear, targetDate) => {
    try {
      const dateQuery = targetDate || invoiceDate || ""
      const url = `/api/getNextInvoiceNumber?type=independent${dateQuery ? `&date=${dateQuery}` : ""}`
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

      // Fallback: Query Firestore collection directly
      const snapshot = await getDocs(collection(db, "IndependentManualBills"))
      let maxNumber = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.invoiceNumber && data.invoiceNumber.startsWith(`INV-OTR-${fyYear}`)) {
          const numberPart = data.invoiceNumber.split("/")[1]
          const number = Number.parseInt(numberPart, 10)
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number
          }
        }
      })

      setLastInvoiceNumber(maxNumber)
    } catch (error) {
      console.error("Error fetching last invoice number:", error)
      toast.error("Failed to fetch last invoice number.")
    }
  }

  const [customerInfo, setCustomerInfo] = useState({
    company: "",
    name: "",
    contactPerson: "",
    address: "",
    shippingAddress: "",
    contact: "",
    email: "",
    gstin: "",
    country: "",
    state: "",
  })

  const [items, setItems] = useState([
    {
      id: uuidv4(),
      description: "Technical testing and analysis services",
      productDescription: "",
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

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "AUD": return "A$";
      default: return curr + " ";
    }
  };

  const generateInvoiceNumber = () => {
    const nextNumber = lastInvoiceNumber + 1
    return `INV-OTR-${financialYear}/${nextNumber.toString().padStart(3, "0")}`
  }

  // Use manual invoice number if provided, otherwise use generated one
  const invoiceNumber = manualInvoiceNumber.trim() || generateInvoiceNumber()

  // Format invoice date for display (DD-MMM-YYYY format)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Handle customer selection and populate customer orders
  const handleCustomerSelection = (customerEmail) => {
    setSelectedCustomerEmail(customerEmail)
    setSelectedOrderId("") // Reset order selection

    // Find selected customer
    const selected = customers.find((c) => c.email === customerEmail)
    if (selected) {
      setCustomerInfo((prev) => ({
        ...prev,
        ...selected,
        shippingAddress: selected.address,
      }))
    }

    // Filter orders for the selected customer
    const filteredOrders = orders.filter((order) => order.email === customerEmail)
    setCustomerOrders(filteredOrders)
  }

  // Handle order selection and populate invoice date
  const handleOrderSelection = (orderId) => {
    setSelectedOrderId(orderId)

    // Find the selected order
    const selectedOrder = customerOrders.find((order) => order.id === orderId || order.orderId === orderId)

    if (selectedOrder && selectedOrder.timestamp) {
      // Convert timestamp to YYYY-MM-DD format for date input
      let orderDate

      if (selectedOrder.timestamp instanceof Date) {
        orderDate = selectedOrder.timestamp
      } else if (selectedOrder.timestamp.toDate && typeof selectedOrder.timestamp.toDate === "function") {
        // Firestore Timestamp
        orderDate = selectedOrder.timestamp.toDate()
      } else {
        // Try to parse as date string or number
        orderDate = new Date(selectedOrder.timestamp)
      }

      if (!isNaN(orderDate.getTime())) {
        const formattedDate = orderDate.toISOString().split("T")[0]
        setInvoiceDate(formattedDate)
        toast.success(`Invoice date set to order date: ${formatDateForDisplay(formattedDate)}`)
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
        productDescription: "",
        quantity: 1,
        rate: 0,
        hsn: "",
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

  // Calculate subtotal
  const calculateItemAmount = (item) => {
    return item.quantity * item.rate
  }

  const subtotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0)

  // Calculate Razorpay processing fees if applicable
  const calculateProcessingFees = () => {
    if (paymentInfo.paymentType !== "Razorpay") {
      return {
        processingFee: 0,
        totalProcessingFee: 0,
      }
    }

    // Determine the processing fee rate based on transaction type
    const feeRate = paymentInfo.isInternational ? 0.03 : 0.02
    const processingFee = subtotal * feeRate

    return {
      processingFee,
      feeRate,
    }
  }

  const processingFees = calculateProcessingFees()

  // Check if customer is from Maharashtra
  const isInternational = invoiceType === "International"
  const isMaharashtra = !isInternational && (customerInfo?.state || "").toLowerCase().includes("maharashtra")

  // Calculate taxes
  const calculateTaxes = () => {
    const result = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      taxableValues: [],
    }

    // Calculate the taxable amount (subtotal + processing fee, WITHOUT separate GST on processing fee)
    const taxableAmount = subtotal + processingFees.processingFee

    // Add regular items to taxable values
    items.forEach((item) => {
      const amount = calculateItemAmount(item)
      // Allow 0 as a valid GST rate
      const taxRate = item.gst === undefined || item.gst === null || item.gst === "" ? 18 : Number(item.gst)

      if (isInternational) {
        // International is Zero-rated export under LUT / Bond (0% GST)
        result.taxableValues.push({
          hsn: item.hsn,
          taxableValue: amount,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          igstRate: 0,
          igstAmount: 0,
          totalTax: 0,
        })
      } else if (isMaharashtra) {
        // For Maharashtra: Split into CGST and SGST
        const halfTaxRate = taxRate / 2
        const halfTaxAmount = (amount * halfTaxRate) / 100
        
        result.cgst += halfTaxAmount
        result.sgst += halfTaxAmount

        result.taxableValues.push({
          hsn: item.hsn,
          taxableValue: amount,
          cgstRate: halfTaxRate,
          cgstAmount: halfTaxAmount,
          sgstRate: halfTaxRate,
          sgstAmount: halfTaxAmount,
          totalTax: halfTaxAmount * 2,
        })
      } else {
        // For other states: Apply IGST
        const taxAmount = (amount * taxRate) / 100
        
        result.igst += taxAmount

        result.taxableValues.push({
          hsn: item.hsn,
          taxableValue: amount,
          igstRate: taxRate,
          igstAmount: taxAmount,
          totalTax: taxAmount,
        })
      }
    })

    // Add processing fee if applicable
    if (processingFees.processingFee > 0) {
      const processingHsn = "997158"

      if (isInternational) {
        result.taxableValues.push({
          hsn: processingHsn,
          taxableValue: processingFees.processingFee,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          igstRate: 0,
          igstAmount: 0,
          totalTax: 0,
        })
      } else if (isMaharashtra) {
        // For Maharashtra: Split into CGST and SGST
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
        // For other states: Apply IGST
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

    // Calculate total (taxable amount + GST)
    result.total = taxableAmount + result.cgst + result.sgst + result.igst

    // Round to 2 decimal places
    result.total = Math.round(result.total * 100) / 100

    // Calculate roundoff
    result.roundOff = Math.round(result.total) - result.total

    // Final total after rounding
    result.finalTotal = Math.round(result.total)

    return result
  }

  const taxes = calculateTaxes()

  // Group items by HSN/SAC code for tax summary
  const groupByHsn = () => {
    const groups = {}

    // Add regular items
    items.forEach((item) => {
      const amount = calculateItemAmount(item)
      const taxRate = item.gst === undefined || item.gst === null || item.gst === "" ? 18 : Number(item.gst)
      
      if (!groups[item.hsn]) {
        groups[item.hsn] = {
          hsn: item.hsn,
          taxableValue: 0,
          cgstRate: isInternational ? 0 : (isMaharashtra ? taxRate / 2 : 0),
          cgstAmount: 0,
          sgstRate: isInternational ? 0 : (isMaharashtra ? taxRate / 2 : 0),
          sgstAmount: 0,
          igstRate: isInternational ? 0 : (!isMaharashtra ? taxRate : 0),
          igstAmount: 0,
          totalTax: 0,
        }
      }

      groups[item.hsn].taxableValue += amount

      if (isInternational) {
        // Zero-rated
      } else if (isMaharashtra) {
        const halfTaxRate = taxRate / 2
        const halfTaxAmount = (amount * halfTaxRate) / 100
        groups[item.hsn].cgstAmount += halfTaxAmount
        groups[item.hsn].sgstAmount += halfTaxAmount
        groups[item.hsn].totalTax += halfTaxAmount * 2
      } else {
        const taxAmount = (amount * taxRate) / 100
        groups[item.hsn].igstAmount += taxAmount
        groups[item.hsn].totalTax += taxAmount
      }
    })

    // Add processing fee if applicable
    if (processingFees.processingFee > 0) {
      const processingHsn = "997158"
      if (!groups[processingHsn]) {
        groups[processingHsn] = {
          hsn: processingHsn,
          taxableValue: 0,
          cgstRate: isInternational ? 0 : (isMaharashtra ? 9 : 0),
          cgstAmount: 0,
          sgstRate: isInternational ? 0 : (isMaharashtra ? 9 : 0),
          sgstAmount: 0,
          igstRate: isInternational ? 0 : (!isMaharashtra ? 18 : 0),
          igstAmount: 0,
          totalTax: 0,
        }
      }

      groups[processingHsn].taxableValue += processingFees.processingFee

      if (isInternational) {
        // Zero-rated
      } else if (isMaharashtra) {
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
      // Validate required fields
      if (!customerInfo.company || !customerInfo.name || !customerInfo.address) {
        toast.error("Please fill in all required customer information")
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

      const billData = {
        customerInfo,
        items,
        paymentInfo,
        invoiceNumber,
        invoiceDate: formatDateForDisplay(invoiceDate),
        invoiceDateRaw: invoiceDate, // Store raw date for sorting/filtering
        financialYear,
        subtotal,
        processingFees,
        taxes,
        selectedOrderId: selectedOrderId || null, // Store the associated order ID
        otherReferences,
        timestamp: Timestamp.now(),
      }

      billData.currency = currency;
      billData.exchangeRate = exchangeRate;
      billData.isInternational = isInternational;
      if (isInternational) {
        billData.convertedTotal = Number((taxes.finalTotal / exchangeRate).toFixed(2));
      }
      
      const docIdToUpdate = currentDocId || initialData?.id
      if (docIdToUpdate) {
        await updateDoc(doc(db, "IndependentManualBills", docIdToUpdate), billData)
        toast.success("Bill updated successfully!")
        if (onUpdateComplete) onUpdateComplete()
      } else {
        const docRef = await addDoc(collection(db, "IndependentManualBills"), billData)
        setCurrentDocId(docRef.id)
        toast.success("Bill saved to Firebase successfully!")
        // Re-fetch the last invoice number to ensure it's up-to-date
        await fetchLastInvoiceNumber(financialYear)
      }

      return true
    } catch (error) {
      console.error("Error saving bill:", error)
      toast.error("Failed to save bill to Firebase.")
      return false
    }
  }

  const handleDownloadPDF = async () => {
    // If not saved yet, save first. If already saved, don't create duplicate doc!
    if (!currentDocId && !initialData?.id) {
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
      selectedOrderId: selectedOrderId || null,
      otherReferences,
      timestamp: Timestamp.now(),
      currency,
      exchangeRate,
      isInternational,
      validityDays,
      showBrandName,
      hsnSummary
    }

    try {
      const doc = generateIndependentInvoicePDF(billData)
      doc.save(`${invoiceNumber.replace(/\//g, "-")}.pdf`)
      toast.success("Invoice PDF generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF")
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Independent Manual Tax Invoice Generator</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Invoice Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                className="w-full p-2 border rounded"
                placeholder={generateInvoiceNumber()}
                value={manualInvoiceNumber}
                onChange={(e) => setManualInvoiceNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate: {generateInvoiceNumber()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date*</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={invoiceDate}

                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Date when the order was placed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name*</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Enter customer name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Optional"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other References</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Optional"
                value={otherReferences}
                onChange={(e) => setOtherReferences(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show Brand Name</label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={showBrandName}
                  onChange={(e) => setShowBrandName(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">Include "Brainwave Sportstech"</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Currency & Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
              <select className="w-full p-2 border rounded" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
                <option value="Domestic">Domestic (GST Applied)</option>
                <option value="International">International (No GST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Days)</label>
              <input type="number" className="w-full p-2 border rounded" value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="w-full p-2 border rounded" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AED">AED</option>
                <option value="SGD">SGD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate (1 {currency} = ? INR)</label>
              <input type="number" className="w-full p-2 border rounded" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} disabled={currency === 'INR'} step="0.01" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Company Name"
                value={customerInfo.company}
                onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person*</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Contact Person"
                value={customerInfo.contactPerson}
                onChange={(e) => setCustomerInfo({ ...customerInfo, contactPerson: e.target.value })}
                required
              />
            </div>
            {!isInternational && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="GSTIN"
                  value={customerInfo.gstin}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, gstin: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Contact Number"
                value={customerInfo.contact}
                onChange={(e) => setCustomerInfo({ ...customerInfo, contact: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="State"
                value={customerInfo.state}
                onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="Country"
                value={customerInfo.country}
                onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address*</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Billing Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address (if different)</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Shipping Address"
                value={customerInfo.shippingAddress}
                onChange={(e) => setCustomerInfo({ ...customerInfo, shippingAddress: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                className="w-full p-2 border rounded"
                value={paymentInfo.paymentType}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentType: e.target.value })}
              >
                <option value="Direct">Direct</option>
                <option value="Razorpay">Razorpay</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Swift">Swift</option>
              </select>
            </div>
            {paymentInfo.paymentType === "Razorpay" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={paymentInfo.isInternational ? "international" : "domestic"}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, isInternational: e.target.value === "international" })
                  }
                >
                  <option value="domestic">Domestic (2% fee)</option>
                  <option value="international">International (3% fee)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Table */}
      <h3 className="text-lg font-semibold mb-2 border-b pb-1">Invoice Items</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-left text-gray-600 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Description of Services</th>
              <th className="border px-2 py-1">Product Description</th>
              <th className="border px-2 py-1">HSN/SAC</th>
              <th className="border px-2 py-1">Quantity</th>
              <th className="border px-2 py-1">Rate</th>
              <th className="border px-2 py-1">GST (%)</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="border px-2 py-1">{index + 1}</td>
                <td className="border px-2 py-1">
                  <input
                    className="w-full p-1 border rounded"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    required
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    className="w-full p-1 border rounded"
                    value={item.productDescription || ""}
                    onChange={(e) => handleItemChange(index, "productDescription", e.target.value)}
                    placeholder="Optional"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    className="w-full p-1 border rounded"
                    value={item.hsn}
                    onChange={(e) => handleItemChange(index, "hsn", e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", +e.target.value)}
                    min="1"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", +e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="border px-2 py-1">
                  <select
                    className="w-full p-1 border rounded"
                    value={item.gst}
                    onChange={(e) => handleItemChange(index, "gst", +e.target.value)}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </td>
                <td className="border px-2 py-1 text-right">₹{calculateItemAmount(item).toFixed(2)}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={items.length === 1}
                  >
                    <AiOutlineClose />
                  </button>
                </td>
              </tr>
            ))}
            {paymentInfo.paymentType === "Razorpay" && (
              <tr className="bg-gray-50">
                <td className="border px-2 py-1">{items.length + 1}</td>
                <td className="border px-2 py-1">Commission on Card Payments</td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1">997158</td>
                <td className="border px-2 py-1 text-center">1</td>
                <td className="border px-2 py-1 text-right">{processingFees.processingFee.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center">18%</td>
                <td className="border px-2 py-1 text-right">₹{processingFees.processingFee.toFixed(2)}</td>
                <td className="border px-2 py-1"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={addItem}>
        + Add Item
      </button>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Invoice Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Subtotal:</div>
              <div className="text-right">₹{subtotal.toFixed(2)}</div>

              {paymentInfo.paymentType === "Razorpay" && (
                <>
                  <div className="font-medium">
                    {paymentInfo.isInternational ? "Processing Fee (3%):" : "Processing Fee (2%):"}
                  </div>
                  <div className="text-right">₹{processingFees.processingFee.toFixed(2)}</div>
                  <div className="font-medium border-t pt-1">Taxable Amount:</div>
                  <div className="text-right border-t pt-1">
                    ₹{(subtotal + processingFees.processingFee).toFixed(2)}
                  </div>
                </>
              )}

              {(isMaharashtra || isInternational) ? (
                <>
                  <div className="font-medium">CGST:</div>
                  <div className="text-right">₹{taxes.cgst.toFixed(2)}</div>
                  <div className="font-medium">SGST:</div>
                  <div className="text-right">₹{taxes.sgst.toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div className="font-medium">IGST:</div>
                  <div className="text-right">₹{taxes.igst.toFixed(2)}</div>
                </>
              )}

              <div className="font-medium">Round Off:</div>
              <div className="text-right">₹{taxes.roundOff.toFixed(2)}</div>

              <div className="font-medium text-lg pt-2 border-t">Grand Total:</div>
              <div className="text-right text-lg font-bold pt-2 border-t">₹{taxes.finalTotal.toFixed(2)}</div>

              {currency !== "INR" && (
                <>
                  <div className="font-medium text-sm text-gray-500 pt-2 border-t mt-2">Conversion Rate:</div>
                  <div className="text-right text-sm text-gray-500 pt-2 border-t mt-2">1 {currency} = ₹{Number(exchangeRate).toFixed(2)}</div>
                  
                  <div className="font-medium text-lg pt-2 text-indigo-600">Total in {currency}:</div>
                  <div className="text-right text-lg font-bold pt-2 text-indigo-600">
                    {getCurrencySymbol(currency)}{(taxes.finalTotal / exchangeRate).toFixed(2)}
                  </div>
                </>
              )}

              <div className="col-span-2 text-sm italic mt-2">{convertNumberToWords(taxes.finalTotal)} Rupees Only</div>

              {paymentInfo.paymentType === "Razorpay" && (
                <div className="col-span-2 text-xs mt-2 text-gray-500 border-t pt-2">
                  <p className="font-medium">Formula Applied:</p>
                  <p>
                    Grand Total = [Subtotal + {paymentInfo.isInternational ? "3%" : "2%"} Processing Fee] { isInternational ? " + 0% GST (Zero-Rated Export)" : isMaharashtra ? " + 18% GST (9% CGST + 9% SGST)" : " + 18% IGST"}
                  </p>
                  <p>
                    = [₹{subtotal.toFixed(2)} + ₹{processingFees.processingFee.toFixed(2)}] + ₹
                    {(isInternational ? 0 : isMaharashtra ? taxes.cgst + taxes.sgst : taxes.igst).toFixed(2)}
                  </p>
                  <p>
                    = ₹{(subtotal + processingFees.processingFee).toFixed(2)} + ₹
                    {(isInternational ? 0 : isMaharashtra ? taxes.cgst + taxes.sgst : taxes.igst).toFixed(2)} = ₹{taxes.finalTotal.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">Tax Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">HSN/SAC</th>
                  <th className="text-right py-1">Taxable Value</th>
                  {isInternational ? (
                    <th className="text-right py-1">Zero-Rated GST</th>
                  ) : isMaharashtra ? (
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
              <tbody>
                {hsnSummary.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-1">{item.hsn}</td>
                    <td className="text-right py-1">₹{item.taxableValue.toFixed(2)}</td>
                    {isInternational ? (
                      <td className="text-right py-1">0% (₹0.00)</td>
                    ) : isMaharashtra ? (
                      <>
                        <td className="text-right py-1">₹{item.cgstAmount.toFixed(2)}</td>
                        <td className="text-right py-1">₹{item.sgstAmount.toFixed(2)}</td>
                      </>
                    ) : (
                      <td className="text-right py-1">₹{item.igstAmount.toFixed(2)}</td>
                    )}
                    <td className="text-right py-1">₹{item.totalTax.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td className="py-1">Total</td>
                  <td className="text-right py-1">₹{(subtotal + processingFees.processingFee).toFixed(2)}</td>
                  {isInternational ? (
                    <td className="text-right py-1">₹0.00</td>
                  ) : isMaharashtra ? (
                    <>
                      <td className="text-right py-1 font-medium">₹{taxes.cgst.toFixed(2)}</td>
                      <td className="text-right py-1 font-medium">₹{taxes.sgst.toFixed(2)}</td>
                    </>
                  ) : (
                    <td className="text-right py-1">₹{taxes.igst.toFixed(2)}</td>
                  )}
                  <td className="text-right py-1">
                    ₹{(isInternational ? 0 : isMaharashtra ? taxes.cgst + taxes.sgst : taxes.igst).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          className="w-full sm:w-1/3 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
          onClick={handleDownloadPDF}
        >
          {currentDocId ? "Download PDF (Saved)" : "Generate & Save Invoice PDF"}
        </button>
        <button
          className="w-full sm:w-1/3 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-medium"
          onClick={handleSaveToFirebase}
        >
          {currentDocId ? "Update in Firebase" : "Save to Firebase Only"}
        </button>
        <button
          type="button"
          className="w-full sm:w-1/3 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
          onClick={() => {
            setCurrentDocId(null)
            setManualInvoiceNumber("")
            fetchLastInvoiceNumber(financialYear)
            toast.info("Ready to create a new invoice")
          }}
        >
          Reset / New Invoice
        </button>
      </div>
    </div>
  )
}

export default IndependentManualBillGenerator
