import { NextResponse } from "next/server"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getAdminDb, Timestamp } from "@/lib/firebase-admin"
import { v4 as uuidv4 } from "uuid"
import { generateIndependentInvoicePDF } from "@/utils/generateIndependentInvoicePDF"
import { generateStandardInvoicePDF } from "@/utils/generateStandardInvoicePDF"

const db = getAdminDb()

// Helper function to get 2-digit Indian State code
function getStateCode(stateName) {
  if (!stateName) return "XX"
  const cleanState = stateName.trim().toLowerCase()

  const stateCodes = {
    "jammu and kashmir": "01",
    "jammu & kashmir": "01",
    "himachal pradesh": "02",
    "punjab": "03",
    "chandigarh": "04",
    "uttarakhand": "05",
    "haryana": "06",
    "delhi": "07",
    "rajasthan": "08",
    "uttar pradesh": "09",
    "bihar": "10",
    "sikkim": "11",
    "arunachal pradesh": "12",
    "nagaland": "13",
    "manipur": "14",
    "mizoram": "15",
    "tripura": "16",
    "meghalaya": "17",
    "assam": "18",
    "west bengal": "19",
    "jharkhand": "20",
    "odisha": "21",
    "orissa": "21",
    "chhattisgarh": "22",
    "madhya pradesh": "23",
    "gujarat": "24",
    "dadra and nagar haveli and daman and diu": "26",
    "maharashtra": "27",
    "andhra pradesh": "37",
    "karnataka": "29",
    "goa": "30",
    "lakshadweep": "31",
    "kerala": "32",
    "tamil nadu": "33",
    "puducherry": "34",
    "pondicherry": "34",
    "andaman and nicobar islands": "35",
    "telangana": "36",
    "ladakh": "38",
  }

  for (const [key, code] of Object.entries(stateCodes)) {
    if (cleanState === key || cleanState.includes(key)) {
      return code
    }
  }

  return "XX"
}

// Helper function to convert number to words
function convertNumberToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]

  if (num === 0) return "Zero"

  const crores = Math.floor(num / 10000000)
  const lakhs = Math.floor((num % 10000000) / 100000)
  const thousands = Math.floor((num % 100000) / 1000)
  const hundreds = Math.floor((num % 1000) / 100)
  const remainder = num % 100

  let words = ""

  if (crores > 0) {
    words += convertNumberToWords(crores) + " Crore "
  }
  if (lakhs > 0) {
    words += convertNumberToWords(lakhs) + " Lakh "
  }
  if (thousands > 0) {
    words += convertNumberToWords(thousands) + " Thousand "
  }
  if (hundreds > 0) {
    words += ones[hundreds] + " Hundred "
  }
  if (remainder >= 20) {
    words += tens[Math.floor(remainder / 10)] + " "
    if (remainder % 10 > 0) {
      words += ones[remainder % 10] + " "
    }
  } else if (remainder >= 10) {
    words += teens[remainder - 10] + " "
  } else if (remainder > 0) {
    words += ones[remainder] + " "
  }

  return words.trim()
}

// Helper function to get service description based on order category
function getServiceDescription(category) {
  const descriptions = {
    Paddle: "Technical testing and analysis services for Paddle",
    Ball: "Technical testing and analysis services for Ball",
    Court: "Court certification services",
    Flooring: "Sports flooring certification and testing services",
  }
  return descriptions[category] || "Technical testing and analysis services"
}

