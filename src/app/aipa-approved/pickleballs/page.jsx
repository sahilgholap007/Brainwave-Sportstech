"use client";

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApprovedProductGrid from "@/components/ApprovedProductGrid";
import { db, defaultDb } from "@/firebase/firebaseconfig";

const AIPAApprovedPickleballs = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedPickleballs();
  }, []);

  const fetchApprovedPickleballs = async () => {
    try {
      const q = query(
        collection(defaultDb, "certification_orders"),
        where("category", "==", "Ball")
      );

      const querySnapshot = await getDocs(q);
      const ballProducts = [];

      querySnapshot.forEach((doc) => {
        ballProducts.push({ id: doc.id, ...doc.data() });
      });


      setProducts(ballProducts);
    } catch (error) {
      console.error("Error fetching pickleballs:", error);
      toast.error("Failed to fetch pickleball products.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f39c12] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2c3e50] font-semibold">Loading Approved Pickleballs...</p>
        </div>
      </div>
    );
  }

  // Get unique useTypes for filter
  const types = Array.from(new Set(products.map(p => p.useType).filter(Boolean)));

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <ApprovedProductGrid
        products={products}
        title={<>AIPA Approved <span className="text-[#f39c12]">Pickleballs</span></>}
        subtitle="Browse our comprehensive list of AIPA-certified pickleballs that meet the highest standards for competitive play."
        typeOptions={types}
        typeLabel="Type"
      />
    </>
  );
};

export default AIPAApprovedPickleballs;
