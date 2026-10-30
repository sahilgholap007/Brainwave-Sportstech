const fs = require('fs');
let code = fs.readFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', 'utf8');

// 1. Remove old state
code = code.replace(`    const [isEditingDetails, setIsEditingDetails] = useState(false)\n    const [editedOrderDetails, setEditedOrderDetails] = useState({})\n`, "");

// 2. Remove handleSaveDetails
const handleSaveStart = code.indexOf('  const handleSaveDetails = async () => {');
const updateOrderStatusStart = code.indexOf('  const updateOrderStatus = async (orderId, newStatus, category) => {');
if (handleSaveStart !== -1 && updateOrderStatusStart !== -1) {
  code = code.substring(0, handleSaveStart) + code.substring(updateOrderStatusStart);
}

// 3. Add handleUpdateField right before updateOrderStatus
const handleUpdateFieldCode = `  const handleUpdateField = async (fieldKey, newValue) => {
    try {
      setIsUpdating(true)
      const orderRef = doc(db, "certification_orders", selectedOrder.id || selectedOrder.orderId)
      await updateDoc(orderRef, { [fieldKey]: newValue })

      const updatedOrder = { ...selectedOrder, [fieldKey]: newValue }
      setSelectedOrder(updatedOrder)
      setOrders(orders.map(o => (o.id === updatedOrder.id || o.orderId === updatedOrder.orderId) ? updatedOrder : o))
      
      toast.success(\`Updated successfully!\`)
    } catch (error) {
      console.error(\`Error updating field:\`, error)
      toast.error(\`Failed to update\`)
    } finally {
      setIsUpdating(false)
    }
  }

`;
code = code.replace('  const updateOrderStatus = async (orderId, newStatus, category) => {', handleUpdateFieldCode + '  const updateOrderStatus = async (orderId, newStatus, category) => {');

// 4. Inject EditableRow component before ProcessOrders
const editableRowCode = `const EditableRow = ({ label, value, fieldKey, onSave, isUpdating }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || "")

  const handleSave = async () => {
    await onSave(fieldKey, editValue)
    setIsEditing(false)
  }

  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-100 min-h-[40px] group">
      <span className="text-xs sm:text-sm font-medium text-slate-600 mt-1">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-32 sm:w-48 h-7 text-xs sm:text-sm px-2 py-1"
            autoFocus
          />
          <button onClick={handleSave} disabled={isUpdating} className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded disabled:opacity-50">
            <CheckCircle size={16} />
          </button>
          <button onClick={() => { setIsEditing(false); setEditValue(value || ""); }} disabled={isUpdating} className="text-red-600 hover:text-red-700 bg-red-50 p-1 rounded disabled:opacity-50">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right max-w-[60%] break-words mt-1">
            {value || "N/A"}
          </span>
          {fieldKey && (
            <button onClick={() => { setEditValue(value || ""); setIsEditing(true); }} className="text-slate-400 hover:text-blue-600 transition-colors ml-2" title={\`Edit \${label}\`}>
              <Edit size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

`;
code = code.replace('const ProcessOrders = () => {', editableRowCode + 'const ProcessOrders = () => {');

// 5. Replace general details array
const arrayOld = `                        ].map(([label, value, editKey]) => (
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
const arrayNew = `                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(arrayOld, arrayNew);

// 6. Restore modal header
const headerOld = `<div className="flex items-center gap-4">
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
const headerNew = `<button
                  onClick={closeModal}`;
code = code.replace(headerOld, headerNew);

// 7. Refactor product specs: Ball
const ballSpecsOld = `{selectedOrder.category === "Ball" && (
                          <>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Certification Type</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.certificationType || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Ball Type</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.ballType || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Currently Sold</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.currentlySold || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Ball Material</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.materialOfBall || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Model Name</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.modelName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Model Number</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.modelNumber || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Use Type</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.useType || "N/A"}</span>
                            </div>
                          </>
                        )}`;
const ballSpecsNew = `{selectedOrder.category === "Ball" && [
                          ["Certification Type", selectedOrder.certificationType, "certificationType"],
                          ["Ball Type", selectedOrder.ballType, "ballType"],
                          ["Currently Sold", selectedOrder.currentlySold, "currentlySold"],
                          ["Ball Material", selectedOrder.materialOfBall, "materialOfBall"],
                          ["Model Name", selectedOrder.modelName, "modelName"],
                          ["Model Number", selectedOrder.modelNumber, "modelNumber"],
                          ["Use Type", selectedOrder.useType, "useType"]
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(ballSpecsOld, ballSpecsNew);

// 8. Refactor product specs: Paddle
const paddleSpecsOld = `{selectedOrder.category === "Paddle" && (
                          <>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Paddle Shape</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.paddleShape || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Core Material</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.coreMaterial || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Honeycomb Cell Size</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.honeycombCellSize || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Surface Material</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.surfaceMaterial || "N/A"}</span>
                            </div>
                          </>
                        )}`;
const paddleSpecsNew = `{selectedOrder.category === "Paddle" && [
                          ["Paddle Shape", selectedOrder.paddleShape, "paddleShape"],
                          ["Core Material", selectedOrder.coreMaterial, "coreMaterial"],
                          ["Honeycomb Cell Size", selectedOrder.honeycombCellSize, "honeycombCellSize"],
                          ["Surface Material", selectedOrder.surfaceMaterial, "surfaceMaterial"]
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(paddleSpecsOld, paddleSpecsNew);

// 9. Refactor product specs: Court
const courtSpecsOld = `{selectedOrder.category === "Court" && (
                          <>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Facility Name</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.facilityName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Facility Location</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.facilityLocation || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Facility Type</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.facilityType || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Number of Courts</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.numberOfCourts || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-start py-2 border-b border-slate-100">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">Base Type</span>
                              <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right">{selectedOrder.baseType || "N/A"}</span>
                            </div>
                          </>
                        )}`;
const courtSpecsNew = `{selectedOrder.category === "Court" && [
                          ["Facility Name", selectedOrder.facilityName, "facilityName"],
                          ["Facility Location", selectedOrder.facilityLocation, "facilityLocation"],
                          ["Facility Type", selectedOrder.facilityType, "facilityType"],
                          ["Number of Courts", selectedOrder.numberOfCourts, "numberOfCourts"],
                          ["Base Type", selectedOrder.baseType, "baseType"]
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(courtSpecsOld, courtSpecsNew);

fs.writeFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', code, 'utf8');
console.log('done');
