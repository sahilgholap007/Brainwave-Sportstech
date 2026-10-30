import { verifyIdToken, getAdminDb } from './firebase-admin';

/**
 * Check if a decoded token belongs to an authorized admin.
 * Evaluates custom claims, admin email whitelist (including env variables),
 * and Firestore user role.
 * 
 * @param {object} decodedToken - Decoded Firebase ID token
 * @returns {Promise<boolean>}
 */
export async function isUserAdmin(decodedToken) {
    if (!decodedToken) return false;

    // 1. Check custom claims
    if (decodedToken.admin === true || decodedToken.role === 'admin') {
        return true;
    }

    const email = decodedToken.email?.trim().toLowerCase();

    // 2. Check ADMIN_EMAIL env list (comma-separated or single)
    const envEmails = (process.env.ADMIN_EMAIL || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    // Default admin fallbacks for the project
    const defaultAdmins = [
        'admin@brainwavesportstech.com',
        'gholapsahil007@gmail.com',
        'brainwavesportstech@gmail.com',
        'sahil.gholap007@gmail.com',
    ];

    const allAllowedEmails = new Set([...envEmails, ...defaultAdmins]);

    if (email && allAllowedEmails.has(email)) {
        return true;
    }

    // 3. Check Firestore `users` collection for `role: 'admin'`
    if (decodedToken.uid) {
        try {
            const db = getAdminDb();
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();
            if (userDoc.exists && userDoc.data()?.role === 'admin') {
                return true;
            }
        } catch (error) {
            console.warn('Error verifying admin role in Firestore:', error.message);
        }
    }

    return false;
}

/**
 * Verify the Firebase auth token from the request's Authorization header.
 * Returns the decoded user token if valid, or a Response error if invalid.
 *
 * Usage in API routes:
 *   const authResult = await verifyAuth(req);
 *   if (authResult instanceof Response) return authResult;
 *   // authResult is now the decoded token with uid, email, etc.
 */
export async function verifyAuth(req) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * Verify that the caller is an authenticated admin user.
 * Returns the decoded token if valid admin, or a Response error.
 *
 * Usage in admin-only API routes:
 *   const authResult = await verifyAdmin(req);
 *   if (authResult instanceof Response) return authResult;
 */
export async function verifyAdmin(req) {
    const authResult = await verifyAuth(req);
    if (authResult instanceof Response) return authResult;

    const isAdmin = await isUserAdmin(authResult);
    if (!isAdmin) {
        return new Response(
            JSON.stringify({ error: 'Forbidden: Admin access required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return authResult;
}
