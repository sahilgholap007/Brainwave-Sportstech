import Razorpay from "razorpay";
import { verifyAuth } from "@/lib/authMiddleware";

export async function POST(req) {
  // Verify authentication
  const authResult = await verifyAuth(req);
  if (authResult instanceof Response) return authResult;

  const { amount, currency = "INR" } = await req.json();

  try {
    // ✅ Razorpay has a per-transaction max limit (₹1,00,000 in paise)
    const maxAmount = 100000 * 100;
    if (amount > maxAmount) {
      return new Response(
        JSON.stringify({ error: "Amount exceeds the maximum allowed limit of ₹1,00,000." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Initialize Razorpay with server-side keys
    const razorpay = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });

    // ✅ Create a new order (AUTO capture mode)
    const order = await razorpay.orders.create({
      amount,      // amount must be in paise
      currency,    // INR
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // <-- Auto capture enabled!
    });

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ error: "Unable to create Razorpay order" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
