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

async function checkDateFields() {
    const snap = await db.collection("certification_orders").get();
    snap.docs.forEach(doc => {
        const d = doc.data();
        const dateFields = {};
        for (const [k, v] of Object.entries(d)) {
            if (k.toLowerCase().includes('date') || k.toLowerCase().includes('time') || k.toLowerCase().includes('created') || k.toLowerCase().includes('at')) {
                dateFields[k] = v;
            }
        }
        console.log(`Doc [${doc.id}]:`, dateFields);
    });
}

checkDateFields().catch(console.error);
