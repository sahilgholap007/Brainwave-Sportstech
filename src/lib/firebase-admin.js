import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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
        const apps = getApps();

        if (apps.length === 0) {
            // Initialize new app
            adminApp = initializeApp({
                credential: cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.F_CLIENT_EMAIL,
                    privateKey: process.env.F_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
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
        const PROD_DB_ID = "(default)";
        const envDbId = process.env.NEXT_PUBLIC_FIREBASE_DB_ID;
        // In production runtime, force (default) database (undefined in Admin SDK)
        const isProd = process.env.NODE_ENV === "production" && !process.env.FORCE_STAGING_DB;
        // In prod or when envDbId is "(default)"/unset, targetId is undefined -> connects to (default)
        const targetId = isProd 
            ? undefined 
            : (envDbId && envDbId !== "(default)" ? envDbId : undefined);

        adminDb = targetId 
            ? getFirestore(getAdminApp(), targetId) 
            : getFirestore(getAdminApp());
    }
    return adminDb;
}

/**
 * Get Firebase Auth Admin instance
 * @returns {admin.auth.Auth} Auth instance
 */
export function getAdminAuth() {
    if (!adminAuth) {
        adminAuth = getAuth(getAdminApp());
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
