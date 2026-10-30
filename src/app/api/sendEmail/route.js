import nodemailer from "nodemailer"
import { verifyAuth } from "@/lib/authMiddleware"
import { generateEmailTemplate, generateAdminNotificationHtml } from "@/utils/emailTemplates"

export async function POST(req) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (authResult instanceof Response) return authResult;

    const data = await req.json()
    const {
      userEmail,
      userName,
      orderId,
      newStatus,
      paymentType,
      paddleDetails,
      ballDetails,
      totalPriceINR,
      convertedPriceWithSymbol,
      timestamp = new Date().toISOString(),
      cartItems = [],
      category,
      // Additional order details
      facilityName,
      facilityLocation,
      facilityType,
      numberOfCourts,
      baseType,
      surfaceType,
      companyName,
      manufacturer,
      contactNumber,
      mailingAddress,
      country,
      state,
      certificationType,
      dateOfCertification,
    } = data

    if (!userEmail || !orderId || !newStatus) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), {
        status: 400,
      })
    }

    const formattedTime = new Date(timestamp).toLocaleString()

    // Determine order type based on status or available data
    const isCourtOrder =
      category === "Court" ||
      newStatus.toLowerCase().includes("inspection") ||
      facilityName ||
      facilityLocation ||
      newStatus.includes("awaiting inspection")

    // Build template context (all data the templates need)
    const ctx = {
      ...data,
      orderId,
      userName,
      userEmail,
      newStatus,
      paymentType,
      formattedTime,
      isCourtOrder,
      convertedPriceWithSymbol,
      totalPriceINR,
      cartItems,
      category,
      paddleDetails,
      ballDetails,
      facilityName,
      facilityLocation,
      facilityType,
      numberOfCourts,
      baseType,
      surfaceType,
      companyName,
      manufacturer,
      contactNumber,
      mailingAddress,
      country,
      state,
      certificationType,
      dateOfCertification,
      data, // full data object for fallback field access
    }

    // Generate the email content
    const emailContent = generateEmailTemplate(newStatus, ctx)

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465", // Use SSL for 465, STARTTLS for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Helps with some Hostinger SMTP issues
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      logger: true,
      debug: true,
    })

    // User email configuration
    const userMailOptions = {
      from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    }

    // Admin notification email
    const adminMailOptions = {
      from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`,
      to: "admin@brainwavesportstech.com",
      subject: `📥 Status Updated: ${newStatus} - Order #${orderId}`,
      html: generateAdminNotificationHtml(ctx),
    }

    // Send both emails
    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(adminMailOptions)

    return new Response(
      JSON.stringify({
        message: "Dynamic status emails sent successfully",
        status: newStatus,
        orderType: isCourtOrder ? "Court Certification" : "Product Testing",
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Email sending error:", error)
    return new Response(
      JSON.stringify({
        message: "Email failed to send",
        error: error.message,
      }),
      { status: 500 },
    )
  }
}
