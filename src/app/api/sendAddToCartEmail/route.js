import nodemailer from "nodemailer";
import { verifyAuth } from "@/lib/authMiddleware";

export async function POST(req) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (authResult instanceof Response) return authResult;

    // Parse request body
    const { userEmail, userName, orderId, cartDetails } = await req.json();

    if (!userEmail || !orderId || !cartDetails) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter for Hostinger SMTP
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
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      logger: true, // Enable diagnostic logging
      debug: true, // Show detailed handshake trace
    });

    // ✅ 1st Email: Send to Client (User)
    const clientMailOptions = {
      from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`, // Alias email address
      to: userEmail, // Send to client email
      subject: `Order Added to Cart - Order ID: ${orderId}`,
      html: `
        <h2>Hello,</h2>
        <p>The following order has been added to your cart:</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Status:</strong> Added to Cart</p>
        <p>Thank you for using our services!</p>
        <p>Best Regards,</p>
        <p>Brainwave Sports Tech Team</p>
      `,
    };

    // ✅ 2nd Email: Send to Admin with Cart Details
    const adminEmail = "admin@brainwavesportstech.com";
    const adminMailOptions = {
      from: `"Brainwave Sports Tech" <admin@brainwavesportstech.com>`, // Alias email address
      to: adminEmail, // Send to admin email
      subject: `New Item Added to Cart - Order ID: ${orderId}`,
      html: `
        <h2>Admin Notification</h2>
        <p>A new item has been added to the cart.</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>User Name:</strong> ${userName}</p>
        <p><strong>Cart Details:</strong></p>
        <ul>
          <li><strong>Manufacturer:</strong> ${cartDetails.manufacturer}</li>
          <li><strong>Model Name:</strong> ${cartDetails.modelName}</li>
          <li><strong>Model Number:</strong> ${cartDetails.modelNumber}</li>
          <li><strong>Submission Type:</strong> ${cartDetails.submissionType}</li>
          <li><strong>Certification Type:</strong> ${cartDetails.certificationType}</li>
          <li><strong>Total Price:</strong> ${cartDetails.convertedPriceWithSymbol}</li>
        </ul>
        <p>Please review the cart details for further actions.</p>
      `,
    };

    // Send both emails with individual error handling
    let clientEmailSent = false;
    let adminEmailSent = false;

    try {
      await transporter.sendMail(clientMailOptions);
      clientEmailSent = true;
    } catch (err) {
      console.error("Client email failed:", err);
    }

    try {
      await transporter.sendMail(adminMailOptions);
      adminEmailSent = true;
    } catch (err) {
      console.error("Admin email failed:", err);
    }

    if (!clientEmailSent && !adminEmailSent) {
      throw new Error("Both notification emails failed to send.");
    }

    return new Response(
      JSON.stringify({ 
        message: "Cart notification process completed", 
        clientEmailSent, 
        adminEmailSent 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ message: "Email failed to send", error: error.message }),
      { status: 500 }
    );
  }
}
