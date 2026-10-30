const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
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

async function run() {
    console.log("Starting script...");
    
    // 1. Reset counters
    console.log("Resetting counters...");
    const countersRef = db.collection('certificate_counters');
    const countersSnap = await countersRef.get();
    
    let batch = db.batch();
    let count = 0;
    
    for (const doc of countersSnap.docs) {
        batch.delete(doc.ref);
        count++;
    }
    
    console.log(`Deleted ${count} counter documents.`);
    
    // 2. Remove certificate fields from orders
    console.log("Clearing orders...");
    const ordersRef = db.collection('certification_orders');
    const ordersSnap = await ordersRef.get();
    
    let updatedOrders = 0;
    
    for (const doc of ordersSnap.docs) {
        const data = doc.data();
        if (data.certificateNumber) {
            batch.update(doc.ref, {
                certificateNumber: FieldValue.delete(),
                certificateGeneratedAt: FieldValue.delete(),
                certificateExpiryDate: FieldValue.delete()
            });
            updatedOrders++;
            
            if ((count + updatedOrders) % 400 === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
    }
    
    if (count > 0 || updatedOrders > 0) {
        await batch.commit();
    }
    
    console.log(`Cleared certificate details from ${updatedOrders} orders.`);
    console.log("Done.");
}

run().catch(console.error);
