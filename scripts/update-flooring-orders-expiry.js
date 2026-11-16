const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

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

function calculateExpiryDate(order, years = 5) {
    let issueDateObj;
    if (order.dateOfCertification) {
        const parts = order.dateOfCertification.split("/");
        if (parts.length === 3) {
            issueDateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }

    if (!issueDateObj || isNaN(issueDateObj.getTime())) {
        if (order.certificateGeneratedAt) {
            const secs = order.certificateGeneratedAt.seconds || (order.certificateGeneratedAt._seconds);
            if (secs) issueDateObj = new Date(secs * 1000);
        }
    }

    if (!issueDateObj || isNaN(issueDateObj.getTime())) {
        if (order.timestamp) {
            const secs = order.timestamp.seconds || order.timestamp._seconds;
            issueDateObj = secs ? new Date(secs * 1000) : new Date(order.timestamp);
        }
    }

    if (!issueDateObj || isNaN(issueDateObj.getTime())) {
        issueDateObj = new Date();
    }

    const expiryDateObj = new Date(issueDateObj);
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + years);
    expiryDateObj.setDate(expiryDateObj.getDate() - 1);
    return expiryDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function updateOrders() {
    console.log("Checking and updating flooring/court orders to 5-year duration...");
    for (const dbId of ['(default)', 'staging', 'new-db']) {
        try {
            const db = dbId === '(default)' ? getFirestore(adminApp) : getFirestore(adminApp, dbId);
            const snap = await db.collection('certification_orders').get();
            console.log(`\nChecking database [${dbId}] (total orders: ${snap.size})`);
            
            let updatedCount = 0;
            for (const doc of snap.docs) {
                const data = doc.data();
                const cat = (data.category || data.type || '').toString().toLowerCase();
                const isFlooringOrCourt = cat.includes('floor') || cat.includes('court');
                
                if (isFlooringOrCourt) {
                    const newExpiry = calculateExpiryDate(data, 5);
                    console.log(`  Found order: ${doc.id}`);
                    console.log(`    Category: ${data.category || data.type}`);
                    console.log(`    Current Expiry: ${data.certificateExpiryDate}`);
                    console.log(`    New 5-Year Expiry: ${newExpiry}`);
                    
                    if (data.certificateExpiryDate !== newExpiry) {
                        await doc.ref.update({
                            certificateExpiryDate: newExpiry
                        });
                        console.log(`    -> Updated certificateExpiryDate to ${newExpiry}`);
                        updatedCount++;
                    } else {
                        console.log(`    -> Already up-to-date.`);
                    }
                }
            }
            console.log(`Database [${dbId}]: Updated ${updatedCount} orders.`);
        } catch (e) {
            console.log(`Database [${dbId}] error: ${e.message}`);
        }
    }
    console.log("\nFinished updating orders.");
}

updateOrders().catch(console.error);

