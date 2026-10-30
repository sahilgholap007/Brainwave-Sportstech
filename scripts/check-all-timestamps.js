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

async function checkAllTimestamps() {
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
        orders.push({
            id: doc.id,
            date,
            dateStr: date ? date.toISOString().split('T')[0] : 'NO_DATE',
            name: d.name || d.manufacturer || d.companyName,
            company: d.companyName || d.manufacturer,
            category: d.category,
            status: d.order_status,
            amount: d.totalPriceINR || d.convertedPrice || 0,
            paymentType: d.paymentType
        });
    });

    orders.sort((a, b) => (a.date && b.date ? a.date - b.date : 0));
    console.log(`Total orders: ${orders.length}`);
    orders.forEach((o, i) => {
        console.log(`${(i+1).toString().padStart(2, ' ')}. [${o.id}] Date: ${o.dateStr} | ${o.name} (${o.company}) | ${o.category} | INR ${o.amount} | ${o.status}`);
    });
}

checkAllTimestamps().catch(console.error);
