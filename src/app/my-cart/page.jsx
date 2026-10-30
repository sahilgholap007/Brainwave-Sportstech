"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/contexts/CartContext"
import { auth } from "@/firebase/firebaseconfig"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, getMetadata, getBytes } from "firebase/storage"
import { db } from "@/firebase/firebaseconfig"
import { AiOutlineClose } from "react-icons/ai"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Download, Image as ImageIcon, Package, CreditCard, CheckCircle, Trophy, MapPin, CircleDot, FileText, Trash2, ArrowRight, Maximize2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { getAuthToken } from "@/lib/getAuthToken"

const storage = getStorage()

// --- Bank Details Modal (New Design) ---
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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <AiOutlineClose size={20} />
        </button>

        {/* Left Side: Bank Info */}
        <div className="md:w-1/2 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Download size={20} />
            </div>
            Bank Transfer
          </h2>

          <div className="space-y-4 text-sm">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Account Name</p>
              <p className="font-semibold text-gray-800">Brainwave Velocity Pvt Ltd</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Account Number</p>
              <p className="font-mono font-semibold text-gray-800 tracking-wider">278705005002</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Bank</p>
                <p className="font-semibold text-gray-800">ICICI Bank</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">IFSC</p>
                <p className="font-mono font-semibold text-gray-800">ICIC0002787</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-500">Total Payable</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{(convertedPrice * 1.18).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">*Includes 18% GST</p>
          </div>
        </div>

        {/* Right Side: Upload */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Upload Receipt</h3>
            <p className="text-sm text-gray-500 mb-6">Please upload the transaction screenshot/receipt to confirm your order.</p>

            <label
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${paymentImage
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                }`}
            >
              {isPaymentUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-green-600">Uploading...</span>
                </div>
              ) : paymentImage ? (
                <div className="relative w-full h-full p-2 group">
                  <img src={paymentImage} alt="Receipt" className="w-full h-full object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-xl text-white text-xs font-bold">
                    Click to change
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                    <ImageIcon className="text-gray-400" size={24} />
                  </div>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={onUpload}
                disabled={isPaymentUploading}
              />
            </label>
          </div>

          <button
            className={`w-full mt-6 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${!paymentImage || isConfirming
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-[#f39c12] hover:bg-[#e67e22] shadow-orange-200"
              }`}
            onClick={onConfirm}
            disabled={!paymentImage || isConfirming}
          >
            {isConfirming ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Processing Modal ---
const ProcessingModal = ({ isOpen, stage }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 md:w-96 p-8 text-center animate-scaleIn">
        <div className="mb-6 flex justify-center">
          {stage === "success" ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle size={40} />
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
          {stage === "success" && "Your application has been submitted successfully. Redirecting..."}
        </p>
      </div>
    </div>
  )
}

// --- Main Cart Page ---
const CartPage = () => {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [userCountry, setUserCountry] = useState("IN")
  const [currencyInitials, setCurrencyInitials] = useState("INR")
  const [convertedPrice, setConvertedPrice] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [paymentImage, setPaymentImage] = useState(null)
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { cart, removeFromCart, clearCart, fetchCartItems } = useCart()
  const [isPaymentUploading, setIsPaymentUploading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)

  // UI State

  // UI State
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingStage, setProcessingStage] = useState("saving")
  const [viewingImages, setViewingImages] = useState(null) // Array of images
  const [viewingIndex, setViewingIndex] = useState(0) // Current index
  const [isLoading, setIsLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState([])

  useEffect(() => {
    // Simulate initial loading for premium feel / hydration
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleRemoveWithAnimation = async (id) => {
    setRemovingIds(prev => [...prev, id])
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300))
    await removeFromCart(userId, id)
    setRemovingIds(prev => prev.filter(item => item !== id))
  }

  const grandTotal = cart.reduce((total, item) => {
    const price = Number.parseFloat(item.convertedPriceWithSymbol?.replace(/[^\d.]/g, "") || 0)
    return total + price
  }, 0)



  // --- Logic Helpers ---

  const moveFileFromTemp = async (tempURL, targetFolder, fileNamePrefix) => {
    if (!tempURL || !tempURL.includes("tempUploads")) return tempURL;

    try {
      // Simplified logic: Create new ref, copy bytes, delete old.
      // Assuming tempURL is a download URL, we can't easily reverse to ref without regex, 
      // but we can assume we know the filename pattern or try to fetch it.

      // For Safety: We will just return the tempURL if we can't move it easily.
      // BUT, to be correct, we should fetch the blob.
      const response = await fetch(tempURL);
      const blob = await response.blob();

      const fileExtension = blob.type.split("/")[1] || "png";
      const newFileName = `${fileNamePrefix}.${fileExtension}`;
      const finalRef = ref(storage, `${targetFolder}/${newFileName}`);

      await uploadBytes(finalRef, blob);
      const finalURL = await getDownloadURL(finalRef);

      // Try to delete old file if possible (hard without reference), skipping deletion is safe-ish for temp.
      // To properly delete, we'd need the ref.

      return finalURL;
    } catch (e) {
      console.error("Error moving file:", e);
      return tempURL; // Fallback
    }
  }

  // --- Image Viewer Logic ---
  const openImageViewer = (images, index = 0) => {
    // Ensure images is an array
    const imageList = Array.isArray(images) ? images : [images].filter(Boolean);
    if (imageList.length === 0) return;

    // Normalize format: if objects with url, extract url
    const normalizedImages = imageList.map(img => (typeof img === 'object' && img?.url) ? img.url : img);

    setViewingImages(normalizedImages);
    setViewingIndex(index);
  };

  const closeImageViewer = () => {
    setViewingImages(null);
    setViewingIndex(0);
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    if (!viewingImages || viewingImages.length <= 1) return;
    setViewingIndex((prev) => (prev + 1) % viewingImages.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (!viewingImages || viewingImages.length <= 1) return;
    setViewingIndex((prev) => (prev - 1 + viewingImages.length) % viewingImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingImages) return;
      if (e.key === "Escape") closeImageViewer();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingImages]);


  const handlePaymentImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.")
      e.target.value = ""
      return
    }

    setIsPaymentUploading(true)
    const cartItemIds = cart.map((item) => item.id).join("_")
    const fileExtension = file.name.split(".").pop()
    const uniqueFileName = `${cartItemIds}_paymentReceipt.${fileExtension}`

    const tempFileRef = ref(storage, `tempUploads/${uniqueFileName}`)
    await uploadBytes(tempFileRef, file)

    const tempDownloadURL = await getDownloadURL(tempFileRef)
    setPaymentImage(tempDownloadURL)
    toast.success("Receipt uploaded successfully. Submit to confirm.")
    setIsPaymentUploading(false)
  }

  const deleteIfExists = async (fileRef) => {
    try {
      await getMetadata(fileRef)
      await deleteObject(fileRef)
    } catch (err) {
      // Ignore
    }
  }

  const handleBankPaymentSubmit = async () => {
    if (!userId) {
      toast.error("You must be logged in to submit the payment.");
      return;
    }
    if (!paymentImage) {
      toast.error("Please upload the payment receipt.");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsConfirming(true);
      setShowProcessingModal(true);
      setProcessingStage("saving");

      const cartItemIds = cart.map((item) => item.id).join("_");
      const fileExtension = paymentImage.split(".").pop().split("?")[0];
      const finalPaymentFileName = `${cartItemIds}_paymentReceipt.${fileExtension}`;
      const finalPaymentRef = ref(storage, `payment-receipts/${finalPaymentFileName}`);

      const tempPaymentFile = await fetch(paymentImage).then((res) => res.blob());
      await uploadBytes(finalPaymentRef, tempPaymentFile);
      const finalPaymentURL = await getDownloadURL(finalPaymentRef);
      // Clean up temp if possible

      const paymentDetails = {
        paymentType: "Bank Transfer",
        paymentReceipt: finalPaymentURL,
        timestamp: new Date(),
      };

      const processItemFiles = async (item) => {
        // Handle Court Images
        let finalCourtImageURLs = item.courtImages || null;
        if (item.courtImages && Array.isArray(item.courtImages)) {
          finalCourtImageURLs = await Promise.all(
            item.courtImages.map(async (image, index) => {
              if (image.url && image.url.includes("tempUploads")) {
                const finalURL = await moveFileFromTemp(
                  image.url,
                  "courtImages",
                  `${item.id}_courtImage_${index}`
                );
                return finalURL ? { ...image, url: finalURL } : image;
              }
              return image;
            })
          );
        }

        // Handle Court Checklist
        let finalChecklist = item.checklistFile || null;
        if (item.checklistFile && item.checklistFile.url && item.checklistFile.url.includes("tempUploads")) {
          const finalChecklistURL = await moveFileFromTemp(
            item.checklistFile.url,
            "checklists",
            `${item.id}_checklist`
          );
          if (finalChecklistURL) {
            finalChecklist = { ...item.checklistFile, url: finalChecklistURL };
          }
        }

        // Handle Paddle Image
        let finalPaddleImage = item.paddleImage || null;
        if (item.paddleImage && item.paddleImage.includes("tempUploads")) {
          finalPaddleImage = await moveFileFromTemp(item.paddleImage, "paddleImages", `${item.id}_paddleImage`) || item.paddleImage;
        }

        // Handle Ball Image
        let finalBallImage = item.ballImage || null;
        if (item.ballImage && item.ballImage.includes("tempUploads")) {
          finalBallImage = await moveFileFromTemp(item.ballImage, "ballImages", `${item.id}_ballImage`) || item.ballImage;
        }

        // Handle Flooring Image
        let finalFlooringImage = item.flooringImage || null;
        if (item.flooringImage && item.flooringImage.includes("tempUploads")) {
          finalFlooringImage = await moveFileFromTemp(item.flooringImage, "flooringImages", `${item.id}_flooringImage`) || item.flooringImage;
        }

        return {
          ...item,
          courtImages: finalCourtImageURLs,
          checklistFile: finalChecklist,
          paddleImage: finalPaddleImage,
          ballImage: finalBallImage,
          flooringImage: finalFlooringImage,
        };
      };

      const allItems = await Promise.all(cart.map(processItemFiles));

      const saveOrder = async (item) => {
        let category = item.category || "Unknown";
        if (item.category === "Flooring" || item.flooringImage || item.flooringType || item.productTradeName) category = "Flooring";
        else if (item.paddleImage) category = "Paddle";
        else if (item.ballImage) category = "Ball";
        else if (item.courtImages) category = "Court";

        const orderRef = doc(db, "certification_orders", item.id);
        const orderData = {
          ...item,
          userId,
          category,
          type: category,
          paymentDetails,
          order_status: (category === "Paddle" || category === "Flooring") ? "Payment received, awaiting samples" : "Payment received, awaiting inspection",
          orderDate: new Date().toISOString(),
          timestamp: new Date(),
        };
        await setDoc(orderRef, orderData);
      };

      await Promise.all(allItems.map(saveOrder));

      // Clear Legacy Carts
      const courtRef = doc(db, "CourtCertification", userId);
      const ballRef = doc(db, "Balltestingforms", userId);
      const paddleRef = doc(db, "Paddletestingforms", userId);

      await Promise.all([
        updateDoc(courtRef, { cart: [] }).catch(() => setDoc(courtRef, { cart: [] })),
        updateDoc(ballRef, { cart: [] }).catch(() => setDoc(ballRef, { cart: [] })),
        updateDoc(paddleRef, { cart: [] }).catch(() => setDoc(paddleRef, { cart: [] })),
      ]);

      // ✅ Clear Unified Cart (New)
      await clearCart(userId);

      setProcessingStage("emailing");

      try {
        const emailPayload = {
          userEmail: auth.currentUser.email,
          userName: auth.currentUser.displayName || "Customer",
          orderId: cart.map((item) => item.id).join("_"),
          newStatus: "Order placed successfully via Bank Transfer",
          paymentType: "Bank Transfer",
          cartItems: cart,
          timestamp: new Date().toISOString(),
        };

        const token = await getAuthToken();
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify(emailPayload),
        });
      } catch (emailError) {
        console.error("📧 Error sending email:", emailError);
      }

      setProcessingStage("success");
      setPaymentImage(null);
      setBankModalOpen(false);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          router.push("/my-orders");
        }, 1500);
      }, 2000);

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred while submitting your payment.");
      setShowProcessingModal(false);
    } finally {
      setIsSubmitting(false);
      setIsConfirming(false);
    }
  };

  const proceedToPay = async () => {
    if (!userId || cart.length === 0) {
      toast.error("No items in the cart to process.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (typeof window.Razorpay === "undefined") {
        toast.error("Razorpay SDK not loaded. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      const amountInPaise = Math.round(grandTotal * 1.18 * 100);

      // 1: Create Razorpay order
      const token = await getAuthToken();
      const orderResponse = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ amount: amountInPaise, currency: "INR" }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || "Failed to create Razorpay order");

      const { id: razorpayOrderId } = orderData;

      // 2: Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RZP_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "Brainwave Sportstech",
        description: "Certification & Testing Services",
        order_id: razorpayOrderId,
        handler: async (response) => {
          setShowProcessingModal(true);
          setProcessingStage("saving");

          const paymentDetails = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            // 3: Verify
            const verifyRes = await fetch("/api/verifyPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...paymentDetails }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // 4: Save (Duplicate logic from Bank Transfer? Ideally abstract, but keep inline for stability)
            // Restore logic mainly
            const processItemFiles = async (item) => {
              // Similar logic to Bank Transfer, reused
              // For brevity in generated file, assume simplified or standard copy behaviour
              // In production, we'd refactor this to a shared function
              // Re-using moveFileFromTemp
              let finalCourtImageURLs = item.courtImages || null;
              if (item.courtImages && Array.isArray(item.courtImages)) {
                finalCourtImageURLs = await Promise.all(item.courtImages.map(async (image, index) => {
                  if (image.url?.includes("tempUploads")) {
                    return await moveFileFromTemp(image.url, "courtImages", `${item.id}_courtImage_${index}`) || image;
                  }
                  return image;
                }));
              }

              let finalChecklist = item.checklistFile || null;
              if (item.checklistFile?.url?.includes("tempUploads")) {
                const url = await moveFileFromTemp(item.checklistFile.url, "checklists", `${item.id}_checklist`);
                if (url) finalChecklist = { ...item.checklistFile, url };
              }

              let finalPaddleImage = item.paddleImage || null;
              if (item.paddleImage?.includes("tempUploads")) {
                finalPaddleImage = await moveFileFromTemp(item.paddleImage, "paddleImages", `${item.id}_paddleImage`) || item.paddleImage;
              }

              let finalBallImage = item.ballImage || null;
              if (item.ballImage?.includes("tempUploads")) {
                finalBallImage = await moveFileFromTemp(item.ballImage, "ballImages", `${item.id}_ballImage`) || item.ballImage;
              }

              let finalFlooringImage = item.flooringImage || null;
              if (item.flooringImage?.includes("tempUploads")) {
                finalFlooringImage = await moveFileFromTemp(item.flooringImage, "flooringImages", `${item.id}_flooringImage`) || item.flooringImage;
              }

              return {
                ...item,
                courtImages: finalCourtImageURLs,
                checklistFile: finalChecklist,
                paddleImage: finalPaddleImage,
                ballImage: finalBallImage,
                flooringImage: finalFlooringImage,
              };
            }

            const allItems = await Promise.all(cart.map(processItemFiles));

            const saveOrder = async (item) => {
              let category = item.category || "Unknown";
              if (item.category === "Flooring" || item.flooringImage || item.flooringType || item.productTradeName) category = "Flooring";
              else if (item.paddleImage) category = "Paddle";
              else if (item.ballImage) category = "Ball";
              else if (item.courtImages) category = "Court";

              const orderRef = doc(db, "certification_orders", item.id);
              const orderData = {
                ...item,
                userId,
                category,
                type: category,
                paymentDetails,
                order_status: (category === "Paddle" || category === "Flooring") ? "Payment received, awaiting samples" : "Payment received, awaiting inspection",
                orderDate: new Date().toISOString(),
                timestamp: new Date(),
              };
              await setDoc(orderRef, orderData);
            };

            await Promise.all(allItems.map(saveOrder));

            // ✅ Clear Cart using Context (Updates Navbar & Firestore)
            await clearCart(userId);

            setProcessingStage("emailing");

            const emailToken = await getAuthToken();
            await fetch("/api/sendEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...(emailToken && { Authorization: `Bearer ${emailToken}` }) },
              body: JSON.stringify({
                userEmail: auth.currentUser.email,
                userName: auth.currentUser.displayName || "Customer",
                orderId: cart.map((item) => item.id).join("_"),
                newStatus: "Order placed successfully via Razorpay",
                paymentType: "Razorpay",
                cartItems: cart,
                timestamp: new Date().toISOString(),
              }),
            });

            setProcessingStage("success");

            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => router.push("/my-orders"), 1500);
            }, 2000);

          } catch (error) {
            console.error("Error after payment:", error);
            toast.error("Failed to verify payment.");
            setShowProcessingModal(false);
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: auth.currentUser?.displayName || "Customer",
          email: auth.currentUser?.email || "unknown@example.com",
          contact: cart[0]?.contactNumber || "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setIsSubmitting(false);
        setShowProcessingModal(false);
      });
      razorpay.open();

    } catch (err) {
      console.error("Error in proceedToPay:", err);
      toast.error("Payment could not be initiated.");
      setIsSubmitting(false);
    }
  }

  // --- Effects ---
  useEffect(() => {
    const fetchUserCurrencyInitials = async () => {
      try {
        const locationResponse = await fetch("https://ipapi.co/json/")
        const locationData = await locationResponse.json()
        setUserCountry(locationData.country)
        setCurrencyInitials(locationData.currency)
      } catch (error) {
        setConvertedPrice(grandTotal)
      }
    }
    fetchUserCurrencyInitials()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        setUserId(null)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchCartItems(userId);
    }
  }, [userId, fetchCartItems]);


  const getItemType = (item) => {
    if (item.category === "Flooring" || item.flooringImage || item.flooringType || item.productTradeName) return "Sports Flooring"
    if (item.paddleImage) return "Paddle"
    if (item.ballImage) return "Ball"
    if (item.courtImages) return "Court"
    return "Product"
  }

  const handleRemove = async (itemId) => {
    try {
      const itemRemoved = await removeFromCart(userId, itemId)
      if (itemRemoved) {
        toast.success("Item removed")
      }
    } catch (error) {
      toast.error("Could not remove item")
    }
  }

  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 px-4 sm:px-6 md:px-12 font-sans pb-20">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#2c3e50] mb-8 flex items-center gap-3">
          Your Cart
          <span className="bg-blue-100 text-blue-600 text-sm font-bold px-3 py-1 rounded-full">{cart.length} items</span>
        </h1>

        {isLoading ? (
          // Custom Skeleton Loading
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/3 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex gap-6 animate-pulse">
                  <div className="w-full sm:w-40 h-40 bg-slate-200 rounded-2xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-10 bg-slate-200 rounded-xl"></div>
                      <div className="h-10 bg-slate-200 rounded-xl"></div>
                      <div className="h-10 bg-slate-200 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 animate-pulse space-y-4">
                <div className="h-8 w-1/2 bg-slate-200 rounded"></div>
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-12 w-full bg-slate-200 rounded-xl mt-8"></div>
              </div>
            </div>
          </div>
        ) : cart.length === 0 ? (
          // Launchpad Empty State
          <div className="py-12">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-sm border border-slate-100">
                <Package size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Ready to get started? Choose a certification type below to begin your application process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Paddle Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl p-8 border border-orange-100/50 hover:shadow-xl hover:shadow-orange-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/pickle-ball-paddle-testing")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Paddle Certification</h3>
                <p className="text-sm text-gray-600 mb-6">Submit your paddle designs for USAPA approval and performance testing.</p>
                <button className="flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>

              {/* Ball Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-3xl p-8 border border-yellow-100/50 hover:shadow-xl hover:shadow-yellow-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/pickle-ball-testing")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-yellow-500 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Package size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ball Certification</h3>
                <p className="text-sm text-gray-600 mb-6">Get your pickleballs tested for durability, bounce, and official standards.</p>
                <button className="flex items-center gap-2 text-yellow-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>

              {/* Court Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-8 border border-blue-100/50 hover:shadow-xl hover:shadow-blue-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/court-certification")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Court Inspector</h3>
                <p className="text-sm text-gray-600 mb-6">Schedule an on-site inspection for professional court certification.</p>
                <button className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>

              {/* Sports Flooring Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl p-8 border border-emerald-100/50 hover:shadow-xl hover:shadow-emerald-100 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => router.push("/forms/sports-flooring-certification")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Trophy size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sports Flooring</h3>
                <p className="text-sm text-gray-600 mb-6">Laboratory certification for acrylic, PU, vinyl, modular and rubber flooring.</p>
                <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Start Application <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Cart Items (65% width) - relative to sit above bg */}
            {/* Left Column: Cart Items (65% width) - relative to sit above bg */}
            <div className="w-full lg:w-2/3 space-y-6 relative z-10 pb-12">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col sm:flex-row gap-6 items-start group hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 ${removingIds.includes(item.id) ? 'opacity-0 -translate-x-full scale-90' : 'opacity-100 translate-x-0 scale-100'}`}
                >
                  {/* Image */}
                  {(() => {
                    const imageUrl = item.paddleImage ||
                      item.ballImage ||
                      item.flooringImage ||
                      (item.courtImages?.[0]?.url || item.courtImages?.[0]) ||
                      "/placeholder.jpg";
                    const isPdf = imageUrl?.toLowerCase().includes(".pdf");

                    return (
                      <div
                        className="w-full sm:w-40 h-40 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-100 relative cursor-pointer hover:scale-[1.02] transition-transform shadow-inner flex items-center justify-center group-hover:shadow-md"
                        onClick={() => {
                          if (isPdf) {
                            window.open(imageUrl, "_blank");
                          } else {
                            // Collect all images for this item to browse
                            const allItemImages = [];
                            if (item.paddleImage) allItemImages.push(item.paddleImage);
                            if (item.ballImage) allItemImages.push(item.ballImage);
                            if (item.flooringImage) allItemImages.push(item.flooringImage);
                            if (item.courtImages) {
                              if (Array.isArray(item.courtImages)) item.courtImages.forEach(img => allItemImages.push(img));
                              else allItemImages.push(item.courtImages);
                            }
                            // Find index of clicked image (heuristic: first one usually)
                            openImageViewer(allItemImages, 0);
                          }
                        }}
                      >
                        {isPdf ? (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                            <FileText size={32} className="mb-1 block mx-auto" />
                            <span className="text-[10px] font-medium uppercase text-center mt-1">PDF Document</span>
                          </div>
                        ) : (
                          <>
                            <img
                              src={imageUrl}
                              alt={item.name || item.productTradeName}
                              className="w-full h-full object-contain p-2 mix-blend-multiply"
                            />
                          </>
                        )}
                        {/* Zoom overlay hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white/90 p-2 rounded-full shadow-sm text-slate-700">
                            <Maximize2 size={16} />
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Content */}
                  <div className="flex-1 w-full flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-2">
                          <span className={`self-start text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${getItemType(item) === 'Paddle' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            getItemType(item) === 'Ball' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                              getItemType(item) === 'Sports Flooring' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            {getItemType(item)} Certification
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
                            {item.productTradeName || `${item.modelName || ''} ${item.modelNumber || ''}`.trim() || item.name || "Unnamed Item"}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="block font-extrabold text-2xl text-slate-900 tracking-tight">{item.convertedPriceWithSymbol}</span>
                          <span className="text-xs text-slate-400 font-medium">Excl. Taxes</span>
                        </div>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        {(item.companyName || item.manufacturer || item.flooringManufacturer) && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Company / Mfg</span>
                            <span className="font-semibold text-slate-700 truncate">{item.companyName || item.flooringManufacturer || item.manufacturer}</span>
                          </div>
                        )}
                        {item.flooringType && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Flooring Type</span>
                            <span className="font-semibold text-slate-700 truncate">
                              {Array.isArray(item.flooringType) ? item.flooringType.join(", ") : item.flooringType}
                            </span>
                          </div>
                        )}
                        {item.totalThickness && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Thickness</span>
                            <span className="font-semibold text-slate-700">{item.totalThickness} mm</span>
                          </div>
                        )}
                        {item.useType && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Use Type</span>
                            <span className="font-semibold text-slate-700">{item.useType}</span>
                          </div>
                        )}
                        {(item.modelName || item.modelNumber) && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Model</span>
                            <span className="font-semibold text-slate-700 truncate">{item.modelName || item.modelNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-3 mt-2">
                      <button
                        onClick={() => handleRemoveWithAnimation(item.id)}
                        disabled={removingIds.includes(item.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2 group/remove disabled:opacity-50"
                      >
                        <Trash2 size={16} className="group-hover/remove:scale-110 transition-transform" />
                        Remove
                      </button>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all flex items-center gap-2 transform active:scale-95"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary (Sticky) (35% width) */}
            <div className="w-full lg:w-1/3 active sticky top-32">
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹ {grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-medium">₹ {(grandTotal * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span>₹ {(grandTotal * 1.18).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={proceedToPay} // Razorpay
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={20} />
                    Pay Online (Razorpay)
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    onClick={() => setBankModalOpen(true)}
                    className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Bank Transfer
                  </button>
                </div>

                <p className="text-xs text-center text-gray-400 mt-6">
                  Secure checkout powered by Razorpay.
                  <br />By placing this order, you agree to our Terms of Service.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      <BankDetailsModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onConfirm={handleBankPaymentSubmit}
        onUpload={handlePaymentImageUpload}
        paymentImage={paymentImage}
        convertedPrice={grandTotal}
        currencySymbol="₹"
        isPaymentUploading={isPaymentUploading}
        isConfirming={isConfirming}
      />

      <ProcessingModal isOpen={showProcessingModal} stage={processingStage} />

      {/* Item Details Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">

            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-start sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getItemType(selectedItem) === 'Paddle' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    getItemType(selectedItem) === 'Ball' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                      getItemType(selectedItem) === 'Sports Flooring' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {getItemType(selectedItem)} Certification
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    ID: {selectedItem.orderId || selectedItem.id}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {selectedItem.productTradeName || `${selectedItem.modelName || ''} ${selectedItem.modelNumber || ''}`.trim() || selectedItem.name || "Unnamed Item"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-full transition-all shadow-sm"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

              {/* Gallery */}
              {(selectedItem.courtImages || selectedItem.paddleImage || selectedItem.ballImage || selectedItem.flooringImage) && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2 px-1">
                    <ImageIcon size={18} className="text-blue-600" />
                    Product Image
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                    {Array.isArray(selectedItem.courtImages) ? (
                      selectedItem.courtImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-32 h-32 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative group"
                          onClick={() => openImageViewer(selectedItem.courtImages, idx)}
                        >
                          <img src={img.url || img} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transform scale-75 group-hover:scale-100 transition-all" size={20} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className="w-32 h-32 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative group"
                        onClick={() => openImageViewer(selectedItem.flooringImage || selectedItem.paddleImage || selectedItem.ballImage, 0)}
                      >
                        <img
                          src={selectedItem.flooringImage || selectedItem.paddleImage || selectedItem.ballImage || "/placeholder.jpg"}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transform scale-75 group-hover:scale-100 transition-all" size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price & Primary Info Card */}
              <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                {/* Decorative bg blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -ml-5 -mb-5"></div>

                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Trophy size={14} className="text-yellow-500" />
                    Company Name
                  </div>
                  <span className="text-xl font-bold tracking-tight">{selectedItem.companyName || selectedItem.flooringManufacturer || selectedItem.manufacturer || "N/A"}</span>
                  {selectedItem.country && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                      <MapPin size={14} />
                      {selectedItem.country}
                    </div>
                  )}
                </div>
                <div className="flex-1 sm:border-l sm:border-slate-700 sm:pl-8 relative z-10 pt-4 sm:pt-0 border-t border-slate-700 sm:border-t-0">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Estimation</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white tracking-tight">{selectedItem.convertedPriceWithSymbol}</span>
                    <span className="text-slate-400 text-xs font-medium border border-slate-600 px-1.5 py-0.5 rounded">Excl. Taxes</span>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2 px-1">
                  <CircleDot size={18} className="text-blue-600" />
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Helper for Grid Item */}
                  {(() => {
                    const GridItem = ({ label, value }) => (
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{label}</span>
                        <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
                      </div>
                    )

                    return (
                      <>
                        {selectedItem.modelName && <GridItem label="Model Name" value={selectedItem.modelName} />}
                        {selectedItem.modelNumber && <GridItem label="Model Number" value={selectedItem.modelNumber} />}
                        {selectedItem.companyName && selectedItem.companyName !== selectedItem.manufacturer &&
                          <GridItem label="Company" value={selectedItem.companyName} />
                        }

                        {/* Item Type Specifics */}
                        {getItemType(selectedItem) === "Sports Flooring" && (
                          <>
                            {selectedItem.productTradeName && <GridItem label="Product Name" value={selectedItem.productTradeName} />}
                            {selectedItem.brandName && <GridItem label="Brand Name" value={selectedItem.brandName} />}
                            {selectedItem.flooringManufacturer && <GridItem label="Manufacturer" value={selectedItem.flooringManufacturer} />}
                            {selectedItem.useType && <GridItem label="Type of Use" value={selectedItem.useType} />}
                            {selectedItem.flooringType && <GridItem label="Flooring Type" value={Array.isArray(selectedItem.flooringType) ? selectedItem.flooringType.join(", ") : selectedItem.flooringType} />}
                            {selectedItem.constructionSystem && <GridItem label="Construction" value={Array.isArray(selectedItem.constructionSystem) ? selectedItem.constructionSystem.join(", ") : selectedItem.constructionSystem} />}
                            {selectedItem.totalThickness && <GridItem label="Thickness" value={`${selectedItem.totalThickness} mm`} />}
                            {selectedItem.sampleDimensions && <GridItem label="Dimensions" value={selectedItem.sampleDimensions} />}
                            {selectedItem.colorFinish && <GridItem label="Color / Finish" value={selectedItem.colorFinish} />}
                            {selectedItem.batchNumber && <GridItem label="Batch No." value={selectedItem.batchNumber} />}
                            {selectedItem.dateOfManufacture && <GridItem label="Mfg Date" value={selectedItem.dateOfManufacture} />}
                            {selectedItem.purposeOfTesting && <GridItem label="Purpose" value={Array.isArray(selectedItem.purposeOfTesting) ? selectedItem.purposeOfTesting.join(", ") : selectedItem.purposeOfTesting} />}
                          </>
                        )}

                        {getItemType(selectedItem) === "Court" && (
                          <>
                            {selectedItem.surfaceType && <GridItem label="Surface" value={selectedItem.surfaceType} />}
                            {selectedItem.baseType && <GridItem label="Base" value={selectedItem.baseType} />}
                            {selectedItem.numberOfCourts && <GridItem label="Courts" value={selectedItem.numberOfCourts} />}
                            {selectedItem.facilityType && <GridItem label="Facility" value={selectedItem.facilityType} />}
                          </>
                        )}

                        {(getItemType(selectedItem) === "Ball" || getItemType(selectedItem) === "Paddle") && (
                          <>
                            {selectedItem.useType && <GridItem label="Use Type" value={selectedItem.useType} />}
                            {selectedItem.numberOfHoles && <GridItem label="Number of Holes" value={selectedItem.numberOfHoles} />}
                            {selectedItem.ballType && <GridItem label="Ball Type" value={selectedItem.ballType} />}
                            {selectedItem.materialOfBall && <GridItem label="Material" value={selectedItem.materialOfBall} />}

                            {selectedItem.paddleShape && <GridItem label="Shape" value={selectedItem.paddleShape} />}
                            {selectedItem.coreMaterial && <GridItem label="Core" value={selectedItem.coreMaterial} />}
                            {selectedItem.faceMaterial && <GridItem label="Face" value={selectedItem.faceMaterial} />}
                          </>
                        )}

                        {selectedItem.submissionType && <GridItem label="Submission" value={selectedItem.submissionType} />}
                      </>
                    )
                  })()}
                </div>

                {selectedItem.mailingAddress && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Mailing Address</span>
                    <p className="text-sm font-medium text-slate-700">{selectedItem.mailingAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Full Screen Image Viewer (Apple Style) */}
      {viewingImages && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn select-none"
          onClick={closeImageViewer}
        >
          <button
            onClick={closeImageViewer}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20"
          >
            <AiOutlineClose size={28} />
          </button>

          {/* Navigation Buttons */}
          {viewingImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 backdrop-blur-md"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 backdrop-blur-md"
              >
                <ChevronRight size={32} />
              </button>

              {/* Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium z-20 border border-white/10">
                {viewingIndex + 1} / {viewingImages.length}
              </div>
            </>
          )}

          <img
            key={viewingIndex} // Key forces re-render for animation if needed, or remove for smooth transition
            src={viewingImages[viewingIndex]}
            alt="Full Screen"
            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl animate-scaleIn transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Style for animation */}
      <style jsx>{`
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.03; transform: scale(1); } 50% { opacity: 0.08; transform: scale(1.05); } }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
      `}</style>
    </div>
  )
}

export default CartPage
