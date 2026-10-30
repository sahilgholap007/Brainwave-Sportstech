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

async function checkCustomerInfos() {
    console.log("=== Aerix Doc in AutoInvoices ===");
    const aerixDoc = await db.collection('AutoInvoices').doc('FiOfgZFqs3kFusYGjoZx').get();
    console.log(JSON.stringify(aerixDoc.data()?.customerInfo, null, 2));

    console.log("\n=== Skechers Independent Invoice ===");
    const skechInv = await db.collection('IndependentManualBills').where('invoiceNumber', '==', 'INV-OTR-26-27/007').get();
    skechInv.forEach(d => console.log(JSON.stringify(d.data().customerInfo, null, 2)));

    console.log("\n=== Gerflor Order ===");
    const gerfOrder = await db.collection('certification_orders').doc('BST-SF-261021-YO1').get();
    console.log(JSON.stringify(gerfOrder.data(), null, 2));
}

checkCustomerInfos().catch(console.error);
