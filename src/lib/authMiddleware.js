import { verifyIdToken } from './firebase-admin';

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

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || authResult.email !== adminEmail) {
        return new Response(
            JSON.stringify({ error: 'Forbidden: Admin access required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return authResult;
}
