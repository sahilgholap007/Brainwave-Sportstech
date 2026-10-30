"use client";
import React from "react";
import { ShoppingCart, Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const AddToCartModal = ({ isOpen, onClose, onAddAnother }) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
        {/* Header with Background Pattern */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <path d="M0 0L100 100M100 0L0 100" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Successfully Added!</h3>
            <p className="text-blue-100 font-medium">Your item is now in the cart.</p>
          </div>
        </div>

        {/* Action Content */}
        <div className="p-8 space-y-4">
          <button
            onClick={() => {
              onAddAnother();
              onClose();
            }}
            className="w-full group flex items-center justify-between px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plus size={20} />
              </div>
              <span>Add Another Item</span>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => {
              router.push("/my-cart");
              onClose();
            }}
            className="w-full group flex items-center justify-between px-6 py-4 bg-blue-600 rounded-2xl text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <span>Go to My Cart</span>
            </div>
            <ArrowRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-center text-slate-400 text-sm pt-2">
            You can manage your items anytime in the cart.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
