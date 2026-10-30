const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
});

const adminApp = initializeApp({
    credential: cert({
        projectId: env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
        clientEmail: env['F_CLIENT_EMAIL'],
        privateKey: env['F_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
    }),
});

const db = env['NEXT_PUBLIC_FIREBASE_DB_ID'] 
    ? getFirestore(adminApp, env['NEXT_PUBLIC_FIREBASE_DB_ID']) 
    : getFirestore(adminApp);

// Output directories
const baseOutputDir = path.join(__dirname, '..', 'downloaded_orders_FY26-27');
const invoicesDir = path.join(baseOutputDir, 'invoices');
const existingDbInvoicesDir = path.join(baseOutputDir, 'existing_db_invoices');

fs.mkdirSync(baseOutputDir, { recursive: true });
fs.mkdirSync(invoicesDir, { recursive: true });
fs.mkdirSync(existingDbInvoicesDir, { recursive: true });

// State Codes Mapping
const stateCodes = {
    'Andhra Pradesh': '37',
    'Arunachal Pradesh': '12',
    'Assam': '18',
    'Bihar': '10',
    'Chhattisgarh': '22',
    'Goa': '30',
    'Gujarat': '24',
    'Haryana': '06',
    'Himachal Pradesh': '02',
    'Jharkhand': '20',
    'Karnataka': '29',
    'Kerala': '32',
    'Madhya Pradesh': '23',
    'Maharashtra': '27',
    'Manipur': '14',
    'Meghalaya': '17',
    'Mizoram': '15',
    'Nagaland': '13',
    'Odisha': '21',
    'Punjab': '03',
    'Rajasthan': '08',
    'Sikkim': '11',
    'Tamil Nadu': '33',
    'Telangana': '36',
    'Tripura': '16',
    'Uttar Pradesh': '09',
    'Uttarakhand': '05',
    'West Bengal': '19',
    'Andaman and Nicobar Islands': '35',
    'Chandigarh': '04',
    'Dadra and Nagar Haveli and Daman and Diu': '26',
    'Delhi': '07',
    'Jammu and Kashmir': '01',
    'Ladakh': '38',
    'Lakshadweep': '31',
    'Puducherry': '34'
};

function getStateCode(stateName) {
    if (!stateName) return 'XX';
    for (const [s, code] of Object.entries(stateCodes)) {
        if (stateName.toLowerCase().includes(s.toLowerCase())) return code;
    }
    return 'XX';
}

function convertNumberToWords(num) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const remainder = Math.floor(num % 100);

    let words = "";

    if (crores > 0) words += convertNumberToWords(crores) + " Crore ";
    if (lakhs > 0) words += convertNumberToWords(lakhs) + " Lakh ";
    if (thousands > 0) words += convertNumberToWords(thousands) + " Thousand ";
    if (hundreds > 0) words += ones[hundreds] + " Hundred ";

    if (remainder >= 20) {
        words += tens[Math.floor(remainder / 10)] + " ";
        if (remainder % 10 > 0) words += ones[remainder % 10] + " ";
    } else if (remainder >= 10) {
        words += teens[remainder - 10] + " ";
    } else if (remainder > 0) {
        words += ones[remainder] + " ";
    }

    return words.trim();
}

