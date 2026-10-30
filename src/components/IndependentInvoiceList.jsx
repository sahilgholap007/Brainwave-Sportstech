"use client"
import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { toast } from "react-toastify"
import { Edit, Download, Trash2, Search } from "lucide-react"
import { generateIndependentInvoicePDF } from "@/utils/generateIndependentInvoicePDF"

const IndependentInvoiceList = ({ onEdit }) => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, "IndependentManualBills"),
        orderBy("timestamp", "desc")
      )
      const snapshot = await getDocs(q)
      
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setInvoices(invoicesData)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (invoice) => {
    try {
      const doc = generateIndependentInvoicePDF(invoice)
      doc.save(`${invoice.invoiceNumber.replace(/\//g, "-")}.pdf`)
      toast.success("Invoice PDF generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "IndependentManualBills", id))
        toast.success("Invoice deleted successfully")
        setInvoices(invoices.filter(inv => inv.id !== id))
      } catch (error) {
        console.error("Error deleting invoice:", error)
        toast.error("Failed to delete invoice")
      }
    }
  }

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerInfo?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount, currency = "INR") => {
    try {
      const locale = currency === "INR" ? "en-IN" : "en-US"
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
      }).format(amount)
    } catch {
      return `${currency} ${Number(amount || 0).toFixed(2)}`
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md max-w-6xl mx-auto overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Generated Invoices</h2>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm font-semibold border-b">
              <th className="py-3 px-6 whitespace-nowrap">Date</th>
              <th className="py-3 px-6 whitespace-nowrap">Invoice No.</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6 text-right whitespace-nowrap">Total Amount</th>
              <th className="py-3 px-6 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2">Loading invoices...</p>
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  {searchTerm ? "No matching invoices found" : "No invoices generated yet"}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors text-sm">
                  <td className="py-3 px-6 whitespace-nowrap">
                    {invoice.invoiceDate || (invoice.timestamp?.toDate ? invoice.timestamp.toDate().toLocaleDateString() : 'N/A')}
                  </td>
                  <td className="py-3 px-6 font-medium whitespace-nowrap">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-6">
                    <div className="font-medium text-gray-800">{invoice.customerInfo?.name}</div>
                    {invoice.customerInfo?.company && (
                      <div className="text-xs text-gray-500">{invoice.customerInfo.company}</div>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right font-medium">
                    {invoice.currency && invoice.currency !== "INR" ? (
                      <div>
                        <div>
                          {formatCurrency(
                            invoice.convertedTotal ||
                              (invoice.taxes?.finalTotal ? invoice.taxes.finalTotal / (invoice.exchangeRate || 1) : 0),
                            invoice.currency
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-normal">
                          (₹{(invoice.taxes?.finalTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </div>
                      </div>
                    ) : (
                      formatCurrency(invoice.taxes?.finalTotal || 0, "INR")
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => handleDownload(invoice)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(invoice)}
                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default IndependentInvoiceList
