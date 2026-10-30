import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { convertNumberToWords } from "./numberToWords.js"
import { getStateCode } from "./generateStandardInvoicePDF.js"

const getCurrencySymbol = (curr) => {
  switch (curr) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "AUD": return "A$";
    default: return curr + " ";
  }
};

export const generateIndependentInvoicePDF = (invoice) => {
  const {
    invoiceNumber,
    showBrandName,
    customerInfo = {},
    isInternational,
    paymentInfo = {},
    invoiceDate,
    items = [],
    subtotal = 0,
    processingFees = { processingFee: 0 },
    taxes = { finalTotal: 0, cgst: 0, sgst: 0, igst: 0, roundOff: 0 },
    currency = "INR",
    exchangeRate = 1,
    validityDays = 15,
    hsnSummary = [],
    otherReferences = ""
  } = invoice

  const isMaharashtra = !isInternational && (customerInfo?.state || "").toLowerCase().includes("maharashtra")

  // Create new PDF document
  const PDFClass = jsPDF.jsPDF || jsPDF
  const doc = new PDFClass()

  // Set document properties
  doc.setProperties({
    title: `Invoice_${invoiceNumber}`,
    subject: "Tax Invoice",
    author: "BRAINWAVE SPORTS TECH",
    keywords: "invoice, tax, bill",
    creator: "BRAINWAVE SPORTS TECH",
  })

  // Document dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  const contentWidth = pageWidth - margin * 2

  // Helper function to add text
  const addText = (text, x, y, options = {}) => {
    const defaults = {
      align: "left",
      fontSize: 10,
      fontStyle: "normal",
    }
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

  // Helper function to add a box
  const addBox = (x, y, w, h) => {
    doc.rect(x, y, w, h, "S")
  }

  // Helper function to add a line
  const addLine = (x1, y1, x2, y2) => {
    doc.line(x1, y1, x2, y2)
  }

  // Calculate item amount
  const calculateItemAmount = (item) => {
    return (item.quantity || 0) * (item.rate || 0)
  }

  // Start building the invoice - OPTIMIZED FOR SINGLE PAGE
  // Title - Compact
  addText("Tax Invoice", pageWidth / 2, 12, { align: "center", fontSize: 14, fontStyle: "bold" })

  // Company details - Reduced spacing
  let companyY = 20;
  if (showBrandName !== false) { // default to true if undefined
    addText("BRAINWAVE SPORTS TECH", margin, companyY, { fontSize: 10, fontStyle: "bold" })
    companyY += 5;
  }
  
  addText("BRAINWAVE VELOCITY PRIVATE LIMITED", margin, companyY, { fontSize: 8, fontStyle: showBrandName !== false ? "normal" : "bold" })
  companyY += 4;
  addText("Unit No. 404 A wing, 4th Floor, Motibhai Tower, Opp Railway Station,", margin, companyY, { fontSize: 7 })
  companyY += 4;
  addText("Badlapur Railway Station, Bazar Peth, Badlapur, Thane", margin, companyY, { fontSize: 7 })
  companyY += 4;
  addText("GSTIN/UIN: 27AANCB1614K1ZL | State: Maharashtra, Code: 27", margin, companyY, { fontSize: 7 })

  // Dimensions and width limits for consignee and buyer boxes
  const boxY = 42
  const boxHeight = 28 // Compact height matching template
  const halfWidth = contentWidth / 2
  const consigneeBoxWidth = halfWidth
  const consigneeInnerWidth = consigneeBoxWidth - 4
  const buyerBoxWidth = halfWidth
  const buyerInnerWidth = buyerBoxWidth - 4
  const buyerX = margin + consigneeBoxWidth

  // Consignee box
  addBox(margin, boxY, consigneeBoxWidth, boxHeight)
  addText("Consignee (Ship to)", margin + 2, boxY + 4, { fontStyle: "bold", fontSize: 8 })

  // Format shipping address & name cleanly without overlapping
  const consigneeDisplayName = (customerInfo.company || customerInfo.name || "").trim()
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  const consigneeNameLines = doc.splitTextToSize(consigneeDisplayName, consigneeInnerWidth)
  const shippingAddressRaw = customerInfo.shippingAddress || customerInfo.address || ""
  const shippingAddressClean = shippingAddressRaw.replace(/\r?\n/g, ', ').replace(/,\s*,+/g, ',').trim()
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  const shippingAddressLines = doc.splitTextToSize(shippingAddressClean, consigneeInnerWidth)

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

  // Add state info to shipping address
  const shippingStateCode = isInternational ? "96" : getStateCode(customerInfo.state)
  addText(
    `State: ${customerInfo.state || ""}, Code: ${shippingStateCode}`,
    margin + 2,
    boxY + boxHeight - 3,
    { fontSize: 7, maxWidth: consigneeInnerWidth }
  )

  // Buyer box
  addBox(buyerX, boxY, buyerBoxWidth, boxHeight)
  addText("Buyer (Bill to)", buyerX + 2, boxY + 4, { fontStyle: "bold", fontSize: 8 })

  // Format billing address & name cleanly without overlapping
  const buyerDisplayName = (customerInfo.company || customerInfo.name || "").trim()
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  const buyerNameLines = doc.splitTextToSize(buyerDisplayName, buyerInnerWidth)
  const billingAddressRaw = customerInfo.address || ""
  const billingAddressClean = billingAddressRaw.replace(/\r?\n/g, ', ').replace(/,\s*,+/g, ',').trim()
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  const billingAddressLines = doc.splitTextToSize(billingAddressClean, buyerInnerWidth)

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

  // Add GSTIN and state info to billing address - Condensed
  if (isInternational) {
    addText(`GSTIN: Company Registered Overseas`, buyerX + 2, boxY + boxHeight - 7, { fontSize: 7, maxWidth: buyerInnerWidth })
  } else {
    addText(`GSTIN: ${customerInfo.gstin || "N/A"}`, buyerX + 2, boxY + boxHeight - 7, { fontSize: 7, maxWidth: buyerInnerWidth })
  }
  const buyerStateCode = isInternational ? "96" : getStateCode(customerInfo.state)
  addText(
    `State: ${customerInfo.state || ""}, Code: ${buyerStateCode}`,
    buyerX + 2,
    boxY + boxHeight - 3,
    { fontSize: 7, maxWidth: buyerInnerWidth }
  )

  // Simplified invoice details table - COMPACT
  const detailsY = boxY + boxHeight + 3 // Reduced spacing
  const detailsRowHeight = 6 // Slightly taller for combined content
  const col1Width = contentWidth / 2
  const col2Width = contentWidth / 2

  // Invoice number and date combined
  addBox(margin, detailsY, col1Width, detailsRowHeight)
  addBox(margin + col1Width, detailsY, col2Width, detailsRowHeight)

  // Invoice No
  addText("Invoice No.: ", margin + 2, detailsY + 4, { fontSize: 7 })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  const invoiceNoWidth = doc.getTextWidth("Invoice No.: ")
  addText(`${invoiceNumber || ""}`, margin + 2 + invoiceNoWidth, detailsY + 4, { fontSize: 7, fontStyle: "bold" })

  // Dated
  addText("Dated: ", margin + col1Width + 2, detailsY + 4, { fontSize: 7 })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  const datedWidth = doc.getTextWidth("Dated: ")
  addText(`${invoiceDate || ""}`, margin + col1Width + 2 + datedWidth, detailsY + 4, { fontSize: 7, fontStyle: "bold" })

  // Payment type row combined
  addBox(margin, detailsY + detailsRowHeight, col1Width, detailsRowHeight)
  addBox(margin + col1Width, detailsY + detailsRowHeight, col2Width, detailsRowHeight)

  addText("Mode/Terms of Payment: ", margin + 2, detailsY + detailsRowHeight + 4, { fontSize: 7 })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  const modeWidth = doc.getTextWidth("Mode/Terms of Payment: ")
  addText(`${paymentInfo.paymentType || ""}`, margin + 2 + modeWidth, detailsY + detailsRowHeight + 4, { fontSize: 7, fontStyle: "bold" })
  addText(`Other References: `, margin + col1Width + 2, detailsY + detailsRowHeight + 4, { fontSize: 7 })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  const otherRefWidth = doc.getTextWidth("Other References: ")
  addText(`${otherReferences}`, margin + col1Width + 2 + otherRefWidth, detailsY + detailsRowHeight + 4, { fontSize: 7, fontStyle: "bold" })

  // Items table - COMPACT
  const itemsY = detailsY + detailsRowHeight * 2 + 3 // Reduced spacing

  const headers = [
    { header: "Sl No.", dataKey: "index" },
    { header: "Description of Services", dataKey: "description" },
    { header: "Product Description", dataKey: "productDescription" },
    { header: "HSN/SAC", dataKey: "hsn" },
    { header: "Qty", dataKey: "quantity" },
    { header: "Rate", dataKey: "rate" },
    { header: "Amount", dataKey: "amount" },
  ]

  // Table data
  const tableData = []

  // Add regular items
  items.forEach((item, index) => {
    tableData.push([
      index + 1,
      item.description || "",
      item.productDescription || "",
      item.hsn || "",
      item.quantity || 0,
      Number(item.rate || 0).toFixed(2),
      calculateItemAmount(item).toFixed(2),
    ])
  })

  // Add processing fee if applicable
  if (processingFees?.processingFee > 0) {
    tableData.push([
      items.length + 1,
      "Commission on Card Payments",
      "",
      "997158",
      1,
      processingFees.processingFee.toFixed(2),
      processingFees.processingFee.toFixed(2),
    ])
  }

  // Add items table with compact styling
  autoTable(doc, {
    startY: itemsY,
    head: [headers.map((h) => h.header)],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 7, // Smaller font
      cellPadding: 1, // Reduced padding
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 7,
      cellPadding: 1,
    },
    bodyStyles: {
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 7,
      cellPadding: 1,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 45 },
      2: { cellWidth: 70 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 15, halign: "right" },
      6: { cellWidth: 25, halign: "right" },
    },
    margin: { left: margin, right: margin },
  })

  // Check if we need to add a page after the items table for totals
  const pageHeight = doc.internal.pageSize.getHeight()
  const spaceNeededForTotals = currency !== "INR" ? 50 : 35
  
  if (doc.lastAutoTable.finalY + spaceNeededForTotals > pageHeight - margin) {
    doc.addPage()
    doc.lastAutoTable.finalY = margin // Reset Y position for new page
  }

  // Get the last Y position after the items table
  let lastY = doc.lastAutoTable.finalY + 5 // Increased spacing to prevent overlap

  const amountColumnX = margin + 10 + 45 + 70 + 15 + 10 + 15 // Position where Amount column starts
  const amountColumnWidth = 25 // Width of Amount column

  // Add subtotal - COMPACT & FORMATTED
  const totalTaxableValue = subtotal + (processingFees?.processingFee || 0)
  addText("Sub Total", margin, lastY, { fontSize: 7 })
  addText(`Rs. ${totalTaxableValue.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
  lastY += 5 // Increased spacing

  // Add taxes - COMPACT & FORMATTED
  if ((taxes.cgst || 0) > 0 || (taxes.sgst || 0) > 0) {
    addText("CGST", margin, lastY, { fontSize: 7 })
    addText(`Rs. ${(taxes.cgst || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 5

    addText("SGST", margin, lastY, { fontSize: 7 })
    addText(`Rs. ${(taxes.sgst || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 5
  } else if ((taxes.igst || 0) > 0) {
    addText("IGST", margin, lastY, { fontSize: 7 })
    addText(`Rs. ${(taxes.igst || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 5
  }

  // Add roundoff - COMPACT & FORMATTED
  addText("Rounded Off", margin, lastY, { fontSize: 7 })
  addText(`Rs. ${(taxes.roundOff || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
  lastY += 5 // Increased spacing

  // Add total - COMPACT & FORMATTED
  addText("Total", margin, lastY, { fontStyle: "bold", fontSize: 8 })
  addText(`Rs. ${(taxes.finalTotal || 0).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })
  lastY += 7 // Increased spacing

  if (currency !== "INR") {
    addText(`Conversion Rate`, margin, lastY, { fontSize: 7 })
    addText(`1 ${currency} = Rs. ${Number(exchangeRate).toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
    lastY += 5 // Increased spacing
    
    const convertedTotal = ((taxes.finalTotal || 0) / exchangeRate).toFixed(2);
    addText(`Total in ${currency}`, margin, lastY, { fontStyle: "bold", fontSize: 8 })
    addText(`${getCurrencySymbol(currency)}${convertedTotal}`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })
    lastY += 7 // Increased spacing
  }

  // Add amount in words - COMPACT
  addText("Amount Chargeable (in words)", margin, lastY, { fontStyle: "bold", fontSize: 7 })
  addText("E. & O.E", pageWidth - margin, lastY, { align: "right", fontSize: 7 })
  lastY += 3

  // Convert amount to words
  const amountInWords = convertNumberToWords(taxes.finalTotal || 0)
  addText(`INR ${amountInWords} Only`, margin, lastY, { fontStyle: "italic", fontSize: 7 })
  lastY += 4

  if (currency !== "INR") {
    const convertedTotalNum = Number(((taxes.finalTotal || 0) / exchangeRate).toFixed(2))
    const foreignWords = convertNumberToWords(Math.round(convertedTotalNum))
    addText(`${currency} ${foreignWords} Only`, margin, lastY, { fontStyle: "italic", fontSize: 7 })
    lastY += 4
  }

  // Add HSN/SAC summary table - COMPACT
  const isZeroRated = Boolean(isInternational);
  const taxSummaryHeaders = isMaharashtra && !isZeroRated
    ? [
        [
          { content: "HSN/SAC", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
          { content: "Taxable\nValue", rowSpan: 2, styles: { valign: "middle", halign: "right" } },
          { content: "Central Tax", colSpan: 2, styles: { halign: "center" } },
          { content: "State Tax", colSpan: 2, styles: { halign: "center" } },
          { content: "Total\nTax Amount", rowSpan: 2, styles: { valign: "middle", halign: "right" } },
        ],
        ["Rate", "Amount", "Rate", "Amount"],
      ]
    : [
        [
          { content: "HSN/SAC", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
          { content: "Taxable\nValue", rowSpan: 2, styles: { valign: "middle", halign: "right" } },
          { content: isZeroRated ? "Integrated Tax (Zero-Rated Export)" : "Integrated Tax", colSpan: 2, styles: { halign: "center" } },
          { content: "Total\nTax Amount", rowSpan: 2, styles: { valign: "middle", halign: "right" } },
        ],
        ["Rate", "Amount"],
      ];

  const taxSummaryData = hsnSummary.map((item) => {
    if (isZeroRated) {
      return [
        item.hsn,
        (item.taxableValue || 0).toFixed(2),
        "0%",
        "0.00",
        "0.00",
      ]
    } else if (isMaharashtra) {
      return [
        item.hsn,
        (item.taxableValue || 0).toFixed(2),
        `${item.cgstRate || 0}%`,
        (item.cgstAmount || 0).toFixed(2),
        `${item.sgstRate || 0}%`,
        (item.sgstAmount || 0).toFixed(2),
        (item.totalTax || 0).toFixed(2),
      ]
    } else {
      return [
        item.hsn,
        (item.taxableValue || 0).toFixed(2),
        `${item.igstRate || 0}%`,
        (item.igstAmount || 0).toFixed(2),
        (item.totalTax || 0).toFixed(2),
      ]
    }
  })

  // Add a row for totals
  const totalRow = isZeroRated
    ? ["Total", totalTaxableValue.toFixed(2), "", "0.00", "0.00"]
    : isMaharashtra
      ? [
        "Total",
        totalTaxableValue.toFixed(2),
        "",
        (taxes.cgst || 0).toFixed(2),
        "",
        (taxes.sgst || 0).toFixed(2),
        ((taxes.cgst || 0) + (taxes.sgst || 0)).toFixed(2),
      ]
      : ["Total", totalTaxableValue.toFixed(2), "", (taxes.igst || 0).toFixed(2), (taxes.igst || 0).toFixed(2)]

  taxSummaryData.push(totalRow)

  // Ensure enough space for the tax summary header
  if (lastY + 15 > pageHeight - margin) {
    doc.addPage()
    lastY = margin
  }

  // Add tax summary table with compact styling
  autoTable(doc, {
    startY: lastY,
    head: taxSummaryHeaders,
    body: taxSummaryData,
    theme: "grid",
    styles: {
      fontSize: 6, // Smaller font
      cellPadding: 0.5, // Minimal padding
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 6,
      cellPadding: 0.5,
    },
    bodyStyles: {
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 6,
      cellPadding: 0.5,
    },
    columnStyles: isMaharashtra && !isZeroRated
      ? {
        0: { cellWidth: 30 },
        1: { cellWidth: 30, halign: "right" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 25, halign: "right" },
        6: { cellWidth: 40, halign: "right" },
      }
      : {
        0: { cellWidth: 35 },
        1: { cellWidth: 45, halign: "right" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 40, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
    margin: { left: margin, right: margin },
  })

  // Get the last Y position after the tax summary table
  lastY = doc.lastAutoTable.finalY + 5 // Increased spacing to move tax amount lower

  // Check if we need to add a page for bank details and signature
  const spaceNeededForFooter = 50
  if (lastY + spaceNeededForFooter > pageHeight - margin) {
    doc.addPage()
    lastY = margin + 5
  }

  // Convert tax amount to words
  const taxInWords = isZeroRated
    ? "Zero"
    : convertNumberToWords(isMaharashtra ? (taxes.cgst || 0) + (taxes.sgst || 0) : (taxes.igst || 0))

  // Add tax amount in words - COMPACT
  addText("Tax Amount (in words)  : ", margin, lastY, { fontStyle: "bold", fontSize: 7 })
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  const taxLabelWidth = doc.getTextWidth("Tax Amount (in words)  : ")
  const zeroRatedSuffix = isZeroRated ? " (Zero-rated export under LUT)" : ""
  addText(`INR ${taxInWords} Only${zeroRatedSuffix}`, margin + taxLabelWidth, lastY, { fontStyle: "italic", fontSize: 7 })
  lastY += 5 // Reduced spacing

  // Validity Note
  if (validityDays) {
    addText(`Note: This invoice is valid for ${validityDays} days.`, margin, lastY, { fontStyle: "italic", fontSize: 7 })
    lastY += 5
  }

  // ✅ Add Bank Details Footer
  addLine(margin, lastY, pageWidth - margin, lastY)
  lastY += 5 
  
  addText("Bank Account Details:", margin, lastY, { fontStyle: "bold", fontSize: 8 })
  lastY += 4
  addText("A/C Name: Brainwave Velocity Private Limited", margin, lastY, { fontSize: 7 })
  lastY += 4
  addText("Bank: ICICI Bank, Badlapur Branch", margin, lastY, { fontSize: 7 })
  lastY += 4
  addText("Bank Account Number: 278705005002", margin, lastY, { fontSize: 7 })
  lastY += 4
  addText("IFSC: ICIC0002787", margin, lastY, { fontSize: 7 })
  lastY += 8

  // Thank you message
  addText("Thank You for Your Business!", pageWidth / 2, lastY, {
    align: "center",
    fontSize: 9,
    fontStyle: "bold",
  })
  lastY += 5

  // Return the doc instead of saving directly, so caller can decide what to do
  return doc;
}
