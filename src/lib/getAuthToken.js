import { auth } from '@/firebase/firebaseconfig';

/**
 * Get the current user's Firebase ID token for API authorization.
 * Returns the token string or null if the user is not logged in.
 *
 * Usage:
 *   const token = await getAuthToken();
 *   fetch('/api/someRoute', {
 *     headers: {
 *       'Content-Type': 'application/json',
 *       ...(token && { 'Authorization': `Bearer ${token}` }),
 *     },
 *   });
 */
export async function getAuthToken() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
    }
}
