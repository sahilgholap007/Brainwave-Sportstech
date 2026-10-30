const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
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

async function inspect() {
    console.log("=== Checking list of all collections ===");
    const collections = await db.listCollections();
    console.log("Collections in DB:", collections.map(c => c.id));

    for (const coll of collections) {
        const snap = await coll.get();
        console.log(`\n--- Collection: ${coll.id} (Total docs: ${snap.docs.length}) ---`);
        
        let matchCount = 0;
        snap.docs.forEach(doc => {
            const data = doc.data();
            const inv = data.invoiceNumber || data.invoice_number || (data.invoice && data.invoice.number);
            const date = data.createdAt || data.orderDate || data.timestamp || data.invoiceDate || data.date;
            let dateStr = "";
            if (date) {
                if (date.toDate) dateStr = date.toDate().toISOString();
                else if (date instanceof Date) dateStr = date.toISOString();
                else dateStr = JSON.stringify(date);
            }
            if (inv || coll.id.includes('order') || coll.id.includes('Invoice') || coll.id.includes('Bill')) {
                console.log(`  Doc: ${doc.id} | invoiceNumber: ${inv} | date: ${dateStr} | customer/name: ${data.name || data.companyName || (data.customerInfo && data.customerInfo.company) || 'N/A'}`);
                matchCount++;
            }
        });
        if (matchCount === 0 && snap.docs.length > 0) {
            console.log("  Sample doc keys:", Object.keys(snap.docs[0].data()));
        }
    }
}

inspect().catch(console.error);
