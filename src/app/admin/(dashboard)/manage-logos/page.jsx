"use client"
import { useState, useEffect } from "react"
import { db } from "@/firebase/firebaseconfig"
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore"
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { Trash2, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ManageLogos() {
    const [logos, setLogos] = useState([])
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [companyName, setCompanyName] = useState("")

    const storage = getStorage()

    useEffect(() => {
        fetchLogos()
    }, [])

    const fetchLogos = async () => {
        try {


            const q = query(collection(db, "companyLogos"), orderBy("createdAt", "desc"))
            const querySnapshot = await getDocs(q)
            const fetchedLogos = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            setLogos(fetchedLogos)
        } catch (error) {
            console.error("Error fetching logos:", error)
            toast.error("Failed to fetch logos.")
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!selectedFile || !companyName) {
            toast.error("Please select a file and enter a company name.")
            return
        }

        setUploading(true)
        try {
            const storageRef = ref(storage, `companyLogos/${Date.now()}_${selectedFile.name}`)
            await uploadBytes(storageRef, selectedFile)
            const downloadURL = await getDownloadURL(storageRef)

            await addDoc(collection(db, "companyLogos"), {
                name: companyName,
                imageUrl: downloadURL,
                createdAt: serverTimestamp(),
            })

            toast.success("Logo uploaded successfully!")
            setSelectedFile(null)
            setCompanyName("")
            // Reset file input
            const fileInput = document.getElementById("logo-upload")
            if (fileInput) fileInput.value = ""

            fetchLogos()
        } catch (error) {
            console.error("Error uploading logo:", error)
            toast.error("Failed to upload logo.")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (logo) => {
        if (!confirm(`Are you sure you want to delete the logo for ${logo.name}?`)) return

        try {
            const imageRef = ref(storage, logo.imageUrl)
            await deleteObject(imageRef).catch((error) => {
                console.warn("Failed to delete image from storage (might not exist):", error)
            })

            await deleteDoc(doc(db, "companyLogos", logo.id))

            toast.success("Logo deleted successfully!")
            fetchLogos()
        } catch (error) {
            console.error("Error deleting logo:", error)
            toast.error("Failed to delete logo.")
        }
    }

    return (
        <div className="min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header with Split Coloring */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-slate-900">Manage Company </span>
                    <span className="text-orange-500">Logos</span>
                </h1>
                <p className="text-slate-600">Upload and manage company logos for invoices and certificates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <Card className="border-slate-200 shadow-md rounded-2xl">
                        <CardHeader className="bg-white border-b border-slate-100">
                            <CardTitle className="text-slate-900 flex items-center gap-2">
                                <Upload size={20} className="text-purple-600" />
                                Upload New Logo
                            </CardTitle>
                            <CardDescription className="text-slate-600">Add a new company logo</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                                        Company Name
                                    </label>
                                    <Input
                                        type="text"
                                        id="companyName"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Brainwave Sports"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="logo-upload" className="block text-sm font-medium text-slate-700 mb-2">
                                        Logo Image
                                    </label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        {selectedFile ? (
                                            <div className="text-sm text-green-600 font-medium break-all">
                                                {selectedFile.name}
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md rounded-lg"
                                >
                                    {uploading ? "Uploading..." : "Upload Logo"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-md rounded-2xl">
                        <CardHeader className="bg-white border-b border-slate-100">
                            <CardTitle className="text-slate-900">Existing Logos ({logos.length})</CardTitle>
                            <CardDescription className="text-slate-600">Manage your uploaded company logos</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {logos.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No logos uploaded yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {logos.map((logo) => (
                                        <div
                                            key={logo.id}
                                            className="group relative bg-white rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200 hover:shadow-md transition"
                                        >
                                            <div className="relative w-full h-24 mb-3">
                                                <Image
                                                    src={logo.imageUrl}
                                                    alt={logo.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <p
                                                className="text-sm font-medium text-gray-700 text-center truncate w-full"
                                                title={logo.name}
                                            >
                                                {logo.name}
                                            </p>

                                            <button
                                                onClick={() => handleDelete(logo)}
                                                className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                                title="Delete Logo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
