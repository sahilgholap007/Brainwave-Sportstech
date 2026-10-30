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

async function run() {
    console.log("Fetching IndependentManualBills collection...");
    
    const billsRef = db.collection('IndependentManualBills');
    const billsSnap = await billsRef.get();
    
    console.log(`Found ${billsSnap.docs.length} bills.`);
    for (const doc of billsSnap.docs) {
        console.log(doc.id, doc.data().invoiceNumber);
    }

    console.log("Fetching ManualBills collection...");
    const billsRef2 = db.collection('ManualBills');
    const billsSnap2 = await billsRef2.get();
    
    console.log(`Found ${billsSnap2.docs.length} bills in ManualBills.`);
}

run().catch(console.error);
