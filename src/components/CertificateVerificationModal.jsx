import React from 'react';
import Image from 'next/image';
import { AiOutlineClose } from 'react-icons/ai';
import { ShieldCheck, Calendar, Package, User } from 'lucide-react';
import Link from 'next/link';

export default function CertificateVerificationModal({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  const isCertified = product.order_status === "Certification Completed" || product.order_status === "Certification completed";
  const imageSrc = product.flooringImage || product.paddleImage || product.ballImage || null;
  const modelName = product.productTradeName || product.productName || product.modelName || "N/A";
  const companyName = product.companyName || product.flooringManufacturer || product.manufacturer || product.company || "N/A";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className={`px-6 py-4 flex items-center justify-between text-white ${isCertified ? 'bg-gradient-to-r from-emerald-600 to-emerald-800' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}>
          <div className="flex items-center gap-3">
            {isCertified ? <ShieldCheck className="w-6 h-6" /> : <Package className="w-6 h-6" />}
            <h3 className="text-xl font-bold">
              {isCertified ? "AIPA Certified Product" : "Product Details"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Side */}
            <div className="flex flex-col items-center justify-center bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
              <div className="relative w-full aspect-square max-w-[250px] mb-4">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={product.modelName || "Product"}
                    fill
                    unoptimized={true}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 rounded-lg">
                    No Image
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                  {product.category || product.type || "Product"}
                </span>
              </div>
            </div>

            {/* Details Side */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Model</h4>
                <p className="text-2xl font-bold text-slate-900">{modelName}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                  <User className="w-3 h-3 mr-1" /> Manufacturer / Brand
                </h4>
                <p className="text-lg font-medium text-slate-800">
                  {companyName}
                </p>
              </div>

              {isCertified && (
                <>
                  <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> Issue Date
                      </h4>
                      <p className="font-medium text-slate-900">
                        {product.dateOfCertification 
                          ? new Date(product.dateOfCertification).toLocaleDateString()
                          : product.certificateGeneratedAt 
                            ? new Date(product.certificateGeneratedAt.seconds * 1000).toLocaleDateString() 
                            : "N/A"}
                      </p>
                    </div>
                    {product.certificateExpiryDate && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> Expiry
                        </h4>
                        <p className="font-medium text-slate-900">{product.certificateExpiryDate}</p>
                      </div>
                    )}
                  </div>
                  
                  {product.certificateNumber && (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 mt-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <p className="text-xs text-emerald-800 uppercase font-semibold mb-1">Certificate No.</p>
                          <p className="font-mono text-emerald-900 font-bold">{product.certificateNumber}</p>
                        </div>
                        <Link 
                          href={`/verify/${product.certificateNumber}`}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Verify Certificate
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
