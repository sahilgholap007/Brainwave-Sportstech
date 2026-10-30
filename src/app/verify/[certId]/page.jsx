import { getAdminDb } from "@/lib/firebase-admin"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, XCircle, Calendar, ShieldCheck, ArrowLeft, Package, User } from "lucide-react"

function getFlooringStandardsText(standardsUsed, fallbackText) {
  if (fallbackText) return fallbackText;
  if (!standardsUsed) return "EN / ISO / ASTM Standards";
  if (typeof standardsUsed === "string") return standardsUsed;

  const stds = [];
  if (standardsUsed.enStandardChecked) {
    stds.push(standardsUsed.enStandard ? `EN (${standardsUsed.enStandard})` : "EN");
  }
  if (standardsUsed.isoStandardChecked) {
    stds.push(standardsUsed.isoStandard ? `ISO (${standardsUsed.isoStandard})` : "ISO");
  }
  if (standardsUsed.astmStandardChecked) {
    stds.push(standardsUsed.astmStandard ? `ASTM (${standardsUsed.astmStandard})` : "ASTM");
  }

  if (stds.length > 0) {
    return `${stds.join(" / ")} Standards`;
  }
  return "EN / ISO / ASTM Standards";
}

async function getCertificate(certId) {
  try {
    const db = getAdminDb()
    const snapshot = await db.collection("certification_orders")
      .where("certificateNumber", "==", certId)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const orderDoc = snapshot.docs[0]
    const order = orderDoc.data()
    
    // Convert Firestore Timestamp to string for Client Components or rendering
    let issueDate = null
    if (order.certificateGeneratedAt) {
      issueDate = new Date(order.certificateGeneratedAt.seconds * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    } else if (order.dateOfCertification) {
        issueDate = new Date(order.dateOfCertification).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    }

    return {
      certificateNumber: order.certificateNumber,
      category: order.category || order.type,
      companyName: order.companyName || order.flooringManufacturer || order.manufacturer || order.name || "N/A",
      modelName: order.productTradeName || order.productName || order.modelName || "N/A",
      country: order.country || "India",
      testingManual: order.testingManual || "AIPA Laboratory Testing Manual",
      standardsUsed: order.standardsUsed || null,
      standardsText: order.standardsText || null,
      issueDate: issueDate || "N/A",
      expiryDate: order.certificateExpiryDate || "N/A",
      status: order.order_status,
      productImage: order.flooringImage || order.paddleImage || order.ballImage || null,
      shape: order.paddleShape || order.useType || (order.flooringType ? (Array.isArray(order.flooringType) ? order.flooringType.join(", ") : order.flooringType) : null),
    }
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return null
  }
}

export async function generateMetadata({ params }) {
  const { certId } = await params
  return {
    title: `Verify Certificate ${certId} | Brainwave Sportstech`,
    description: `Official AIPA Certificate Verification for ${certId}`,
  }
}

export default async function VerifyCertificatePage({ params }) {
  const { certId } = await params
  const cert = await getCertificate(certId)

  const isCertified = cert && (cert.status === "Certification Completed" || cert.status === "Certification completed")

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl mb-6">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-purple-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className={`px-6 py-8 text-center text-white ${isCertified ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
          <div className="flex justify-center mb-4">
            {isCertified ? (
              <ShieldCheck className="w-20 h-20 text-green-100" />
            ) : (
              <XCircle className="w-20 h-20 text-red-100" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isCertified ? "Valid Certificate" : cert ? "Certificate Invalid" : "Certificate Not Found"}
          </h1>
          <p className="text-lg opacity-90">
            {isCertified 
              ? "This is a verified AIPA Compliant product by Brainwave Sportstech." 
              : "The scanned QR code does not match any valid certificate in our system."}
          </p>
          {cert && (
            <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full font-mono font-medium tracking-wide">
              {cert.certificateNumber}
            </div>
          )}
        </div>

        {cert && isCertified && (
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6 border border-slate-100">
                {cert.productImage ? (
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-lg overflow-hidden shadow-sm bg-white">
                    <Image
                      src={cert.productImage}
                      alt={cert.modelName}
                      fill
                      unoptimized={true}
                      className="object-contain p-4"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                    <Package className="w-16 h-16" />
                  </div>
                )}
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {cert.category}
                  </span>
                  {cert.shape && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full ml-2">
                      {cert.shape}
                    </span>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                    <Package className="w-4 h-4 mr-2" /> Model Details
                  </h3>
                  <p className="text-2xl font-bold text-slate-900">{cert.modelName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                    <User className="w-4 h-4 mr-2" /> Issued To
                  </h3>
                  <p className="text-lg font-medium text-slate-800">{cert.companyName}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> Issue Date
                    </h3>
                    <p className="font-medium text-slate-900">{cert.issueDate}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> Expiry Date
                    </h3>
                    <p className="font-medium text-slate-900">{cert.expiryDate}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 mt-4">
                  {cert.category === "Flooring" ? (
                    <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                      Sports flooring model <span className="font-bold">{cert.modelName}</span> submitted by <span className="font-bold">{cert.companyName}</span>, {cert.country} was tested as per the <span className="font-semibold">{cert.testingManual}</span> for pickleball bounce test and other sports properties as per <span className="font-semibold">{getFlooringStandardsText(cert.standardsUsed, cert.standardsText)}</span>. The Sports flooring <span className="font-bold">{cert.modelName}</span> was found to be suitable for pickleball play.
                    </p>
                  ) : (
                    <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                      This equipment has successfully passed laboratory testing and meets all technical specifications required for AIPA Compliance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
