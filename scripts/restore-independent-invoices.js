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

const db = env['NEXT_PUBLIC_FIREBASE_DB_ID'] 
    ? getFirestore(adminApp, env['NEXT_PUBLIC_FIREBASE_DB_ID']) 
    : getFirestore(adminApp);

function getFinancialYear() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let startYear, endYear;
    if (currentMonth < 3) {
        startYear = currentYear - 1;
        endYear = currentYear;
    } else {
        startYear = currentYear;
        endYear = currentYear + 1;
    }

    return `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;
}

async function restoreIndependentInvoices() {
    console.log('=== Restoring Independent Manual Bills from Archive ===\n');

    const archiveSnap = await db.collection('IndependentManualBills_Archive').get();
    console.log(`Found ${archiveSnap.docs.length} documents in IndependentManualBills_Archive.`);

    if (archiveSnap.empty) {
        console.log('No documents found to restore.');
        return;
    }

    for (const docSnap of archiveSnap.docs) {
        const data = docSnap.data();
        const docId = docSnap.id;
        
        // Remove archivedAt field when restoring back to active collection
        const { archivedAt, ...originalData } = data;

        // Restore to IndependentManualBills
        await db.collection('IndependentManualBills').doc(docId).set(originalData);
        console.log(`Restored doc ${docId} (Invoice: ${data.invoiceNumber}) to IndependentManualBills`);

        // Remove from archive now that it is restored
        await db.collection('IndependentManualBills_Archive').doc(docId).delete();
    }

    // Verify restored state and next invoice number
    console.log('\n=== VERIFICATION ===');
    const fy = getFinancialYear();
    const currentSnap = await db.collection('IndependentManualBills').get();
    console.log(`Total active IndependentManualBills now: ${currentSnap.docs.length}`);

    let maxIndNumber = 0;
    currentSnap.forEach(doc => {
        const data = doc.data();
        console.log(`  - Doc: ${doc.id} | Inv#: ${data.invoiceNumber} | Customer: ${data.customerInfo?.company || data.customerInfo?.name}`);
        if (data.invoiceNumber && data.invoiceNumber.startsWith(`INV-OTR-${fy}`)) {
            const numberPart = data.invoiceNumber.split('/')[1];
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxIndNumber) {
                maxIndNumber = num;
            }
        }
    });

    const nextIndInvoiceNumber = `INV-OTR-${fy}/${(maxIndNumber + 1).toString().padStart(3, '0')}`;
    console.log(`\nNext Independent Invoice Number will now be: ${nextIndInvoiceNumber}`);
    console.log('AutoInvoices (Order Details) remain in archive as requested.');
}

restoreIndependentInvoices().catch(console.error);
