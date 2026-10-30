const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

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

const db = env['NEXT_PUBLIC_FIREBASE_DB_ID'] ? getFirestore(adminApp, env['NEXT_PUBLIC_FIREBASE_DB_ID']) : getFirestore(adminApp);

function parseDate(val) {
    if (!val) return null;
    if (val.toDate) return val.toDate();
    if (val instanceof Date) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    return null;
}

async function deepInspect() {
    console.log("=== All ManualBills ===");
    const manSnap = await db.collection("ManualBills").get();
    const manBills = manSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    manBills.sort((a,b) => (a.invoiceNumber || '').localeCompare(b.invoiceNumber || ''));
    manBills.forEach(d => {
        console.log(`ManualBill [${d.id}]: Inv: ${d.invoiceNumber} | Date: ${d.invoiceDate} (raw: ${d.invoiceDateRaw}) | OrderId: ${d.selectedOrderId} | Customer: ${d.customerInfo?.company || d.customerInfo?.name} | Amount: ${d.taxes?.finalTotal}`);
    });

    console.log("\n=== All AutoInvoices ===");
    const autoSnap = await db.collection("AutoInvoices").get();
    const autoBills = autoSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    autoBills.sort((a,b) => (a.invoiceNumber || '').localeCompare(b.invoiceNumber || ''));
    autoBills.forEach(d => {
        console.log(`AutoInvoice [${d.id}]: Inv: ${d.invoiceNumber} | Date: ${d.invoiceDate} (raw: ${d.invoiceDateRaw}) | OrderId: ${d.selectedOrderId} | Customer: ${d.customerInfo?.company || d.customerInfo?.name} | Amount: ${d.taxes?.finalTotal}`);
    });

    console.log("\n=== certification_orders from 2026-04-01 onwards ===");
    const certOrders = await db.collection("certification_orders").get();
    const apr1_2026 = new Date("2026-04-01T00:00:00Z");
    const filteredOrders = [];
    certOrders.docs.forEach(doc => {
        const d = doc.data();
        let dateObj = parseDate(d.createdAt) || parseDate(d.orderDate) || parseDate(d.date);
        
        if (dateObj && dateObj >= apr1_2026) {
            filteredOrders.push({ id: doc.id, dateObj, rawData: d });
        }
    });
    
    // Sort chronologically
    filteredOrders.sort((a, b) => a.dateObj - b.dateObj);
    console.log(`Total orders from 1st April 2026 till date: ${filteredOrders.length}`);
    filteredOrders.forEach((item, idx) => {
        const o = item.rawData;
        console.log(`\n[${idx+1}] OrderID: ${item.id}`);
        console.log(`   Date: ${item.dateObj.toISOString()}`);
        console.log(`   Customer: ${o.name || o.manufacturer || o.facilityName} | Company: ${o.companyName || o.manufacturer}`);
        console.log(`   Category: ${o.category} | Status: ${o.order_status} | PaymentType: ${o.paymentType || o.paymentDetails?.paymentType}`);
        console.log(`   Price: INR ${o.totalPriceINR || o.convertedPrice || o.amount} | USD ${o.totalPriceUSD || o.amountUSD}`);
        console.log(`   Order invoiceNumber field: ${o.invoiceNumber || 'NONE'}`);
        console.log(`   Order invoiceUrl: ${o.invoiceUrl || 'NONE'}`);
        
        // Find matching bill in AutoInvoices or ManualBills
        const matchingAuto = autoBills.filter(b => b.selectedOrderId === item.id);
        const matchingMan = manBills.filter(b => b.selectedOrderId === item.id);
        if (matchingAuto.length > 0) {
            console.log(`   -> Found in AutoInvoices: ${matchingAuto.map(m => m.invoiceNumber).join(', ')}`);
        }
        if (matchingMan.length > 0) {
            console.log(`   -> Found in ManualBills: ${matchingMan.map(m => m.invoiceNumber).join(', ')}`);
        }
        if (matchingAuto.length === 0 && matchingMan.length === 0) {
            console.log(`   -> NO linked bill in AutoInvoices or ManualBills`);
        }
    });
}

deepInspect().catch(console.error);
