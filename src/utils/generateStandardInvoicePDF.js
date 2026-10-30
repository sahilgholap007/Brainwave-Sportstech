import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { convertNumberToWords } from "./numberToWords.js"

// Helper function to get 2-digit Indian State code
export function getStateCode(stateName) {
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

export const generateStandardInvoicePDF = (invoiceData) => {
  const {
    invoiceNumber = "",
    invoiceDate = "",
    customerInfo = {},
    paymentInfo = {},
    items = [],
    subtotal = 0,
    processingFees = { processingFee: 0 },
    taxes = { finalTotal: 0, cgst: 0, sgst: 0, igst: 0, roundOff: 0 },
    otherReferences = "",
    hsnSummary = [],
  } = invoiceData

  const customerState = customerInfo.state || "Maharashtra"
  const isMaharashtra = customerState.toLowerCase().includes("maharashtra")
  const stateCode = getStateCode(customerState)
  const paymentType = paymentInfo.paymentType || "Bank Transfer"

  const PDFClass = jsPDF.jsPDF || jsPDF
  const doc = new PDFClass()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - margin * 2

  doc.setProperties({
    title: `Invoice_${invoiceNumber}`,
    subject: "Tax Invoice",
    author: "BRAINWAVE SPORTS TECH",
    keywords: "invoice, tax, bill",
    creator: "BRAINWAVE SPORTS TECH",
  })

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
  addText(`State: ${customerState}, Code: ${stateCode}`, margin + 2, boxY + boxHeight - 3, { fontSize: 7, maxWidth: consigneeInnerWidth })

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
  addText(`State: ${customerState}, Code: ${stateCode}`, buyerX + 2, boxY + boxHeight - 3, { fontSize: 7, maxWidth: buyerInnerWidth })

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
  addText(invoiceNumber, margin + 2, detailsY + detailsRowHeight + 3.5, { fontSize: 7, fontStyle: "bold" })
  addText(invoiceDate, margin + col1Width + 2, detailsY + detailsRowHeight + 3.5, { fontSize: 7, fontStyle: "bold" })

  addBox(margin, detailsY + detailsRowHeight * 2, col1Width, detailsRowHeight)
  addBox(margin + col1Width, detailsY + detailsRowHeight * 2, col2Width, detailsRowHeight)
  addText("Mode/Terms of Payment", margin + 2, detailsY + detailsRowHeight * 2 + 3.5, { fontSize: 7 })
  addText("Other References", margin + col1Width + 2, detailsY + detailsRowHeight * 2 + 3.5, { fontSize: 7 })

  addBox(margin, detailsY + detailsRowHeight * 3, col1Width, detailsRowHeight)
  addBox(margin + col1Width, detailsY + detailsRowHeight * 3, col2Width, detailsRowHeight)
  addText(paymentType, margin + 2, detailsY + detailsRowHeight * 3 + 3.5, { fontSize: 7 })
  addText(otherReferences || "", margin + col1Width + 2, detailsY + detailsRowHeight * 3 + 3.5, { fontSize: 7 })

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
    item.description || "",
    item.hsn || "998346",
    item.quantity || 1,
    Number(item.rate || 0).toFixed(2),
    (Number(item.quantity || 1) * Number(item.rate || 0)).toFixed(2),
  ])

  // If processing fee applies
  if (processingFees?.processingFee > 0) {
    tableData.push([
      items.length + 1,
      "Commission on Card Payments",
      "997158",
      1,
      Number(processingFees.processingFee).toFixed(2),
      Number(processingFees.processingFee).toFixed(2),
    ])
  }

  autoTable(doc, {
    startY: itemsY,
    head: [headers.map((h) => h.header)],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 7,
      cellPadding: 1,
    },
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

  // Check if page break is needed before totals
  if (doc.lastAutoTable.finalY + 45 > pageHeight - margin) {
    doc.addPage()
    doc.lastAutoTable.finalY = margin
  }

  let lastY = doc.lastAutoTable.finalY + 5
  const amountColumnX = margin + 10 + 80 + 25 + 20 + 20
  const amountColumnWidth = 25
  const taxableAmount = subtotal + (processingFees?.processingFee || 0)

  addText("Sub Total", margin, lastY, { fontSize: 7 })
  addText(`Rs. ${taxableAmount.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
  lastY += 3

  if (isMaharashtra) {
    const cgstRate = taxableAmount > 0 ? ((taxes.cgst / taxableAmount) * 100).toFixed(0) : "9"
    const sgstRate = taxableAmount > 0 ? ((taxes.sgst / taxableAmount) * 100).toFixed(0) : "9"
    addText(`Output CGST @ ${cgstRate}%`, margin, lastY, { fontSize: 7 })
    addText(`Rs. ${(taxes.cgst || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 3
    addText(`Output SGST @ ${sgstRate}%`, margin, lastY, { fontSize: 7 })
    addText(`Rs. ${(taxes.sgst || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 3
  } else {
    const igstRate = taxableAmount > 0 ? ((taxes.igst / taxableAmount) * 100).toFixed(0) : "18"
    addText(`Output IGST @ ${igstRate}%`, margin, lastY, { fontSize: 7 })
    addText(`Rs. ${(taxes.igst || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 3
  }

  addText("Rounded Off", margin, lastY, { fontSize: 7 })
  addText(`Rs. ${(taxes.roundOff || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
  lastY += 3

  addText("Total", margin, lastY, { fontStyle: "bold", fontSize: 8 })
  addText(`Rs. ${(taxes.finalTotal || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })
  lastY += 5

  addText("Amount Chargeable (in words)", margin, lastY, { fontStyle: "bold", fontSize: 7 })
  addText("E. & O.E", pageWidth - margin, lastY, { align: "right", fontSize: 7 })
  lastY += 3

  const amountInWords = convertNumberToWords(taxes.finalTotal || 0)
  addText(`INR ${amountInWords} Only`, margin, lastY, { fontStyle: "italic", fontSize: 7 })
  lastY += 5

  // HSN/SAC summary table
  const taxSummaryHeaders = isMaharashtra
    ? ["HSN/SAC", "Taxable\nValue", "Central Tax", "State Tax", "Total\nTax Amount"]
    : ["HSN/SAC", "Taxable\nValue", "Integrated Tax", "Total\nTax Amount"]

  const taxSummarySubHeaders = isMaharashtra
    ? ["", "", "Rate", "Amount", "Rate", "Amount", ""]
    : ["", "", "Rate", "Amount", ""]

  // Build summary rows from hsnSummary if available, else derive
  let summaryRows = []
  if (hsnSummary && hsnSummary.length > 0) {
    summaryRows = hsnSummary.map((item) => {
      if (isMaharashtra) {
        return [
          item.hsn || "998346",
          (item.taxableValue || 0).toFixed(2),
          `${item.cgstRate || 9}%`,
          (item.cgstAmount || 0).toFixed(2),
          `${item.sgstRate || 9}%`,
          (item.sgstAmount || 0).toFixed(2),
          (item.totalTax || 0).toFixed(2),
        ]
      } else {
        return [
          item.hsn || "998346",
          (item.taxableValue || 0).toFixed(2),
          `${item.igstRate || 18}%`,
          (item.igstAmount || 0).toFixed(2),
          (item.totalTax || 0).toFixed(2),
        ]
      }
    })
  } else {
    summaryRows = [
      isMaharashtra
        ? ["998346", taxableAmount.toFixed(2), "9%", (taxes.cgst || 0).toFixed(2), "9%", (taxes.sgst || 0).toFixed(2), ((taxes.cgst || 0) + (taxes.sgst || 0)).toFixed(2)]
        : ["998346", taxableAmount.toFixed(2), "18%", (taxes.igst || 0).toFixed(2), (taxes.igst || 0).toFixed(2)]
    ]
  }

  // Total row
  const totalSummaryRow = isMaharashtra
    ? ["Total", taxableAmount.toFixed(2), "", (taxes.cgst || 0).toFixed(2), "", (taxes.sgst || 0).toFixed(2), ((taxes.cgst || 0) + (taxes.sgst || 0)).toFixed(2)]
    : ["Total", taxableAmount.toFixed(2), "", (taxes.igst || 0).toFixed(2), (taxes.igst || 0).toFixed(2)]
  summaryRows.push(totalSummaryRow)

  if (lastY + 30 > pageHeight - margin) {
    doc.addPage()
    lastY = margin
  }

  autoTable(doc, {
    startY: lastY,
    head: [taxSummaryHeaders, taxSummarySubHeaders],
    body: summaryRows,
    theme: "grid",
    styles: { fontSize: 6, cellPadding: 0.5 },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 6,
      cellPadding: 0.5,
    },
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

  const taxInWords = convertNumberToWords(isMaharashtra ? (taxes.cgst || 0) + (taxes.sgst || 0) : (taxes.igst || 0))
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

  return doc
}

