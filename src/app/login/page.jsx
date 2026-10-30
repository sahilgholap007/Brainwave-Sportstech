'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/firebaseconfig';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.displayName) {
      setUsername(storedUser.displayName);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userInfo = {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        uid: user.uid,
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUsername(userInfo.displayName);
      setError('');

      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userInfo = {
        email: user.email,
        displayName: user.displayName,
        uid: user.uid,
      };

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          displayName: user.displayName || user.email.split('@')[0],
          role: 'user',
          cart: []
        });
      }

      localStorage.setItem('user', JSON.stringify(userInfo));
      setUsername(userInfo.displayName);

      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error) {
      setError('Google login failed. Please try again.');
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
          <h2 className="text-3xl font-extrabold text-[#2c3e50] mb-2">
            {username ? `Welcome, ${username}!` : "Log In"}
          </h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg mb-4">{error}</div>}

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
                placeholder="Enter your password"
              />
            </div>
            <div className="flex justify-end mt-1">
              <a href="/forgot-password" className="text-xs text-[#f39c12] hover:text-[#e67e22] font-semibold">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#f39c12] text-white py-3 rounded-lg hover:bg-[#e67e22] transition duration-300 font-bold text-base shadow-lg hover:shadow-xl"
          >
            Log In
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border-2 border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition duration-300 text-gray-700 font-semibold shadow-sm"
        >
          <FcGoogle className="text-2xl mr-2" /> Log in with Google
        </button>

        <p className="text-gray-600 text-sm mt-6 text-center">
          Don't have an account?{" "}
          <a href="/signup" className="text-[#f39c12] hover:text-[#e67e22] font-bold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
