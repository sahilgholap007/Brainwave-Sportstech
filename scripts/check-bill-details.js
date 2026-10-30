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

async function checkDetails() {
    console.log("=== Skechers Bill (IndependentManualBills 7saFRA80aI61rTbG7qXv) ===");
    const skechDoc = await db.collection('IndependentManualBills').doc('7saFRA80aI61rTbG7qXv').get();
    console.log(JSON.stringify(skechDoc.data(), null, 2));

    console.log("\n=== Gerflor Bill (IndependentManualBills tMhPcUBRU0I39k0J9sqt) ===");
    const gerfDoc = await db.collection('IndependentManualBills').doc('tMhPcUBRU0I39k0J9sqt').get();
    console.log(JSON.stringify(gerfDoc.data(), null, 2));

    console.log("\n=== Sri Jain Pharmacy (ManualBills q69INqXThPX96IBk89tw) ===");
    const jainDoc = await db.collection('ManualBills').doc('q69INqXThPX96IBk89tw').get();
    console.log(JSON.stringify(jainDoc.data(), null, 2));

    console.log("\n=== Attivi Life (ManualBills 6ac21MagsGV4t5zkpKBu) ===");
    const attiviDoc = await db.collection('ManualBills').doc('6ac21MagsGV4t5zkpKBu').get();
    console.log(JSON.stringify(attiviDoc.data(), null, 2));
}

checkDetails().catch(console.error);
