const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../brainwave-sportstech-firebase-adminsdk-fbsvc-7075cb4ce3.json");

// Initialize Firebase Admin
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sourceDb = getFirestore(app);
const targetDb = getFirestore(app, "new-db");

const TRANSFORM_COLLECTIONS = [
    { name: "CourtCertification", type: "Court" },
    { name: "Paddletestingforms", type: "Paddle" },
    { name: "Balltestingforms", type: "Ball" },
];

const DIRECT_COLLECTIONS = ["AutoInvoices", "ManualBills", "companyLogos"];

async function verifyMigration() {
    console.log("🔍 Starting Verification (Default DB vs. New DB)...\n");

    // --- 1. Verify TRANSFORMED Collections (Orders) ---
    console.log("🔹 PART 1: Verifying Orders (Legacy Arrays -> Collection)");

    let totalLegacyOrders = 0;

    for (const source of TRANSFORM_COLLECTIONS) {
        const snapshot = await sourceDb.collection(source.name).get();
        let collectionOrderCount = 0;

        snapshot.forEach(doc => {
            const orders = doc.data().processedOrders || [];
            collectionOrderCount += orders.length;
        });

        console.log(`   📂 ${source.name}: Found ${collectionOrderCount} embedded orders in Source.`);
        totalLegacyOrders += collectionOrderCount;
    }

    // Count in Target
    const targetOrdersSnapshot = await targetDb.collection("certification_orders").count().get();
    const totalNewOrders = targetOrdersSnapshot.data().count;

    console.log(`   👉 Target 'certification_orders': ${totalNewOrders} documents.`);

    if (totalLegacyOrders === totalNewOrders) {
        console.log("   ✅ MATCH: Order counts match perfectly.");
    } else {
        console.warn(`   ⚠️ MISMATCH: Expected ${totalLegacyOrders}, found ${totalNewOrders}. (Duplicate IDs potentially merged?)`);
    }


    // --- 2. Verify DIRECT Collections ---
    console.log("\n🔹 PART 2: Verifying Standard Collections (Direct Copy)");

    for (const colName of DIRECT_COLLECTIONS) {
        const sourceCountSnap = await sourceDb.collection(colName).count().get();
        const targetCountSnap = await targetDb.collection(colName).count().get();

        const sourceCount = sourceCountSnap.data().count;
        const targetCount = targetCountSnap.data().count;

        console.log(`   📂 ${colName}: Source=${sourceCount} | Target=${targetCount}`);

        if (sourceCount === targetCount) {
            console.log(`   ✅ MATCH`);
        } else {
            console.warn(`   ⚠️ MISMATCH`);
        }
    }

    console.log("\n🏁 Verification Complete.");
}

verifyMigration();
