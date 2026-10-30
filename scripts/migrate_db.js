const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../brainwave-sportstech-firebase-adminsdk-fbsvc-7075cb4ce3.json");

// Initialize Firebase Admin
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// 1. Source DB (Default)
const sourceDb = getFirestore(app); // Default database

// 2. Target DB (Named: new-db)
const targetDb = getFirestore(app, "new-db");

// Configurations
const TRANSFORM_COLLECTIONS = [
    { name: "CourtCertification", type: "Court" },
    { name: "Paddletestingforms", type: "Paddle" },
    { name: "Balltestingforms", type: "Ball" },
];
const TARGET_NORMALIZED_COLLECTION = "certification_orders";

// Collections to copy AS-IS (Root Level -> Root Level)
const DIRECT_COPY_COLLECTIONS = [
    "AutoInvoices",
    "ManualBills",
    "companyLogos"
];

const BATCH_SIZE = 500;

async function migrateData() {
    console.log("🚀 Starting Data Migration (Cross-Database)...");
    console.log("FROM: (default) Database");
    console.log("TO:   'new-db' Database");

    let totalMigrated = 0;
    let batch = targetDb.batch();
    let operationCount = 0;

    // --- PART 1: TRANSFORM & NORMALIZE (Legacy Arrays -> Collection) ---
    console.log("\n🔹 PART 1: Normalizing Legacy Orders...");
    for (const source of TRANSFORM_COLLECTIONS) {
        console.log(`\n📂 Processing Collection: ${source.name}...`);

        try {
            const snapshot = await sourceDb.collection(source.name).get();

            if (snapshot.empty) {
                console.log(`   Running empty check: No documents found in ${source.name}`);
                continue;
            }

            for (const doc of snapshot.docs) {
                const userData = doc.data();
                const userId = doc.id;
                const orders = userData.processedOrders || [];

                if (orders.length === 0) continue;

                console.log(`   👤 User: ${userId} (${orders.length} orders)`);

                for (const order of orders) {
                    const orderId = order.orderId || `MIG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

                    const newOrderDoc = {
                        ...order,
                        userId: userId,
                        type: source.type,
                        migrationStatus: "migrated",
                        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
                    };

                    const targetRef = targetDb.collection(TARGET_NORMALIZED_COLLECTION).doc(orderId);
                    batch.set(targetRef, newOrderDoc);

                    operationCount++;
                    totalMigrated++;

                    if (operationCount >= BATCH_SIZE) {
                        await batch.commit();
                        console.log(`   ✅ Committed batch of ${operationCount} documents.`);
                        batch = targetDb.batch();
                        operationCount = 0;
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Error processing ${source.name}:`, error);
        }
    }

    // --- PART 2: DIRECT COPY (Root -> Root) ---
    console.log("\n🔹 PART 2: Copying Standard Collections...");
    for (const collectionName of DIRECT_COPY_COLLECTIONS) {
        console.log(`\n📂 Processing Collection: ${collectionName}...`);

        try {
            const snapshot = await sourceDb.collection(collectionName).get();

            if (snapshot.empty) {
                console.log(`   ⚠️ No documents found in '${collectionName}'.`);
                continue;
            }

            console.log(`   📄 Found ${snapshot.size} documents.`);

            for (const doc of snapshot.docs) {
                const docData = doc.data();
                // Use same ID as source
                const targetRef = targetDb.collection(collectionName).doc(doc.id);

                batch.set(targetRef, docData);
                operationCount++;
                totalMigrated++;

                if (operationCount >= BATCH_SIZE) {
                    await batch.commit();
                    console.log(`   ✅ Committed batch of ${operationCount} documents.`);
                    batch = targetDb.batch();
                    operationCount = 0;
                }
            }
        } catch (error) {
            console.error(`❌ Error processing ${collectionName}:`, error);
        }
    }

    // Commit remaining operations
    if (operationCount > 0) {
        await batch.commit();
        console.log(`   ✅ Committed final batch of ${operationCount} documents.`);
    }

    console.log(`\n🎉 Migration Complete! Total items migrated: ${totalMigrated}`);
}

migrateData();
