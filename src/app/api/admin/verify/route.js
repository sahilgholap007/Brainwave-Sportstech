import { verifyIdToken } from '@/lib/firebase-admin';
import { isUserAdmin } from '@/lib/authMiddleware';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/verify
 * 
 * Server-side admin verification endpoint.
 * Verifies that the caller has a valid Firebase token AND is an authorized admin.
 * 
 * Returns: { isAdmin: true, email: string, uid: string } or 401/403 error
 */
export async function POST(req) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Unauthorized: Missing or invalid token' },
            { status: 401 }
        );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await verifyIdToken(token);
        const isAdmin = await isUserAdmin(decodedToken);

        if (!isAdmin) {
            console.warn(`Admin access denied for email: ${decodedToken.email} (UID: ${decodedToken.uid})`);
            return NextResponse.json(
                { error: 'Forbidden: Not an admin user' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            isAdmin: true,
            email: decodedToken.email,
            uid: decodedToken.uid,
        });
    } catch (error) {
        console.error('Admin verification failed:', error.message);
        return NextResponse.json(
            { error: 'Unauthorized: Invalid or expired token' },
            { status: 401 }
        );
    }
}
