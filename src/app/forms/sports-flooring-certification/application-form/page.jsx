"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { auth, db } from "@/firebase/firebaseconfig";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useCart } from "@/app/contexts/CartContext";
import { toast } from "react-toastify";
// Shared utilities
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { uploadImageToStorage, finalizeImageUpload } from "@/utils/imageUpload";
import { generateFlooringOrderId } from "@/utils/orderIdGenerator";
import { getAuthToken } from "@/lib/getAuthToken";
import { useRouter } from "next/navigation";
import AddToCartModal from "@/components/AddToCartModal";

const storage = getStorage();

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  const modalContentRef = useRef(null);

  const handleScroll = () => {
    if (modalContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setCanAccept(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b bg-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800">
            Terms and Conditions - Sports Flooring Testing
          </h2>
        </div>

        {/* Modal Content */}
        <div
          ref={modalContentRef}
          onScroll={handleScroll}
          className="p-6 h-80 overflow-y-auto bg-white"
        >
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
            <p>
              Please read the terms and conditions carefully before proceeding. By continuing, you agree to the following:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Specimen Requirements:</strong> A minimum of two (2) test specimen panels measuring 500mm x 500mm each of the exact specified thickness and composition must be submitted to Brainwave SportsTech Laboratory.
              </li>
              <li>
                <strong>Advance Payment:</strong> Testing and technical evaluation will commence only after receipt of full fees in advance and successful arrival of physical test specimens.
              </li>
              <li>
                <strong>Identical Material:</strong> All submitted specimens must represent identical batch materials, layers, and manufacturing specifications.
              </li>
              <li>
                <strong>Test Standards:</strong> Testing will be performed according to specified EN, ASTM, ISO, or AIPA testing protocols for sports surfaces.
              </li>
              <li>
                <strong>Turnaround Time:</strong> Standard laboratory evaluation takes approximately three (3) to four (4) weeks upon receipt of specimens. Express testing may be requested at an additional charge.
              </li>
              <li>
                <strong>Specimen Retention:</strong> Due to destructive testing methods, test specimens will not be returned and will be retained by Brainwave SportsTech for compliance records.
              </li>
              <li>
                <strong>Liability:</strong> Brainwave SportsTech and AIPA certify only the tested specimens. The laboratory does not assume liability for variances in full-scale on-site flooring installations or subsequent substrate defects.
              </li>
              <li>
                <strong>Finality:</strong> Soft-copy laboratory evaluation reports will be furnished to both the applicant and the certification authority upon conclusion of testing.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 flex justify-end space-x-4 bg-gray-100 border-t">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canAccept
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            onClick={onAccept}
            disabled={!canAccept}
          >
            I Accept
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const BankDetailsModal = ({
  isOpen,
  onClose,
  onConfirm,
  onUpload,
  paymentImage,
  convertedPrice,
  currencySymbol,
  isPaymentUploading,
  isConfirming,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden max-h-[90vh] overflow-y-auto mt-10 mb-10">
        <div className="p-6 border-b bg-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800">
            Bank Payment Details
          </h2>
        </div>

        <div className="p-6 bg-white">
          <p className="text-gray-700 mb-4 text-sm">
            Please transfer the amount to the bank details below and upload your payment receipt screenshot.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-gray-800 text-sm">
            <p><strong>Bank Name:</strong> ICICI Bank</p>
            <p><strong>Branch Name:</strong> Badlapur</p>
            <p><strong>Account Number:</strong> 278705005002</p>
            <p><strong>IFSC Code:</strong> ICIC0002787</p>
            <p><strong>Account Holder:</strong> Brainwave Velocity Pvt Ltd</p>

            <div className="text-xl font-semibold text-blue-600 mt-4">
              <p>Base Amount: {currencySymbol} {convertedPrice.toLocaleString()}</p>
              <p>GST (18%): {currencySymbol} {(convertedPrice * 0.18).toLocaleString()}</p>
              <hr className="my-2 border-gray-300" />
              <p className="font-bold">
                Total Amount to be Paid: {currencySymbol} {(convertedPrice * 1.18).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-gray-700 font-medium block mb-2 text-sm">
              Upload Payment Receipt Screenshot
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-sm"
              required
            />
            {isPaymentUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            )}
            {paymentImage && (
              <img
                src={paymentImage}
                alt="Payment Preview"
                className="mt-4 w-32 h-32 object-cover rounded shadow-lg"
              />
            )}
          </div>
        </div>

        <div className="p-6 flex justify-end space-x-4 bg-gray-100 border-t">
          <button
            className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition text-sm ${
              isConfirming ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={onConfirm}
            disabled={!paymentImage || isConfirming}
          >
            {isConfirming ? "Confirming..." : "Confirm Payment"}
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProcessingModal = ({ isOpen, stage, pendingAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-96 p-8 text-center transform transition-all scale-100">
        <div className="mb-6 flex justify-center">
          {stage === "success" ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          ) : (
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {stage === "saving" && (pendingAction === "invoice" ? "Registering Invoice Request..." : "Processing Order...")}
          {stage === "emailing" && "Sending Confirmation..."}
          {stage === "success" && (pendingAction === "invoice" ? "Invoice Requested!" : "Thank You!")}
        </h3>

        <div className="text-gray-600 text-sm">
          {stage === "saving" && "Please wait while we register your sports flooring certification details."}
          {stage === "emailing" && "We are dispatching confirmation emails to your inbox."}
          {stage === "success" && (
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-bold text-green-600">
                {pendingAction === "invoice" ? "Invoice Request Submitted Successfully!" : "Application Submitted Successfully!"}
              </h3>
              <p className="text-gray-700">
                {pendingAction === "invoice"
                  ? "Your order has been registered! Our finance department will email your official tax invoice with 15-day credit terms shortly. Please ship your physical test specimens to our lab."
                  : "Your order is confirmed! Please ship the physical sample specimens to our test lab."}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-xs">
                <p className="font-bold text-amber-900 mb-2">📦 Sample Shipping Instructions:</p>
                <div className="text-gray-700 space-y-1">
                  <p><strong>Quantity:</strong> 2 sample specimens (500mm x 500mm each)</p>
                  <p><strong>Address:</strong> Unit 403-404, Motibhai Smriti Towers,</p>
                  <p>Opposite Railway Station, Badlapur (W),</p>
                  <p>PIN 421503, Maharashtra, India</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Home
                </button>
              </div>

              <p className="text-xs text-gray-400">Redirecting to home automatically...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, formData, imagePreview, onConfirm, pendingAction }) => {
  if (!isOpen) return null;

  const actionText =
    pendingAction === "cart"
      ? "Add to Cart"
      : pendingAction === "razorpay"
      ? "Proceed to Razorpay"
      : pendingAction === "invoice"
      ? "Confirm & Request Invoice"
      : "Proceed to Bank Details";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Review Flooring Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto grow">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <p className="text-sm text-blue-900 font-semibold">
              Please review all technical and company details before proceeding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Client / Applicant */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-md">Client / Applicant Details</h3>
              <div className="text-sm space-y-1.5 text-gray-700">
                <p><strong>Company/Organization:</strong> {formData.companyName}</p>
                <p><strong>Contact Person:</strong> {formData.contactPerson}</p>
                <p><strong>Contact Number:</strong> {formData.contactNumber}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Country:</strong> {formData.country}</p>
                <p><strong>State:</strong> {formData.state}</p>
                {formData.gstin && <p><strong>GSTIN:</strong> {formData.gstin}</p>}
                <p><strong>Client Type:</strong> {Array.isArray(formData.clientType) ? formData.clientType.join(", ") : (formData.clientType || "N/A")}</p>
              </div>
            </div>

            {/* Section 2: Sample Specifications */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-md">Flooring Sample Specifications</h3>
              <div className="text-sm space-y-1.5 text-gray-700">
                <p><strong>Product / Trade Name:</strong> {formData.productName}</p>
                <p><strong>Manufacturer:</strong> {formData.flooringManufacturer}</p>
                <p><strong>Brand Name:</strong> {formData.brandName}</p>
                <p><strong>Type of Use:</strong> {formData.useType || "Indoor"}</p>
                <p><strong>Flooring Type:</strong> {formData.flooringType || "N/A"}</p>
                <p><strong>Construction / System:</strong> {formData.flooringConstruction || "N/A"}</p>
                <p><strong>Total Thickness:</strong> {formData.totalThickness} mm</p>
                <p><strong>Sample Dimensions:</strong> {formData.sampleDimensions}</p>
                <p><strong>Colour / Finish:</strong> {formData.colorFinish}</p>
                {formData.batchNumber && <p><strong>Batch / Lot No.:</strong> {formData.batchNumber}</p>}
                {formData.dateOfManufacture && <p><strong>Date of Manufacture:</strong> {formData.dateOfManufacture}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Testing Purpose & Standards */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-md">Testing Purpose & Standards</h3>
            <div className="text-sm space-y-1.5 text-gray-700">
              <p><strong>Purpose of Testing:</strong> {formData.purposeOfTesting || "N/A"}</p>
              <p><strong>Applicable Standard:</strong> {formData.standardsUsed || "Not specified"}</p>
              {formData.layerDetails && (
                <div className="pt-2">
                  <p><strong>Layer Details / Composition:</strong></p>
                  <p className="whitespace-pre-wrap text-xs bg-white p-2.5 rounded border border-gray-200 mt-1">
                    {formData.layerDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Sample Image */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col items-center">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-md w-full text-left mb-4">Sample Image</h3>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Flooring Sample Preview"
                className="max-h-64 object-contain rounded-lg border shadow-md"
              />
            ) : (
              <p className="text-red-500 text-sm">No sample image uploaded.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition text-sm"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-sm"
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SportsFlooringTestingForm() {
  const router = useRouter();
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStage, setProcessingStage] = useState("saving");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [formData, setFormData] = useState({
    orderId: "",
    // Client Details
    companyName: "",
    country: "",
    state: "",
    contactPerson: "",
    name: "", // mapped to contactPerson
    contactNumber: "",
    email: "",
    clientType: "", // Single-select dropdown

    // Sample Details
    productName: "",
    flooringManufacturer: "",
    brandName: "",
    useType: "Indoor", // Indoor / Outdoor
    flooringType: "", // Single-select dropdown
    flooringConstruction: "", // Single-select dropdown
    totalThickness: "",
    sampleDimensions: "500mm x 500mm",
    layerDetails: "",
    colorFinish: "",
    batchNumber: "",
    dateOfManufacture: "",

    // Purpose
    purposeOfTesting: "", // Single-select dropdown

    // Standards
    standardsUsed: "", // Single-select dropdown (EN / ASTM / ISO / AIPA)

    // Agreements & Uploads
    termsAccepted: false,
    flooringImage: "",
    tempFlooringImageFilename: "",
    paymentType: "",
    paymentReceipt: "",
    tempPaymentReceiptFilename: "",
  });

  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const totalPriceINR = 60000; // Flat pricing confirmed by user

  // Dynamic currency conversion
  const {
    convertedPrice,
    currencySymbol,
    isLoading: isCurrencyLoading,
  } = useCurrencyConversion(totalPriceINR);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentImage, setPaymentImage] = useState(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isPaymentUploading, setIsPaymentUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isOtherCountry, setIsOtherCountry] = useState(false);
  const [isOtherState, setIsOtherState] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Standard input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "contactPerson" ? { name: value } : {}),
    }));
  };

  // Location dropdown handler
  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    if (name === "country") {
      setIsOtherCountry(value === "Other");
      setFormData((prev) => ({ ...prev, country: value === "Other" ? "" : value }));
    } else if (name === "state") {
      setIsOtherState(value === "Other");
      setFormData((prev) => ({ ...prev, state: value === "Other" ? "" : value }));
    }
  };

  const isFormValid = React.useMemo(() => {
    const required = [
      "companyName", "contactPerson", "contactNumber", "email",
      "country", "state", "productName", "flooringManufacturer",
      "brandName", "totalThickness", "colorFinish", "flooringImage",
      "useType"
    ];

    for (const field of required) {
      if (!formData[field]) return false;
    }

    if (formData.country === "India" && !formData.gstin) return false;
    if (!formData.clientType) return false;
    if (!formData.flooringType) return false;
    if (!formData.flooringConstruction) return false;
    if (!formData.purposeOfTesting) return false;
    if (!formData.termsAccepted) return false;

    return true;
  }, [formData]);

  const openTermsModal = () => setIsModalOpen(true);
  const closeTermsModal = () => setIsModalOpen(false);

  const handleAcceptTerms = () => {
    setFormData((prev) => ({ ...prev, termsAccepted: true }));
    closeTermsModal();
  };

  const validateEmailAndPhone = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      toast.error("Please enter a valid contact number.");
      return false;
    }

    return true;
  };

  const ensureOrderId = async () => {
    if (!formData.orderId) {
      const orderId = generateFlooringOrderId();
      await new Promise((resolve) =>
        setFormData((prev) => {
          resolve();
          return { ...prev, orderId };
        })
      );
      return orderId;
    }
    return formData.orderId;
  };

  // Sample Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed (PNG, JPG, or JPEG).");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.");
      e.target.value = "";
      return;
    }

    setIsImageUploading(true);

    const orderId = await ensureOrderId();

    const uploadedImageURL = await uploadImageToStorage(
      file,
      "flooringImages",
      orderId,
      "flooringImage",
      true
    );

    if (uploadedImageURL) {
      const { downloadURL, uniqueFileName } = uploadedImageURL;

      setFormData((prev) => ({
        ...prev,
        flooringImage: downloadURL,
        tempFlooringImageFilename: uniqueFileName,
      }));

      setImagePreview(downloadURL);
    } else {
      toast.error("Failed to upload image. Please try again.");
    }

    setIsImageUploading(false);
  };

  // Payment Receipt Upload
  const handlePaymentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed (PNG, JPG, or JPEG).");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.");
      e.target.value = "";
      return;
    }

    setIsPaymentUploading(true);
    const orderId = await ensureOrderId();

    const uploadedPaymentURL = await uploadImageToStorage(
      file,
      "payment-receipts",
      orderId,
      "paymentReceipt",
      true
    );

    if (uploadedPaymentURL) {
      const { downloadURL, uniqueFileName } = uploadedPaymentURL;

      if (formData.tempPaymentReceiptFilename) {
        const oldFileRef = ref(storage, `tempUploads/${formData.tempPaymentReceiptFilename}`);
        await deleteObject(oldFileRef).catch(() => {});
      }

      setFormData((prev) => ({
        ...prev,
        paymentReceipt: downloadURL,
        tempPaymentReceiptFilename: uniqueFileName,
      }));

      setPaymentImage(downloadURL);
    } else {
      toast.error("Failed to upload payment receipt.");
    }

    setIsPaymentUploading(false);
  };

  // Submit Bank Payment
  const handleBankPaymentSubmit = async () => {
    if (!userId) {
      toast.error("You must be logged in to submit.");
      return;
    }

    if (!formData.paymentReceipt) {
      toast.error("Please upload the payment receipt.");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsConfirming(true);

      const orderId = await ensureOrderId();

      let finalFlooringImageURL = formData.flooringImage;
      if (formData.tempFlooringImageFilename) {
        finalFlooringImageURL = await finalizeImageUpload(
          formData.tempFlooringImageFilename,
          "flooringImages"
        );
      }

      let finalPaymentReceiptURL = formData.paymentReceipt;
      if (formData.tempPaymentReceiptFilename) {
        finalPaymentReceiptURL = await finalizeImageUpload(
          formData.tempPaymentReceiptFilename,
          "payment-receipts"
        );
      }

      const orderRef = doc(db, "certification_orders", orderId);

      const order = {
        orderId,
        id: orderId,
        userId,
        category: "Flooring",
        type: "Flooring",
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        name: formData.contactPerson,
        contactNumber: formData.contactNumber,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        gstin: formData.gstin || "",
        clientType: formData.clientType,

        // Technical Flooring Specs
        productName: formData.productName,
        modelName: formData.productName, // alias for common viewers
        flooringManufacturer: formData.flooringManufacturer,
        manufacturer: formData.flooringManufacturer,
        brandName: formData.brandName,
        useType: formData.useType,
        flooringType: formData.flooringType,
        flooringConstruction: formData.flooringConstruction,
        totalThickness: formData.totalThickness,
        sampleDimensions: formData.sampleDimensions,
        layerDetails: formData.layerDetails,
        colorFinish: formData.colorFinish,
        batchNumber: formData.batchNumber,
        dateOfManufacture: formData.dateOfManufacture,
        purposeOfTesting: formData.purposeOfTesting,
        standardsUsed: formData.standardsUsed,

        flooringImage: finalFlooringImageURL,
        paymentReceipt: finalPaymentReceiptURL,
        paymentType: "Bank Transfer",
        timestamp: new Date(),
        totalPriceINR,
        convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
        order_status: "Payment received, awaiting samples",
      };

      setShowProcessingModal(true);
      setProcessingStage("saving");

      await setDoc(orderRef, order);

      setProcessingStage("emailing");

      // Dispatch confirmation email
      try {
        const emailPayload = {
          ...order,
          timestamp: new Date().toISOString(),
          userEmail: formData.email,
          userName: formData.contactPerson,
          orderId,
          newStatus: "Order placed successfully via Bank Transfer",
          paymentType: "Bank Transfer",
          category: "Flooring",
          companyName: formData.companyName,
          productName: formData.productName,
          productTradeName: formData.productName,
          flooringManufacturer: formData.flooringManufacturer,
          manufacturer: formData.flooringManufacturer,
          brandName: formData.brandName,
          useType: formData.useType,
          flooringType: formData.flooringType,
          flooringConstruction: formData.flooringConstruction,
          constructionSystem: formData.flooringConstruction,
          totalThickness: formData.totalThickness,
          sampleDimensions: formData.sampleDimensions,
          layerDetails: formData.layerDetails,
          colorFinish: formData.colorFinish,
          batchNumber: formData.batchNumber,
          dateOfManufacture: formData.dateOfManufacture,
          purposeOfTesting: formData.purposeOfTesting,
          standardsUsed: formData.standardsUsed,
          totalPriceINR,
          convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
        };

        const token = await getAuthToken();
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(emailPayload),
        });
      } catch (err) {
        console.error("Email send error:", err);
      }

      setProcessingStage("success");

      setTimeout(() => {
        router.push("/");
      }, 6000);

      setImagePreview(null);
      setBankModalOpen(false);
    } catch (error) {
      console.error("Error submitting bank payment:", error);
      toast.error("Failed to submit order.");
      setShowProcessingModal(false);
    } finally {
      setIsSubmitting(false);
      setIsConfirming(false);
    }
  };

  // Submit Razorpay Payment
  const executeRazorpaySubmit = async () => {
    try {
      setIsSubmitting(true);

      const customOrderId = await ensureOrderId();

      if (!formData.flooringImage) {
        toast.error("Please upload the sports flooring sample image.");
        setIsSubmitting(false);
        return;
      }

      const priceWithGST = totalPriceINR * 1.18;
      const amountInPaise = Math.round(priceWithGST * 100);

      const orderPayload = {
        amount: amountInPaise,
        currency: "INR",
      };

      const token = await getAuthToken();
      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      const { id: razorpayOrderId } = data;

      const options = {
        key: process.env.NEXT_PUBLIC_RZP_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "Brainwave Sportstech",
        description: "Sports Flooring Certification & Testing (incl. 18% GST)",
        order_id: razorpayOrderId,
        handler: async function (res) {
          setShowProcessingModal(true);
          setProcessingStage("saving");

          const paymentDetails = {
            razorpay_order_id: res.razorpay_order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
          };

          try {
            const verifyRes = await fetch("/api/verifyPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentDetails),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            let finalFlooringImageURL = formData.flooringImage;
            if (formData.tempFlooringImageFilename) {
              finalFlooringImageURL = await finalizeImageUpload(
                formData.tempFlooringImageFilename,
                "flooringImages"
              );
            }

            const orderRef = doc(db, "certification_orders", customOrderId);

            const order = {
              id: customOrderId,
              orderId: customOrderId,
              userId,
              category: "Flooring",
              type: "Flooring",
              companyName: formData.companyName,
              contactPerson: formData.contactPerson,
              name: formData.contactPerson,
              contactNumber: formData.contactNumber,
              email: formData.email,
              country: formData.country,
              state: formData.state,
              gstin: formData.gstin || "",
              clientType: formData.clientType,

              productName: formData.productName,
              modelName: formData.productName,
              flooringManufacturer: formData.flooringManufacturer,
              manufacturer: formData.flooringManufacturer,
              brandName: formData.brandName,
              useType: formData.useType,
              flooringType: formData.flooringType,
              flooringConstruction: formData.flooringConstruction,
              totalThickness: formData.totalThickness,
              sampleDimensions: formData.sampleDimensions,
              layerDetails: formData.layerDetails,
              colorFinish: formData.colorFinish,
              batchNumber: formData.batchNumber,
              dateOfManufacture: formData.dateOfManufacture,
              purposeOfTesting: formData.purposeOfTesting,
              standardsUsed: formData.standardsUsed,

              flooringImage: finalFlooringImageURL,
              paymentDetails,
              paymentType: "Razorpay",
              timestamp: new Date(),
              totalPriceINR,
              convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
              order_status: "Payment received, awaiting samples",
            };

            await setDoc(orderRef, order);

            setProcessingStage("emailing");

            try {
              const emailPayload = {
                ...order,
                timestamp: new Date().toISOString(),
                userEmail: formData.email,
                userName: formData.contactPerson,
                orderId: customOrderId,
                newStatus: "Order placed successfully via Razorpay",
                paymentType: "Razorpay",
                category: "Flooring",
                companyName: formData.companyName,
                productName: formData.productName,
                productTradeName: formData.productName,
                flooringManufacturer: formData.flooringManufacturer,
                manufacturer: formData.flooringManufacturer,
                brandName: formData.brandName,
                useType: formData.useType,
                flooringType: formData.flooringType,
                flooringConstruction: formData.flooringConstruction,
                constructionSystem: formData.flooringConstruction,
                totalThickness: formData.totalThickness,
                sampleDimensions: formData.sampleDimensions,
                layerDetails: formData.layerDetails,
                colorFinish: formData.colorFinish,
                batchNumber: formData.batchNumber,
                dateOfManufacture: formData.dateOfManufacture,
                purposeOfTesting: formData.purposeOfTesting,
                standardsUsed: formData.standardsUsed,
                totalPriceINR,
                convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
              };

              const emailToken = await getAuthToken();
              await fetch("/api/sendEmail", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(emailToken && { Authorization: `Bearer ${emailToken}` }),
                },
                body: JSON.stringify(emailPayload),
              });
            } catch (err) {
              console.error("Email send error:", err);
            }

            setProcessingStage("success");

            setTimeout(() => {
              router.push("/");
            }, 6000);
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error(err.message || "Payment verification failed.");
            setShowProcessingModal(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment was cancelled.");
            setIsSubmitting(false);
          },
        },
        prefill: {
          name: formData.contactPerson,
          email: formData.email,
          contact: formData.contactNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(`Payment Failed: ${response.error.description}`);
        setShowProcessingModal(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      toast.error("Failed to initiate payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add to Cart
  const { addToCart } = useCart();

  const executeAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      const orderId = await ensureOrderId();

      if (!formData.flooringImage) {
        toast.error("Please upload the sports flooring sample image.");
        setIsAddingToCart(false);
        return;
      }

      const convertedPriceWithSymbol = `${currencySymbol} ${convertedPrice}`;
      const cartItem = {
        id: orderId,
        orderId,
        ...formData,
        category: "Flooring",
        type: "Flooring",
        modelName: formData.productName,
        totalPriceINR,
        convertedPriceWithSymbol,
        timestamp: new Date().toISOString(),
        order_status: "In cart, awaiting payment",
      };

      await addToCart(userId, cartItem);

      try {
        const emailPayload = {
          userEmail: formData.email,
          userName: formData.contactPerson,
          orderId,
          cartDetails: {
            manufacturer: formData.flooringManufacturer,
            modelName: formData.productName,
            modelNumber: formData.batchNumber || "N/A",
            useType: formData.useType,
            submissionType: Array.isArray(formData.purposeOfTesting) ? formData.purposeOfTesting.join(", ") : (formData.purposeOfTesting || "N/A"),
            certificationType: "AIPA Sports Flooring",
            convertedPriceWithSymbol,
          },
        };

        const cartToken = await getAuthToken();
        await fetch("/api/sendAddToCartEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(cartToken && { Authorization: `Bearer ${cartToken}` }),
          },
          body: JSON.stringify(emailPayload),
        });
      } catch (err) {
        console.error("Cart notification error:", err);
      }

      setShowAddToCartModal(true);
      setIsAddingToCart(false);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart.");
      setIsAddingToCart(false);
    }
  };

  const handleActionClick = (action, e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to apply.");
      return;
    }

    if (!isFormValid) {
      toast.error("Please complete all required fields and accept the terms.");
      return;
    }

    if (!validateEmailAndPhone()) {
      return;
    }

    setPendingAction(action);
    setReviewModalOpen(true);
  };

  // Submit Request Invoice / Pay Later
  const executeRequestInvoiceSubmit = async () => {
    if (!userId) {
      toast.error("You must be logged in to apply.");
      return;
    }

    if (!formData.flooringImage) {
      toast.error("Please upload the sports flooring sample image.");
      return;
    }

    try {
      setIsSubmitting(true);
      setShowProcessingModal(true);
      setProcessingStage("saving");

      const orderId = await ensureOrderId();

      let finalFlooringImageURL = formData.flooringImage;
      if (formData.tempFlooringImageFilename) {
        finalFlooringImageURL = await finalizeImageUpload(
          formData.tempFlooringImageFilename,
          "flooringImages"
        );
      }

      const orderRef = doc(db, "certification_orders", orderId);

      const order = {
        orderId,
        id: orderId,
        userId,
        category: "Flooring",
        type: "Flooring",
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        name: formData.contactPerson,
        contactNumber: formData.contactNumber,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        gstin: formData.gstin || "",
        clientType: formData.clientType,

        // Technical Flooring Specs
        productName: formData.productName,
        modelName: formData.productName,
        flooringManufacturer: formData.flooringManufacturer,
        manufacturer: formData.flooringManufacturer,
        brandName: formData.brandName,
        useType: formData.useType,
        flooringType: formData.flooringType,
        flooringConstruction: formData.flooringConstruction,
        totalThickness: formData.totalThickness,
        sampleDimensions: formData.sampleDimensions,
        layerDetails: formData.layerDetails,
        colorFinish: formData.colorFinish,
        batchNumber: formData.batchNumber,
        dateOfManufacture: formData.dateOfManufacture,
        purposeOfTesting: formData.purposeOfTesting,
        standardsUsed: formData.standardsUsed,

        flooringImage: finalFlooringImageURL,
        paymentType: "Request Invoice",
        order_status: "Requested invoice",
        invoiceStatus: "Pending Generation",
        invoiceRequestedAt: new Date().toISOString(),
        paymentStatus: "Unpaid",
        timestamp: new Date(),
        totalPriceINR,
        convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
      };

      await setDoc(orderRef, order);

      setProcessingStage("emailing");

      // Dispatch confirmation email
      try {
        const emailPayload = {
          ...order,
          timestamp: new Date().toISOString(),
          userEmail: formData.email,
          userName: formData.contactPerson,
          orderId,
          newStatus: "Requested invoice",
          paymentType: "Request Invoice",
          category: "Flooring",
          companyName: formData.companyName,
          productName: formData.productName,
          productTradeName: formData.productName,
          flooringManufacturer: formData.flooringManufacturer,
          manufacturer: formData.flooringManufacturer,
          brandName: formData.brandName,
          useType: formData.useType,
          flooringType: formData.flooringType,
          flooringConstruction: formData.flooringConstruction,
          constructionSystem: formData.flooringConstruction,
          totalThickness: formData.totalThickness,
          sampleDimensions: formData.sampleDimensions,
          layerDetails: formData.layerDetails,
          colorFinish: formData.colorFinish,
          batchNumber: formData.batchNumber,
          dateOfManufacture: formData.dateOfManufacture,
          purposeOfTesting: formData.purposeOfTesting,
          standardsUsed: formData.standardsUsed,
          totalPriceINR,
          convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
        };

        const token = await getAuthToken();
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(emailPayload),
        });
      } catch (err) {
        console.error("Email send error:", err);
      }

      setProcessingStage("success");

      setTimeout(() => {
        router.push("/");
      }, 6500);

      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting invoice request:", error);
      toast.error("Failed to submit invoice request.");
      setShowProcessingModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReview = () => {
    setReviewModalOpen(false);
    if (pendingAction === "cart") {
      executeAddToCart();
    } else if (pendingAction === "razorpay") {
      executeRazorpaySubmit();
    } else if (pendingAction === "bank") {
      setBankModalOpen(true);
    } else if (pendingAction === "invoice") {
      executeRequestInvoiceSubmit();
    }
  };

  if (isCurrencyLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading form details...</p>
      </div>
    );
  }

  const clientTypesList = [
    "Manufacturer",
    "Supplier / Distributor",
    "Contractor / Installer",
    "Sports Facility Owner / Developer",
    "Consultant / Architect",
  ];

  const flooringTypesList = [
    "Synthetic Acrylic Flooring",
    "Polyurethane (PU) Flooring",
    "EPDM / Rubber Flooring",
    "PVC / Vinyl Sports Flooring",
    "Modular Interlocking Flooring tiles",
  ];

  const constructionSystemsList = [
    "Single Layer",
    "Multi-layer System",
    "Roll / Sheet Flooring",
    "Tile / Modular System",
  ];

  const purposeList = [
    "AIPA Approval and Endorsement",
    "Product Quality Assessment",
    "Product Development / R&D",
  ];

  const standardsList = [
    "EN Standard",
    "ASTM Standard",
    "ISO Standard",
    "AIPA Protocol",
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100/70 pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans">
      {/* Header Section */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[#f39c12] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Official Lab Certification Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Sports Flooring Submission Form
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mt-1">
              For Testing, Evaluation & Technical Assessment for Pickleball Playability
            </p>
          </div>
          <Link
            href="/forms/court-certification/application-form"
            className="self-start md:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap flex items-center gap-2"
          >
            <span>🏟️ Switch to Court Certification &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Guidelines Banner */}
      <div className="mb-6 bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 bg-amber-100 text-[#f39c12] rounded-xl text-lg font-bold">📦</span>
            <div>
              <span className="font-bold text-amber-900 text-sm">Sample Submission Guidelines:</span>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Submit <span className="font-semibold text-slate-900">two (2) sample specimens (500mm x 500mm each)</span> of your sports flooring system to our testing laboratory: Unit 403-404, Motibhai Smriti Towers, Opposite Railway Station, Badlapur (W), PIN 421503, Maharashtra, India.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 font-medium">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ 2 Samples (500x500mm)</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ Material & Layer Specs</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ Sample Specimen Photo</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleActionClick("razorpay", e)} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start">
          {/* Left Column: Client Details & Sample Details */}
          <div className="space-y-6">
            {/* Section 1: Client / Applicant Details */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Client / Applicant Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-semibold text-gray-700">Company / Organization Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="Enter company or organization name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactPerson" className="text-sm font-semibold text-gray-700">Contact Person *</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="Contact person's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactNumber" className="text-sm font-semibold text-gray-700">Mobile Number *</label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="e.g. +91 98765 43210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="e.g. contact@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-semibold text-gray-700">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={isOtherCountry ? "Other" : formData.country}
                    onChange={handleLocationChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                  {isOtherCountry && (
                    <input
                      type="text"
                      placeholder="Enter your country"
                      className="mt-2 w-full px-5 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm"
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      required
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-semibold text-gray-700">State *</label>
                  <select
                    id="state"
                    name="state"
                    value={isOtherState ? "Other" : formData.state}
                    onChange={handleLocationChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Other">Other</option>
                  </select>
                  {isOtherState && (
                    <input
                      type="text"
                      placeholder="Enter your state"
                      className="mt-2 w-full px-5 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm"
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  )}
                </div>

                {formData.country === "India" && (
                  <div className="space-y-2">
                    <label htmlFor="gstin" className="text-sm font-semibold text-gray-700">GSTIN Number *</label>
                    <input
                      type="text"
                      id="gstin"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                      placeholder="Enter company GSTIN (e.g. 27AAAAA0000A1Z5)"
                      required
                    />
                  </div>
                )}

                <div className={`space-y-2 ${formData.country !== "India" ? "md:col-span-2" : ""}`}>
                  <label htmlFor="clientType" className="text-sm font-semibold text-gray-700">Client Type *</label>
                  <select
                    id="clientType"
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Client Type</option>
                    {clientTypesList.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 2: Sports Flooring Sample Details */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Sports Flooring Sample Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="productName" className="text-sm font-semibold text-gray-700">Product / Trade Name *</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="Enter product trade name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="flooringManufacturer" className="text-sm font-semibold text-gray-700">Flooring Manufacturer *</label>
                  <input
                    type="text"
                    id="flooringManufacturer"
                    name="flooringManufacturer"
                    value={formData.flooringManufacturer}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="Enter flooring manufacturer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="brandName" className="text-sm font-semibold text-gray-700">Brand Name *</label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="totalThickness" className="text-sm font-semibold text-gray-700">Total Thickness (mm) *</label>
                  <input
                    type="text"
                    id="totalThickness"
                    name="totalThickness"
                    value={formData.totalThickness}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="e.g. 8 mm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sampleDimensions" className="text-sm font-semibold text-gray-700">Sample Dimensions *</label>
                  <input
                    type="text"
                    id="sampleDimensions"
                    name="sampleDimensions"
                    value={formData.sampleDimensions}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="e.g. 500mm x 500mm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="colorFinish" className="text-sm font-semibold text-gray-700">Colour / Finish *</label>
                  <input
                    type="text"
                    id="colorFinish"
                    name="colorFinish"
                    value={formData.colorFinish}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="e.g. Deep Blue / Textured Matte"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="batchNumber" className="text-sm font-semibold text-gray-700">Batch / Lot No.</label>
                  <input
                    type="text"
                    id="batchNumber"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="e.g. BATCH-2026-X"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateOfManufacture" className="text-sm font-semibold text-gray-700">Date of Manufacture (if known)</label>
                  <input
                    type="text"
                    id="dateOfManufacture"
                    name="dateOfManufacture"
                    value={formData.dateOfManufacture}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                    placeholder="DD / MM / YYYY"
                  />
                </div>

                {/* Type of Use Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="useType" className="text-sm font-semibold text-gray-700">
                    Type of Use *
                  </label>
                  <select
                    id="useType"
                    name="useType"
                    value={formData.useType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>

                {/* Flooring Type Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="flooringType" className="text-sm font-semibold text-gray-700">
                    Flooring Type *
                  </label>
                  <select
                    id="flooringType"
                    name="flooringType"
                    value={formData.flooringType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Flooring Type</option>
                    {flooringTypesList.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flooring Construction Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="flooringConstruction" className="text-sm font-semibold text-gray-700">
                    Flooring Construction / System *
                  </label>
                  <select
                    id="flooringConstruction"
                    name="flooringConstruction"
                    value={formData.flooringConstruction}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Flooring Construction / System</option>
                    {constructionSystemsList.map((system) => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layer Details / Composition */}
              <div className="mt-6 space-y-2">
                <label htmlFor="layerDetails" className="text-sm font-semibold text-gray-700">
                  Layer Details / Composition
                </label>
                <textarea
                  id="layerDetails"
                  name="layerDetails"
                  value={formData.layerDetails}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 text-sm"
                  placeholder="Provide breakdown of surface coat, intermediate cushion, primer, and backing layers..."
                />
              </div>
            </section>
          </div>

          {/* Right Column: Purpose of Testing, Uploads & Actions */}
          <div className="space-y-6">
            {/* Section 3: Purpose of Testing & Applicable Standards */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Purpose of Testing & Standards</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purpose of Testing Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="purposeOfTesting" className="text-sm font-semibold text-gray-700">
                    Purpose of Testing *
                  </label>
                  <select
                    id="purposeOfTesting"
                    name="purposeOfTesting"
                    value={formData.purposeOfTesting}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-gray-50 text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Purpose of Testing</option>
                    {purposeList.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Applicable Standards Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="standardsUsed" className="text-sm font-semibold text-gray-700">
                    Applicable Standard / Test Method to be Used
                  </label>
                  <select
                    id="standardsUsed"
                    name="standardsUsed"
                    value={formData.standardsUsed}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-gray-50 text-sm cursor-pointer"
                  >
                    <option value="">Select Applicable Standard (Optional)</option>
                    {standardsList.map((std) => (
                      <option key={std} value={std}>
                        {std}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 4: Sample Photo Upload & Agreement */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Uploads & Agreement</h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="flooringImage" className="text-sm font-bold text-slate-800 mb-2 block">
                    Upload Sports Flooring Sample Photo *
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="flooringImage"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload sample image</span> or drag and drop
                        </p>
                        <p className="text-xs text-red-500 font-medium">PNG, JPG or JPEG (Flooring Specimen) (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        id="flooringImage"
                        name="flooringImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>

                  {isImageUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                      <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="mt-4 flex justify-center">
                      <img src={imagePreview} alt="Preview" className="h-40 w-auto rounded-lg shadow-md object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={openTermsModal}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-700 cursor-pointer" onClick={openTermsModal}>
                    I have read and agree to the <span className="text-blue-600 font-semibold hover:underline">Terms and Conditions</span>. I understand that testing begins after fee payment and receipt of 2 sample specimens.
                  </label>
                </div>
              </div>
            </section>

            {/* Pricing Summary & Action Buttons */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-lg font-semibold text-blue-800">
                  Testing & Certification Fee: {currencySymbol} {convertedPrice.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-blue-600">+ 18% GST</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Total Payable: {currencySymbol} {(convertedPrice * 1.18).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={(e) => handleActionClick("cart", e)}
                  disabled={isSubmitting || isAddingToCart || !isFormValid}
                  className="px-5 py-3.5 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Razorpay */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    "Pay Using Razorpay"
                  )}
                </button>

                {/* Bank Details */}
                <button
                  type="button"
                  onClick={(e) => handleActionClick("bank", e)}
                  disabled={isSubmitting || !isFormValid}
                  className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Pay Using Bank Details
                </button>

                {/* Request Invoice & Pay Later */}
                <button
                  type="button"
                  onClick={(e) => handleActionClick("invoice", e)}
                  disabled={isSubmitting || !isFormValid}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Request Invoice & Pay Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      <TermsModal
        isOpen={isModalOpen}
        onClose={closeTermsModal}
        onAccept={handleAcceptTerms}
      />

      <BankDetailsModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onConfirm={handleBankPaymentSubmit}
        onUpload={handlePaymentImageUpload}
        paymentImage={paymentImage}
        currencySymbol={currencySymbol}
        convertedPrice={convertedPrice}
        isPaymentUploading={isPaymentUploading}
        isConfirming={isConfirming}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        formData={formData}
        imagePreview={imagePreview}
        onConfirm={handleConfirmReview}
        pendingAction={pendingAction}
      />

      <ProcessingModal isOpen={showProcessingModal} stage={processingStage} pendingAction={pendingAction} />

      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        onAddAnother={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
