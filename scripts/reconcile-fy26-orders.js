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
const db = env['NEXT_PUBLIC_FIREBASE_DB_ID'] ? getFirestore(adminApp, env['NEXT_PUBLIC_FIREBASE_DB_ID']) : getFirestore(adminApp);

async function reconcileFY2627() {
    console.log("=== STARTING RECONCILIATION FOR FY 26-27 ===\n");

    // 1. Map orders to their verified invoice numbers
    const singleOrderMappings = [
        { orderId: 'BST-260328-7II', invoiceNumber: '26-27/001', company: 'Sri Jain Pharmacy', invoiceType: 'Manual' },
        { orderId: 'BST-260529-51B', invoiceNumber: '26-27/002', company: 'Attivi', invoiceType: 'Auto' },
        { orderId: 'BST-260804-Z34', invoiceNumber: '26-27/003', company: 'Aerix Sports', invoiceType: 'Auto' },
        { orderId: 'BST-260804-3VW', invoiceNumber: '26-27/004', company: 'Aerix Sports', invoiceType: 'Auto' },
        { orderId: 'BST-260804-9QB', invoiceNumber: '26-27/005', company: 'Aerix Sports', invoiceType: 'Auto' },
        { orderId: 'BST-260804-UAZ', invoiceNumber: '26-27/006', company: 'Aerix Sports', invoiceType: 'Auto' },
        { orderId: 'BST-260804-V9G', invoiceNumber: '26-27/007', company: 'Aerix Sports', invoiceType: 'Auto' },
        { orderId: 'BST-260804-WZ3', invoiceNumber: '26-27/008', company: 'Aerix Sports', invoiceType: 'Auto' },
        { orderId: 'BST-SF-261021-YO1', invoiceNumber: 'INV-OTR-26-27/010', company: 'Gerflor', invoiceType: 'Independent' },
    ];

    const skechersOrderIds = [
        'BST-260713-RHD',
        'BST-260713-4U8',
        'BST-260713-K87',
        'BST-260713-Q22',
        'BST-260717-66C',
        'BST-260717-OIC',
        'BST-260717-ROR',
        'BST-260717-SG0',
        'BST-260717-T1E',
        'BST-260717-X5M',
        'BST-260910-80Y',
        'BST-260910-4SE',
        'BST-260910-HSR',
        'BST-260910-HK5',
    ];

    // Update single orders
    console.log("1. Updating Standard & Gerflor Orders in certification_orders...");
    for (const item of singleOrderMappings) {
        const orderRef = db.collection('certification_orders').doc(item.orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
            await orderRef.update({
                invoiceNumber: item.invoiceNumber,
                invoiceStatus: 'Invoice Generated',
                invoiceType: item.invoiceType,
                invoiceUpdatedAt: Timestamp.now(),
            });
            console.log(`  -> Linked Order ${item.orderId} (${item.company}) => ${item.invoiceNumber}`);
        } else {
            console.log(`  [!] Order ${item.orderId} does not exist in certification_orders`);
        }
    }

    // Update Skechers orders with consolidated invoice
    console.log("\n2. Updating 14 Skechers Orders in certification_orders with Consolidated Invoice INV-OTR-26-27/007...");
    for (const orderId of skechersOrderIds) {
        const orderRef = db.collection('certification_orders').doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
            await orderRef.update({
                invoiceNumber: 'INV-OTR-26-27/007',
                invoiceStatus: 'Invoice Generated',
                invoiceType: 'Consolidated Independent',
                invoiceUpdatedAt: Timestamp.now(),
            });
            console.log(`  -> Linked Skechers Order ${orderId} => INV-OTR-26-27/007`);
        } else {
            console.log(`  [!] Order ${orderId} does not exist in certification_orders`);
        }
    }

    // 3. Clean up Attivi duplicate bills (keep RiKUcXTi0CeOY3KwNE6x as primary 26-27/002 in AutoInvoices)
    console.log("\n3. Archiving duplicate Attivi invoices...");
    const duplicatesToArchive = [
        { collection: 'AutoInvoices', docId: 'DIqZFqYYRQuBFzGCRLYi', reason: 'Duplicate 26-27/001 generated for Attivi instead of Sri Jain' },
        { collection: 'AutoInvoices', docId: 'kBTNG414nQzHXHzqyn0f', reason: 'Duplicate copy of 26-27/002 generated for Attivi' },
        { collection: 'ManualBills', docId: '6ac21MagsGV4t5zkpKBu', reason: 'Duplicate 26-27/002 copy in ManualBills for Attivi' },
        { collection: 'ManualBills', docId: 'cjrmMQwEIjaBw9opJEL6', reason: 'Typo duplicate 26-27/02 in ManualBills for Attivi' },
        { collection: 'ManualBills', docId: 'EKbCFQ4pRONP1TNDEAq6', reason: 'Typo duplicate 26-27/02 (601800) in ManualBills for Attivi' },
        { collection: 'ManualBills', docId: 'NtBeRGmUJsbJaGSHdChU', reason: 'Typo duplicate 26-27/02 (601800) in ManualBills for Attivi' },
    ];

    for (const item of duplicatesToArchive) {
        const docRef = db.collection(item.collection).doc(item.docId);
        const snap = await docRef.get();
        if (snap.exists) {
            const data = snap.data();
            const archiveCollection = `${item.collection}_Archive`;
            await db.collection(archiveCollection).doc(item.docId).set({
                ...data,
                archivedAt: Timestamp.now(),
                archiveReason: item.reason,
                primaryInvoiceNumber: '26-27/002',
                isArchivedDuplicate: true,
            });
            await docRef.delete();
            console.log(`  -> Archived ${item.collection}/${item.docId} (${data.invoiceNumber}) to ${archiveCollection}`);
        } else {
            console.log(`  [i] Doc ${item.collection}/${item.docId} already archived or not found`);
        }
    }

    // 4. Initialize Atomic Sequence Counter in `counters/invoiceNumbers`
    console.log("\n4. Initializing atomic invoice sequence counters in counters/invoiceNumbers...");
    const counterRef = db.collection('counters').doc('invoiceNumbers');
    await counterRef.set({
        standard_FY26_27: 8,       // Max allocated standard is 26-27/008 (Aerix)
        independent_FY26_27: 10,   // Max allocated independent is INV-OTR-26-27/010 (Gerflor)
        updatedAt: Timestamp.now(),
    }, { merge: true });

    console.log("  -> Counter set: standard_FY26_27 = 8 (Next will be 26-27/009)");
    console.log("  -> Counter set: independent_FY26_27 = 10 (Next will be INV-OTR-26-27/011)");

    console.log("\n=== RECONCILIATION COMPLETE SUCCESSFULLY! ===");
}

reconcileFY2627().catch(console.error);

