import { NextResponse } from "next/server"
import { getAdminDb, Timestamp } from "@/lib/firebase-admin"
import { logger } from "@/lib/errorHandler"

const db = getAdminDb()

export async function POST(request) {
  try {
    const body = await request.json()
    const { billData, existingDocId } = body

    if (!billData || !billData.invoiceNumber) {
      return NextResponse.json(
        { success: false, error: "Missing billData or invoiceNumber" },
        { status: 400 }
      )
    }

    const { invoiceNumber, financialYear } = billData
    let savedDocId = existingDocId || null

    // 1. Prevent duplicate creation by checking if an existing bill exists with this invoiceNumber
    if (!savedDocId) {
      const existingSnap = await db
        .collection("ManualBills")
        .where("invoiceNumber", "==", invoiceNumber)
        .limit(1)
        .get()

      if (!existingSnap.empty) {
        savedDocId = existingSnap.docs[0].id
      }
    }

    // 2. Save or update the ManualBill document
    const dataToSave = {
      ...billData,
      updatedAt: Timestamp.now(),
    }

    if (savedDocId) {
      await db.collection("ManualBills").doc(savedDocId).set(dataToSave, { merge: true })
    } else {
      dataToSave.createdAt = Timestamp.now()
      const newDocRef = await db.collection("ManualBills").add(dataToSave)
      savedDocId = newDocRef.id
    }

    // 3. Atomically update the sequence counter if this invoice number is higher
    const numberPart = parseInt(invoiceNumber.split("/")[1], 10)
    if (!isNaN(numberPart) && financialYear) {
      const fyKey = financialYear.replace("-", "_")
      const counterRef = db.collection("counters").doc("invoiceNumbers")
      const counterSnap = await counterRef.get()
      const currentCounter = counterSnap.exists ? (counterSnap.data()[`standard_FY${fyKey}`] || 0) : 0

      if (numberPart > currentCounter) {
        await counterRef.set(
          {
            [`standard_FY${fyKey}`]: numberPart,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        )
      }
    }

    // 4. Bi-directional update to certification_orders for all selected order IDs
    const orderIds = new Set()
    if (Array.isArray(billData.selectedOrderIds)) {
      billData.selectedOrderIds.forEach((id) => id && orderIds.add(id))
    }
    if (billData.selectedOrderId) {
      orderIds.add(billData.selectedOrderId)
    }

    if (orderIds.size > 0) {
      const batch = db.batch()
      const isBulk = orderIds.size > 1

      for (const orderId of orderIds) {
        const orderRef = db.collection("certification_orders").doc(orderId)
        batch.set(
          orderRef,
          {
            invoiceNumber,
            invoiceStatus: "Invoice Generated",
            invoiceGeneratedAt: Timestamp.now(),
            invoiceType: isBulk ? "ManualBulk" : "Manual",
          },
          { merge: true }
        )
      }

      await batch.commit()
    }

    return NextResponse.json({
      success: true,
      docId: savedDocId,
      invoiceNumber,
      linkedOrdersCount: orderIds.size,
    })
  } catch (error) {
    logger.error("Error saving manual bill", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save manual bill" },
      { status: 500 }
    )
  }
}

