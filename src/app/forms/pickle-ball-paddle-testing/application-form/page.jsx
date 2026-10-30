"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { auth, db } from "@/firebase/firebaseconfig"; // Adjust the import path based on your project structure
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useCart } from "@/app/contexts/CartContext";
import { toast } from "react-toastify";
import { getBytes, deleteObject } from "firebase/storage";
// Shared utilities
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { uploadImageToStorage, finalizeImageUpload } from "@/utils/imageUpload";
import { generatePaddleOrderId } from "@/utils/orderIdGenerator";
import { getAuthToken } from "@/lib/getAuthToken";
import { useRouter } from "next/navigation";
import AddToCartModal from "@/components/AddToCartModal";

const storage = getStorage(); // Initialize Firebase Storage

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  const modalContentRef = useRef(null);

  const handleScroll = () => {
    if (modalContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
      // Add a small buffer (e.g., 5px) to account for sub-pixel rendering differences
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
            Terms and Conditions
          </h2>
        </div>

        {/* Modal Content */}
        <div
          ref={modalContentRef}
          onScroll={handleScroll}
          className="p-6 h-80 overflow-y-auto bg-white"
        >
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Please read the terms and conditions carefully before proceeding
              further. By continuing, you agree to the following:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                The number of paddles and/or balls required for testing will be
                six (6) each.
              </li>
              <li>
                Testing will be undertaken only upon payment of the full fee in
                advance and after receiving the requisite number of paddles
                and/or balls needed for testing in Brainwave SportsTech
                Laboratory.
              </li>
              <li>
                All six (6) specimens of paddle/ball submitted for testing must
                be of the same material, design, make, and model.
              </li>
              <li>
                Paddles/balls must have the manufacturer’s name, model name, and
                AIPA Approved logo printed on the test specimens.
              </li>
              <li>
                Paddles submitted for testing and approval must have their final
                graphics frozen. No further modification in graphics on the
                paddle surface is allowed. Neon green or fluorescent yellow
                graphics are not permitted.
              </li>
              <li>
                Applicants must upload an image of the paddle/ball (max 500x500
                pixels and less than 5MB in size) on our website. Images must
                display the full equipment, including the handle, on a white
                background.
              </li>
              <li>
                Equipment that fails testing can be resubmitted after the
                required modifications and changes are made, along with the
                applicable fee.
              </li>
              <li>
                The normal testing time is four (4) weeks upon receipt of all
                specimens at Brainwave SportsTech Laboratory. Express testing
                services (1–2 weeks) are available at an extra charge.
              </li>
              <li>
                Upon request, Brainwave SportsTech will provide pictures/videos
                of tests where the specimens failed to comply for client
                confirmation and satisfaction.
              </li>
              <li>
                Test reports will be provided in soft copy format for all tests
                conducted at Brainwave SportsTech Laboratory to both the client
                and the certification body (AIPA).
              </li>
              <li>
                Brainwave SportsTech does not accept liability for defects in
                mass production of equipment, even if the equipment complies
                during testing.
              </li>
              <li>
                Test specimens will not be returned after testing. They will be
                retained for one (1) year from the testing date and may be used
                to promote the sport among underprivileged communities.
              </li>
              <li>
                By clicking “I agree,” paying the fee, and submitting the
                specimens for testing, you agree to all terms and conditions of
                Brainwave SportsTech.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 flex justify-end space-x-4 bg-gray-100 border-t">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${canAccept
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
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto mt-10 mb-10">
        {/* Modal Header */}
        <div className="p-6 border-b bg-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800">
            Bank Payment Details
          </h2>
        </div>

        {/* Bank Details */}
        <div className="p-6 bg-white">
          <p className="text-gray-700 mb-4">
            Please transfer the amount to the bank details below and upload your
            payment receipt.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-gray-800">
            <p>
              <strong>Bank Name:</strong> ICICI Bank
            </p>
            <p>
              <strong>Branch Name:</strong> Badlapur
            </p>
            <p>
              <strong>Account Number:</strong> 278705005002
            </p>
            <p>
              <strong>IFSC Code:</strong> ICIC0002787
            </p>
            <p>
              <strong>Account Holder:</strong> Brainwave Velocity Pvt Ltd
            </p>
            <div className="text-xl font-semibold text-blue-600 mt-4">
              <p>
                Base Amount: {currencySymbol} {convertedPrice.toLocaleString()}
              </p>
              <p>
                GST (18%): {currencySymbol}{" "}
                {(convertedPrice * 0.18).toLocaleString()}
              </p>
              <hr className="my-2 border-gray-300" />
              <p className="font-bold">
                Total Amount to be Paid: {currencySymbol}{" "}
                {(convertedPrice * 1.18).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Upload Payment Screenshot */}
          <div className="mt-4">
            <label className="text-gray-700 font-medium block mb-2">
              Upload Payment Receipt
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
            {/* Show loading bar when uploading */}
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

        {/* Modal Footer */}
        <div className="p-6 flex justify-end space-x-4 bg-gray-100 border-t">
          <button
            className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition ${isConfirming
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
            onClick={onConfirm}
            disabled={!paymentImage || isConfirming}
          >
            {isConfirming ? "Confirming..." : "Confirm Payment"}
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

const ProcessingModal = ({ isOpen, stage }) => {
  if (!isOpen) return null

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
          {stage === "saving" && "Processing Order..."}
          {stage === "emailing" && "Sending Confirmation..."}
          {stage === "success" && "Thank You!"}
        </h3>

        <p className="text-gray-600">
          {stage === "saving" && "Please wait while we save your certification details."}
          {stage === "emailing" && "We are sending a confirmation email to your inbox."}
          {stage === "success" && (
            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-bold text-green-600">Order Placed Successfully!</h3>
              <p className="text-gray-700">
                The order is placed successfully! You will receive confirmation and further updates about your order through the email you provided while filling the form.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
                <p className="font-bold text-blue-900 mb-2 text-xs">📦 Please ship your 6 sample paddles to:</p>
                <div className="text-gray-700 space-y-1 text-[10px] leading-tight">
                  <p>Unit 403-404, Motibhai Smriti Towers</p>
                  <p>Opposite Railway Station, Badlapur (W)</p>
                  <p>PIN 421503, Maharashtra, India</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Home
                </button>
              </div>

              <p className="text-xs text-gray-400">Redirecting to home automatically...</p>
            </div>
          )}
        </p>
      </div>
    </div>
  )
}

const ReviewModal = ({ isOpen, onClose, formData, imagePreview, onConfirm, pendingAction }) => {
  if (!isOpen) return null;

  const actionText =
    pendingAction === "cart"
      ? "Add to Cart"
      : pendingAction === "razorpay"
      ? "Proceed to Razorpay"
      : "Proceed to Bank Details";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Review Your Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto grow">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <p className="text-sm text-blue-900 font-semibold">
              Please review all the information below. Once verified, click "{actionText}" to proceed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Applicant Details */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-md">Applicant Details</h3>
              <div className="text-sm space-y-1.5 text-gray-700">
                <p><strong>Full Name:</strong> {formData.name}</p>
                <p><strong>Contact Number:</strong> {formData.contactNumber}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Country:</strong> {formData.country}</p>
                <p><strong>State:</strong> {formData.state}</p>
                {formData.gstin && <p><strong>GST IN:</strong> {formData.gstin}</p>}
                <p className="whitespace-pre-wrap"><strong>Mailing Address:</strong> {formData.mailingAddress}</p>
              </div>
            </div>

            {/* Section 2: Product & Specifications */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-md">Product Details</h3>
              <div className="text-sm space-y-1.5 text-gray-700">
                <p><strong>Brand/Company Name:</strong> {formData.companyName}</p>
                <p><strong>Manufacturer:</strong> {formData.manufacturer}</p>
                <p><strong>Model Name:</strong> {formData.modelName}</p>
                <p><strong>Model Number:</strong> {formData.modelNumber}</p>
                <p><strong>Submission Type:</strong> {formData.submissionType}</p>
                <p><strong>Paddle Shape:</strong> {formData.paddleShape}</p>
                <p><strong>Core Material:</strong> {formData.coreMaterial}</p>
                <p><strong>Core Thickness:</strong> {formData.coreThickness}</p>
                <p><strong>Honeycomb Cell Size:</strong> {formData.honeycombCellSize}</p>
                <p><strong>Surface Material:</strong> {formData.surfaceMaterial}</p>
                <p><strong>Surface Finish:</strong> {formData.surfaceFinish}</p>
                <p><strong>Currently Sold:</strong> {formData.currentlySold}</p>
                <p><strong>Previously Submitted:</strong> {formData.previouslySubmitted}</p>
                <p><strong>Certification:</strong> {formData.certificationType}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Uploaded Image */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col items-center">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-md w-full text-left mb-4">Uploaded Pickleball Paddle Image</h3>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Paddle Preview"
                className="max-h-64 object-contain rounded-lg border shadow-md"
              />
            ) : (
              <p className="text-red-500 text-sm">No image uploaded.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-850 font-bold rounded-xl transition"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

const pickleBallPaddleTestingForm = () => {
  const router = useRouter();
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingStage, setProcessingStage] = useState("saving") // saving -> emailing -> success
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [formData, setFormData] = useState({
    orderId: "",
    name: "",
    contactNumber: "",
    email: "",
    mailingAddress: "",
    manufacturer: "",
    companyName: "", // ✅ Company/Brand name for public display
    country: "",
    state: "", // <- Add this line
    modelName: "",
    modelNumber: "",
    submissionType: "New",
    paddleShape: "",
    coreMaterial: "",
    coreThickness: "",
    honeycombCellSize: "",
    surfaceMaterial: "",
    surfaceFinish: "",
    currentlySold: "Yes",
    previouslySubmitted: "Yes",
    termsAccepted: false,
    paddleImage: "",
    certificationType: "AIPA",
    paymentType: "",
    paymentReceipt: "",
    gstin: "",
  });

  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [totalPriceINR, settotalPriceINR] = useState(51000); // Default price for "New"

  // Use shared currency conversion hook
  const {
    convertedPrice,
    currencySymbol,
    currencyCode: currencyInitials,
    userCountry,
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
  const [pendingAction, setPendingAction] = useState(null); // 'cart' | 'razorpay' | 'bank'

  // Get logged-in user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // Reference the user's document in the Paddletestingforms collection
        const userDocRef = doc(db, "Paddletestingforms", user.uid);

        // Check if the document exists, and initialize it if not
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, { cart: [], processedOrders: [] });
        }
      } else {
        setUserId(null);
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let price = 0;

    if (formData.certificationType === "AIPA") {
      switch (formData.submissionType) {
        case "New":
          price = 51000;
          break;
        case "Resubmission":
          price = 21000;
          break;
        case "Renewal":
          price = 51000;
          break;
      }
    } else if (formData.certificationType === "UWPF" || formData.certificationType === "IPF") {
      switch (formData.submissionType) {
        case "New":
          price = 60000;
          break;
        case "Resubmission":
          price = 25000;
          break;
        case "Renewal":
          price = 15000;
          break;
        default:
          price = 0; // Fallback
      }
    }

    settotalPriceINR(price);
  }, [formData.certificationType, formData.submissionType]);

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : e.target.value,
    });
  };

  const handleLocationChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "country") {
      setIsOtherCountry(value === "Other");
      if (value === "Other") {
        setFormData((prev) => ({ ...prev, country: "" }));
      }
    }

    if (name === "state") {
      setIsOtherState(value === "Other");
      if (value === "Other") {
        setFormData((prev) => ({ ...prev, state: "" }));
      }
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const isFormValid = React.useMemo(() => {
    const required = [
      "name", "contactNumber", "email", "mailingAddress", "manufacturer",
      "companyName", "country", "state", "modelName", "modelNumber",
      "paddleShape", "coreMaterial", "coreThickness", "honeycombCellSize",
      "surfaceMaterial", "surfaceFinish", "paddleImage"
    ];
    // Basic fields
    for (const field of required) {
      if (!formData[field]) return false;
    }
    // Conditional: GSTIN if India
    if (formData.country === "India" && !formData.gstin) return false;

    // Terms
    if (!formData.termsAccepted) return false;

    return true;
  }, [formData]);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAccept = () => {
    setFormData((prev) => ({ ...prev, termsAccepted: true }));
    closeModal();
  };

  // Use shared order ID generator
  const ensureOrderId = async () => {
    if (!formData.orderId) {
      const orderId = generatePaddleOrderId();
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

  const openBankDetailsModal = () => {
    const requiredFields = [
      "name",
      "contactNumber",
      "email",
      "mailingAddress",
      "manufacturer",
      "companyName", // ✅ Required for public display
      "country",
      "state", // <- Add this
      "modelName",
      "modelNumber",
      "submissionType",
      "paddleShape",
      "coreMaterial",
      "coreThickness",
      "honeycombCellSize",
      "surfaceMaterial",
      "surfaceFinish",
      "currentlySold",
      "previouslySubmitted",
      "certificationType",
    ];
    // ✅ Conditionally require GSTIN only if country is India
    if (formData.country === "India" && !formData.gstin) {
      toast.error("Please enter your GST IN Number.");
      return;
    }
    // Check if any required field is missing
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`
        );
        return; // Prevent modal from opening
      }
    }

    if (!validateEmailAndPhone()) {
      return; // Prevent modal from opening
    }

    if (!formData.termsAccepted) {
      toast.error("You must agree to the terms and conditions.");
      return; // Prevent modal from opening
    }

    if (!formData.paddleImage) {
      toast.error("Please upload the paddle image.");
      return; // Prevent modal from opening
    }

    setBankModalOpen(true); // Open modal only if all validations pass
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate File Type (Only images allowed)
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed. Please upload a PNG, JPG, or JPEG image.");
      e.target.value = "";
      return;
    }

    // Validate File Size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.");
      e.target.value = "";
      return;
    }

    setIsImageUploading(true); // Start Loading

    // ✅ Ensure Order ID is set before uploading
    const orderId = await ensureOrderId();

    // ✅ If an old image exists, delete it before uploading the new one
    if (formData.tempPaddleImageFilename) {
      const oldFileRef = ref(
        storage,
        `tempUploads/${formData.tempPaddleImageFilename}`
      );
      await deleteObject(oldFileRef).catch((error) =>
        console.warn("Failed to delete old image:", error)
      );
    }

    // ✅ Upload the new image to Firebase (Temp Storage)
    const uploadedImageURL = await uploadImageToStorage(
      file,
      "paddleImages",
      orderId,
      "paddleImage",
      true // Upload to temporary storage
    );

    if (uploadedImageURL) {
      const { downloadURL, uniqueFileName } = uploadedImageURL;

      // ✅ Update state with the new image URL and filename
      setFormData((prev) => ({
        ...prev,
        paddleImage: downloadURL,
        tempPaddleImageFilename: uniqueFileName, // Store new temp filename
      }));

      // ✅ Show the preview of the new image
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Failed to upload image. Please try again.");
    }

    setIsImageUploading(false); // Stop Loading
  };

  // finalizeImageUpload is now imported from @/utils/imageUpload

  const handlePaymentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate File Type (Only images allowed)
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed. Please upload a PNG, JPG, or JPEG image.");
      e.target.value = "";
      return;
    }

    // Validate File Size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.");
      e.target.value = "";
      return;
    }

    setIsPaymentUploading(true); // Start Loading

    // ✅ Ensure Order ID is set before uploading
    const orderId = await ensureOrderId();

    // ✅ Upload to Firebase (Temp Storage)
    const uploadedPaymentURL = await uploadImageToStorage(
      file,
      "payment-receipts",
      orderId,
      "paymentReceipt",
      true // Upload to tempUploads
    );

    if (uploadedPaymentURL) {
      const { downloadURL, uniqueFileName } = uploadedPaymentURL;

      // ✅ Store temporary filename & URL so it can be moved later
      setFormData((prev) => ({
        ...prev,
        paymentReceipt: downloadURL, // Temp URL
        tempPaymentReceiptFilename: uniqueFileName, // Store temp filename
      }));

      // ✅ Show Image Preview
      setPaymentImage(downloadURL);
    } else {
      toast.error("Failed to upload payment receipt. Please try again.");
    }

    setIsPaymentUploading(false); // Stop Loading
  };

  // ✅ Function to Upload Image to Firebase
  // uploadImageToStorage is now imported from @/utils/imageUpload

  const handleBankPaymentSubmit = async () => {
    if (!userId) {
      toast.error("You must be logged in to submit the form.");
      return;
    }

    if (!formData.paymentReceipt) {
      toast.error("Please upload the payment receipt.");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsConfirming(true);

      // ✅ Ensure Order ID exists before submitting
      const orderId = await ensureOrderId();

      // ✅ Move Paddle Image from tempUploads to paddleImages
      let finalPaddleImageURL = formData.paddleImage;
      if (formData.tempPaddleImageFilename) {
        finalPaddleImageURL = await finalizeImageUpload(
          formData.tempPaddleImageFilename,
          "paddleImages"
        );
      }

      // ✅ Move Payment Receipt from tempUploads to payment-receipts
      let finalPaymentReceiptURL = formData.paymentReceipt;
      if (formData.tempPaymentReceiptFilename) {
        const movedPaymentReceiptURL = await finalizeImageUpload(
          formData.tempPaymentReceiptFilename,
          "payment-receipts"
        );

        if (movedPaymentReceiptURL) {
          finalPaymentReceiptURL = movedPaymentReceiptURL; // ✅ Store final URL
        } else {
          throw new Error("Failed to move payment receipt to final storage.");
        }
      }

      // Submit Data
      setShowProcessingModal(true);
      setProcessingStage("saving");

      // Reference New Order Document
      const orderRef = doc(db, "certification_orders", orderId);

      // Order Data
      const order = {
        orderId,
        userId,
        // Explicitly select fields
        category: "Paddle",
        type: "Paddle",
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email,
        mailingAddress: formData.mailingAddress,
        manufacturer: formData.manufacturer,
        companyName: formData.companyName,
        country: formData.country,
        state: formData.state,

        paddleDetails: {
          modelName: formData.modelName,
          modelNumber: formData.modelNumber,
          paddleShape: formData.paddleShape,
          coreMaterial: formData.coreMaterial,
          coreThickness: formData.coreThickness,
          honeycombCellSize: formData.honeycombCellSize,
          surfaceMaterial: formData.surfaceMaterial,
          surfaceFinish: formData.surfaceFinish,
          submissionType: formData.submissionType,
          currentlySold: formData.currentlySold,
          previouslySubmitted: formData.previouslySubmitted,
          certificationType: formData.certificationType,
        },

        // Flattened common fields
        modelName: formData.modelName,
        modelNumber: formData.modelNumber,
        paddleShape: formData.paddleShape,
        coreMaterial: formData.coreMaterial,
        coreThickness: formData.coreThickness,
        honeycombCellSize: formData.honeycombCellSize,
        surfaceMaterial: formData.surfaceMaterial,
        surfaceFinish: formData.surfaceFinish,
        submissionType: formData.submissionType,
        currentlySold: formData.currentlySold,
        previouslySubmitted: formData.previouslySubmitted,
        certificationType: formData.certificationType,

        paddleImage: finalPaddleImageURL,
        paymentReceipt: finalPaymentReceiptURL, // Store final viewable URL
        paymentType: "Bank Transfer",
        timestamp: new Date(),
        totalPriceINR,
        convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
        order_status: "Payment received, awaiting samples",
      };

      // Save to Firestore (Normalized Collection)

      await setDoc(orderRef, order);


      setProcessingStage("emailing");

      // Send confirmation email (optional)
      try {
        const emailPayload = {
          userEmail: formData.email,
          userName: formData.name,
          orderId,
          newStatus: "Order placed successfully via Bank Transfer",
          paymentType: "Bank Transfer",
          paddleDetails: {
            modelName: formData.modelName,
            modelNumber: formData.modelNumber,
            paddleShape: formData.paddleShape,
            coreMaterial: formData.coreMaterial,
            coreThickness: formData.coreThickness,
            honeycombCellSize: formData.honeycombCellSize,
            surfaceMaterial: formData.surfaceMaterial,
            surfaceFinish: formData.surfaceFinish,
            certificationType: formData.certificationType,
          },
          totalPriceINR,
          convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
          timestamp: new Date().toISOString(),
        };


        const token = await getAuthToken();
        const emailResponse = await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify(emailPayload),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send email confirmation");
        } else {

        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

      setProcessingStage("success");

      setFormData({
        orderId: "",
        name: "",
        contactNumber: "",
        email: "",
        mailingAddress: "",
        manufacturer: "",
        companyName: "",
        country: "",
        state: "", // Reset state
        modelName: "",
        modelNumber: "",
        submissionType: "New",
        paddleShape: "",
        coreMaterial: "",
        coreThickness: "",
        honeycombCellSize: "",
        surfaceMaterial: "",
        surfaceFinish: "",
        currentlySold: "Yes",
        previouslySubmitted: "Yes",
        termsAccepted: false,
        paddleImage: "",
        certificationType: "AIPA",
        paymentType: "",
        paymentReceipt: "",
        gstin: "",
      });

      setImagePreview(null);
      setBankModalOpen(false);

      setTimeout(() => {
        router.push("/");
      }, 6000);

    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.message || "Failed to submit order.");
      setShowProcessingModal(false);
    } finally {
      setIsSubmitting(false);
      setIsConfirming(false);
    }
  };

  const executeRazorpaySubmit = async () => {
    try {
      setIsSubmitting(true);

      // ✅ Ensure Razorpay SDK loaded
      if (typeof window.Razorpay === "undefined") {
        toast.error("Razorpay SDK not loaded. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Ensure Order ID
      const orderId = await ensureOrderId();

      // ✅ Finalize paddle image
      let finalPaddleImageURL = formData.paddleImage;
      if (formData.tempPaddleImageFilename) {
        finalPaddleImageURL = await finalizeImageUpload(
          formData.tempPaddleImageFilename,
          "paddleImages"
        );
      }
      if (!finalPaddleImageURL) {
        toast.error("Failed to finalize image upload.");
        setIsSubmitting(false);
        return;
      }

      const maxAmount = 100000 * 100;
      const priceWithGST = convertedPrice * 1.18;
      const amountInPaise = Math.round(priceWithGST * 100);

      if (amountInPaise > maxAmount) {
        toast.error("Order exceeds ₹1,00,000 limit. Please split payment.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Create Razorpay order
      const token = await getAuthToken();
      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ amount: amountInPaise, currency: "INR" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      const { id: razorpayOrderId } = data;

      // ✅ Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RZP_KEY_ID, // Public key only
        amount: amountInPaise,
        currency: "INR",
        name: "Brainwave Sportstech",
        description: "Certification & Testing Services",
        order_id: razorpayOrderId,
        handler: async function (response) {
          setShowProcessingModal(true);
          setProcessingStage("saving");

          const paymentDetails = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            // ✅ Step 1: Verify payment signature via backend
            const verifyRes = await fetch("/api/verifyPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentDetails), // no amount needed
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }
            // ✅ Step 2: Save order to Firestore (Normalized)
            const orderRef = doc(db, "certification_orders", orderId);

            const order = {
              id: orderId,
              orderId,
              userId,
              // Explicitly select fields
              category: "Paddle",
              type: "Paddle",
              name: formData.name,
              contactNumber: formData.contactNumber,
              email: formData.email,
              mailingAddress: formData.mailingAddress,
              manufacturer: formData.manufacturer,
              companyName: formData.companyName,
              country: formData.country,
              state: formData.state,

              paddleDetails: {
                modelName: formData.modelName,
                modelNumber: formData.modelNumber,
                paddleShape: formData.paddleShape,
                coreMaterial: formData.coreMaterial,
                coreThickness: formData.coreThickness,
                honeycombCellSize: formData.honeycombCellSize,
                surfaceMaterial: formData.surfaceMaterial,
                surfaceFinish: formData.surfaceFinish,
                submissionType: formData.submissionType,
                currentlySold: formData.currentlySold,
                previouslySubmitted: formData.previouslySubmitted,
                certificationType: formData.certificationType,
              },

              // Flattened common fields
              modelName: formData.modelName,
              modelNumber: formData.modelNumber,
              paddleShape: formData.paddleShape,
              coreMaterial: formData.coreMaterial,
              coreThickness: formData.coreThickness,
              honeycombCellSize: formData.honeycombCellSize,
              surfaceMaterial: formData.surfaceMaterial,
              surfaceFinish: formData.surfaceFinish,
              submissionType: formData.submissionType,
              currentlySold: formData.currentlySold,
              previouslySubmitted: formData.previouslySubmitted,
              certificationType: formData.certificationType,

              paddleImage: finalPaddleImageURL,

              totalPriceINR,
              convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
              paymentDetails,
              paymentType: "Razorpay",
              timestamp: new Date(),
              order_status: "Payment received, awaiting inspection",
            };

            await setDoc(orderRef, order);


            setProcessingStage("emailing");

            // ✅ Step 3: Send confirmation email
            const emailPayload = {
              userEmail: formData.email,
              userName: formData.name,
              orderId,
              newStatus: "Order placed successfully via Razorpay",
              paymentType: "Razorpay",
              paddleDetails: {
                modelName: formData.modelName,
                modelNumber: formData.modelNumber,
                paddleShape: formData.paddleShape,
                coreMaterial: formData.coreMaterial,
                coreThickness: formData.coreThickness,
                honeycombCellSize: formData.honeycombCellSize,
                surfaceMaterial: formData.surfaceMaterial,
                surfaceFinish: formData.surfaceFinish,
                certificationType: formData.certificationType,
              },
              totalPriceINR,
              convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
              timestamp: new Date().toISOString(),
            };

            const emailToken = await getAuthToken();
            await fetch("/api/sendEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...(emailToken && { Authorization: `Bearer ${emailToken}` }) },
              body: JSON.stringify(emailPayload),
            });

            setProcessingStage("success");

            // ✅ Step 4: Done
            setFormData({
              orderId: "",
              name: "",
              contactNumber: "",
              email: "",
              mailingAddress: "",
              manufacturer: "",
              companyName: "",
              country: "",
              state: "", // Reset state
              modelName: "",
              modelNumber: "",
              submissionType: "New",
              paddleShape: "",
              coreMaterial: "",
              coreThickness: "",
              honeycombCellSize: "",
              surfaceMaterial: "",
              surfaceFinish: "",
              currentlySold: "Yes",
              previouslySubmitted: "Yes",
              termsAccepted: false,
              paddleImage: "",
              certificationType: "AIPA",
              paymentType: "",
              paymentReceipt: "",
              gstin: "",
            });

            setImagePreview(null);

            setTimeout(() => {
              router.push("/");
            }, 6000);
          } catch (error) {
            console.error("Error after payment:", error);
            toast.error("Failed to verify payment. Please contact support.");
            setShowProcessingModal(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment was cancelled. No amount deducted.");
            setIsSubmitting(false);
          },
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.contactNumber,
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setShowProcessingModal(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("Failed to process the payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleActionClick = (action, e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to submit the form.");
      return;
    }

    const requiredFields = [
      "name",
      "contactNumber",
      "email",
      "mailingAddress",
      "manufacturer",
      "companyName",
      "country",
      "state",
      "modelName",
      "modelNumber",
      "submissionType",
      "paddleShape",
      "coreMaterial",
      "coreThickness",
      "honeycombCellSize",
      "surfaceMaterial",
      "surfaceFinish",
      "currentlySold",
      "previouslySubmitted",
      "certificationType",
    ];

    if (formData.country === "India" && !formData.gstin) {
      toast.error("Please enter your GST IN Number.");
      return;
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(
          `Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`
        );
        return;
      }
    }

    if (!validateEmailAndPhone()) {
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    if (!formData.paddleImage) {
      toast.error("Please upload the paddle image.");
      return;
    }

    setPendingAction(action);
    setReviewModalOpen(true);
  };

  const handleConfirmReview = () => {
    setReviewModalOpen(false);
    if (pendingAction === "cart") {
      executeAddToCart();
    } else if (pendingAction === "razorpay") {
      executeRazorpaySubmit();
    } else if (pendingAction === "bank") {
      setBankModalOpen(true);
    }
  };

  const handleSubmit = (e) => {
    handleActionClick("razorpay", e);
  };

  const { addToCart } = useCart();

  const executeAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      // Ensure Order ID is generated
      let orderId = formData.orderId;

      if (!orderId) {
        orderId = await ensureOrderId();
      }

      // Ensure images are uploaded
      if (!formData.paddleImage) {
        toast.error("Please upload paddle image");
        return;
      }

      const convertedPriceWithSymbol = `${currencySymbol} ${convertedPrice}`;
      const cartItem = {
        id: orderId, // Use the unique ID
        ...formData,
        totalPriceINR,
        convertedPriceWithSymbol,
        timestamp: new Date().toISOString(),
        order_status: "Payment received awaiting samples",
      };

      // ✅ Add item to Cart via Context (Unified 'users' collection)
      await addToCart(userId, cartItem);


      try {
        const emailPayload = {
          userEmail: formData.email, // User's email
          userName: formData.name,
          orderId,
          cartDetails: {
            manufacturer: formData.manufacturer,
            modelName: formData.modelName,
            modelNumber: formData.modelNumber,
            submissionType: formData.submissionType,
            certificationType: formData.certificationType,
            convertedPriceWithSymbol,
          },
        };

        const cartToken = await getAuthToken();
        const emailResponse = await fetch("/api/sendAddToCartEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(cartToken && { Authorization: `Bearer ${cartToken}` }) },
          body: JSON.stringify(emailPayload),
        });

        const emailData = await emailResponse.json();
        
        if (!emailResponse.ok) {
          console.error("Email API Error:", emailData);
          toast.warning("Item added to cart, but notification email failed to send.");
        } else if (!emailData.clientEmailSent || !emailData.adminEmailSent) {
          console.warn("Partial email success:", emailData);
          toast.info("Item added to cart. Some notifications may have failed.");
        }
      } catch (emailError) {
        console.error("Network error sending email:", emailError);
      }

      // Show Success Modal
      setShowAddToCartModal(true);


      //clear cart
      setFormData({
        orderId: "",
        name: "",
        contactNumber: "",
        email: "",
        mailingAddress: "",
        manufacturer: "",
        companyName: "", // ✅ Reset company name
        country: "",
        state: "", // Added
        modelName: "",
        modelNumber: "",
        submissionType: "New",
        paddleShape: "",
        coreMaterial: "",
        coreThickness: "",
        honeycombCellSize: "",
        surfaceMaterial: "",
        surfaceFinish: "",
        currentlySold: "Yes",
        previouslySubmitted: "Yes",
        termsAccepted: false,
        paddleImage: "",
        certificationType: "AIPA",
        paymentType: "", // Added
        paymentReceipt: "", // Added
        gstin: "", // Added
      });

      setImagePreview(null);
      setIsAddingToCart(false);

    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart.");
      setIsAddingToCart(false);
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

  return (
    <div className="min-h-screen w-full bg-slate-100/70 pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans">
      {/* Header Section */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[#f39c12] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Official Certification Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Pickleball Paddle Testing Application
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mt-1">
              Submit your paddle for official testing and certification. Please ensure all details are accurate.
            </p>
          </div>
          <Link
            href="/forms/pickle-ball-testing/application-form"
            className="self-start md:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap flex items-center gap-2"
          >
            <span>💡 Switch to Ball Testing Form &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Guidelines & Shipping Banner */}
      <div className="mb-6 bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 bg-amber-100 text-[#f39c12] rounded-xl text-lg font-bold">📦</span>
            <div>
              <span className="font-bold text-amber-900 text-sm">Sample Submission Requirements:</span>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Ship 6 sample paddles to: <span className="font-semibold text-slate-900">Unit 403-404, Motibhai Smriti Towers, Opposite Railway Station, Badlapur (W), PIN 421503, Maharashtra, India.</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 font-medium">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ Contact & GSTIN</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ 6 Paddle Samples</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ Paddle Photo (Max 5MB)</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start">
          {/* Left Column: Applicant Details & Product Information */}
          <div className="space-y-6">
            {/* Section 1: Applicant Details */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Applicant Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactNumber" className="text-sm font-semibold text-gray-700 ml-1">Contact Number</label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. +91 98765 43210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mailingAddress" className="text-sm font-semibold text-gray-700 ml-1">Mailing Address</label>
                  <textarea
                    id="mailingAddress"
                    name="mailingAddress"
                    value={formData.mailingAddress}
                    onChange={handleChange}
                    rows="1"
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Enter your full mailing address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-semibold text-gray-700 ml-1">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleLocationChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
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
                      className="mt-3 w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-semibold text-gray-700 ml-1">State</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleLocationChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
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
                      className="mt-3 w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  )}
                </div>

                {formData.country === "India" && (
                  <div className="space-y-2">
                    <label htmlFor="gstin" className="text-sm font-semibold text-gray-700 ml-1">GST IN Number</label>
                    <input
                      type="text"
                      id="gstin"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Enter GSTIN"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Product Information */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Product Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="manufacturer" className="text-sm font-semibold text-gray-700 ml-1">Manufacturer Name</label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter manufacturer name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-semibold text-gray-700 ml-1">
                    Company/Brand Name
                    <span className="text-xs font-normal text-gray-500 ml-2">(Displayed on certificate)</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modelName" className="text-sm font-semibold text-gray-700 ml-1">Model Name</label>
                  <input
                    type="text"
                    id="modelName"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter model name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modelNumber" className="text-sm font-semibold text-gray-700 ml-1">Model Number</label>
                  <input
                    type="text"
                    id="modelNumber"
                    name="modelNumber"
                    value={formData.modelNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter model number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="submissionType" className="text-sm font-semibold text-gray-700 ml-1">Submission Type</label>
                  <select
                    id="submissionType"
                    name="submissionType"
                    value={formData.submissionType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Resubmission">Resubmission</option>
                    <option value="Renewal">Renewal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="certificationType" className="text-sm font-semibold text-gray-700 ml-1">Certification Type</label>
                  <select
                    id="certificationType"
                    name="certificationType"
                    value={formData.certificationType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="AIPA">AIPA</option>
                    <option value="UWPF" disabled>UWPF (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Technical Specifications, Additional Details, Uploads & Submission */}
          <div className="space-y-6">
            {/* Section 3: Technical Specifications */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Technical Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="paddleShape" className="text-sm font-semibold text-gray-700 ml-1">Paddle Shape</label>
                  <input
                    type="text"
                    id="paddleShape"
                    name="paddleShape"
                    value={formData.paddleShape}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. Elongated"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="coreMaterial" className="text-sm font-semibold text-gray-700 ml-1">Core Material</label>
                  <input
                    type="text"
                    id="coreMaterial"
                    name="coreMaterial"
                    value={formData.coreMaterial}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. Polymer Honeycomb"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="coreThickness" className="text-sm font-semibold text-gray-700 ml-1">Core Thickness</label>
                  <input
                    type="text"
                    id="coreThickness"
                    name="coreThickness"
                    value={formData.coreThickness}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. 16mm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="honeycombCellSize" className="text-sm font-semibold text-gray-700 ml-1">Honeycomb Cell Size</label>
                  <input
                    type="text"
                    id="honeycombCellSize"
                    name="honeycombCellSize"
                    value={formData.honeycombCellSize}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. 8mm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="surfaceMaterial" className="text-sm font-semibold text-gray-700 ml-1">Surface Material</label>
                  <input
                    type="text"
                    id="surfaceMaterial"
                    name="surfaceMaterial"
                    value={formData.surfaceMaterial}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. Carbon Fiber"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="surfaceFinish" className="text-sm font-semibold text-gray-700 ml-1">Surface Finish</label>
                  <input
                    type="text"
                    id="surfaceFinish"
                    name="surfaceFinish"
                    value={formData.surfaceFinish}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. Textured"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Additional Details */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Additional Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="currentlySold" className="text-sm font-semibold text-gray-700 ml-1">Currently Sold in Market?</label>
                  <select
                    id="currentlySold"
                    name="currentlySold"
                    value={formData.currentlySold}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="previouslySubmitted" className="text-sm font-semibold text-gray-700 ml-1">Previously Submitted to AIPA?</label>
                  <select
                    id="previouslySubmitted"
                    name="previouslySubmitted"
                    value={formData.previouslySubmitted}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 5: Uploads & Agreement */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Uploads & Agreement</h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="paddleImage" className="text-sm font-bold text-slate-800 mb-2 block">Upload Pickleball Paddle Image (NOT a Ball)</label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="paddleImage" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload paddle image</span> or drag and drop</p>
                        <p className="text-xs text-red-500 font-medium">PNG, JPG or JPEG (Paddle Image Only - No Balls) (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        id="paddleImage"
                        name="paddleImage"
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
                    onChange={openModal}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-700 cursor-pointer" onClick={openModal}>
                    I have read and agree to the <span className="text-blue-600 font-semibold hover:underline">Terms and Conditions</span>. I understand that testing will only proceed after payment and receipt of samples.
                  </label>
                </div>
              </div>
            </section>

            {/* Pricing & Action Buttons */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-lg font-semibold text-blue-800">
                  Total Price: {currencySymbol} {convertedPrice.toLocaleString()} <span className="text-sm font-normal text-blue-600">+ 18% GST</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Includes testing and certification fees
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={(e) => handleActionClick("cart", e)}
                  disabled={isSubmitting || isAddingToCart || !isFormValid}
                  className="flex-1 px-6 py-3.5 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Pay Using Razorpay"
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleActionClick("bank", e)}
                  disabled={isSubmitting || !isFormValid}
                  className="flex-1 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Pay Using Bank Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      <TermsModal isOpen={isModalOpen} onClose={closeModal} onAccept={handleAccept} />
      <BankDetailsModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onConfirm={handleBankPaymentSubmit}
        onUpload={handlePaymentImageUpload}
        paymentImage={paymentImage}
        convertedPrice={convertedPrice}
        currencySymbol={currencySymbol}
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

      <ProcessingModal isOpen={showProcessingModal} stage={processingStage} />

      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        onAddAnother={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
};

export default pickleBallPaddleTestingForm;
