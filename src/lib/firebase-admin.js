import admin from 'firebase-admin';

/**
 * Centralized Firebase Admin SDK initialization
 * Ensures only one instance is created and reused across all API routes
 */

let adminApp = null;
let adminDb = null;
let adminAuth = null;

/**
 * Get or initialize Firebase Admin App
 * @returns {admin.app.App} Firebase Admin App instance
 */
export function getAdminApp() {
    if (!adminApp) {
        const apps = admin.apps;

        if (!apps || apps.length === 0) {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'brainwave-sportstech';
            const clientEmail = process.env.F_CLIENT_EMAIL;
            const privateKey = process.env.F_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (clientEmail && privateKey) {
                adminApp = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            } else {
                // In Cloud Run / Firebase Functions, use default ambient credentials if available
                adminApp = admin.initializeApp({
                    projectId,
                });
            }
        } else {
            // Use existing app
            adminApp = apps[0];
        }
    }

    return adminApp;
}

/**
 * Get Firestore Admin instance
 * @returns {admin.firestore.Firestore} Firestore instance
 */
export function getAdminDb() {
    if (!adminDb) {
        const app = getAdminApp();
        const envDbId = process.env.NEXT_PUBLIC_FIREBASE_DB_ID;
        const isProd = process.env.NODE_ENV === "production" && !process.env.FORCE_STAGING_DB;
        const targetId = isProd 
            ? undefined 
            : (envDbId && envDbId !== "(default)" ? envDbId : undefined);

        adminDb = targetId 
            ? admin.firestore(app, targetId) 
            : admin.firestore(app);
    }
    return adminDb;
}

/**
 * Get Firebase Auth Admin instance
 * @returns {admin.auth.Auth} Auth instance
 */
export function getAdminAuth() {
    if (!adminAuth) {
        adminAuth = admin.auth(getAdminApp());
    }
    return adminAuth;
}

/**
 * Verify Firebase ID token
 * @param {string} token - Firebase ID token from Authorization header
 * @returns {Promise<admin.auth.DecodedIdToken>} Decoded token
 */
export async function verifyIdToken(token) {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(token);
}

/**
 * Get user by UID
 * @param {string} uid - User ID
 * @returns {Promise<admin.auth.UserRecord>} User record
 */
export async function getUserByUid(uid) {
    const auth = getAdminAuth();
    return await auth.getUser(uid);
}

export const Timestamp = admin.firestore.Timestamp;
export const FieldValue = admin.firestore.FieldValue;
export default admin;
