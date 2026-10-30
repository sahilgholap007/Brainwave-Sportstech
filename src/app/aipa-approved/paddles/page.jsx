"use client";

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApprovedProductGrid from "@/components/ApprovedProductGrid";
import { db, defaultDb } from "@/firebase/firebaseconfig";

const AIPAApprovedPaddles = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedProducts();
  }, []);

  const fetchApprovedProducts = async () => {
    try {
      const q = query(
        collection(defaultDb, "certification_orders"),
        where("category", "==", "Paddle")
      );

      const querySnapshot = await getDocs(q);
      const paddleProducts = [];

      querySnapshot.forEach((doc) => {
        paddleProducts.push({ id: doc.id, ...doc.data() });
      });


      setProducts(paddleProducts);
    } catch (error) {
      console.error("Error fetching paddles:", error);
      toast.error("Failed to fetch paddle products.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f39c12] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2c3e50] font-semibold">Loading Approved Paddles...</p>
        </div>
      </div>
    );
  }

  // Get unique shapes for filter
  const shapes = Array.from(new Set(products.map(p => p.paddleShape).filter(Boolean)));

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <ApprovedProductGrid
        products={products}
        title={<>AIPA Approved <span className="text-[#f39c12]">Paddles</span></>}
        subtitle="Browse our comprehensive list of AIPA-certified paddles that meet the highest standards for competitive play."
        typeOptions={shapes}
        typeLabel="Shape"
      />
    </>
  );
};

export default AIPAApprovedPaddles;
