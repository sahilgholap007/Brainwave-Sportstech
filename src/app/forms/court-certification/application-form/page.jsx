"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { auth, db } from "@/firebase/firebaseconfig"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useCart } from "@/app/contexts/CartContext"
import { toast } from "react-toastify"
import { getBytes } from "firebase/storage"
import { Download, Upload, Trash2 } from "lucide-react"
// Shared utilities
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion"
import { uploadImageToStorage, finalizeImageUpload } from "@/utils/imageUpload"
import { generateCourtOrderId } from "@/utils/orderIdGenerator"
import { getAuthToken } from "@/lib/getAuthToken"
import { useRouter } from "next/navigation"
import AddToCartModal from "@/components/AddToCartModal"

const storage = getStorage()

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [canAccept, setCanAccept] = useState(false)
  const modalContentRef = useRef(null)

  const handleScroll = () => {
    if (modalContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current
      // Add a small buffer (e.g., 5px) to account for sub-pixel rendering differences
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setCanAccept(true)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b bg-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800">Terms and Conditions</h2>
        </div>

        {/* Modal Content */}
        <div ref={modalContentRef} onScroll={handleScroll} className="p-6 h-80 overflow-y-auto bg-white">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Please read the terms and conditions carefully before proceeding further. By continuing, you agree to the
              following:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                Court certification will be undertaken only upon payment of the full fee in advance and after receiving
                all required documentation.
              </li>
              <li>The court must meet all the standard specifications as required by the certification body.</li>
              <li>
                Applicants must upload clear images of the court (max 5MB in size) showing the full court layout,
                surface, and markings.
              </li>
              <li>
                Courts that fail certification can be resubmitted after the required modifications and changes are made,
                along with the applicable fee.
              </li>
              <li>
                The normal certification process takes four (4) weeks upon receipt of all documentation and payment.
                Express certification services (1–2 weeks) are available at an extra charge.
              </li>
              <li>
                Upon request, Brainwave SportsTech will provide detailed reports of areas where the court failed to
                comply for client confirmation and satisfaction.
              </li>
              <li>
                Certification reports will be provided in soft copy format for all inspections conducted by Brainwave
                SportsTech to both the client and the certification body (AIPA/UWPF).
              </li>
              <li>
                Brainwave SportsTech does not accept liability for defects in court construction or maintenance, even if
                the court complies during certification.
              </li>
              <li>
                By clicking "I agree," paying the fee, and submitting the application for certification, you agree to
                all terms and conditions of Brainwave SportsTech.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 flex justify-end space-x-4 bg-gray-100 border-t">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${canAccept ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 text-gray-200 cursor-not-allowed"
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
  )
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden max-h-[90vh] overflow-y-auto mt-10 mb-10">
        {/* Modal Header */}
        <div className="p-6 border-b bg-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800">Bank Payment Details</h2>
        </div>

        {/* Bank Details */}
        <div className="p-6 bg-white">
          <p className="text-gray-700 mb-4">
            Please transfer the amount to the bank details below and upload your payment receipt.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-gray-800">
            <p><strong>Bank Name:</strong> ICICI Bank</p>
            <p><strong>Branch Name:</strong> Badlapur</p>
            <p><strong>Account Number:</strong> 278705005002</p>
            <p><strong>IFSC Code:</strong> ICIC0002787</p>
            <p><strong>Account Holder:</strong> Brainwave Velocity Pvt Ltd</p>

            <div className="text-xl font-semibold text-blue-600 mt-4">
              <p>Base Amount: {currencySymbol} {convertedPrice.toLocaleString()}</p>
              <p>GST (18%): {currencySymbol} {(convertedPrice * 0.18).toLocaleString()}</p>
              <hr className="my-2 border-gray-300" />
              <p className="font-bold">Total Amount to be Paid: {currencySymbol} {(convertedPrice * 1.18).toLocaleString()}</p>
            </div>
          </div>

          {/* Upload Payment Screenshot */}
          <div className="mt-4">
            <label className="text-gray-700 font-medium block mb-2">Upload Payment Receipt</label>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
            {isPaymentUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            )}
            {paymentImage && (
              <img
                src={paymentImage || "/placeholder.svg"}
                alt="Payment Preview"
                className="mt-4 w-32 h-32 object-cover rounded shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 flex justify-end space-x-4 bg-gray-100 border-t">
          <button
            className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition ${isConfirming ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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
  )
}

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
          {stage === "success" && <span className="text-green-600">Order Placed Successfully!</span>}
        </h3>

        <div className="text-gray-600">
          {stage === "saving" && <p>Please wait while we save your certification details.</p>}
          {stage === "emailing" && <p>We are sending a confirmation email to your inbox.</p>}
          {stage === "success" && (
            <div className="space-y-4 text-center">
              <p>
                The order is placed successfully! You will receive confirmation and further updates about your order through the email you provided while filling the form.
              </p>
              
              <div className="pt-4">
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
        </div>
      </div>
    </div>
  )
}

const ReviewModal = ({ isOpen, onClose, formData, imagePreview, checklistFile, onConfirm, pendingAction }) => {
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
          <h2 className="text-2xl font-bold text-gray-800 font-sans">Review Your Court Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold font-sans">&times;</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto grow">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <p className="text-sm text-blue-900 font-semibold font-sans">
              Please review all the information below. Once verified, click "{actionText}" to proceed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Applicant Details */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-md font-sans">Applicant Details</h3>
              <div className="text-sm space-y-1.5 text-gray-700 font-sans">
                <p><strong>Full Name:</strong> {formData.name}</p>
                <p><strong>Contact Number:</strong> {formData.contactNumber}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Country:</strong> {formData.country}</p>
                <p><strong>State:</strong> {formData.state}</p>
                {formData.gstin && <p><strong>GST IN:</strong> {formData.gstin}</p>}
                <p className="whitespace-pre-wrap"><strong>Mailing Address:</strong> {formData.mailingAddress}</p>
              </div>
            </div>

            {/* Section 2: Court Details */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-md font-sans">Facility & Court Details</h3>
              <div className="text-sm space-y-1.5 text-gray-700 font-sans">
                <p><strong>Facility Name:</strong> {formData.facilityName}</p>
                <p><strong>Brand/Company Name:</strong> {formData.companyName}</p>
                <p><strong>Manufacturer:</strong> {formData.manufacturer}</p>
                <p><strong>Location:</strong> {formData.facilityLocation}</p>
                <p><strong>Facility Type:</strong> {formData.facilityType}</p>
                <p><strong>Number of Courts:</strong> {formData.numberOfCourts}</p>
                <p><strong>Construction Date:</strong> {formData.constructionDate}</p>
                {formData.renovationDate && <p><strong>Last Renovation Date:</strong> {formData.renovationDate}</p>}
                <p><strong>Court Base:</strong> {formData.baseType}</p>
                <p><strong>Surface Type:</strong> {formData.surfaceType === "Other" ? formData.otherSurfaceType : formData.surfaceType}</p>
                <p><strong>Color Scheme:</strong> {formData.surfaceColorScheme}</p>
                <p><strong>Constructed By:</strong> {formData.constructionCompany}</p>
                <p><strong>Type of Use:</strong> {formData.useType}</p>
                <p><strong>Certification Type:</strong> {formData.certificationType}</p>
                <p><strong>Court is being used:</strong> {formData.isCourtBeingUsed}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Uploaded Checklist */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-md font-sans">Uploaded Checklist</h3>
            {checklistFile ? (
              <p className="text-sm text-green-600 flex items-center gap-2 font-sans">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                </svg>
                {checklistFile.name} (Checklist PDF Uploaded)
              </p>
            ) : (
              <p className="text-red-500 text-sm font-sans">No checklist uploaded.</p>
            )}
          </div>

          {/* Section 4: Uploaded Court Images */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3">
            <h3 className="font-bold text-gray-800 border-b pb-2 text-md font-sans">Uploaded Court Images</h3>
            {imagePreview && imagePreview.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreview.map((previewUrl, index) => (
                  <img
                    key={index}
                    src={previewUrl}
                    alt={`Court Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-lg border shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <p className="text-red-500 text-sm font-sans">No images uploaded.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-850 font-bold rounded-xl transition font-sans"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition font-sans"
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

const PickleballCourtCertificationForm = () => {
  const router = useRouter()
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingStage, setProcessingStage] = useState("saving") // saving -> emailing -> success

  const [formData, setFormData] = useState({
    orderId: "",
    name: "", // Court Facility Owner
    contactNumber: "",
    email: "",
    mailingAddress: "",
    state: "",
    country: "",
    facilityName: "", // Court Facility Name
    companyName: "", // ✅ Company/Brand name for public display
    facilityLocation: "", // Location of Facility
    facilityType: "Indoor", // Indoor / Outdoor
    numberOfCourts: "",
    constructionDate: "",
    renovationDate: "", // if applicable
    baseType: "Concrete", // Concrete / Asphalt
    surfaceType: "Acrylic Paint System", // Options from the list
    otherSurfaceType: "", // If "Other" is selected
    surfaceColorScheme: "",
    constructionCompany: "", // Court Construction done by
    useType: "Recreational purpose", // Recreational purpose / Professional Play
    certificationType: "AIPA", // AIPA/UWPF
    isCourtBeingUsed: "Yes", // Yes / No
    termsAccepted: false,
    courtImages: [], // Array of court images
    paymentType: "",
    paymentReceipt: "",
    gstin: "",
    checklistUploaded: false, // New field for checklist upload
    manufacturer: "", // New manufacturer field
  })

  const [userId, setUserId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState([])
  const [basePrice, setBasePrice] = useState(25000) // Base price for up to 2 courts
  const [additionalCourtPrice, setAdditionalCourtPrice] = useState(10000) // Price for each additional court
  const [totalPriceINR, setTotalPriceINR] = useState(25000) // Initial price

  // Use shared currency conversion hook
  const {
    convertedPrice,
    currencySymbol,
    currencyCode: currencyInitials,
    userCountry,
    isLoading: isCurrencyLoading,
  } = useCurrencyConversion(totalPriceINR)



  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentImage, setPaymentImage] = useState(null)
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [isPaymentUploading, setIsPaymentUploading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [checklistFile, setChecklistFile] = useState(null)
  const [isChecklistUploading, setIsChecklistUploading] = useState(false)

  const [isOtherCountry, setIsOtherCountry] = useState(false)
  const [isOtherState, setIsOtherState] = useState(false)
  const [isOtherSurface, setIsOtherSurface] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'cart' | 'razorpay' | 'bank'

  // Get logged-in user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)

        // Reference the user's document in the CourtCertification collection
        const userDocRef = doc(db, "CourtCertification", user.uid)

        // Check if the document exists, and initialize it if not
        const userDoc = await getDoc(userDocRef)
        if (!userDoc.exists()) {
          await setDoc(userDocRef, { cart: [], processedOrders: [] })
        }
      } else {
        setUserId(null)
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    })

    return () => unsubscribe()
  }, [router])

  // Calculate price based on number of courts
  useEffect(() => {
    const numCourts = Number.parseInt(formData.numberOfCourts) || 0

    if (numCourts <= 2) {
      setTotalPriceINR(basePrice)
    } else {
      // Base price for first 2 courts + additional price for each extra court
      const additionalCourts = numCourts - 2
      setTotalPriceINR(basePrice + additionalCourts * additionalCourtPrice)
    }
  }, [formData.numberOfCourts, basePrice, additionalCourtPrice])

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target

    if (name === "surfaceType" && value === "Other") {
      setIsOtherSurface(true)
    } else if (name === "surfaceType") {
      setIsOtherSurface(false)
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleLocationChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "country") {
      setIsOtherCountry(value === "Other")
      if (value === "Other") {
        setFormData((prev) => ({ ...prev, country: "" }))
      }
    }

    if (name === "state") {
      setIsOtherState(value === "Other")
      if (value === "Other") {
        setFormData((prev) => ({ ...prev, state: "" }))
      }
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleAccept = () => {
    setFormData((prev) => ({ ...prev, termsAccepted: true }))
    closeModal()
  }

  // Use shared order ID generator
  const ensureOrderId = async () => {
    if (!formData.orderId) {
      const orderId = generateCourtOrderId()
      await new Promise((resolve) =>
        setFormData((prev) => {
          resolve()
          return { ...prev, orderId }
        }),
      )
      return orderId
    }
    return formData.orderId
  }

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
      "country",
      "state",
      "facilityName",
      "companyName", // ✅ Required for public display
      "manufacturer", // ✅ Added manufacturer
      "facilityLocation",
      "facilityType",
      "numberOfCourts",
      "constructionDate",
      "baseType",
      "surfaceType",
      "surfaceColorScheme",
      "constructionCompany",
      "useType",
      "certificationType",
      "isCourtBeingUsed",
    ]

    // Check if other surface type is selected but not specified
    if (isOtherSurface && !formData.otherSurfaceType) {
      toast.error("Please specify the surface type.")
      return
    }

    // Conditionally require GSTIN only if country is India
    if (formData.country === "India" && !formData.gstin) {
      toast.error("Please enter your GST IN Number.")
      return
    }

    // Check if any required field is missing
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`)
        return // Prevent modal from opening
      }
    }

    if (!validateEmailAndPhone()) {
      return // Prevent modal from opening
    }

    if (!formData.termsAccepted) {
      toast.error("You must agree to the terms and conditions.")
      return // Prevent modal from opening
    }

    if (formData.courtImages.length === 0) {
      toast.error("Please upload at least one court image.")
      return // Prevent modal from opening
    }

    if (!formData.checklistUploaded) {
      toast.error("Please download, complete, and upload the checklist before proceeding.")
      return // Prevent modal from opening
    }

    setBankModalOpen(true) // Open modal only if all validations pass
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate that all selected files are images
    const nonImageFiles = files.filter((file) => !file.type.startsWith("image/"))
    if (nonImageFiles.length > 0) {
      toast.error("Only image files are allowed. Please upload PNG, JPG, or JPEG images.")
      e.target.value = ""
      return
    }

    // Check if adding these files would exceed the 5 image limit
    if (formData.courtImages.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images.")
      e.target.value = ""
      return
    }

    // Calculate total size of all files
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)

    // Check if total size exceeds 5MB
    if (totalSize > 5 * 1024 * 1024) {
      toast.error("Total file size exceeds 5MB. Please upload smaller images.")
      e.target.value = ""
      return
    }

    setIsImageUploading(true) // Start Loading

    // Ensure Order ID is set before uploading
    const orderId = await ensureOrderId()

    // Upload each image
    const uploadPromises = files.map(async (file, index) => {
      // Upload the image to Firebase (Temp Storage)
      const uploadedImageURL = await uploadImageToStorage(
        file,
        "courtImages",
        `${orderId}_${index}`,
        "courtImage",
        true, // Upload to temporary storage
      )

      if (uploadedImageURL) {
        const { downloadURL, uniqueFileName } = uploadedImageURL

        // Create preview
        const preview = URL.createObjectURL(file)

        return {
          url: downloadURL,
          tempFileName: uniqueFileName,
          preview,
        }
      }
      return null
    })

    const uploadedImages = await Promise.all(uploadPromises)
    const validImages = uploadedImages.filter((img) => img !== null)

    if (validImages.length > 0) {
      // Update state with the new images
      setFormData((prev) => ({
        ...prev,
        courtImages: [...prev.courtImages, ...validImages],
      }))

      // Update image previews
      setImagePreview((prev) => [...prev, ...validImages.map((img) => img.preview)])
    } else {
      toast.error("Failed to upload images. Please try again.")
    }

    setIsImageUploading(false) // Stop Loading
    e.target.value = "" // Reset file input
  }

  const handleRemoveImage = async (index) => {
    const imageToRemove = formData.courtImages[index]

    // Remove from Firebase Storage if it exists
    if (imageToRemove && imageToRemove.tempFileName) {
      const tempRef = ref(storage, `tempUploads/${imageToRemove.tempFileName}`)
      try {
        await deleteObject(tempRef)
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }

    // Remove from state
    setFormData((prev) => ({
      ...prev,
      courtImages: prev.courtImages.filter((_, i) => i !== index),
    }))

    // Remove from preview
    setImagePreview((prev) => prev.filter((_, i) => i !== index))
  }

  const downloadChecklist = () => {
    // URL to your checklist PDF
    const checklistUrl = "/pickleball-court-certification-checklist.pdf"

    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = checklistUrl
    link.download = "pickleball-court-certification-checklist.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Checklist download started. Please complete and upload it.")
  }

  const handleChecklistUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      toast.error("Please upload the checklist in PDF format.")
      e.target.value = ""
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller file.")
      e.target.value = ""
      return
    }

    setIsChecklistUploading(true)

    // Ensure Order ID is set before uploading
    const orderId = await ensureOrderId()

    // Upload to Firebase Storage
    const uploadedFile = await uploadImageToStorage(
      file,
      "checklists",
      orderId,
      "checklist",
      true, // Upload to temporary storage
    )

    if (uploadedFile) {
      const { downloadURL, uniqueFileName } = uploadedFile

      // Update state
      setFormData((prev) => ({
        ...prev,
        checklistFile: {
          url: downloadURL,
          tempFileName: uniqueFileName,
          name: file.name,
        },
        checklistUploaded: true,
      }))

      setChecklistFile({
        url: downloadURL,
        name: file.name,
      })

      toast.success("Checklist uploaded successfully!")
    } else {
      toast.error("Failed to upload checklist. Please try again.")
    }

    setIsChecklistUploading(false)
    e.target.value = "" // Reset file input
  }

  // finalizeImageUpload is now imported from @/utils/imageUpload

  const handlePaymentImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate File Type (Only images allowed)
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed. Please upload a PNG, JPG, or JPEG image.")
      e.target.value = ""
      return
    }

    // Validate File Size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.")
      e.target.value = ""
      return
    }

    setIsPaymentUploading(true) // Start Loading

    // Ensure Order ID is set before uploading
    const orderId = await ensureOrderId()

    // Upload to Firebase (Temp Storage)
    const uploadedPaymentURL = await uploadImageToStorage(
      file,
      "payment-receipts",
      orderId,
      "paymentReceipt",
      true, // Upload to tempUploads
    )

    if (uploadedPaymentURL) {
      const { downloadURL, uniqueFileName } = uploadedPaymentURL

      // Store temporary filename & URL so it can be moved later
      setFormData((prev) => ({
        ...prev,
        paymentReceipt: downloadURL, // Temp URL
        tempPaymentReceiptFilename: uniqueFileName, // Store temp filename
      }))

      // Show Image Preview
      setPaymentImage(downloadURL)
    } else {
      toast.error("Failed to upload payment receipt. Please try again.")
    }

    setIsPaymentUploading(false) // Stop Loading
  }

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

      // Ensure Order ID exists before submitting
      const orderId = await ensureOrderId();

      // Finalize checklist upload
      let finalChecklistURL = null;
      if (formData.checklistFile?.tempFileName) {
        finalChecklistURL = await finalizeImageUpload(
          formData.checklistFile.tempFileName,
          "checklists"
        );
      }

      // Finalize court images
      const finalCourtImageURLs = await Promise.all(
        formData.courtImages.map(async (image) => {
          if (image.tempFileName) {
            return (
              (await finalizeImageUpload(image.tempFileName, "courtImages")) ||
              image.url
            );
          }
          return image.url;
        })
      );

      // Move Payment Receipt from tempUploads to payment-receipts
      let finalPaymentReceiptURL = formData.paymentReceipt;
      if (formData.tempPaymentReceiptFilename) {
        const movedPaymentReceiptURL = await finalizeImageUpload(
          formData.tempPaymentReceiptFilename,
          "payment-receipts"
        );

        if (movedPaymentReceiptURL) {
          finalPaymentReceiptURL = movedPaymentReceiptURL; // Store final URL
        } else {
          throw new Error("Failed to move payment receipt to final storage.");
        }
      }

      // Reference New Order Document
      const orderRef = doc(db, "certification_orders", orderId);

      // Prepare the final surface type value
      const finalSurfaceType =
        formData.surfaceType === "Other"
          ? formData.otherSurfaceType
          : formData.surfaceType;

      // Order Data
      // Order Data
      const order = {
        orderId,
        userId,
        // Explicitly select fields to avoid pollution
        category: "Court",
        type: "Court",
        name: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email,
        mailingAddress: formData.mailingAddress,
        state: formData.state,
        country: formData.country,
        companyName: formData.companyName,
        manufacturer: formData.manufacturer,
        gstin: formData.gstin || "",

        // Court Specifics
        facilityName: formData.facilityName,
        facilityLocation: formData.facilityLocation,
        facilityType: formData.facilityType,
        numberOfCourts: formData.numberOfCourts,
        constructionDate: formData.constructionDate,
        renovationDate: formData.renovationDate,
        baseType: formData.baseType,
        surfaceType: finalSurfaceType,
        surfaceColorScheme: formData.surfaceColorScheme,
        constructionCompany: formData.constructionCompany,
        useType: formData.useType,
        certificationType: formData.certificationType,
        isCourtBeingUsed: formData.isCourtBeingUsed,

        courtImages: finalCourtImageURLs,
        checklistFile: finalChecklistURL,
        paymentReceipt: finalPaymentReceiptURL, // Store final viewable URL

        paymentType: "Bank Transfer",
        timestamp: new Date(),
        totalPriceINR,
        convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
        order_status: "Payment received, awaiting inspection",
      };

      // Submit Data
      setShowProcessingModal(true)
      setProcessingStage("saving")

      // Save to Firestore (Normalized Collection)

      await setDoc(orderRef, order);


      setProcessingStage("emailing")

      // Send confirmation email (optional)
      try {
        const emailPayload = {
          userEmail: formData.email,
          userName: formData.name,
          orderId,
          newStatus:
            "Court certification request placed successfully via Bank Transfer",
          paymentType: "Bank Transfer",
          courtDetails: {
            facilityName: formData.facilityName,
            facilityLocation: formData.facilityLocation,
            facilityType: formData.facilityType,
            numberOfCourts: formData.numberOfCourts,
            constructionDate: formData.constructionDate,
            renovationDate: formData.renovationDate,
            baseType: formData.baseType,
            surfaceType: finalSurfaceType,
            surfaceColorScheme: formData.surfaceColorScheme,
            constructionCompany: formData.constructionCompany,
            manufacturer: formData.manufacturer, // Added manufacturer
            useType: formData.useType,
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

      setProcessingStage("success")

      setTimeout(() => {
        router.push("/")
      }, 6000)

      // Reset form
      setFormData({
        orderId: "",
        name: "",
        contactNumber: "",
        email: "",
        mailingAddress: "",
        state: "",
        country: "",
        facilityName: "",
        facilityLocation: "",
        facilityType: "Indoor",
        numberOfCourts: "",
        constructionDate: "",
        renovationDate: "",
        baseType: "Concrete",
        surfaceType: "Acrylic Paint System",
        otherSurfaceType: "",
        surfaceColorScheme: "",
        constructionCompany: "",
        useType: "Recreational purpose",
        certificationType: "AIPA",
        isCourtBeingUsed: "Yes",
        termsAccepted: false,
        courtImages: [],
        paymentType: "",
        paymentReceipt: "",
        gstin: "",
        checklistUploaded: false,
        manufacturer: "",
      });

      setImagePreview([]);
      setChecklistFile(null);
      setBankModalOpen(false);

      // Delay before redirecting/reloading
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }, 2000);

    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.message || "Failed to submit order.");
      setShowProcessingModal(false) // Hide modal on error
    } finally {
      setIsSubmitting(false);
      setIsConfirming(false);
    }
  };

  const executeRazorpaySubmit = async () => {
    try {
      setIsSubmitting(true);

      if (typeof window.Razorpay === "undefined") {
        toast.error("Razorpay SDK not loaded. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      const orderId = await ensureOrderId();

      // Finalize checklist upload
      let finalChecklistURL = null;
      if (formData.checklistFile?.tempFileName) {
        finalChecklistURL = await finalizeImageUpload(
          formData.checklistFile.tempFileName,
          "checklists"
        );
      }

      // Finalize court images
      const finalCourtImageURLs = await Promise.all(
        formData.courtImages.map(async (image) => {
          if (image.tempFileName) {
            return (
              (await finalizeImageUpload(image.tempFileName, "courtImages")) ||
              image.url
            );
          }
          return image.url;
        })
      );

      const maxAmount = 100000 * 100;
      const priceWithGST = convertedPrice * 1.18;
      const amountInPaise = Math.round(priceWithGST * 100);

      if (amountInPaise > maxAmount) {
        toast.error("Order exceeds max ₹1,00,000. Please split payment.");
        setIsSubmitting(false);
        return;
      }

      // Create Razorpay order
      const token = await getAuthToken();
      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ amount: amountInPaise, currency: "INR" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");

      const { id: razorpayOrderId } = data;

      const finalSurfaceType =
        formData.surfaceType === "Other"
          ? formData.otherSurfaceType
          : formData.surfaceType;

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RZP_KEY_ID, // ✅ public key
        amount: amountInPaise,
        currency: "INR",
        name: "Brainwave Sportstech",
        description: "Certification & Testing Services (incl. 18% GST)",
        order_id: razorpayOrderId,
        handler: async (response) => {
          setShowProcessingModal(true)
          setProcessingStage("saving")

          const paymentDetails = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            // ✅ Verify + capture
            const verifyRes = await fetch("/api/verifyPayment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentDetails,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // ✅ Save order to Firestore (Normalized)
            const orderRef = doc(db, "certification_orders", orderId);

            // ✅ Save order to Firestore (Normalized)
            // const orderRef = doc(db, "certification_orders", orderId); // Removed duplicate declaration

            const order = {
              id: orderId,
              orderId,
              userId,
              // Explicitly select fields to avoid pollution
              category: "Court",
              type: "Court",
              name: formData.name,
              contactNumber: formData.contactNumber,
              email: formData.email,
              mailingAddress: formData.mailingAddress,
              state: formData.state,
              country: formData.country,
              companyName: formData.companyName,
              manufacturer: formData.manufacturer,
              gstin: formData.gstin || "",

              // Court Specifics
              facilityName: formData.facilityName,
              facilityLocation: formData.facilityLocation,
              facilityType: formData.facilityType,
              numberOfCourts: formData.numberOfCourts,
              constructionDate: formData.constructionDate,
              renovationDate: formData.renovationDate,
              baseType: formData.baseType,
              surfaceType: finalSurfaceType,
              surfaceColorScheme: formData.surfaceColorScheme,
              constructionCompany: formData.constructionCompany,
              useType: formData.useType,
              certificationType: formData.certificationType,
              isCourtBeingUsed: formData.isCourtBeingUsed,

              courtImages: finalCourtImageURLs,
              checklistFile: finalChecklistURL,

              totalPriceINR,
              convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
              paymentDetails,
              paymentType: "Razorpay",
              timestamp: new Date(),
              order_status: "Payment received, awaiting inspection",
            };

            await setDoc(orderRef, order);


            setProcessingStage("emailing")

            // ✅ Email
            const emailPayload = {
              userEmail: formData.email,
              userName: formData.name,
              orderId,
              newStatus: "Court certification request placed successfully via Razorpay",
              paymentType: "Razorpay",
              courtDetails: {
                facilityName: formData.facilityName,
                facilityLocation: formData.facilityLocation,
                facilityType: formData.facilityType,
                numberOfCourts: formData.numberOfCourts,
                constructionDate: formData.constructionDate,
                renovationDate: formData.renovationDate,
                baseType: formData.baseType,
                surfaceType: finalSurfaceType,
                surfaceColorScheme: formData.surfaceColorScheme,
                constructionCompany: formData.constructionCompany,
                manufacturer: formData.manufacturer, // Added manufacturer
                useType: formData.useType,
                certificationType: formData.certificationType,
              },
              totalPriceINR,
              convertedPriceWithSymbol: `${currencySymbol} ${convertedPrice}`,
              timestamp: new Date().toISOString(),
            };

            await fetch("/api/sendCourtCertificationEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailPayload),
            });

            setProcessingStage("success")
            
            setTimeout(() => {
              router.push("/")
            }, 6000)
          } catch (error) {
            console.error("Error after payment:", error);
            toast.error("Failed to verify payment. Please contact support.");
            setIsSubmitting(false);
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
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
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
      "country",
      "state",
      "facilityName",
      "companyName",
      "manufacturer",
      "facilityLocation",
      "facilityType",
      "numberOfCourts",
      "constructionDate",
      "baseType",
      "surfaceType",
      "surfaceColorScheme",
      "constructionCompany",
      "useType",
      "certificationType",
      "isCourtBeingUsed",
    ];

    if (isOtherSurface && !formData.otherSurfaceType) {
      toast.error("Please specify the surface type.");
      return;
    }

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

    if (formData.courtImages.length === 0) {
      toast.error("Please upload at least one court image.");
      return;
    }

    if (!formData.checklistUploaded) {
      toast.error("Please download, complete, and upload the checklist before proceeding.");
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


  const { addToCart } = useCart()

  const executeAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      // Ensure Order ID is generated
      let orderId = formData.orderId

      if (!orderId) {
        orderId = await ensureOrderId()
      }

      // Prepare the final surface type value
      const finalSurfaceType = formData.surfaceType === "Other" ? formData.otherSurfaceType : formData.surfaceType

      const convertedPriceWithSymbol = `${currencySymbol} ${convertedPrice}`
      const cartItem = {
        id: orderId, // Use the unique ID
        ...formData,
        surfaceType: finalSurfaceType,
        totalPriceINR,
        convertedPriceWithSymbol,
        timestamp: new Date().toISOString(),
        order_status: "In cart, awaiting payment",
      }

      // ✅ Add item to Cart via Context (Unified 'users' collection)
      await addToCart(userId, cartItem);


      try {
        const emailPayload = {
          userEmail: formData.email, // User's email
          userName: formData.name,
          orderId,
          cartDetails: {
            facilityName: formData.facilityName,
            facilityLocation: formData.facilityLocation,
            facilityType: formData.facilityType,
            numberOfCourts: formData.numberOfCourts,
            certificationType: formData.certificationType,
            convertedPriceWithSymbol,
          },
        }

        const cartToken = await getAuthToken();
        const emailResponse = await fetch("/api/sendAddToCartEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(cartToken && { Authorization: `Bearer ${cartToken}` }) },
          body: JSON.stringify(emailPayload),
        })

        const emailData = await emailResponse.json();
        
        if (!emailResponse.ok) {
          console.error("Email API Error:", emailData);
          toast.warning("Court certification request added to cart, but notification email failed to send.");
        } else if (!emailData.clientEmailSent || !emailData.adminEmailSent) {
          console.warn("Partial email success:", emailData);
          toast.info("Court certification request added to cart. Some notifications may have failed.");
        }
      } catch (emailError) {
        console.error("Network error sending email:", emailError);
      }

      // Show Success Modal
      setShowAddToCartModal(true);


      // Reset form
      setFormData({
        orderId: "",
        name: "",
        contactNumber: "",
        email: "",
        mailingAddress: "",
        state: "",
        country: "",
        facilityName: "",
        companyName: "", // Added
        manufacturer: "", // Added
        facilityLocation: "",
        facilityType: "Indoor",
        numberOfCourts: "",
        constructionDate: "",
        renovationDate: "",
        baseType: "Concrete",
        surfaceType: "Acrylic Paint System",
        otherSurfaceType: "",
        surfaceColorScheme: "",
        constructionCompany: "",
        useType: "Recreational purpose",
        certificationType: "AIPA",
        isCourtBeingUsed: "Yes",
        termsAccepted: false,
        courtImages: [],
        paymentType: "",
        paymentReceipt: "",
        gstin: "",
        checklistUploaded: false,
      })

      setImagePreview([])
      setChecklistFile(null)
      setIsAddingToCart(false) // Reset loading state

    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart.")
      setIsAddingToCart(false)
    }
  }

  // Determine if payment options should be enabled
  const isPaymentEnabled = formData.checklistUploaded

  if (isCurrencyLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading form details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-slate-100/70 pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans">
      {/* Header Section */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[#f39c12] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Official Facility Certification Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Pickleball Court Certification Application
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mt-1">
              Apply for official certification for your pickleball courts. Please ensure all details are accurate.
            </p>
          </div>
          <Link
            href="/forms/sports-flooring-certification/application-form"
            className="self-start md:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap flex items-center gap-2"
          >
            <span>🏟️ Switch to Flooring Certification &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Required Information Banner */}
      <div className="mb-6 bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 bg-amber-100 text-[#f39c12] rounded-xl text-lg font-bold">📋</span>
            <div>
              <span className="font-bold text-amber-900 text-sm">Required Information for Certification:</span>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Ensure you have facility coordinates, construction specs, and 5 court photos ready before submitting.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 font-medium">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ Facility & GSTIN</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ Surface Materials & Specs</span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">✓ 5 Photos & Checklist PDF</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start">
          {/* Left Column: Applicant Details & Court Details */}
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
                    rows="2"
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Enter your mailing address"
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

                <div className="space-y-2">
                  <label htmlFor="manufacturer" className="text-sm font-semibold text-gray-700 ml-1">Manufacturer Name</label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter Manufacturer Name"
                  />
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

            {/* Section 2: Court Details */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Court Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="facilityName" className="text-sm font-semibold text-gray-700 ml-1">Court Facility Name</label>
                  <input
                    type="text"
                    id="facilityName"
                    name="facilityName"
                    value={formData.facilityName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter facility name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-semibold text-gray-700 ml-1">
                    Company/Brand Name <span className="text-xs font-normal text-gray-500">(Displayed on approved products page)</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter company/brand name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="facilityLocation" className="text-sm font-semibold text-gray-700 ml-1">Location of Facility</label>
                  <input
                    type="text"
                    id="facilityLocation"
                    name="facilityLocation"
                    value={formData.facilityLocation}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter facility location"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="facilityType" className="text-sm font-semibold text-gray-700 ml-1">Type of Facility</label>
                  <select
                    id="facilityType"
                    name="facilityType"
                    value={formData.facilityType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="numberOfCourts" className="text-sm font-semibold text-gray-700 ml-1">Number of Courts</label>
                  <input
                    type="number"
                    id="numberOfCourts"
                    name="numberOfCourts"
                    value={formData.numberOfCourts}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter number of courts"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="constructionDate" className="text-sm font-semibold text-gray-700 ml-1">Date of Construction</label>
                  <input
                    type="date"
                    id="constructionDate"
                    name="constructionDate"
                    value={formData.constructionDate}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="renovationDate" className="text-sm font-semibold text-gray-700 ml-1">Last Renovation Date (if applicable)</label>
                  <input
                    type="date"
                    id="renovationDate"
                    name="renovationDate"
                    value={formData.renovationDate}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="baseType" className="text-sm font-semibold text-gray-700 ml-1">Court Base</label>
                  <select
                    id="baseType"
                    name="baseType"
                    value={formData.baseType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="Concrete">Concrete</option>
                    <option value="Asphalt">Asphalt</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="surfaceType" className="text-sm font-semibold text-gray-700 ml-1">Court Surface</label>
                  <select
                    id="surfaceType"
                    name="surfaceType"
                    value={formData.surfaceType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="Acrylic Paint System">Acrylic Paint System</option>
                    <option value="Vinyl sports mat">Vinyl sports mat</option>
                    <option value="PVC sports mat">PVC sports mat</option>
                    <option value="PP Modular Court Tiles">PP Modular Court Tiles</option>
                    <option value="Other">Other</option>
                  </select>
                  {isOtherSurface && (
                    <input
                      type="text"
                      name="otherSurfaceType"
                      value={formData.otherSurfaceType}
                      onChange={handleChange}
                      placeholder="Please specify surface type"
                      className="mt-3 w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="surfaceColorScheme" className="text-sm font-semibold text-gray-700 ml-1">Surface Color Scheme</label>
                  <input
                    type="text"
                    id="surfaceColorScheme"
                    name="surfaceColorScheme"
                    value={formData.surfaceColorScheme}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter surface color scheme"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="constructionCompany" className="text-sm font-semibold text-gray-700 ml-1">Court Construction done by</label>
                  <input
                    type="text"
                    id="constructionCompany"
                    name="constructionCompany"
                    value={formData.constructionCompany}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter construction company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="useType" className="text-sm font-semibold text-gray-700 ml-1">Type of use</label>
                  <select
                    id="useType"
                    name="useType"
                    value={formData.useType}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                    required
                  >
                    <option value="Recreational purpose">Recreational purpose</option>
                    <option value="Professional Play">Professional Play</option>
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
                    <option disabled value="UWPF">UWPF</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="isCourtBeingUsed" className="text-sm font-semibold text-gray-700 ml-1">Is Court being used?</label>
                  <select
                    id="isCourtBeingUsed"
                    name="isCourtBeingUsed"
                    value={formData.isCourtBeingUsed}
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
          </div>

          {/* Right Column: Uploads & Agreement + Pricing & Actions */}
          <div className="space-y-6">
            {/* Section 3: Uploads & Agreement */}
            <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Uploads & Agreement</h3>

              <div className="space-y-8">
                {/* Checklist Download & Upload */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Self-Assessment Checklist</h4>
                  <p className="text-gray-600 mb-4 text-sm">Please download, print, complete, and upload the scanned copy of the checklist.</p>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <button
                      type="button"
                      onClick={downloadChecklist}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 w-full md:w-auto justify-center"
                    >
                      <Download className="w-5 h-5" />
                      Download Checklist
                    </button>

                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Completed Checklist (PDF)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleChecklistUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-gray-50 rounded-xl border border-gray-300"
                        />
                        {isChecklistUploading && (
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
                            <div className="h-full bg-blue-600 animate-pulse w-1/2"></div>
                          </div>
                        )}
                      </div>
                      {checklistFile && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {checklistFile.name} uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Court Images Upload */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Upload Court Images (Max 5, 5MB total)</label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="courtImages" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                      </div>
                      <input
                        type="file"
                        id="courtImages"
                        name="courtImages"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {isImageUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                      <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  )}

                  {formData.courtImages.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {formData.courtImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview || image.url}
                            alt={`Court ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">{formData.courtImages.length}/5 images uploaded</p>
                </div>

                {/* Terms Agreement */}
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
                    I have read and agree to the <span className="text-blue-600 font-semibold hover:underline">Terms and Conditions</span>. I understand that certification will only proceed after payment and verification.
                  </label>
                </div>
              </div>
            </section>

            {/* Pricing & Action Buttons */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-lg font-semibold text-blue-800">
                  Total Price: {currencySymbol} {convertedPrice.toLocaleString()} <span className="text-sm font-normal text-blue-600">+ 18% GST</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {Number.parseInt(formData.numberOfCourts) > 2
                    ? `Includes base price for first 2 courts + additional fee for extra courts`
                    : `Flat rate for up to 2 courts`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={(e) => handleActionClick("cart", e)}
                  disabled={isSubmitting || !isPaymentEnabled || isAddingToCart}
                  className="flex-1 px-5 py-3.5 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting || !isPaymentEnabled}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Pay Using Razorpay"}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleActionClick("bank", e)}
                  disabled={isSubmitting || !isPaymentEnabled}
                  className="flex-1 px-5 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
        currencySymbol={currencySymbol}
        convertedPrice={convertedPrice}
        isPaymentUploading={isPaymentUploading}
        isConfirming={isConfirming}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        formData={formData}
        imagePreview={formData.courtImages.map(img => img.preview || img.url)}
        checklistFile={checklistFile}
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


export default PickleballCourtCertificationForm
