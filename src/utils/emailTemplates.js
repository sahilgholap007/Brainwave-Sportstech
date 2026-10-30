/**
 * Email template generators for the sendEmail API route.
 * Extracted to keep the API route clean and these templates maintainable.
 */

// ─── Shared Styles ──────────────────────────────────────────────────────────

const baseStyles = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; padding: 30px; line-height: 1.6;">
    <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">Brainwave Sports Tech</h1>
        <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">AIPA's Equipment Testing and Certification Laboratory</p>
      </div>
`

const footerStyles = `
      <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #ecf0f1;">
        <p style="color: #34495e; font-size: 16px; margin-bottom: 20px;">
          <strong>Best regards,</strong><br/>
          The Brainwave Sports Tech Certification Team
        </p>
        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #7f8c8d;">
            <a href="https://brainwavesportstech.com" style="color: #3498db; text-decoration: none; margin-right: 20px;">🌐 Visit Website</a>
            <a href="mailto:support@brainwavesportstech.com" style="color: #3498db; text-decoration: none; margin-right: 20px;">📧 Contact Support</a>
            <a href="tel:+1234567890" style="color: #3498db; text-decoration: none;">📞 Call Us</a>
          </p>
        </div>
      </div>
    </div>
  </div>
`

// ─── Order Details Sections ─────────────────────────────────────────────────

function getCourtDetailsSection(ctx) {
    return `
    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">🏟️ Court Certification Details</h3>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Order ID:</span>
          <span style="color: #2c3e50; font-family: monospace;">${ctx.orderId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Facility Name:</span>
          <span style="color: #2c3e50;">${ctx.facilityName || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Location:</span>
          <span style="color: #2c3e50;">${ctx.facilityLocation || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Facility Type:</span>
          <span style="color: #2c3e50;">${ctx.facilityType || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Number of Courts:</span>
          <span style="color: #2c3e50;">${ctx.numberOfCourts || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Base Type:</span>
          <span style="color: #2c3e50;">${ctx.baseType || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Surface Type:</span>
          <span style="color: #2c3e50;">${ctx.surfaceType || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Certification Fee:</span>
          <span style="color: #27ae60; font-weight: 600;">${ctx.convertedPriceWithSymbol || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span style="font-weight: 600; color: #34495e;">Submitted:</span>
          <span style="color: #2c3e50;">${ctx.formattedTime}</span>
        </div>
      </div>
    </div>
  `
}

function formatProductDetails(ctx, item, index) {
    const isPaddle = ctx.category === "Paddle"

    let productData
    if (isPaddle) {
        productData = ctx.paddleDetails || {
            modelName: ctx.data.modelName,
            modelNumber: ctx.data.modelNumber,
            paddleShape: ctx.data.paddleShape,
            coreMaterial: ctx.data.coreMaterial,
            coreThickness: ctx.data.coreThickness,
            honeycombCellSize: ctx.data.honeycombCellSize,
            surfaceMaterial: ctx.data.surfaceMaterial,
            surfaceFinish: ctx.data.surfaceFinish,
            certificationType: ctx.data.certificationType || ctx.certificationType,
        }
    } else {
        productData = ctx.ballDetails || {
            modelName: ctx.data.modelName,
            modelNumber: ctx.data.modelNumber,
            ballType: ctx.data.ballType,
            materialOfBall: ctx.data.materialOfBall,
            useType: ctx.data.useType,
            numberOfHoles: ctx.data.numberOfHoles,
            currentlySold: ctx.data.currentlySold,
            certificationType: ctx.data.certificationType || ctx.certificationType,
        }
    }

    return `
    <div style="background-color: #ffffff; border: 2px solid #ecf0f1; border-radius: 10px; padding: 20px; margin: 15px 0;">
      <h4 style="color: #2c3e50; margin-top: 0; font-size: 18px; border-bottom: 1px solid #bdc3c7; padding-bottom: 8px;">
        ${isPaddle ? "🏓" : "🏐"} ${isPaddle ? "Paddle" : "Ball"} ${ctx.cartItems.length > 1 ? `#${index + 1}` : ""} - ${productData?.modelName || "N/A"}
      </h4>
      <div style="display: grid; gap: 10px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <span style="font-weight: 600; color: #34495e;">Model Number:</span>
          <span style="color: #2c3e50;">${productData?.modelNumber || "N/A"}</span>
        </div>
        ${isPaddle
            ? `
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Shape:</span>
            <span style="color: #2c3e50;">${productData?.paddleShape || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Core Material:</span>
            <span style="color: #2c3e50;">${productData?.coreMaterial || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Core Thickness:</span>
            <span style="color: #2c3e50;">${productData?.coreThickness || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Honeycomb Cell Size:</span>
            <span style="color: #2c3e50;">${productData?.honeycombCellSize || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Surface Material:</span>
            <span style="color: #2c3e50;">${productData?.surfaceMaterial || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Surface Finish:</span>
            <span style="color: #2c3e50;">${productData?.surfaceFinish || "N/A"}</span>
          </div>
        `
            : `
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Ball Type:</span>
            <span style="color: #2c3e50;">${productData?.ballType || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Material:</span>
            <span style="color: #2c3e50;">${productData?.materialOfBall || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Use Type:</span>
            <span style="color: #2c3e50;">${productData?.useType || "N/A"}</span>
          </div>
          ${productData?.numberOfHoles ? `
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Number of Holes:</span>
            <span style="color: #2c3e50;">${productData.numberOfHoles}</span>
          </div>` : ""}
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span style="font-weight: 600; color: #34495e;">Currently Sold:</span>
            <span style="color: #2c3e50;">${productData?.currentlySold || "N/A"}</span>
          </div>
        `
        }
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <span style="font-weight: 600; color: #34495e;">Certification Type:</span>
          <span style="color: #2c3e50;">${productData?.certificationType || ctx.certificationType || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <span style="font-weight: 600; color: #34495e;">Testing Fee:</span>
          <span style="color: #27ae60; font-weight: 600;">${ctx.convertedPriceWithSymbol || "N/A"}</span>
        </div>
      </div>
    </div>
  `
}

function getProductDetailsSection(ctx) {
    const productDetailsHtml =
        ctx.cartItems.length > 0
            ? ctx.cartItems.map((item, index) => formatProductDetails(ctx, item, index)).join("")
            : formatProductDetails(ctx, {}, 0)

    return `
    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        📦 ${ctx.cartItems.length > 1 ? "Product Testing Orders" : "Product Testing Order"}
      </h3>
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Order ID:</span>
          <span style="color: #2c3e50; font-family: monospace;">${ctx.orderId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Company Name:</span>
          <span style="color: #2c3e50;">${ctx.companyName || ctx.manufacturer || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span style="font-weight: 600; color: #34495e;">Submitted:</span>
          <span style="color: #2c3e50;">${ctx.formattedTime}</span>
        </div>
      </div>
      ${productDetailsHtml}
    </div>
  `
}

function getFlooringDetailsSection(ctx) {
    const data = ctx.data || ctx
    const companyName = data.companyName || ctx.companyName || "N/A"
    const productName = data.productName || data.productTradeName || data.modelName || ctx.productName || ctx.productTradeName || ctx.modelName || "N/A"
    const manufacturer = data.flooringManufacturer || data.manufacturer || ctx.flooringManufacturer || ctx.manufacturer || "N/A"
    const brandName = data.brandName || ctx.brandName || "N/A"

    const rawFlooringType = data.flooringType || ctx.flooringType
    const flooringType = Array.isArray(rawFlooringType) ? rawFlooringType.join(", ") : (rawFlooringType || "N/A")

    const rawConstruction = data.flooringConstruction || data.constructionSystem || ctx.flooringConstruction || ctx.constructionSystem
    const construction = Array.isArray(rawConstruction) ? rawConstruction.join(", ") : (rawConstruction || "N/A")

    const totalThickness = data.totalThickness || ctx.totalThickness
    const thicknessDisplay = totalThickness ? `${totalThickness} mm` : "N/A"

    const rawPurpose = data.purposeOfTesting || ctx.purposeOfTesting
    const purpose = Array.isArray(rawPurpose) ? rawPurpose.join(", ") : (rawPurpose || "N/A")

    const standards = data.standardsUsed || ctx.standardsUsed
    const standardsDisplay = Array.isArray(standards) ? standards.join(", ") : (standards || null)

    const sampleDimensions = data.sampleDimensions || ctx.sampleDimensions || null
    const colorFinish = data.colorFinish || ctx.colorFinish || null
    const clientType = data.clientType || ctx.clientType
    const clientTypeDisplay = Array.isArray(clientType) ? clientType.join(", ") : (clientType || null)

    const testingFee = ctx.convertedPriceWithSymbol || (ctx.totalPriceINR ? `₹ ${ctx.totalPriceINR}` : "₹ 60,000")

    return `
    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">
        🏟️ Sports Flooring Certification Details
      </h3>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Order ID:</span>
          <span style="color: #2c3e50; font-family: monospace;">${ctx.orderId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Company Name:</span>
          <span style="color: #2c3e50;">${companyName}</span>
        </div>
        ${clientTypeDisplay ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Client Type:</span>
          <span style="color: #2c3e50;">${clientTypeDisplay}</span>
        </div>` : ""}
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Product / Trade Name:</span>
          <span style="color: #2c3e50;">${productName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Flooring Manufacturer:</span>
          <span style="color: #2c3e50;">${manufacturer}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Brand Name:</span>
          <span style="color: #2c3e50;">${brandName}</span>
        </div>
        ${data.useType || ctx.useType ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Type of Use:</span>
          <span style="color: #2c3e50;">${data.useType || ctx.useType}</span>
        </div>` : ""}
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Flooring Type:</span>
          <span style="color: #2c3e50;">${flooringType}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Construction / System:</span>
          <span style="color: #2c3e50;">${construction}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Total Thickness:</span>
          <span style="color: #2c3e50;">${thicknessDisplay}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Purpose of Testing:</span>
          <span style="color: #2c3e50;">${purpose}</span>
        </div>
        ${sampleDimensions ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Sample Dimensions:</span>
          <span style="color: #2c3e50;">${sampleDimensions}</span>
        </div>` : ""}
        ${standardsDisplay ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Applicable Standards:</span>
          <span style="color: #2c3e50;">${standardsDisplay}</span>
        </div>` : ""}
        ${colorFinish ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Colour / Finish:</span>
          <span style="color: #2c3e50;">${colorFinish}</span>
        </div>` : ""}
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1;">
          <span style="font-weight: 600; color: #34495e;">Testing Fee:</span>
          <span style="color: #27ae60; font-weight: 600;">${testingFee}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span style="font-weight: 600; color: #34495e;">Submitted:</span>
          <span style="color: #2c3e50;">${ctx.formattedTime}</span>
        </div>
      </div>
    </div>
  `
}

function getOrderDetailsSection(ctx) {
    if (ctx.isCourtOrder) return getCourtDetailsSection(ctx)
    if (ctx.category === "Flooring" || ctx.data?.category === "Flooring" || ctx.data?.flooringType) return getFlooringDetailsSection(ctx)
    return getProductDetailsSection(ctx)
}

// ─── Main Template Generator ────────────────────────────────────────────────

/**
 * Generate email HTML and subject for a given order status.
 *
 * @param {string} status - The order status string
 * @param {object} ctx - Context object containing all order/email data
 * @returns {{ subject: string, html: string }}
 */
export function generateEmailTemplate(status, ctx) {
    const orderDetails = getOrderDetailsSection(ctx)

    switch (status) {
        case "Requested invoice":
            return {
                subject: `📑 Invoice Request Received - Please Ship Your Samples - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
              <h2 style="margin: 0; font-size: 24px;">📑 Invoice Request Received</h2>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            Thank you for submitting your sports surface certification application. We have successfully registered your request for an official corporate invoice with 15-day credit terms. Our finance team will prepare and dispatch your tax invoice to this email shortly.
          </p>

          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin-top: 0; font-size: 20px;">📦 Physical Specimen Shipping Guidelines:</h3>
            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.95;">While your invoice is being processed, please prepare and ship your test samples so evaluation can proceed without delay:</p>
            <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Quantity:</strong> Minimum two (2) test specimen panels measuring 500mm x 500mm each</li>
              <li><strong>Marking:</strong> Clearly label the parcel with Order ID: <code style="background: rgba(255,255,255,0.25); padding: 2px 6px; border-radius: 4px;">${ctx.orderId}</code></li>
              <li><strong>Destination:</strong> Unit 403-404, Motibhai Smriti Towers, Opposite Railway Station, Badlapur (W), PIN 421503, Maharashtra, India</li>
              <li><strong>Credit Terms:</strong> Payment of invoice must be completed within 15 days of invoice issuance to release official test reports</li>
            </ul>
          </div>

          ${orderDetails}

          ${footerStyles}`,
            }

        case "Invoice sent, awaiting samples":
            return {
                subject: `🧾 Official Tax Invoice Issued - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
              <h2 style="margin: 0; font-size: 24px;">🧾 Official Tax Invoice Issued</h2>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            Your official tax invoice for <strong>Order #${ctx.orderId}</strong> is ready. Please find the PDF attached to this email and available for direct download below.
          </p>

          ${ctx.invoiceUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${ctx.invoiceUrl}" target="_blank" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37,99,235,0.3);">
              📄 View & Download Invoice PDF
            </a>
          </div>
          ` : ''}

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">💳 Bank Wire / NEFT / RTGS Details</h3>
            <div style="display: grid; gap: 8px; font-size: 14px; color: #334155;">
              <p style="margin: 4px 0;"><strong>Bank Name:</strong> ICICI Bank</p>
              <p style="margin: 4px 0;"><strong>Account Name:</strong> Brainwave Velocity Pvt Ltd</p>
              <p style="margin: 4px 0;"><strong>Account Number:</strong> 278705005002</p>
              <p style="margin: 4px 0;"><strong>IFSC Code:</strong> ICIC0002787</p>
              <p style="margin: 4px 0;"><strong>Branch:</strong> Badlapur</p>
              <p style="margin: 4px 0;"><strong>Payment Term:</strong> Within 15 Days of this email</p>
            </div>
          </div>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏱️ 15-Day Payment Window:</strong> Please ensure the total amount is transferred within 15 calendar days. Formal laboratory test evaluations and AIPA certification reports will be delivered once fees are cleared.
            </p>
          </div>

          ${orderDetails}

          ${footerStyles}`,
            }

        case "15-Day Payment Reminder":
            return {
                subject: `⚠️ Reminder: Outstanding Invoice Payment Due - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
              <h2 style="margin: 0; font-size: 24px;">⚠️ Payment Due Notice: 15-Day Term</h2>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            This is a courteous reminder that the 15-day credit payment period for <strong>Order #${ctx.orderId}</strong> has reached maturity.
          </p>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #991b1b; font-size: 18px;">⚠️ Fee Clearance Required for Certification Release</h3>
            <p style="margin: 8px 0; font-size: 14px; color: #7f1d1d; line-height: 1.6;">
              Our laboratory is currently processing or has completed evaluation of your sports surface specimens. As per Brainwave SportsTech testing policy, official laboratory test results, playability compliance documents, and certification endorsements cannot be furnished until invoice fees are reconciled.
            </p>
          </div>

          ${ctx.invoiceUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${ctx.invoiceUrl}" target="_blank" style="background: #d97706; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              📄 View Invoice PDF
            </a>
          </div>
          ` : ''}

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">💳 Bank Wire Payment Details</h3>
            <div style="display: grid; gap: 8px; font-size: 14px; color: #334155;">
              <p style="margin: 4px 0;"><strong>Bank Name:</strong> ICICI Bank</p>
              <p style="margin: 4px 0;"><strong>Account Name:</strong> Brainwave Velocity Pvt Ltd</p>
              <p style="margin: 4px 0;"><strong>Account Number:</strong> 278705005002</p>
              <p style="margin: 4px 0;"><strong>IFSC Code:</strong> ICIC0002787</p>
              <p style="margin: 4px 0;"><strong>Branch:</strong> Badlapur</p>
            </div>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b;">
              After transferring funds, kindly reply to this email with your transaction UTR or bank payment receipt to expedite report release.
            </p>
          </div>

          ${orderDetails}

          ${footerStyles}`,
            }

        case "Payment received, awaiting inspection":
            return {
                subject: `✅ Payment Confirmed - Court Inspection Process Initiated - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
              <h2 style="margin: 0; font-size: 24px;">✅ Payment Successfully Received!</h2>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            Thank you for choosing Brainwave Sports Tech for your court certification needs. We have successfully received your payment and your certification process has been initiated.
          </p>

          <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin-top: 0; font-size: 20px;">🔄 What Happens Next:</h3>
            <ul style="margin: 15px 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Technical Review:</strong> Our expert team will review your facility specifications</li>
              <li><strong>Inspection Scheduling:</strong> We'll contact you within 2-3 business days to schedule the on-site inspection</li>
              <li><strong>Pre-Inspection Call:</strong> You'll receive a confirmation call with date, time, and inspector details</li>
              <li><strong>Documentation Prep:</strong> We'll prepare all necessary inspection documentation</li>
            </ul>
          </div>

          ${orderDetails}

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-size: 16px;">
              <strong>📞 Important:</strong> Please ensure someone authorized is available at the facility during the scheduled inspection time. Our inspector will need access to all court areas.
            </p>
          </div>

          ${footerStyles}`,
            }

        case "Payment received, awaiting samples":
            return {
                subject: `✅ Payment Confirmed - Please Ship Your Samples - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
              <h2 style="margin: 0; font-size: 24px;">✅ Payment Successfully Received!</h2>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            Thank you for your payment! We have successfully received your payment for product testing and certification. Your testing process is now ready to begin.
          </p>

          <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin-top: 0; font-size: 20px;">📦 Sample Shipping Instructions:</h3>
            <ul style="margin: 15px 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Package Preparation:</strong> Securely package your product samples</li>
              <li><strong>Order ID Label:</strong> Clearly mark package with Order ID: <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${ctx.orderId}</code></li>
              <li><strong>Shipping Method:</strong> Use trackable shipping service</li>
              <li><strong>Timeline:</strong> Testing begins within 24 hours of sample receipt</li>
            </ul>
          </div>

          ${orderDetails}

          ${footerStyles}`,
            }

        case "Certification Completed":
            return {
                subject: `🎉 Certification Complete - Your Official Certificate is Ready! - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #f1c40f, #f39c12); color: white; padding: 25px; border-radius: 15px; display: inline-block;">
              <h2 style="margin: 0; font-size: 28px;">🎉 CERTIFICATION COMPLETED! 🎉</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your ${ctx.isCourtOrder ? "facility" : "product"} is now officially certified!</p>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            <strong>Congratulations!</strong> We are delighted to inform you that your ${ctx.isCourtOrder ? "court certification" : "product certification"} process has been completed successfully. Your ${ctx.isCourtOrder ? "facility" : "product"} has met all official standards and requirements.
          </p>

          ${orderDetails}

          ${ctx.dateOfCertification
                        ? `
            <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 10px;">
              <h4 style="color: #856404; margin-top: 0;">📅 Certification Date: ${ctx.dateOfCertification}</h4>
              <p style="margin: 0; color: #856404; font-size: 16px;">
                This is the official date of your certification. Please retain this information for your records.
              </p>
            </div>
          `
                        : ""
                    }

          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #28a745; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
              <strong style="font-size: 18px;">🎊 Thank you for choosing Brainwave SportsTech! 🎊</strong>
            </div>
          </div>

          ${footerStyles}`,
            }

        default:
            return {
                subject: `📋 Order Status Update - Order #${ctx.orderId}`,
                html: `${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #6c757d, #495057); color: white; padding: 20px; border-radius: 10px; display: inline-block;">
              <h2 style="margin: 0; font-size: 24px;">📋 Order Status Update</h2>
            </div>
          </div>
          
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Dear ${ctx.userName || "Valued Customer"},</p>
          
          <p style="font-size: 16px; color: #34495e; margin-bottom: 25px;">
            Your order status has been updated. Please find the current status and details below.
          </p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">📊 Current Status:</h3>
            <p style="font-size: 18px; color: #495057; margin: 10px 0;"><strong>${status}</strong></p>
          </div>

          ${orderDetails}

          ${footerStyles}`,
            }
    }
}

// ─── Admin Notification Template ────────────────────────────────────────────

/**
 * Generate the admin notification email HTML for order status updates.
 *
 * @param {object} ctx - Context with order data
 * @returns {string} HTML string for the admin email
 */
export function generateAdminNotificationHtml(ctx) {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
      <div style="max-width: 700px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #ddd;">
        <h2 style="color: #222;">📋 Order Status Updated</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style: none; padding-left: 0; font-size: 15px; color: #555;">
            <li style="margin: 8px 0;"><strong>👤 Customer:</strong> ${ctx.userName}</li>
            <li style="margin: 8px 0;"><strong>📧 Email:</strong> ${ctx.userEmail}</li>
            <li style="margin: 8px 0;"><strong>📞 Contact:</strong> ${ctx.contactNumber || "N/A"}</li>
            <li style="margin: 8px 0;"><strong>🆔 Order ID:</strong> ${ctx.orderId}</li>
            <li style="margin: 8px 0;"><strong>🏢 ${ctx.isCourtOrder ? "Facility" : "Company/Brand"}:</strong> ${ctx.facilityName || ctx.companyName || ctx.manufacturer || "N/A"}</li>
            <li style="margin: 8px 0;"><strong>💳 Payment Type:</strong> ${ctx.paymentType || "Razorpay"}</li>
            <li style="margin: 8px 0;"><strong>📌 New Status:</strong> ${ctx.newStatus}</li>
            <li style="margin: 8px 0;"><strong>💰 Amount:</strong> ${ctx.convertedPriceWithSymbol || "N/A"}</li>
            <li style="margin: 8px 0;"><strong>🕒 Updated:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #155724; font-size: 14px;">
            <strong>✅ Action Completed:</strong> Customer has been automatically notified via email with detailed status update and next steps.
          </p>
        </div>
      </div>
    </div>
  `
}
