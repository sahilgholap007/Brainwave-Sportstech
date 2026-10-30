const fs = require('fs');

let code = fs.readFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', 'utf8');

// 1. Add state variables
const stateTarget = `const [isModalOpen, setIsModalOpen] = useState(false) // State for modal visibility`;
const stateReplacement = `const [isModalOpen, setIsModalOpen] = useState(false) // State for modal visibility
    const [isEditingDetails, setIsEditingDetails] = useState(false)
    const [editedOrderDetails, setEditedOrderDetails] = useState({})`;
code = code.replace(stateTarget, stateReplacement);

// 2. Initialize in handleViewOrder
const handleViewTarget = `  const handleViewOrder = (order) => {
    console.log("Order details fetched for modal:", order)
    setSelectedOrder(order)
    setTempStatus(order.order_status || "")
    setIsModalOpen(true)
    setIsEditingPrice(false) // Reset edit state
  }`;
const handleViewReplacement = `  const handleViewOrder = (order) => {
    console.log("Order details fetched for modal:", order)
    setSelectedOrder(order)
    setEditedOrderDetails(order)
    setTempStatus(order.order_status || "")
    setIsModalOpen(true)
    setIsEditingDetails(false)
    setIsEditingPrice(false) // Reset edit state
  }`;
code = code.replace(handleViewTarget, handleViewReplacement);

// 3. Add handleSaveDetails function right before updateOrderStatus
const updateOrderStatusTarget = `  const updateOrderStatus = async (orderId, newStatus, category) => {`;
const handleSaveDetailsCode = `  const handleSaveDetails = async () => {
    try {
      setIsUpdating(true)
      const orderRef = doc(db, "certification_orders", selectedOrder.id || selectedOrder.orderId)
      
      const updates = {
        name: editedOrderDetails.name,
        contactNumber: editedOrderDetails.contactNumber,
        email: editedOrderDetails.email,
        companyName: editedOrderDetails.companyName,
        modelName: editedOrderDetails.modelName,
        modelNumber: editedOrderDetails.modelNumber,
      }
      
      if (selectedOrder.category === "Court") {
        updates.facilityName = editedOrderDetails.facilityName
      } else {
        updates.manufacturer = editedOrderDetails.manufacturer
      }

      await updateDoc(orderRef, updates)

      const updatedOrder = { ...selectedOrder, ...updates }
      setSelectedOrder(updatedOrder)
      setOrders(orders.map(o => (o.id === updatedOrder.id || o.orderId === updatedOrder.orderId) ? updatedOrder : o))
      
      setIsEditingDetails(false)
      toast.success("Order details updated successfully!")
    } catch (error) {
      console.error("Error updating order details:", error)
      toast.error("Failed to update order details")
    } finally {
      setIsUpdating(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, category) => {`;
code = code.replace(updateOrderStatusTarget, handleSaveDetailsCode);

// 4. Update modal header
const headerTarget = `              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Details
                </h3>
                <button
                  onClick={closeModal}`;
const headerReplacement = `              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Details
                </h3>
                <div className="flex items-center gap-4">
                  {isEditingDetails ? (
                    <button
                      onClick={handleSaveDetails}
                      disabled={isUpdating}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingDetails(true)}
                      className="bg-white/20 text-white px-3 py-1 rounded text-sm hover:bg-white/30 transition-colors shadow-sm"
                    >
                      Edit Details
                    </button>
                  )}
                  <button
                    onClick={closeModal}`;
code = code.replace(headerTarget, headerReplacement);

// 5. Update field mapping array
const arrayTarget = `                        {[
                          [
                            selectedOrder?.paymentDetails?.razorpay_order_id ? "Razorpay Order ID" : "Order ID",
                            selectedOrder?.paymentDetails?.razorpay_order_id || selectedOrder?.id || selectedOrder?.orderId,
                          ],
                          ["Customer Name", selectedOrder.name],
                          ["Customer Contact", selectedOrder.contactNumber],
                          ["Customer Email", selectedOrder.email],
                          ["Company Name", selectedOrder.companyName],
                          ["Model Name", selectedOrder.modelName],
                          ["Model Number", selectedOrder.modelNumber],
                          ["Manufacturer/Facility", selectedOrder.manufacturer || selectedOrder.facilityName],
                          [
                            "Payment Type",
                            selectedOrder?.paymentDetails?.paymentType || selectedOrder?.paymentType || "Razorpay",
                          ],
                          ["Payment ID", selectedOrder?.paymentDetails?.razorpay_payment_id],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-start py-2 border-b border-slate-100">
                            <span className="text-xs sm:text-sm font-medium text-slate-600">{label}</span>
                            <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right max-w-[60%] break-words">{value || "N/A"}</span>
                          </div>
                        ))}`;
const arrayReplacement = `                        {[
                          [
                            selectedOrder?.paymentDetails?.razorpay_order_id ? "Razorpay Order ID" : "Order ID",
                            selectedOrder?.paymentDetails?.razorpay_order_id || selectedOrder?.id || selectedOrder?.orderId,
                            null
                          ],
                          ["Customer Name", selectedOrder.name, "name"],
                          ["Customer Contact", selectedOrder.contactNumber, "contactNumber"],
                          ["Customer Email", selectedOrder.email, "email"],
                          ["Company Name", selectedOrder.companyName, "companyName"],
                          ["Model Name", selectedOrder.modelName, "modelName"],
                          ["Model Number", selectedOrder.modelNumber, "modelNumber"],
                          ["Manufacturer/Facility", selectedOrder.manufacturer || selectedOrder.facilityName, selectedOrder.category === "Court" ? "facilityName" : "manufacturer"],
                          [
                            "Payment Type",
                            selectedOrder?.paymentDetails?.paymentType || selectedOrder?.paymentType || "Razorpay",
                            null
                          ],
                          ["Payment ID", selectedOrder?.paymentDetails?.razorpay_payment_id, null],
                        ].map(([label, value, editKey]) => (
                          <div key={label} className="flex justify-between items-start py-2 border-b border-slate-100 min-h-[40px]">
                            <span className="text-xs sm:text-sm font-medium text-slate-600 mt-1">{label}</span>
                            {isEditingDetails && editKey ? (
                              <input
                                type="text"
                                className="border border-slate-300 rounded px-2 py-1 text-xs sm:text-sm text-slate-900 w-1/2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                value={editedOrderDetails[editKey] || ""}
                                onChange={(e) => setEditedOrderDetails({ ...editedOrderDetails, [editKey]: e.target.value })}
                              />
                            ) : (
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right max-w-[60%] break-words mt-1">
                                {value || "N/A"}
                              </span>
                            )}
                          </div>
                        ))}`;
code = code.replace(arrayTarget, arrayReplacement);

fs.writeFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', code, 'utf8');
console.log("Done");
