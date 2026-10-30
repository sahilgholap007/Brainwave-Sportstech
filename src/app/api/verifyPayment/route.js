import crypto from "crypto";

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();




    // ✅ 1. Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch!", { expectedSignature, razorpay_signature });
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), { status: 400 });
    }

    // ✅ 2. Since payment_capture=1, Razorpay already captured automatically
    return new Response(
      JSON.stringify({ ok: true, message: "Payment verified and auto-captured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("💥 verifyPayment error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Verification failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
