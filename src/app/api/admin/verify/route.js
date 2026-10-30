import { verifyIdToken } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/verify
 * 
 * Server-side admin verification endpoint.
 * Verifies that the caller has a valid Firebase token AND is the admin user.
 * 
 * Returns: { isAdmin: true } or 401/403 error
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
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.error('ADMIN_EMAIL not set in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (decodedToken.email !== adminEmail) {
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