function generateInvoicePDF({
    invoiceNumber,
    invoiceDate,
    customerInfo,
    items,
    paymentType,
    processingFee = 0,
    subtotal,
    isMaharashtra,
    cgst,
    sgst,
    igst,
    finalTotal,
    roundOff = 0,
    otherReferences = ""
}) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const addText = (text, x, y, options = {}) => {
        const defaults = { align: "left", fontSize: 10, fontStyle: "normal" };
        const settings = { ...defaults, ...options };
        doc.setFontSize(settings.fontSize);
        if (settings.fontStyle === "bold") doc.setFont("helvetica", "bold");
        else if (settings.fontStyle === "italic") doc.setFont("helvetica", "italic");
        else doc.setFont("helvetica", "normal");
        doc.text(String(text || ""), x, y, { align: settings.align });
    };

    const addBox = (x, y, w, h) => doc.rect(x, y, w, h, "S");
    const addLine = (x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);

    // Header Title
    addText("Tax Invoice", pageWidth / 2, 12, { align: "center", fontSize: 14, fontStyle: "bold" });

    // Company details
    addText("BRAINWAVE SPORTS TECH", margin, 20, { fontSize: 10, fontStyle: "bold" });
    addText("BRAINWAVE VELOCITY PRIVATE LIMITED", margin, 25, { fontSize: 8 });
    addText("Unit No. 404 A wing, 4th Floor, Motibhai Tower, Opp Railway Station,", margin, 29, { fontSize: 7 });
    addText("Badlapur Railway Station, Bazar Peth, Badlapur, Thane, Maharashtra - 421503", margin, 33, { fontSize: 7 });
    addText("GSTIN/UIN: 27AANCB1614K1ZL | State: Maharashtra, Code: 27", margin, 37, { fontSize: 7 });

    // Boxes for consignee and buyer
    const boxY = 42;
    const boxHeight = 28;

    // Consignee box
    addBox(margin, boxY, contentWidth / 2 - 2, boxHeight);
    addText("Consignee (Ship to)", margin + 2, boxY + 4, { fontStyle: "bold", fontSize: 8 });
    const shippingAddressSingleLine = (customerInfo.shippingAddress || customerInfo.address || "").replace(/\n/g, ", ");
    const shippingAddressLines = doc.splitTextToSize(shippingAddressSingleLine, contentWidth / 2 - 12);
    addText(customerInfo.company || customerInfo.name || "N/A", margin + 2, boxY + 8, { fontSize: 8, fontStyle: "bold" });
    let yPos = boxY + 12;
    const maxShippingLines = Math.min(shippingAddressLines.length, 2);
    for (let i = 0; i < maxShippingLines; i++) {
        addText(shippingAddressLines[i], margin + 2, yPos, { fontSize: 7 });
        yPos += 3.5;
    }
    const stateCodeStr = getStateCode(customerInfo.state);
    addText(`State: ${customerInfo.state || "Maharashtra"}, Code: ${stateCodeStr}`, margin + 2, boxY + boxHeight - 3, { fontSize: 7 });

    // Buyer box
    addBox(margin + contentWidth / 2 + 2, boxY, contentWidth / 2 - 2, boxHeight);
    addText("Buyer (Bill to)", margin + contentWidth / 2 + 4, boxY + 4, { fontStyle: "bold", fontSize: 8 });
    const billingAddressSingleLine = (customerInfo.address || customerInfo.shippingAddress || "").replace(/\n/g, ", ");
    const billingAddressLines = doc.splitTextToSize(billingAddressSingleLine, contentWidth / 2 - 12);
    addText(customerInfo.company || customerInfo.name || "N/A", margin + contentWidth / 2 + 4, boxY + 8, { fontSize: 8, fontStyle: "bold" });
    yPos = boxY + 12;
    const maxBillingLines = Math.min(billingAddressLines.length, 2);
    for (let i = 0; i < maxBillingLines; i++) {
        addText(billingAddressLines[i], margin + contentWidth / 2 + 4, yPos, { fontSize: 7 });
        yPos += 3.5;
    }
    addText(`GSTIN: ${customerInfo.gstin || "N/A"}`, margin + contentWidth / 2 + 4, boxY + boxHeight - 7, { fontSize: 7 });
    addText(`State: ${customerInfo.state || "Maharashtra"}, Code: ${stateCodeStr}`, margin + contentWidth / 2 + 4, boxY + boxHeight - 3, { fontSize: 7 });

    // Invoice details box
    const detailsY = boxY + boxHeight + 3;
    const detailsRowHeight = 5;
    const col1Width = contentWidth / 2;
    const col2Width = contentWidth / 2;

    addBox(margin, detailsY, col1Width, detailsRowHeight);
    addBox(margin + col1Width, detailsY, col2Width, detailsRowHeight);
    addText("Invoice No.", margin + 2, detailsY + 3.5, { fontSize: 7, fontStyle: "bold" });
    addText("Dated", margin + col1Width + 2, detailsY + 3.5, { fontSize: 7, fontStyle: "bold" });

    addBox(margin, detailsY + detailsRowHeight, col1Width, detailsRowHeight);
    addBox(margin + col1Width, detailsY + detailsRowHeight, col2Width, detailsRowHeight);
    addText(invoiceNumber, margin + 2, detailsY + detailsRowHeight + 3.5, { fontSize: 7 });
    addText(invoiceDate, margin + col1Width + 2, detailsY + detailsRowHeight + 3.5, { fontSize: 7 });

    addBox(margin, detailsY + detailsRowHeight * 2, col1Width, detailsRowHeight);
    addBox(margin + col1Width, detailsY + detailsRowHeight * 2, col2Width, detailsRowHeight);
    addText("Mode/Terms of Payment", margin + 2, detailsY + detailsRowHeight * 2 + 3.5, { fontSize: 7 });
    addText("Other References", margin + col1Width + 2, detailsY + detailsRowHeight * 2 + 3.5, { fontSize: 7 });

    addBox(margin, detailsY + detailsRowHeight * 3, col1Width, detailsRowHeight);
    addBox(margin + col1Width, detailsY + detailsRowHeight * 3, col2Width, detailsRowHeight);
    addText(paymentType || "Bank Transfer", margin + 2, detailsY + detailsRowHeight * 3 + 3.5, { fontSize: 7 });
    addText(otherReferences || "", margin + col1Width + 2, detailsY + detailsRowHeight * 3 + 3.5, { fontSize: 7 });

    // Items table
    const itemsY = detailsY + detailsRowHeight * 4 + 3;
    const headers = [
        { header: "Sl\nNo.", dataKey: "index" },
        { header: "Description of\nServices", dataKey: "description" },
        { header: "HSN/SAC", dataKey: "hsn" },
        { header: "Qty", dataKey: "quantity" },
        { header: "Rate (INR)", dataKey: "rate" },
        { header: "Amount (INR)", dataKey: "amount" },
    ];

    const tableData = [];
    items.forEach((item, index) => {
        tableData.push([
            index + 1, 
            item.description + (item.productDescription ? `\n(${item.productDescription})` : ""), 
            item.hsn || "998346", 
            item.quantity || 1, 
            (item.rate || 0).toFixed(2), 
            ((item.quantity || 1) * (item.rate || 0)).toFixed(2)
        ]);
    });

    if (processingFee > 0) {
        tableData.push([
            items.length + 1, 
            "Commission on Gateway / Card Payments", 
            "997158", 
            1, 
            processingFee.toFixed(2), 
            processingFee.toFixed(2)
        ]);
    }

    autoTable(doc, {
        startY: itemsY,
        head: [headers.map((h) => h.header)],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 1.2 },
        headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 7 },
        bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 80 },
            2: { cellWidth: 25, halign: "center" },
            3: { cellWidth: 15, halign: "center" },
            4: { cellWidth: 30, halign: "right" },
            5: { cellWidth: 30, halign: "right" },
        },
        margin: { left: margin, right: margin },
    });

    let lastY = doc.lastAutoTable.finalY + 4;
    const amountColumnX = margin + 10 + 80 + 25 + 15 + 30;
    const amountColumnWidth = 30;
    const taxableAmount = subtotal + processingFee;

    addText("Sub Total", margin, lastY, { fontSize: 7 });
    addText(`Rs. ${taxableAmount.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 });
    lastY += 3.5;

    if (isMaharashtra) {
        addText("Output CGST @ 9%", margin, lastY, { fontSize: 7 });
        addText(`Rs. ${cgst.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 });
        lastY += 3.5;
        addText("Output SGST @ 9%", margin, lastY, { fontSize: 7 });
        addText(`Rs. ${sgst.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 });
        lastY += 3.5;
    } else {
        addText("Output IGST @ 18%", margin, lastY, { fontSize: 7 });
        addText(`Rs. ${igst.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 });
        lastY += 3.5;
    }

    if (roundOff !== 0) {
        addText("Rounded Off", margin, lastY, { fontSize: 7 });
        addText(`Rs. ${roundOff.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 });
        lastY += 3.5;
    }

    addText("Total (INR)", margin, lastY, { fontStyle: "bold", fontSize: 8 });
    addText(`Rs. ${finalTotal.toFixed(2)}`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 });
    lastY += 4.5;

    addText("Amount Chargeable (in words):", margin, lastY, { fontStyle: "bold", fontSize: 7 });
    addText("E. & O.E", pageWidth - margin, lastY, { align: "right", fontSize: 7 });
    lastY += 3.5;

    const amountInWords = convertNumberToWords(finalTotal);
    addText(`INR ${amountInWords} Only`, margin, lastY, { fontStyle: "italic", fontSize: 7 });
    lastY += 4.5;

    // HSN/SAC summary table
    const taxSummaryHeaders = isMaharashtra 
        ? ["HSN/SAC", "Taxable Value", "Central Tax Rate", "CGST Amount", "State Tax Rate", "SGST Amount", "Total Tax Amount"]
        : ["HSN/SAC", "Taxable Value", "Integrated Tax Rate", "IGST Amount", "Total Tax Amount"];

    const taxSummaryData = [];
    items.forEach(item => {
        const itemAmt = (item.quantity || 1) * (item.rate || 0);
        if (isMaharashtra) {
            taxSummaryData.push([
                item.hsn || "998346",
                itemAmt.toFixed(2),
                "9%",
                (itemAmt * 0.09).toFixed(2),
                "9%",
                (itemAmt * 0.09).toFixed(2),
                (itemAmt * 0.18).toFixed(2)
            ]);
        } else {
            taxSummaryData.push([
                item.hsn || "998346",
                itemAmt.toFixed(2),
                "18%",
                (itemAmt * 0.18).toFixed(2),
                (itemAmt * 0.18).toFixed(2)
            ]);
        }
    });

    if (processingFee > 0) {
        if (isMaharashtra) {
            taxSummaryData.push([
                "997158",
                processingFee.toFixed(2),
                "9%",
                (processingFee * 0.09).toFixed(2),
                "9%",
                (processingFee * 0.09).toFixed(2),
                (processingFee * 0.18).toFixed(2)
            ]);
        } else {
            taxSummaryData.push([
                "997158",
                processingFee.toFixed(2),
                "18%",
                (processingFee * 0.18).toFixed(2),
                (processingFee * 0.18).toFixed(2)
            ]);
        }
    }

    const totalRow = isMaharashtra 
        ? ["Total", taxableAmount.toFixed(2), "", cgst.toFixed(2), "", sgst.toFixed(2), (cgst + sgst).toFixed(2)]
        : ["Total", taxableAmount.toFixed(2), "", igst.toFixed(2), igst.toFixed(2)];
    taxSummaryData.push(totalRow);

    autoTable(doc, {
        startY: lastY,
        head: [taxSummaryHeaders],
        body: taxSummaryData,
        theme: "grid",
        styles: { fontSize: 6, cellPadding: 0.8 },
        headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 6 },
        bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 6 },
        margin: { left: margin, right: margin },
    });

    lastY = doc.lastAutoTable.finalY + 4;
    const totalTaxVal = isMaharashtra ? cgst + sgst : igst;
    addText("Tax Amount (in words):", margin, lastY, { fontStyle: "bold", fontSize: 7 });
    addText(`INR ${convertNumberToWords(totalTaxVal)} Only`, margin + 35, lastY, { fontStyle: "italic", fontSize: 7 });
    lastY += 5;

    // Bank Account Details & Footer
    addLine(margin, lastY, pageWidth - margin, lastY);
    lastY += 4;

    addText("Bank Account Details:", margin, lastY, { fontStyle: "bold", fontSize: 7.5 });
    lastY += 3.5;
    addText("A/C Name: Brainwave Velocity Private Limited | Bank: ICICI Bank, Badlapur Branch", margin, lastY, { fontSize: 6.5 });
    lastY += 3;
    addText("A/C Number: 278705005002 | IFSC: ICIC0002787 | Mode: NEFT / RTGS / IMPS", margin, lastY, { fontSize: 6.5 });
    lastY += 5;

    addText("Thank You for Your Business!", pageWidth / 2, lastY, { align: "center", fontSize: 8.5, fontStyle: "bold" });
    lastY += 3.5;
    addText("Brainwave Sportstech - AIPA Authorized Equipment Testing Laboratory", pageWidth / 2, lastY, { align: "center", fontSize: 6.5 });
    lastY += 2.5;
    addText("www.brainwavesportstech.com | contact@brainwavesportstech.com | +91-901-100-9611", pageWidth / 2, lastY, { align: "center", fontSize: 5.5 });

    return Buffer.from(doc.output('arraybuffer'));
}

async function processAndDownloadOrders() {
    console.log("=== Fetching Orders and Database Invoices ===");

    // Fetch collections
    const certOrdersSnap = await db.collection("certification_orders").get();
    const autoInvoicesSnap = await db.collection("AutoInvoices").get();
    const manualBillsSnap = await db.collection("ManualBills").get();
    const indManualBillsSnap = await db.collection("IndependentManualBills").get();

    // Map existing bills
    const autoBills = autoInvoicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const manualBills = manualBillsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const indBills = indManualBillsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Export existing bills to existing_db_invoices directory
    console.log(`\nExporting ${autoBills.length} AutoInvoices, ${manualBills.length} ManualBills, and ${indBills.length} IndependentManualBills...`);
    
    // Save existing ManualBills
    manualBills.forEach(b => {
        if (b.invoiceNumber && b.invoiceNumber.startsWith("26-27")) {
            const isMaharashtra = (b.customerInfo?.state || "").toLowerCase().includes("maharashtra");
            const cgst = b.taxes?.cgst || 0;
            const sgst = b.taxes?.sgst || 0;
            const igst = b.taxes?.igst || 0;
            const finalTotal = b.taxes?.finalTotal || b.subtotal || 0;
            const pdfBuf = generateInvoicePDF({
                invoiceNumber: b.invoiceNumber,
                invoiceDate: b.invoiceDate || b.invoiceDateRaw || "28 Mar 2026",
                customerInfo: b.customerInfo || {},
                items: b.items || [{ description: "Technical testing and analysis services", rate: b.subtotal, quantity: 1, hsn: "998346" }],
                paymentType: b.paymentInfo?.paymentType || "Bank Transfer",
                processingFee: b.processingFees?.processingFee || 0,
                subtotal: b.subtotal || 0,
                isMaharashtra,
                cgst,
                sgst,
                igst,
                finalTotal,
                roundOff: b.taxes?.roundOff || 0
            });
            const fname = `DB_ManualBill_${b.invoiceNumber.replace(/\//g, '-')}_${b.selectedOrderId || b.id}.pdf`;
            fs.writeFileSync(path.join(existingDbInvoicesDir, fname), pdfBuf);
        }
    });

    // Save existing AutoInvoices
    autoBills.forEach(b => {
        if (b.invoiceNumber && b.invoiceNumber.startsWith("26-27")) {
            const isMaharashtra = (b.customerInfo?.state || "").toLowerCase().includes("maharashtra");
            const cgst = b.taxes?.cgst || 0;
            const sgst = b.taxes?.sgst || 0;
            const igst = b.taxes?.igst || 0;
            const finalTotal = b.taxes?.finalTotal || b.subtotal || 0;
            const pdfBuf = generateInvoicePDF({
                invoiceNumber: b.invoiceNumber,
                invoiceDate: b.invoiceDate || b.invoiceDateRaw || "08 Aug 2026",
                customerInfo: b.customerInfo || {},
                items: b.items || [{ description: "Technical testing and analysis services", rate: b.subtotal, quantity: 1, hsn: "998346" }],
                paymentType: b.paymentInfo?.paymentType || "Bank Transfer",
                processingFee: b.processingFees?.processingFee || 0,
                subtotal: b.subtotal || 0,
                isMaharashtra,
                cgst,
                sgst,
                igst,
                finalTotal,
                roundOff: b.taxes?.roundOff || 0
            });
            const fname = `DB_AutoInvoice_${b.invoiceNumber.replace(/\//g, '-')}_${b.selectedOrderId || b.id}.pdf`;
            fs.writeFileSync(path.join(existingDbInvoicesDir, fname), pdfBuf);
        }
    });

    // Save existing IndependentManualBills
    indBills.forEach(b => {
        if (b.invoiceNumber && b.invoiceNumber.includes("26-27")) {
            const isMaharashtra = (b.customerInfo?.state || "").toLowerCase().includes("maharashtra");
            const cgst = b.taxes?.cgst || 0;
            const sgst = b.taxes?.sgst || 0;
            const igst = b.taxes?.igst || 0;
            const finalTotal = b.taxes?.finalTotal || b.subtotal || 0;
            const pdfBuf = generateInvoicePDF({
                invoiceNumber: b.invoiceNumber,
                invoiceDate: b.invoiceDate || b.invoiceDateRaw || "",
                customerInfo: b.customerInfo || {},
                items: b.items || [{ description: "Technical testing and analysis services", rate: b.subtotal, quantity: 1, hsn: "998346" }],
                paymentType: b.paymentInfo?.paymentType || "Bank Transfer",
                processingFee: b.processingFees?.processingFee || 0,
                subtotal: b.subtotal || 0,
                isMaharashtra,
                cgst,
                sgst,
                igst,
                finalTotal,
                roundOff: b.taxes?.roundOff || 0,
                otherReferences: b.otherReferences || ""
            });
            const fname = `DB_IndependentBill_${b.invoiceNumber.replace(/\//g, '-')}_${(b.customerInfo?.company || 'Bill').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            fs.writeFileSync(path.join(existingDbInvoicesDir, fname), pdfBuf);
        }
    });

    console.log("Existing DB bills exported.");

    // Filter certification_orders from late March / April 1st 2026 till date
    // Note: BST-260328-7II is the order with invoice 26-27/001 in ManualBills.
    const targetOrders = [];
    certOrdersSnap.docs.forEach(doc => {
        const d = doc.data();
        let date = null;
        if (d.timestamp && d.timestamp.toDate) date = d.timestamp.toDate();
        else if (d.orderDate) date = new Date(d.orderDate);
        else if (d.createdAt) date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);

        if (date && date >= new Date("2026-03-25T00:00:00Z")) {
            targetOrders.push({ id: doc.id, date, raw: d });
        }
    });

    // Chronological sort
    targetOrders.sort((a, b) => a.date - b.date);

    console.log(`\nFound ${targetOrders.length} orders for FY 26-27 (from 1st April / 26-27/001 till date)`);

    const summaryRows = [];
    const jsonExportData = [];

    // Assign sequential invoice numbers starting from 26-27/001
    targetOrders.forEach((item, index) => {
        const seqNumber = index + 1;
        const invoiceNumber = `26-27/${seqNumber.toString().padStart(3, '0')}`;
        const o = item.raw;
        
        // Customer Info Enrichment
        let customerCompany = o.companyName || o.manufacturer || o.name || "N/A";
        let customerName = o.name || customerCompany;
        let customerAddress = o.mailingAddress || "";
        let customerState = o.state || "Maharashtra";
        let customerGstin = o.gstin || "";
        let customerEmail = o.email || "";
        let customerContact = o.contactNumber || "";

        // Enriched info from corporate accounts (Skechers, Gerflor, Aerix, Sri Jain, Attivi)
        if (customerCompany.toLowerCase().includes("skechers") || (o.email && o.email.includes("skechers.com"))) {
            customerCompany = "SKECHERS SOUTH ASIA PRIVATE LIMITED";
            customerName = "Shweta Singh";
            customerAddress = "803 & 804, 8TH FLOOR, FULCRUM B WING, CTS NO. 48, SAHAR ROAD, NEXT TO HYATT REGENCY, ANDHERI ( E ), MUMBAI, MAHARASHTRA- 400099";
            customerState = "Maharashtra";
            customerGstin = customerGstin || "27AARCS3638L2ZL";
            customerEmail = "shweta.singh@skechers.com";
            customerContact = "+91 9667374836";
        } else if (customerCompany.toLowerCase().includes("gerflor") || (o.email && o.email.includes("gerflor.com"))) {
            customerCompany = "Gerflor";
            customerName = o.name || "Nikhil Abhimanyu Kawthankar";
            customerAddress = "ZI DU BOIS DESLOTS, 26130 SAINT-PAUL-TROIS-CHATEAUX, France";
            customerState = "Maharashtra"; // Intermediary / Overseas testing branch in India
            customerEmail = "nikhil.kawthankar@gerflor.com";
            customerContact = o.contactNumber || "9833563694";
        } else if (customerCompany.toLowerCase().includes("aerix")) {
            customerCompany = "Aerix Sports";
            customerName = "Aaryaman Modi";
            customerAddress = "Aaryaman Enterprise, 31, Ganesh Chandra Avenue, Elegance Building, 3rd Floor, Kolkata - 700013";
            customerState = "West Bengal";
            customerGstin = "GHNPM5000A1ZL";
            customerEmail = "aaryamanmodi@outlook.com";
            customerContact = "+919830777212";
        } else if (item.id === "BST-260328-7II") {
            customerCompany = "Sri Jain Pharmacy";
            customerName = "Mr Prateek Jain";
            customerAddress = "54/B1, IDA Kattedan, Hyderabad-500077";
            customerState = "Telangana";
            customerGstin = "36ADTFS9804L1Z5";
            customerEmail = "srijainpharmacy9@gmail.com";
            customerContact = "8885550222";
        } else if (item.id === "BST-260529-51B") {
            customerCompany = "Attivi Life";
            customerName = "George John";
            customerAddress = "ATTIVI, Ground Floor, Shanti Niketan, 39th Cross Rd, 8th Block, Jayanagar, Bengaluru, Karnataka 560070";
            customerState = "Karnataka";
            customerGstin = "29ACJFA8057A1ZE";
            customerEmail = "george@attivilife.com";
            customerContact = "9895188998";
        }

        // Format dates
        const formattedInvoiceDate = item.date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
        const formattedOrderDate = item.date.toISOString().split("T")[0];

        // Service & Product Description
        let category = o.category || o.type || "Paddle";
        let model = o.modelName || o.paddleDetails?.modelName || o.ballDetails?.modelName || o.flooringDetails?.flooringType || o.productName || o.modelNumber || "";
        let serviceDesc = `Technical testing and analysis services for ${category}`;
        if (category === "Flooring") serviceDesc = "Sports flooring certification and testing services";

        // Financials
        const baseAmount = parseFloat(o.totalPriceINR || o.convertedPrice || (category === "Ball" ? 21000 : 51000));
        const paymentType = o.paymentType || o.paymentDetails?.paymentType || (item.id === "BST-260328-7II" ? "Razorpay" : "Bank Transfer");
        const isRazorpay = paymentType === "Razorpay";
        const processingFee = isRazorpay ? baseAmount * 0.02 : 0;
        const taxableAmount = baseAmount + processingFee;

        const isMaharashtra = customerState.toLowerCase().includes("maharashtra");
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isMaharashtra) {
            cgst = taxableAmount * 0.09;
            sgst = taxableAmount * 0.09;
        } else {
            igst = taxableAmount * 0.18;
        }

        const totalTax = cgst + sgst + igst;
        const total = taxableAmount + totalTax;
        const roundOff = Math.round(total) - total;
        const finalTotal = Math.round(total);

        // Generate PDF
        const pdfBuffer = generateInvoicePDF({
            invoiceNumber,
            invoiceDate: formattedInvoiceDate,
            customerInfo: {
                company: customerCompany,
                name: customerName,
                address: customerAddress,
                shippingAddress: customerAddress,
                contact: customerContact,
                email: customerEmail,
                gstin: customerGstin,
                state: customerState,
                country: o.country || "India"
            },
            items: [
                {
                    description: serviceDesc,
                    productDescription: model ? `${category} - ${model}` : category,
                    quantity: 1,
                    rate: baseAmount,
                    hsn: "998346"
                }
            ],
            paymentType,
            processingFee,
            subtotal: baseAmount,
            isMaharashtra,
            cgst,
            sgst,
            igst,
            finalTotal,
            roundOff
        });

        // Save PDF file
        const safeInvNum = invoiceNumber.replace(/\//g, "-");
        const pdfFileName = `Invoice_${safeInvNum}_${item.id}.pdf`;
        const pdfFilePath = path.join(invoicesDir, pdfFileName);
        fs.writeFileSync(pdfFilePath, pdfBuffer);

        console.log(`[${seqNumber}/${targetOrders.length}] Generated ${invoiceNumber} -> ${pdfFileName} (${customerCompany} - INR ${finalTotal})`);

        // Record for CSV
        summaryRows.push({
            Invoice_Number: invoiceNumber,
            Invoice_Date: formattedInvoiceDate,
            Order_ID: item.id,
            Order_Date: formattedOrderDate,
            Customer_Name: customerName,
            Company_Name: customerCompany,
            Email: customerEmail,
            Contact_Number: customerContact,
            Billing_Address: `"${customerAddress.replace(/"/g, '""')}"`,
            State: customerState,
            State_Code: getStateCode(customerState),
            GSTIN: customerGstin,
            Category: category,
            Product_Model: model || "Standard",
            Base_Amount_INR: baseAmount.toFixed(2),
            Processing_Fee_INR: processingFee.toFixed(2),
            CGST_INR: cgst.toFixed(2),
            SGST_INR: sgst.toFixed(2),
            IGST_INR: igst.toFixed(2),
            Total_Amount_INR: finalTotal.toFixed(2),
            Payment_Mode: paymentType,
            Order_Status: o.order_status || "Completed",
            Certificate_Number: o.certificateNumber || "N/A",
            Invoice_PDF_Filename: pdfFileName
        });

        // Record for JSON
        jsonExportData.push({
            invoiceNumber,
            invoiceDate: formattedInvoiceDate,
            orderId: item.id,
            orderDate: formattedOrderDate,
            customer: {
                name: customerName,
                company: customerCompany,
                email: customerEmail,
                contact: customerContact,
                address: customerAddress,
                state: customerState,
                stateCode: getStateCode(customerState),
                gstin: customerGstin,
            },
            order: {
                category,
                model,
                status: o.order_status,
                certificateNumber: o.certificateNumber || null,
                paymentMode: paymentType,
            },
            pricing: {
                baseAmountINR: baseAmount,
                processingFeeINR: processingFee,
                taxableAmountINR: taxableAmount,
                isMaharashtra,
                cgstINR: cgst,
                sgstINR: sgst,
                igstINR: igst,
                totalTaxINR: totalTax,
                roundOffINR: roundOff,
                finalTotalINR: finalTotal
            },
            pdfFile: pdfFileName
        });
    });

    // Write CSV
    const csvHeaders = Object.keys(summaryRows[0]).join(',');
    const csvBody = summaryRows.map(r => Object.values(r).join(',')).join('\n');
    const csvContent = `${csvHeaders}\n${csvBody}`;
    const csvFilePath = path.join(baseOutputDir, 'orders_summary_FY26-27.csv');
    fs.writeFileSync(csvFilePath, csvContent, 'utf8');

    // Write JSON
    const jsonFilePath = path.join(baseOutputDir, 'orders_data_FY26-27.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonExportData, null, 2), 'utf8');

    // Generate comprehensive Markdown report
    let mdContent = `# Brainwave SportsTech - Orders & Invoices FY 2026-27\n\n`;
    mdContent += `**Export Generated:** ${new Date().toLocaleString('en-IN')}\n\n`;
    mdContent += `**Criteria:** Orders from 1st April 2026 till date, sequentially numbered starting from \`26-27/001\`.\n\n`;
    mdContent += `**Total Orders Downloaded:** ${targetOrders.length}\n\n`;
    mdContent += `### Summary Metrics\n\n`;

    const totalBase = jsonExportData.reduce((acc, cur) => acc + cur.pricing.baseAmountINR, 0);
    const totalTax = jsonExportData.reduce((acc, cur) => acc + cur.pricing.totalTaxINR, 0);
    const grandTotal = jsonExportData.reduce((acc, cur) => acc + cur.pricing.finalTotalINR, 0);

    mdContent += `| Metric | Value |\n| :--- | :--- |\n`;
    mdContent += `| Total Base Value | ₹ ${totalBase.toLocaleString('en-IN')} |\n`;
    mdContent += `| Total Taxes (GST) | ₹ ${Math.round(totalTax).toLocaleString('en-IN')} |\n`;
    mdContent += `| **Grand Total Invoiced** | **₹ ${grandTotal.toLocaleString('en-IN')}** |\n\n`;

    mdContent += `### Itemized Orders & Invoices\n\n`;
    mdContent += `| Inv # | Date | Order ID | Company / Customer | Category | Model | Base (₹) | Total (₹) | Status |\n`;
    mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    jsonExportData.forEach(item => {
        mdContent += `| **${item.invoiceNumber}** | ${item.invoiceDate} | \`${item.orderId}\` | ${item.customer.company} (${item.customer.name}) | ${item.order.category} | ${item.order.model || 'Standard'} | ₹ ${item.pricing.baseAmountINR.toLocaleString('en-IN')} | **₹ ${item.pricing.finalTotalINR.toLocaleString('en-IN')}** | ${item.order.status} |\n`;
    });

    const mdReportPath = path.join(baseOutputDir, 'ORDERS_DOWNLOAD_REPORT.md');
    fs.writeFileSync(mdReportPath, mdContent, 'utf8');

    console.log(`\n========================================`);
    console.log(`SUCCESSFULLY PROCESSED & DOWNLOADED ALL ORDERS!`);
    console.log(`- Invoices Directory: ${invoicesDir} (${targetOrders.length} PDFs)`);
    console.log(`- Existing DB Invoices: ${existingDbInvoicesDir}`);
    console.log(`- CSV Summary: ${csvFilePath}`);
    console.log(`- JSON Export: ${jsonFilePath}`);
    console.log(`- Markdown Report: ${mdReportPath}`);
    console.log(`========================================\n`);
}

processAndDownloadOrders().catch(console.error);
