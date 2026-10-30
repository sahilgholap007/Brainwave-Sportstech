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

async function inspectAllOrders() {
    const snap = await db.collection("certification_orders").get();
    const orders = [];
    snap.docs.forEach(doc => {
        const d = doc.data();
        const dateObj = parseDate(d.createdAt) || parseDate(d.orderDate) || parseDate(d.date);
        orders.push({ id: doc.id, dateObj, ...d });
    });

    orders.sort((a, b) => (a.dateObj && b.dateObj ? a.dateObj - b.dateObj : 0));

    console.log(`Total orders: ${orders.length}`);
    orders.forEach((o, idx) => {
        const dateStr = o.dateObj ? o.dateObj.toISOString().split('T')[0] : 'UNKNOWN_DATE';
        console.log(`${idx + 1}. [${o.id}] Date: ${dateStr} | ${o.name} | ${o.companyName || o.manufacturer || 'N/A'} | ${o.category} | ${o.order_status}`);
    });
}

inspectAllOrders().catch(console.error);
