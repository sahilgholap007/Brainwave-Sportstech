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

async function listAllBills() {
    const autoSnap = await db.collection("AutoInvoices").get();
    console.log("=== AUTO INVOICES ===");
    autoSnap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`[AutoInvoice] Doc: ${doc.id} | Inv#: ${d.invoiceNumber} | Date: ${d.invoiceDate} (raw: ${d.invoiceDateRaw}) | OrderId: ${d.selectedOrderId} | Customer: ${d.customerInfo?.company || d.customerInfo?.name} | Subtotal: ${d.subtotal} | Total: ${d.taxes?.finalTotal}`);
    });

    const manSnap = await db.collection("ManualBills").get();
    console.log("\n=== MANUAL BILLS ===");
    manSnap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`[ManualBill] Doc: ${doc.id} | Inv#: ${d.invoiceNumber} | Date: ${d.invoiceDate} (raw: ${d.invoiceDateRaw}) | OrderId: ${d.selectedOrderId} | Customer: ${d.customerInfo?.company || d.customerInfo?.name} | Subtotal: ${d.subtotal} | Total: ${d.taxes?.finalTotal}`);
    });

    const indSnap = await db.collection("IndependentManualBills").get();
    console.log("\n=== INDEPENDENT MANUAL BILLS ===");
    indSnap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`[IndManualBill] Doc: ${doc.id} | Inv#: ${d.invoiceNumber} | Date: ${d.invoiceDate} (raw: ${d.invoiceDateRaw}) | Customer: ${d.customerInfo?.company || d.customerInfo?.name} | Subtotal: ${d.subtotal} | Total: ${d.taxes?.finalTotal}`);
    });
}

listAllBills().catch(console.error);
