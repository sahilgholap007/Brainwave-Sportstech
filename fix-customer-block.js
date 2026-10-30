const fs = require('fs');

let code = fs.readFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', 'utf8');

// 1. Fix EditableRow styling
const editableRowOld = `const EditableRow = ({ label, value, fieldKey, onSave, isUpdating }) => {
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
}`;

const editableRowNew = `const EditableRow = ({ label, value, fieldKey, onSave, isUpdating }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || "")

  const handleSave = async () => {
    await onSave(fieldKey, editValue)
    setIsEditing(false)
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 min-h-[40px] group">
      <span className="text-xs sm:text-sm font-medium text-slate-600 w-1/3 pr-2">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-2 justify-end flex-1 w-2/3">
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 text-xs sm:text-sm px-2 py-1 w-full min-w-0"
            autoFocus
          />
          <button onClick={handleSave} disabled={isUpdating} className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded disabled:opacity-50 shrink-0">
            <CheckCircle size={16} />
          </button>
          <button onClick={() => { setIsEditing(false); setEditValue(value || ""); }} disabled={isUpdating} className="text-red-600 hover:text-red-700 bg-red-50 p-1 rounded disabled:opacity-50 shrink-0">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-end flex-1 w-2/3">
          <span className="text-xs sm:text-sm text-slate-900 font-semibold text-right w-full">
            {value || "N/A"}
          </span>
          {fieldKey && (
            <button onClick={() => { setEditValue(value || ""); setIsEditing(true); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0" title={\`Edit \${label}\`}>
              <Edit size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}`;

code = code.replace(editableRowOld, editableRowNew);


// 2. Fix Customer & Payment Details block
// We will replace the entire mapping block for it.
const customerBlockRegex = /\{\[\s*\[\s*selectedOrder\?\.paymentDetails\?\.razorpay_order_id[\s\S]*?\]\.map\(\(\[label, value\]\) => \([\s\S]*?\)\s*\)\s*\}/;

const customerBlockReplacement = `{[
                          [
                            selectedOrder?.paymentDetails?.razorpay_order_id ? "Razorpay Order ID" : "Order ID",
                            selectedOrder?.paymentDetails?.razorpay_order_id || selectedOrder?.id || selectedOrder?.orderId,
                            null // Non-editable
                          ],
                          ["Customer Name", selectedOrder.name, "name"],
                          ["Customer Contact", selectedOrder.contactNumber, "contactNumber"],
                          ["Customer Email", selectedOrder.email, "email"],
                          ["Company Name", selectedOrder.companyName, "companyName"],
                          ["Model Name", selectedOrder.modelName, "modelName"],
                          ["Model Number", selectedOrder.modelNumber, "modelNumber"],
                          ["Manufacturer/Facility", selectedOrder.manufacturer || selectedOrder.facilityName, selectedOrder.manufacturer ? "manufacturer" : "facilityName"],
                          [
                            "Payment Type",
                            selectedOrder?.paymentDetails?.paymentType || selectedOrder?.paymentType || "Razorpay",
                            "paymentType"
                          ],
                          ["Payment ID", selectedOrder?.paymentDetails?.razorpay_payment_id, null],
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;

code = code.replace(customerBlockRegex, customerBlockReplacement);

fs.writeFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', code, 'utf8');
console.log("Done");
