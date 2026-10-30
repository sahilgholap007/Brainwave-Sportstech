import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const certId = searchParams.get('certId')

    if (!certId) {
      return NextResponse.json({ message: "Certificate ID is required" }, { status: 400 })
    }

    const db = getAdminDb()
    const snapshot = await db.collection("certification_orders")
      .where("certificateNumber", "==", certId)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ message: "Certificate not found" }, { status: 404 })
    }

    const orderDoc = snapshot.docs[0]
    const order = orderDoc.data()
    
    // Selectively return public information
    const publicData = {
      certificateNumber: order.certificateNumber,
      category: order.category || order.type,
      companyName: order.companyName || order.flooringManufacturer || order.manufacturer || order.name || "N/A",
      modelName: order.productTradeName || order.productName || order.modelName || "N/A",
      country: order.country || "India",
      testingManual: order.testingManual || "AIPA Laboratory Testing Manual",
      standardsUsed: order.standardsUsed || null,
      standardsText: order.standardsText || null,
      issueDate: order.certificateGeneratedAt,
      expiryDate: order.certificateExpiryDate,
      status: order.order_status,
      productImage: order.flooringImage || order.paddleImage || order.ballImage || null,
      shape: order.paddleShape || order.useType || (order.flooringType ? (Array.isArray(order.flooringType) ? order.flooringType.join(", ") : order.flooringType) : null),
    }

    return NextResponse.json(publicData)

  } catch (error) {
    console.error("Error verifying certificate:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
