import nodemailer from "nodemailer"
import { verifyAuth } from "@/lib/authMiddleware"
import { generateEmailTemplate, generateAdminNotificationHtml } from "@/utils/emailTemplates"

export async function POST(req) {
  try {
    const authResult = await verifyAuth(req)
    if (authResult instanceof Response) return authResult

    const data = await req.json()
    const {
      userEmail,
      userName,
      orderId,
      invoiceNumber,
      invoiceUrl,
      isReminder = false,
      category = "Flooring",
      companyName,
      productName,
      totalPriceINR,
      convertedPriceWithSymbol,
      dueDate,
    } = data

    if (!userEmail || !orderId) {
      return new Response(JSON.stringify({ message: "Missing userEmail or orderId" }), {
        status: 400,
      })
    }

    const statusKey = isReminder ? "15-Day Payment Reminder" : "Invoice sent, awaiting samples"

    const ctx = {
      orderId,
      userName,
      userEmail,
      newStatus: statusKey,
      paymentType: "Request Invoice",
      formattedTime: new Date().toLocaleString(),
      isCourtOrder: false,
      convertedPriceWithSymbol: convertedPriceWithSymbol || "₹ 60,000",
      totalPriceINR: totalPriceINR || 60000,
      category,
      companyName,
      productName,
      invoiceNumber,
      invoiceUrl,
      dueDate,
      data,
    }

    const emailContent = generateEmailTemplate(statusKey, ctx)

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
    })

    // Attach PDF if invoiceUrl is provided
    const attachments = []
    if (invoiceUrl) {
      try {
        const cleanInvNum = (invoiceNumber || orderId).replace(/[\/\\?%*:|"<>]/g, "-")
        attachments.push({
          filename: `Invoice_${cleanInvNum}.pdf`,
          path: invoiceUrl,
        })
      } catch (attachErr) {
        console.warn("Could not attach invoice URL to email directly:", attachErr)
      }
    }

    const userMailOptions = {
      from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      attachments,
    }

    const adminMailOptions = {
      from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
      to: "admin@brainwavesportstech.com",
      subject: isReminder
        ? `⚠️ Payment Reminder Sent: Order #${orderId} (${companyName || userName})`
        : `🧾 Invoice Dispatched: Order #${orderId} (${invoiceNumber || "N/A"})`,
      html: generateAdminNotificationHtml(ctx),
      attachments,
    }

    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(adminMailOptions)

    return new Response(
      JSON.stringify({
        success: true,
        message: isReminder ? "Reminder email sent" : "Invoice email sent successfully",
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("sendInvoiceEmail error:", error)
    return new Response(
      JSON.stringify({
        message: "Failed to send invoice email",
        error: error.message,
      }),
      { status: 500 }
    )
  }
}
