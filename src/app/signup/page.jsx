'use client'
import React, { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseconfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      setSuccess('');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          displayName: user.displayName || email.split('@')[0], // Default name
          role: 'user', // Default role
          cart: [] // Init empty cart
        });

        setSuccess('Signup successful! You can now log in.');
        setError('');
        setFormData({ email: '', password: '', confirmPassword: '' });
      } catch (err) {
        setError(err.message);
        setSuccess('');
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2c3e50] to-slate-800 py-12 px-4 overflow-hidden">
      {/* Decorative Elements */}
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f39c12]/10 rounded-full mb-4">
            <FaUser className="text-3xl text-[#f39c12]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#2c3e50] mb-2">
            Create an Account
          </h2>
          <p className="text-gray-600">Join us today</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 text-sm text-center p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-[#2c3e50] font-bold mb-2 text-sm">Email</label>
            <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#f39c12] focus-within:border-transparent transition-all">
              <span className="px-3 text-gray-400"><FaEnvelope /></span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[#2c3e50] font-bold mb-2 text-sm">Password</label>
            <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#f39c12] focus-within:border-transparent transition-all">
              <span className="px-3 text-gray-400"><FaLock /></span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 focus:outline-none"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[#2c3e50] font-bold mb-2 text-sm">Confirm Password</label>
            <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#f39c12] focus-within:border-transparent transition-all">
              <span className="px-3 text-gray-400"><FaLock /></span>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 focus:outline-none"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#f39c12] text-white py-3 rounded-lg hover:bg-[#e67e22] transition duration-300 font-bold text-base shadow-lg hover:shadow-xl"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-600 text-sm mt-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-[#f39c12] hover:text-[#e67e22] font-bold">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
