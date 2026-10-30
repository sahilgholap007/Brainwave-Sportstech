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

async function inspectDoc() {
    const doc = await db.collection('certification_orders').doc('BST-260529-51B').get();
    console.log("BST-260529-51B data:");
    console.log(JSON.stringify(doc.data(), null, 2));

    const doc2 = await db.collection('certification_orders').doc('BST-260328-7II').get();
    console.log("\nBST-260328-7II data:");
    console.log(JSON.stringify(doc2.data(), null, 2));
}

inspectDoc().catch(console.error);
