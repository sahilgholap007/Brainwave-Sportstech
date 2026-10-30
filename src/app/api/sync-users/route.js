import { NextResponse } from 'next/server';
import { getAdminApp, getAdminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const adminApp = getAdminApp();
        const auth = getAuth(adminApp);
        const db = getAdminDb();

        const logs = [];
        let createdCount = 0;
        let updatedCount = 0;

        // List all users from Firebase Auth
        // Note: listUsers() retrieves max 1000 users at once. 
        // For production with >1000 users, implementation needs pagination.
        // Assuming <1000 for this fix.
        const listUsersResult = await auth.listUsers(1000);
        const authUsers = listUsersResult.users;

        logs.push(`Found ${authUsers.length} users in Firebase Authentication.`);

        const batch = db.batch();
        let batchCount = 0;

        for (const user of authUsers) {
            const userRef = db.collection('users').doc(user.uid);
            const docSnap = await userRef.get();

            const userData = {
                uid: user.uid,
                email: user.email || null,
                displayName: user.displayName || user.email?.split('@')[0] || "Unknown User",
                photoURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
                metadata: {
                    creationTime: user.metadata.creationTime,
                    lastSignInTime: user.metadata.lastSignInTime,
                },
                lastPrePopulated: new Date()
            };

            if (!docSnap.exists) {
                // Create new doc
                batch.set(userRef, {
                    ...userData,
                    createdAt: new Date(user.metadata.creationTime).toISOString(), // Preserve original join date
                    role: 'user',
                    cart: []
                });
                createdCount++;
                batchCount++;
            } else {
                // Heal existing documents missing critical fields
                const data = docSnap.data();
                if (!data.email || !data.role) {
                    batch.update(userRef, {
                        ...userData,
                        email: data.email || user.email || null,
                        displayName: data.displayName || user.displayName || (user.email ? user.email.split('@')[0] : "Unknown User"),
                        role: data.role || 'user',
                        createdAt: data.createdAt || new Date(user.metadata.creationTime).toISOString()
                    });
                    updatedCount++;
                    batchCount++;
                }
            }

            // Commit batch every 500 operations
            if (batchCount >= 400) {
                await batch.commit();
                logs.push(`Committed batch of ${batchCount} users.`);
                batchCount = 0;
            }
        }

        // Commit remaining
        if (batchCount > 0) {
            await batch.commit();
        }

        logs.push(`Process Complete. Created: ${createdCount}, Healed: ${updatedCount}, Skipped: ${authUsers.length - createdCount - updatedCount}`);

        return NextResponse.json({
            success: true,
            logs,
            stats: {
                total: authUsers.length,
                created: createdCount,
                healed: updatedCount
            }
        });

    } catch (error) {
        console.error("Sync Users Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
