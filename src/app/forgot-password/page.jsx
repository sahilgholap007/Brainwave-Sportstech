'use client';
import React, { useState } from 'react';
import { auth } from '../../firebase/firebaseconfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Check your inbox.');
            setEmail('');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError('No user found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2c3e50] to-slate-800 py-12 px-4 overflow-hidden">
            {/* Decorative Elements - matching login page */}
            <div className="absolute top-20 right-10 w-64 h-64 bg-[#f39c12]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#f39c12]/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#f39c12]/5 rounded-full blur-3xl" />

            {/* Abstract background lines */}
            <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
                    <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
                    <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
                </svg>
            </div>

            <div className="relative z-10 bg-white p-8 shadow-2xl rounded-2xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-[#2c3e50] mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-gray-600">Enter your email to reset your password</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-600 text-sm text-center p-3 rounded-lg mb-4">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-[#2c3e50] font-bold mb-2 text-sm">Email</label>
                        <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#f39c12] focus-within:border-transparent transition-all">
                            <span className="px-3 text-gray-400"><FaEnvelope /></span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 focus:outline-none"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#f39c12] text-white py-3 rounded-lg hover:bg-[#e67e22] transition duration-300 font-bold text-base shadow-lg hover:shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/login" className="inline-flex items-center text-gray-600 hover:text-[#f39c12] transition-colors font-semibold">
                        <FaArrowLeft className="mr-2" /> Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
