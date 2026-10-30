"use client"

import { useState } from "react"
import { X, Download, ImageIcon } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)

  if (!isOpen || !order) return null

  // Handle downloading the checklist file
  const handleDownloadChecklist = async () => {
    if (!order.checklistFile) {
      toast.error("No checklist available to download")
      return
    }

    try {
      // Create a temporary anchor element
      const checklistUrl = typeof order.checklistFile === "string" ? order.checklistFile : order.checklistFile.url

      const link = document.createElement("a")
      link.href = checklistUrl
      link.download = `checklist-${order.id || order.orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Checklist download started")
    } catch (error) {
      console.error("Error downloading checklist:", error)
      toast.error("Failed to download checklist")
    }
  }

  // Handle viewing all court images
  const handleViewImages = () => {
    if (order.courtImages && (Array.isArray(order.courtImages) ? order.courtImages.length > 0 : order.courtImages)) {
      setIsImageGalleryOpen(true)
    } else {
      toast.error("No images available to view")
    }
  }

  // Determine if this is a court certification order
  const isCourtOrder = order.courtImages || order.facilityName

  // Get all court images in a standardized format
  const getCourtImages = () => {
    if (!order.courtImages) return []

    if (Array.isArray(order.courtImages)) {
      return order.courtImages.map((img) => (typeof img === "string" ? img : img.url))
    }

    return [order.courtImages]
  }

  const courtImages = getCourtImages()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b bg-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Order Details <span className="text-blue-600">{order.id || order.orderId}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Order Details */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Order Information</h3>

              {/* Order Type */}
              <div className="mb-4">
                <span className="font-medium">Order Type:</span>{" "}
                {isCourtOrder ? "Court Certification" : "Equipment Testing"}
              </div>

              {/* Order Details */}
              <div className="space-y-2">
                <p>
                  <strong>Order ID:</strong> {order.id || order.orderId}
                </p>
                <p>
                  <strong>Status:</strong> {order.order_status || "Processing"}
                </p>
                <p>
                  <strong>Date:</strong> {order.timestamp ? new Date(order.timestamp).toLocaleString() : "N/A"}
                </p>
                <p>
                  <strong>Price:</strong> {order.convertedPriceWithSymbol || "N/A"}
                </p>
              </div>

              {/* Court-specific details */}
              {isCourtOrder && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Court Details</h4>
                  <div className="space-y-2">
                    <p>
                      <strong>Facility Name:</strong> {order.facilityName || "N/A"}
                    </p>
                    <p>
                      <strong>Facility Location:</strong> {order.facilityLocation || "N/A"}
                    </p>
                    <p>
                      <strong>Number of Courts:</strong> {order.numberOfCourts || "N/A"}
                    </p>
                    <p>
                      <strong>Surface Type:</strong> {order.surfaceType || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              {isCourtOrder && order.checklistFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Certification Checklist</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    The customer has uploaded a completed certification checklist.
                  </p>
                  <button
                    onClick={handleDownloadChecklist}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download size={18} />
                    Download Checklist
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Customer Info & Images */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Customer Information</h3>

              <div className="space-y-2 mb-6">
                <p>
                  <strong>Name:</strong> {order.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {order.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {order.contactNumber || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {order.mailingAddress || "N/A"}
                </p>
              </div>

              {/* Court Images Section */}
              {isCourtOrder && courtImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Court Images</h4>

                  {/* Preview of first image */}
                  <div className="mb-3">
                    <img
                      src={courtImages[0] || "/placeholder.svg"}
                      alt="Court"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>

                  {/* Image count and view all button */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {courtImages.length} {courtImages.length === 1 ? "image" : "images"} available
                    </span>
                    <button
                      onClick={handleViewImages}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <ImageIcon size={18} />
                      View All Images
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Receipt Section */}
              {(order.paymentReceipt || (order.paymentDetails && order.paymentDetails.paymentReceipt)) && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Payment Receipt</h4>
                  <p className="text-sm text-green-700 mb-3">Payment receipt is available for this order.</p>
                  <button
                    onClick={() => {
                      const receiptUrl = order.paymentReceipt || order.paymentDetails.paymentReceipt
                      if (receiptUrl) {
                        window.open(receiptUrl, "_blank")
                      } else {
                        toast.error("Receipt URL is not available")
                      }
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Download size={18} />
                    View Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {isImageGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Court Images</h3>
              <button onClick={() => setIsImageGalleryOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courtImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Court image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(image, "_blank")}
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default OrderDetailsModal
