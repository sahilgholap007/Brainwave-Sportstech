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
    console.log("Starting to clear IndependentManualBills collection...");
    
    const billsRef = db.collection('IndependentManualBills');
    const billsSnap = await billsRef.get();
    
    let batch = db.batch();
    let count = 0;
    
    for (const doc of billsSnap.docs) {
        batch.delete(doc.ref);
        count++;
        
        if (count % 400 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }
    
    if (count > 0) {
        await batch.commit();
    }
    
    console.log(`Deleted ${count} bill documents from IndependentManualBills.`);
    console.log("Done.");
}

run().catch(console.error);
