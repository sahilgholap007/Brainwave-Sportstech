"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { Trash2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

const UploadLogosPage = () => {
    const [user, setUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [logos, setLogos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [companyName, setCompanyName] = useState("");

    const router = useRouter();
    const storage = getStorage();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/");
                return;
            }

            try {
                const token = await currentUser.getIdToken();
                const res = await fetch("/api/admin/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    setUser(currentUser);
                    fetchLogos();
                    setIsCheckingAuth(false);
                } else {
                    router.push("/");
                }
            } catch (error) {
                console.error("Admin verification failed:", error);
                router.push("/");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchLogos = async () => {
        try {
            const q = query(collection(db, "companyLogos"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedLogos = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLogos(fetchedLogos);
        } catch (error) {
            console.error("Error fetching logos:", error);
            toast.error("Failed to fetch logos.");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !companyName) {
            toast.error("Please select a file and enter a company name.");
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `companyLogos/${Date.now()}_${selectedFile.name}`);
            await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "companyLogos"), {
                name: companyName,
                imageUrl: downloadURL,
                createdAt: serverTimestamp(),
            });

            toast.success("Logo uploaded successfully!");
            setSelectedFile(null);
            setCompanyName("");
            // Reset file input
            const fileInput = document.getElementById("logo-upload");
            if (fileInput) fileInput.value = "";

            fetchLogos();
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Failed to upload logo.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (logo) => {
        if (!confirm(`Are you sure you want to delete the logo for ${logo.name}?`)) return;

        try {
            // Delete from Storage
            // Extract path from URL or store path in Firestore. 
            // Since we didn't store path, we can try to extract it or just delete the doc if we can't easily get the ref.
            // However, it's better to try to delete the file.
            // URL format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media...
            // We can create a ref from the URL.
            const imageRef = ref(storage, logo.imageUrl);
            await deleteObject(imageRef).catch((error) => {
                console.warn("Failed to delete image from storage (might not exist):", error);
            });

            // Delete from Firestore
            await deleteDoc(doc(db, "companyLogos", logo.id));

            toast.success("Logo deleted successfully!");
            fetchLogos();
        } catch (error) {
            console.error("Error deleting logo:", error);
            toast.error("Failed to delete logo.");
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800">Manage Company Logos</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Admin: {user?.email}</span>
                        <button
                            onClick={() => signOut(auth)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <Upload size={20} className="text-blue-600" />
                                Upload New Logo
                            </h2>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="e.g. Brainwave Sports"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
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
                                                <Upload size={32} className="text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Logo'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Existing Logos ({logos.length})</h2>

                            {logos.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No logos uploaded yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {logos.map((logo) => (
                                        <div key={logo.id} className="group relative bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-200 hover:shadow-md transition">
                                            <div className="relative w-full h-24 mb-3">
                                                <Image
                                                    src={logo.imageUrl}
                                                    alt={logo.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 text-center truncate w-full" title={logo.name}>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadLogosPage;