export async function POST(req) {
  try {
    const order = await req.json()
    if (!order) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 })
    }

    const invoiceNumber = (order.manualInvoiceNumber || order.invoiceNumber || "").trim()
    const orderId = order.id || order.orderId

    if (!invoiceNumber && !orderId) {
      return NextResponse.json({ message: "Invoice number or order ID is required" }, { status: 400 })
    }

    // 1. Check if an official IndependentManualBill exists for this invoice number
    // (e.g. INV-OTR-26-27/007 for Skechers 14-item consolidated invoice, Gerflor, etc.)
    if (invoiceNumber) {
      const indepSnap = await db
        .collection("IndependentManualBills")
        .where("invoiceNumber", "==", invoiceNumber)
        .limit(1)
        .get()

      if (!indepSnap.empty) {
        const indepBill = indepSnap.docs[0].data()
        const doc = generateIndependentInvoicePDF(indepBill)
        const pdfBase64 = doc.output("datauristring")
        return NextResponse.json({
          pdf: pdfBase64,
          invoiceNumber,
          isIndependent: true,
        })
      }

      // 2. Check if an official ManualBill exists for this invoice number (e.g. bulk orders)
      const manualSnap = await db
        .collection("ManualBills")
        .where("invoiceNumber", "==", invoiceNumber)
        .limit(1)
        .get()

      if (!manualSnap.empty) {
        const manualBill = manualSnap.docs[0].data()
        const doc = generateStandardInvoicePDF(manualBill)
        const pdfBase64 = doc.output("datauristring")
        return NextResponse.json({
          pdf: pdfBase64,
          invoiceNumber,
          isManualBill: true,
        })
      }

      // 3. Check if an official AutoInvoice exists for this invoice number
      const autoSnap = await db
        .collection("AutoInvoices")
        .where("invoiceNumber", "==", invoiceNumber)
        .limit(1)
        .get()

      if (!autoSnap.empty) {
        const autoBill = autoSnap.docs[0].data()
        const doc = generateStandardInvoicePDF(autoBill)
        const pdfBase64 = doc.output("datauristring")
        return NextResponse.json({
          pdf: pdfBase64,
          invoiceNumber,
          isAutoInvoice: true,
        })
      }
    }

    // 4. Check AutoInvoices by selectedOrderId
    if (orderId) {
      const autoByOrderSnap = await db
        .collection("AutoInvoices")
        .where("selectedOrderId", "==", orderId)
        .limit(1)
        .get()

      if (!autoByOrderSnap.empty) {
        const autoBill = autoByOrderSnap.docs[0].data()
        const doc = generateStandardInvoicePDF(autoBill)
        const pdfBase64 = doc.output("datauristring")
        return NextResponse.json({
          pdf: pdfBase64,
          invoiceNumber: autoBill.invoiceNumber || invoiceNumber,
          isAutoInvoice: true,
        })
      }
    }

    // 5. If not found in any existing invoice collection, generate single-order invoice
    if (!invoiceNumber) {
      return NextResponse.json({ message: "Invoice number is required to generate new invoice" }, { status: 400 })
    }

    // Map customer details
    const customerCompany = (order.companyName || order.company || order.manufacturer || order.facilityName || order.name || "").trim()
    const customerContactPerson = (order.contactPerson || order.name || "").trim()
    const customerAddress = (order.mailingAddress || order.address || "").trim()

    const customerInfo = {
      company: customerCompany || "N/A",
      name: customerContactPerson || customerCompany || "N/A",
      address: customerAddress,
      shippingAddress: customerAddress,
      contact: order.contactNumber || order.phone || "",
      email: order.email || "",
      gstin: order.gstin || "",
      country: order.country || "India",
      state: order.state || "Maharashtra",
    }

    const paymentType = order.paymentDetails?.paymentType || order.paymentType || "Bank Transfer"
    const serviceAmount = parseFloat(order.totalPriceINR || order.convertedPrice || 0)

    const items = [
      {
        id: uuidv4(),
        description: getServiceDescription(order.category),
        quantity: 1,
        rate: serviceAmount,
        hsn: "998346",
        gst: 18,
      },
    ]

    const isMaharashtra = customerInfo.state.toLowerCase().includes("maharashtra")
    const stateCode = getStateCode(customerInfo.state)

    // Calculate taxes: Base Amount + 18% GST (matching reference sample)
    const subtotal = serviceAmount
    const taxableAmount = subtotal

    let cgst = 0
    let sgst = 0
    let igst = 0

    if (isMaharashtra) {
      cgst = taxableAmount * 0.09
      sgst = taxableAmount * 0.09
    } else {
      igst = taxableAmount * 0.18
    }

    const totalTax = cgst + sgst + igst
    const total = taxableAmount + totalTax
    const roundOff = Math.round(total) - total
    const finalTotal = Math.round(total)

    // Format invoice date
    let invoiceDate = new Date()
    if (order.timestamp) {
      if (order.timestamp.toDate && typeof order.timestamp.toDate === "function") {
        invoiceDate = order.timestamp.toDate()
      } else if (order.timestamp.seconds) {
        invoiceDate = new Date(order.timestamp.seconds * 1000)
      } else {
        invoiceDate = new Date(order.timestamp)
      }
    }
    if (isNaN(invoiceDate.getTime())) invoiceDate = new Date()

    const formattedInvoiceDate = invoiceDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

    // Create PDF matching Invoice_26-27-002.pdf exactly
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 10
    const contentWidth = pageWidth - margin * 2

    const addText = (text, x, y, options = {}) => {
      const defaults = { align: "left", fontSize: 10, fontStyle: "normal" }
      const settings = { ...defaults, ...options }
      doc.setFontSize(settings.fontSize)
      if (settings.fontStyle === "bold") {
        doc.setFont("helvetica", "bold")
      } else if (settings.fontStyle === "italic") {
        doc.setFont("helvetica", "italic")
      } else {
        doc.setFont("helvetica", "normal")
      }
      const textOptions = { align: settings.align }
      if (settings.maxWidth) {
        textOptions.maxWidth = settings.maxWidth
      }
      doc.text(String(text ?? ""), x, y, textOptions)
    }

    const addBox = (x, y, w, h) => {
      doc.rect(x, y, w, h, "S")
    }

    const addLine = (x1, y1, x2, y2) => {
      doc.line(x1, y1, x2, y2)
    }

    // Header Title
    addText("Tax Invoice", pageWidth / 2, 12, { align: "center", fontSize: 14, fontStyle: "bold" })

    // Company Header
    addText("BRAINWAVE SPORTS TECH", margin, 20, { fontSize: 10, fontStyle: "bold" })
    addText("BRAINWAVE VELOCITY PRIVATE LIMITED", margin, 25, { fontSize: 8 })
    addText("Room No. 404 A wing, 4th Floor, Motibhai Tower, Opp Railway Station,", margin, 29, { fontSize: 7 })
    addText("Badlapur Railway Station, Bazar Peth, Badlapur, Thane", margin, 33, { fontSize: 7 })
    addText("GSTIN/UIN: 27AANCB1614K1ZL | State: Maharashtra, Code: 27", margin, 37, { fontSize: 7 })

    // Consignee and Buyer Boxes
    const boxY = 42
    const boxHeight = 28
    const halfWidth = contentWidth / 2
    const consigneeBoxWidth = halfWidth
    const consigneeInnerWidth = consigneeBoxWidth - 4
    const buyerBoxWidth = halfWidth
    const buyerInnerWidth = buyerBoxWidth - 4
    const buyerX = margin + consigneeBoxWidth

    // Consignee box
    addBox(margin, boxY, consigneeBoxWidth, boxHeight)
    addText("Consignee (Ship to)", margin + 2, boxY + 4, { fontStyle: "bold", fontSize: 8 })

    const consigneeDisplayName = (customerInfo.company || customerInfo.name || "").trim()
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    const consigneeNameLines = doc.splitTextToSize(consigneeDisplayName, consigneeInnerWidth)
    const shippingAddressSingleLine = (customerInfo.shippingAddress || customerInfo.address || "").replace(/\r?\n/g, ", ").replace(/,\s*,+/g, ",").trim()
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    const shippingAddressLines = doc.splitTextToSize(shippingAddressSingleLine, consigneeInnerWidth)

    let yPos = boxY + 8
    const maxConsigneeNameLines = Math.min(consigneeNameLines.length, 2)
    for (let i = 0; i < maxConsigneeNameLines; i++) {
      addText(consigneeNameLines[i], margin + 2, yPos, { fontSize: 7.5, maxWidth: consigneeInnerWidth })
      yPos += 3.5
    }

    const maxShippingLines = maxConsigneeNameLines > 1 ? 1 : 2
    for (let i = 0; i < Math.min(shippingAddressLines.length, maxShippingLines); i++) {
      addText(shippingAddressLines[i], margin + 2, yPos, { fontSize: 7, maxWidth: consigneeInnerWidth })
      yPos += 3.5
    }
    addText(`State: ${customerInfo.state}, Code: ${stateCode}`, margin + 2, boxY + boxHeight - 3, { fontSize: 7, maxWidth: consigneeInnerWidth })

    // Buyer box
    addBox(buyerX, boxY, buyerBoxWidth, boxHeight)
    addText("Buyer (Bill to)", buyerX + 2, boxY + 4, { fontStyle: "bold", fontSize: 8 })

    const buyerDisplayName = (customerInfo.company || customerInfo.name || "").trim()
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    const buyerNameLines = doc.splitTextToSize(buyerDisplayName, buyerInnerWidth)
    const billingAddressSingleLine = (customerInfo.address || "").replace(/\r?\n/g, ", ").replace(/,\s*,+/g, ",").trim()
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    const billingAddressLines = doc.splitTextToSize(billingAddressSingleLine, buyerInnerWidth)

    let bYPos = boxY + 8
    const maxBuyerNameLines = Math.min(buyerNameLines.length, 2)
    for (let i = 0; i < maxBuyerNameLines; i++) {
      addText(buyerNameLines[i], buyerX + 2, bYPos, { fontSize: 7.5, maxWidth: buyerInnerWidth })
      bYPos += 3.5
    }

    const maxBillingLines = maxBuyerNameLines > 1 ? 1 : 2
    for (let i = 0; i < Math.min(billingAddressLines.length, maxBillingLines); i++) {
      addText(billingAddressLines[i], buyerX + 2, bYPos, { fontSize: 7, maxWidth: buyerInnerWidth })
      bYPos += 3.5
    }
    addText(`GSTIN: ${customerInfo.gstin || "N/A"}`, buyerX + 2, boxY + boxHeight - 7, { fontSize: 7, maxWidth: buyerInnerWidth })
    addText(`State: ${customerInfo.state}, Code: ${stateCode}`, buyerX + 2, boxY + boxHeight - 3, { fontSize: 7, maxWidth: buyerInnerWidth })

    // Invoice details table
    const detailsY = boxY + boxHeight + 3
    const detailsRowHeight = 5
    const col1Width = contentWidth / 2
    const col2Width = contentWidth / 2

    addBox(margin, detailsY, col1Width, detailsRowHeight)
    addBox(margin + col1Width, detailsY, col2Width, detailsRowHeight)
    addText("Invoice No.", margin + 2, detailsY + 3.5, { fontSize: 7 })
    addText("Dated", margin + col1Width + 2, detailsY + 3.5, { fontSize: 7 })

    addBox(margin, detailsY + detailsRowHeight, col1Width, detailsRowHeight)
    addBox(margin + col1Width, detailsY + detailsRowHeight, col2Width, detailsRowHeight)
    addText(invoiceNumber, margin + 2, detailsY + detailsRowHeight + 3.5, { fontSize: 7 })
    addText(formattedInvoiceDate, margin + col1Width + 2, detailsY + detailsRowHeight + 3.5, { fontSize: 7 })

    addBox(margin, detailsY + detailsRowHeight * 2, col1Width, detailsRowHeight)
    addBox(margin + col1Width, detailsY + detailsRowHeight * 2, col2Width, detailsRowHeight)
    addText("Mode/Terms of Payment", margin + 2, detailsY + detailsRowHeight * 2 + 3.5, { fontSize: 7 })
    addText("Other References", margin + col1Width + 2, detailsY + detailsRowHeight * 2 + 3.5, { fontSize: 7 })

    addBox(margin, detailsY + detailsRowHeight * 3, col1Width, detailsRowHeight)
    addBox(margin + col1Width, detailsY + detailsRowHeight * 3, col2Width, detailsRowHeight)
    addText(paymentType, margin + 2, detailsY + detailsRowHeight * 3 + 3.5, { fontSize: 7 })
    addText("", margin + col1Width + 2, detailsY + detailsRowHeight * 3 + 3.5, { fontSize: 7 })

    // Items table
    const itemsY = detailsY + detailsRowHeight * 4 + 3
    const headers = [
      { header: "Sl\nNo.", dataKey: "index" },
      { header: "Description of\nServices", dataKey: "description" },
      { header: "HSN/SAC", dataKey: "hsn" },
      { header: "Qty", dataKey: "quantity" },
      { header: "Rate", dataKey: "rate" },
      { header: "Amount", dataKey: "amount" },
    ]

    const tableData = items.map((item, index) => [
      index + 1,
      item.description,
      item.hsn,
      item.quantity,
      item.rate.toFixed(2),
      (item.quantity * item.rate).toFixed(2),
    ])

    autoTable(doc, {
      startY: itemsY,
      head: [headers.map((h) => h.header)],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 7, cellPadding: 1 },
      bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 7, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 25, halign: "right" },
      },
      margin: { left: margin, right: margin },
    })

    let lastY = doc.lastAutoTable.finalY + 5
    const amountColumnX = margin + 10 + 80 + 25 + 20 + 20
    const amountColumnWidth = 25

    addText("Sub Total", margin, lastY, { fontSize: 7 })
    addText(`Rs. ${taxableAmount.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 3

    if (isMaharashtra) {
      addText("Output CGST @ 9%", margin, lastY, { fontSize: 7 })
      addText(`Rs. ${cgst.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
      lastY += 3
      addText("Output SGST @ 9%", margin, lastY, { fontSize: 7 })
      addText(`Rs. ${sgst.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
      lastY += 3
    } else {
      addText("Output IGST @ 18%", margin, lastY, { fontSize: 7 })
      addText(`Rs. ${igst.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
      lastY += 3
    }

    addText("Rounded Off", margin, lastY, { fontSize: 7 })
    addText(`Rs. ${roundOff.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 3

    addText("Total", margin, lastY, { fontStyle: "bold", fontSize: 8 })
    addText(`Rs. ${finalTotal.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })
    lastY += 5

    addText("Amount Chargeable (in words)", margin, lastY, { fontStyle: "bold", fontSize: 7 })
    addText("E. & O.E", pageWidth - margin, lastY, { align: "right", fontSize: 7 })
    lastY += 3

    const amountInWords = convertNumberToWords(finalTotal)
    addText(`INR ${amountInWords} Only`, margin, lastY, { fontStyle: "italic", fontSize: 7 })
    lastY += 5

    // HSN/SAC summary table
    const taxSummaryHeaders = isMaharashtra
      ? ["HSN/SAC", "Taxable\nValue", "Central Tax", "State Tax", "Total\nTax Amount"]
      : ["HSN/SAC", "Taxable\nValue", "Integrated Tax", "Total\nTax Amount"]

    const taxSummarySubHeaders = isMaharashtra
      ? ["", "", "Rate", "Amount", "Rate", "Amount", ""]
      : ["", "", "Rate", "Amount", ""]

    const taxSummaryData = [
      isMaharashtra
        ? ["998346", taxableAmount.toFixed(2), "9%", cgst.toFixed(2), "9%", sgst.toFixed(2), (cgst + sgst).toFixed(2)]
        : ["998346", taxableAmount.toFixed(2), "18%", igst.toFixed(2), igst.toFixed(2)],
      isMaharashtra
        ? ["Total", taxableAmount.toFixed(2), "", cgst.toFixed(2), "", sgst.toFixed(2), (cgst + sgst).toFixed(2)]
        : ["Total", taxableAmount.toFixed(2), "", igst.toFixed(2), igst.toFixed(2)],
    ]

    autoTable(doc, {
      startY: lastY,
      head: [taxSummaryHeaders, taxSummarySubHeaders],
      body: taxSummaryData,
      theme: "grid",
      styles: { fontSize: 6, cellPadding: 0.5 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 6, cellPadding: 0.5 },
      bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 6, cellPadding: 0.5 },
      columnStyles: isMaharashtra
        ? {
          0: { cellWidth: 30 },
          1: { cellWidth: 30, halign: "right" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 25, halign: "right" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 25, halign: "right" },
          6: { cellWidth: 30, halign: "right" },
        }
        : {
          0: { cellWidth: 30 },
          1: { cellWidth: 40, halign: "right" },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 40, halign: "right" },
          4: { cellWidth: 40, halign: "right" },
        },
      margin: { left: margin, right: margin },
    })

    lastY = doc.lastAutoTable.finalY + 5

    addText("Tax Amount (in words)  :", margin, lastY, { fontStyle: "bold", fontSize: 7 })
    lastY += 5

    const taxInWords = convertNumberToWords(isMaharashtra ? cgst + sgst : igst)
    addText(`INR ${taxInWords} Only`, margin, lastY, { fontStyle: "italic", fontSize: 7 })
    lastY += 5

    addLine(margin, lastY, pageWidth - margin, lastY)
    lastY += 4

    addText("Thank You for Your Business!", pageWidth / 2, lastY, { align: "center", fontSize: 9, fontStyle: "bold" })
    lastY += 4

    addText("Brainwave Sportstech - AIPA Authorized Equipment Testing Laboratory", pageWidth / 2, lastY, { align: "center", fontSize: 7 })
    lastY += 3

    addText("www.brainwavesportstech.com | contact@brainwavesportstech.com | +91-901-100-9611", pageWidth / 2, lastY, { align: "center", fontSize: 6 })
    lastY += 3

    addText("Quality Testing & Certification You Can Trust", pageWidth / 2, lastY, { align: "center", fontSize: 6, fontStyle: "italic" })

    // Financial year extraction
    const financialYear = invoiceNumber.split("/")[0]

    // Check if an AutoInvoice already exists for this order or invoiceNumber to prevent duplicate inserts
    let existingDocId = null
    if (orderId) {
      const existingSnap = await db.collection("AutoInvoices").where("selectedOrderId", "==", orderId).limit(1).get()
      if (!existingSnap.empty) {
        existingDocId = existingSnap.docs[0].id
      }
    }

    if (!existingDocId) {
      const existingInvSnap = await db.collection("AutoInvoices").where("invoiceNumber", "==", invoiceNumber).limit(1).get()
      if (!existingInvSnap.empty) {
        existingDocId = existingInvSnap.docs[0].id
      }
    }

    const billData = {
      customerInfo,
      items,
      paymentInfo: {
        paymentType,
        isInternational: false,
      },
      invoiceNumber,
      invoiceDate: formattedInvoiceDate,
      invoiceDateRaw: invoiceDate.toISOString().split("T")[0],
      financialYear,
      subtotal,
      taxes: {
        cgst,
        sgst,
        igst,
        total,
        roundOff,
        finalTotal,
      },
      selectedOrderId: orderId || null,
      updatedAt: Timestamp.now(),
    }

    if (existingDocId) {
      // Update existing record without creating duplicate
      await db.collection("AutoInvoices").doc(existingDocId).set(billData, { merge: true })
    } else {
      // First time save
      billData.createdAt = Timestamp.now()
      await db.collection("AutoInvoices").add(billData)

      // Update atomic counter if sequence is higher
      const numberPart = parseInt(invoiceNumber.split("/")[1], 10)
      if (!isNaN(numberPart)) {
        const fyKey = financialYear.replace("-", "_")
        const counterRef = db.collection("counters").doc("invoiceNumbers")
        const counterSnap = await counterRef.get()
        const currentCounter = counterSnap.exists ? (counterSnap.data()[`standard_FY${fyKey}`] || 0) : 0

        if (numberPart > currentCounter) {
          await counterRef.set({
            [`standard_FY${fyKey}`]: numberPart,
            updatedAt: Timestamp.now(),
          }, { merge: true })
        }
      }
    }

    // Bi-directional link: update certification_orders
    if (orderId) {
      const orderRef = db.collection("certification_orders").doc(orderId)
      const orderSnap = await orderRef.get()
      if (orderSnap.exists) {
        await orderRef.update({
          invoiceNumber,
          invoiceStatus: "Invoice Generated",
          invoiceGeneratedAt: Timestamp.now(),
        })
      }
    }

    // Convert PDF to Base64
    const pdfBase64 = doc.output("datauristring")

    return NextResponse.json({ pdf: pdfBase64, invoiceNumber })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
