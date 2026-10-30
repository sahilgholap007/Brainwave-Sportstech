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

async function inspectTargetOrders() {
    const snap = await db.collection("certification_orders").get();
    const orders = [];
    snap.docs.forEach(doc => {
        const d = doc.data();
        let date = null;
        if (d.timestamp && d.timestamp.toDate) {
            date = d.timestamp.toDate();
        } else if (d.orderDate) {
            date = new Date(d.orderDate);
        } else if (d.createdAt) {
            date = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
        }
        
        // Check if >= March 28 2026 (to see BST-260328-7II as well)
        if (date && date >= new Date("2026-03-25T00:00:00Z")) {
            orders.push({ id: doc.id, date, ...d });
        }
    });

    orders.sort((a, b) => a.date - b.date);
    console.log(`Found ${orders.length} orders >= March 25, 2026:`);
    orders.forEach((o, i) => {
        console.log(`\n--- Order #${i + 1}: ${o.id} ---`);
        console.log(`Date: ${o.date.toISOString()}`);
        console.log(`Customer: ${o.name}`);
        console.log(`Company: ${o.companyName || o.manufacturer}`);
        console.log(`Email: ${o.email}`);
        console.log(`Contact: ${o.contactNumber}`);
        console.log(`Address: ${o.mailingAddress}`);
        console.log(`State: ${o.state} | Country: ${o.country}`);
        console.log(`Category: ${o.category} | Type: ${o.type}`);
        console.log(`Model: ${o.modelName || o.paddleDetails?.modelName || o.ballDetails?.modelName || o.flooringDetails?.flooringType || o.modelNumber || 'N/A'}`);
        console.log(`Price INR: ${o.totalPriceINR || o.convertedPrice}`);
        console.log(`Payment Type: ${o.paymentType || o.paymentDetails?.paymentType}`);
        console.log(`Status: ${o.order_status}`);
        console.log(`Certificate #: ${o.certificateNumber || 'N/A'}`);
    });
}

inspectTargetOrders().catch(console.error);
