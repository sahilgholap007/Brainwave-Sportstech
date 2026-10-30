import { collection, getDocs, doc, updateDoc, query, where, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import { verifyAuth } from "@/lib/authMiddleware"
import nodemailer from "nodemailer"
import { generateEmailTemplate, generateAdminNotificationHtml } from "@/utils/emailTemplates"

export async function POST(req) {
  try {
    const authResult = await verifyAuth(req)
    if (authResult instanceof Response) return authResult

    const ordersRef = collection(db, "certification_orders")
    const q = query(ordersRef, where("order_status", "==", "Invoice sent, awaiting samples"))
    const snapshot = await getDocs(q)

    const now = new Date()
    const overdueOrders = []

    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.paymentStatus === "Paid") return

      // Determine when invoice was sent
      let sentDate = null
      if (data.invoiceSentAt) {
        sentDate = data.invoiceSentAt.toDate ? data.invoiceSentAt.toDate() : new Date(data.invoiceSentAt)
      } else if (data.timestamp) {
        sentDate = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
      }

      if (!sentDate || isNaN(sentDate.getTime())) return

      const diffTime = now.getTime() - sentDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays >= 15) {
        overdueOrders.push({
          id: docSnap.id,
          ...data,
          diffDays,
        })
      }
    })

    // Setup transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    })

    let remindersDispatched = 0

    for (const order of overdueOrders) {
      // Only auto-send if not already auto-reminded in the last 7 days
      let shouldSend = false
      if (!order.autoReminderSent) {
        shouldSend = true
      } else if (order.lastReminderSentAt) {
        const lastSent = order.lastReminderSentAt.toDate
          ? order.lastReminderSentAt.toDate()
          : new Date(order.lastReminderSentAt)
        const daysSinceLast = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceLast >= 7) {
          shouldSend = true
        }
      }

      if (shouldSend && order.email) {
        try {
          const ctx = {
            ...order,
            orderId: order.orderId || order.id,
            userName: order.contactPerson || order.name || "Customer",
            userEmail: order.email,
            newStatus: "15-Day Payment Reminder",
            paymentType: "Request Invoice",
            formattedTime: new Date().toLocaleString(),
            isCourtOrder: false,
            convertedPriceWithSymbol: order.convertedPriceWithSymbol || "₹ 60,000",
            totalPriceINR: order.totalPriceINR || 60000,
            category: order.category || "Flooring",
            companyName: order.companyName,
            productName: order.productName,
            invoiceUrl: order.invoiceUrl,
            invoiceNumber: order.invoiceNumber,
            data: order,
          }

          const emailContent = generateEmailTemplate("15-Day Payment Reminder", ctx)

          const attachments = []
          if (order.invoiceUrl) {
            attachments.push({
              filename: `Invoice_${(order.invoiceNumber || order.id).replace(/[\/\\?%*:|"<>]/g, "-")}.pdf`,
              path: order.invoiceUrl,
            })
          }

          await transporter.sendMail({
            from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
            to: order.email,
            subject: emailContent.subject,
            html: emailContent.html,
            attachments,
          })

          const orderDocRef = doc(db, "certification_orders", order.id)
          await updateDoc(orderDocRef, {
            autoReminderSent: true,
            lastReminderSentAt: serverTimestamp(),
            reminderCount: (order.reminderCount || 0) + 1,
          })

          remindersDispatched++
        } catch (emailErr) {
          console.error(`Failed to send overdue reminder for ${order.id}:`, emailErr)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scannedCount: snapshot.size,
        overdueCount: overdueOrders.length,
        remindersDispatched,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("check-overdue-invoices error:", error)
    return new Response(
      JSON.stringify({ message: "Error checking overdue invoices", error: error.message }),
      { status: 500 }
    )
  }
}
