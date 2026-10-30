const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
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

async function archiveAndReset() {
    const fy = getFinancialYear();
    console.log(`=== Current Financial Year: ${fy} ===\n`);

    // 1. Process AutoInvoices (Order Details Generate Invoice)
    console.log('1. Checking AutoInvoices (Order Details Invoices)...');
    const autoSnap = await db.collection('AutoInvoices').get();
    const autoToArchive = [];
    
    autoSnap.docs.forEach(doc => {
        const d = doc.data();
        if (d.invoiceNumber && d.invoiceNumber.startsWith(fy)) {
            autoToArchive.push({ id: doc.id, data: d });
        }
    });

    console.log(`Found ${autoToArchive.length} AutoInvoices for FY ${fy} to archive.`);

    for (const item of autoToArchive) {
        // Copy to AutoInvoices_Archive
        await db.collection('AutoInvoices_Archive').doc(item.id).set({
            ...item.data,
            archivedAt: Timestamp.now(),
        });
        // Delete from AutoInvoices
        await db.collection('AutoInvoices').doc(item.id).delete();
        console.log(`  -> Archived and removed AutoInvoice: ${item.id} (${item.data.invoiceNumber})`);
    }

    // 2. Process IndependentManualBills (Independent Invoice Generator)
    console.log('\n2. Checking IndependentManualBills (Independent Invoices)...');
    const indSnap = await db.collection('IndependentManualBills').get();
    const indToArchive = [];

    indSnap.docs.forEach(doc => {
        const d = doc.data();
        if (d.invoiceNumber && d.invoiceNumber.includes(fy)) {
            indToArchive.push({ id: doc.id, data: d });
        }
    });

    console.log(`Found ${indToArchive.length} IndependentManualBills for FY ${fy} to archive.`);

    for (const item of indToArchive) {
        // Copy to IndependentManualBills_Archive
        await db.collection('IndependentManualBills_Archive').doc(item.id).set({
            ...item.data,
            archivedAt: Timestamp.now(),
        });
        // Delete from IndependentManualBills
        await db.collection('IndependentManualBills').doc(item.id).delete();
        console.log(`  -> Archived and removed IndependentManualBill: ${item.id} (${item.data.invoiceNumber})`);
    }

    // 3. Verification: Calculate next invoice numbers
    console.log('\n=== VERIFICATION ===');
    
    // Check AutoInvoices next number
    const newAutoSnap = await db.collection('AutoInvoices').get();
    let maxAutoNumber = 0;
    newAutoSnap.forEach(doc => {
        const data = doc.data();
        if (data.invoiceNumber && data.invoiceNumber.startsWith(fy)) {
            const numberPart = data.invoiceNumber.split('/')[1];
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxAutoNumber) {
                maxAutoNumber = num;
            }
        }
    });
    const nextAutoInvoiceNumber = `${fy}/${(maxAutoNumber + 1).toString().padStart(3, '0')}`;
    console.log(`Next Order Details Invoice Number: ${nextAutoInvoiceNumber}`);

    // Check IndependentManualBills next number
    const newIndSnap = await db.collection('IndependentManualBills').get();
    let maxIndNumber = 0;
    newIndSnap.forEach(doc => {
        const data = doc.data();
        if (data.invoiceNumber && data.invoiceNumber.startsWith(`INV-OTR-${fy}`)) {
            const numberPart = data.invoiceNumber.split('/')[1];
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxIndNumber) {
                maxIndNumber = num;
            }
        }
    });
    const nextIndInvoiceNumber = `INV-OTR-${fy}/${(maxIndNumber + 1).toString().padStart(3, '0')}`;
    console.log(`Next Independent Invoice Number:   ${nextIndInvoiceNumber}`);

    console.log('\nReset operation completed successfully!');
}

archiveAndReset().catch(console.error);
