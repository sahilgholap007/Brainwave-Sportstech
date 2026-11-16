import { NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import { getAdminDb, Timestamp } from "@/lib/firebase-admin"
import fs from "fs"
import path from "path"

const db = getAdminDb()

// Helper function to get financial year
function getFinancialYear() {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  let startYear, endYear
  if (currentMonth < 3) {
    // January to March
    startYear = currentYear - 1
    endYear = currentYear
  } else {
    // April to December
    startYear = currentYear
    endYear = currentYear + 1
  }
  return `${startYear.toString().slice(-2)}${endYear.toString().slice(-2)}`
}

// Helper function to wrap text into lines
function wrapText(text, maxChars) {
  const words = text.split(" ")
  const lines = []
  let currentLine = ""
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxChars) {
      lines.push(currentLine.trim())
      currentLine = word
    } else {
      currentLine += (currentLine ? " " : "") + word
    }
  }
  if (currentLine) lines.push(currentLine.trim())
  return lines
}

// Helper function to format standards used for flooring
function getFlooringStandardsText(standardsUsed) {
  if (!standardsUsed) return "EN / ISO / ASTM Standards"
  if (typeof standardsUsed === "string") return standardsUsed

  const stds = []
  if (standardsUsed.enStandardChecked) {
    stds.push(standardsUsed.enStandard ? `EN (${standardsUsed.enStandard})` : "EN")
  }
  if (standardsUsed.isoStandardChecked) {
    stds.push(standardsUsed.isoStandard ? `ISO (${standardsUsed.isoStandard})` : "ISO")
  }
  if (standardsUsed.astmStandardChecked) {
    stds.push(standardsUsed.astmStandard ? `ASTM (${standardsUsed.astmStandard})` : "ASTM")
  }

  if (stds.length > 0) {
    return `${stds.join(" / ")} Standards`
  }
  return "EN / ISO / ASTM Standards"
}

export async function POST(req) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 })
    }

    // Fetch order
    const orderRef = db.collection("certification_orders").doc(orderId)
    const orderSnap = await orderRef.get()
    if (!orderSnap.exists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const order = orderSnap.data()
    const category = order.category || order.type

    if (category !== "Paddle" && category !== "Ball" && category !== "Flooring" && category !== "Court") {
      return NextResponse.json({ message: "Certificates only available for Paddle, Ball, Flooring, and Court" }, { status: 400 })
    }

    // Determine type code
    const typeCode = category === "Paddle" ? "PDL" : category === "Ball" ? "BLL" : category === "Court" ? "CRT" : "FLR"
    const financialYear = getFinancialYear()

    let certificateNumber = order.certificateNumber

    // Generate new certificate number if it doesn't exist
    if (!certificateNumber) {
      const counterRef = db.collection("certificate_counters").doc(typeCode)
      const counterSnap = await counterRef.get()
      
      let lastSequence = 0

      if (counterSnap.exists) {
        const counterData = counterSnap.data()
        if (counterData.financialYear === financialYear) {
          lastSequence = counterData.lastSequence || 0
        }
      }

      lastSequence += 1
      const seqString = lastSequence.toString().padStart(4, "0")
      certificateNumber = `BST-AIPA-${typeCode}-${financialYear}-${seqString}`

      // Update counter
      await counterRef.set({
        lastSequence,
        financialYear
      })
    }

    // Date formatting
    let issueDateObj;
    if (order.dateOfCertification) {
      const parts = order.dateOfCertification.split("/");
      if (parts.length === 3) {
        issueDateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    if (!issueDateObj || isNaN(issueDateObj.getTime())) {
      issueDateObj = order.timestamp ? new Date(order.timestamp.seconds ? order.timestamp.seconds * 1000 : order.timestamp) : new Date();
    }
    
    const issueDate = issueDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    
    // Validity duration: 5 years minus 1 day for Flooring & Court, 3 years minus 1 day for Paddle & Ball
    const isFiveYearCert = category === "Flooring" || category === "Court" || (typeof category === "string" && (category.toLowerCase().includes("floor") || category.toLowerCase().includes("court")));
    const validityYears = isFiveYearCert ? 5 : 3;

    const expiryDateObj = new Date(issueDateObj);
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + validityYears);
    expiryDateObj.setDate(expiryDateObj.getDate() - 1);
    const expiryDate = expiryDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

    // Update order with cert details if new or if certificateExpiryDate needs syncing
    const certUpdates = {}
    if (!order.certificateNumber) {
      certUpdates.certificateNumber = certificateNumber
      certUpdates.certificateGeneratedAt = Timestamp.now()
      certUpdates.certificateExpiryDate = expiryDate
    } else if (order.certificateExpiryDate !== expiryDate) {
      certUpdates.certificateExpiryDate = expiryDate
    }

    if (Object.keys(certUpdates).length > 0) {
      await orderRef.update(certUpdates)
    }

    // Generate QR Code
    const verifyUrl = `https://brainwavesportstech.com/verify/${certificateNumber}`
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    // Select template based on category
    let templateFilename = "certificate-paddle.png"
    if (category === "Ball") {
      templateFilename = "certificate-ball.png"
    } else if (category === "Flooring" || category === "Court") {
      templateFilename = "certificate-flooring.png"
    }

    let templateBytes
    const templatePath = path.join(process.cwd(), 'public', 'images', 'certificates', templateFilename)
    if (fs.existsSync(templatePath)) {
      templateBytes = fs.readFileSync(templatePath)
    } else {
      // In serverless / Cloud Run containers where public/ is hosted on CDN
      const cdnUrl = `https://brainwavesportstech.com/images/certificates/${templateFilename}`
      const cdnRes = await fetch(cdnUrl)
      if (!cdnRes.ok) {
        throw new Error(`Failed to load certificate template from ${cdnUrl}: ${cdnRes.statusText}`)
      }
      const arrayBuffer = await cdnRes.arrayBuffer()
      templateBytes = Buffer.from(arrayBuffer)
    }

    // Build PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([3508, 2480]) // A4 Landscape @ 300dpi
    
    const bgImage = await pdfDoc.embedPng(templateBytes)
    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: 3508,
      height: 2480
    })

    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const textColor = rgb(0.2, 0.2, 0.2) // Dark gray for premium look
    const textSize = 50

    const rawCompanyName = order.companyName || order.flooringManufacturer || order.manufacturerFacility || order.manufacturer || order.name || "N/A"
    const rawModelName = order.productTradeName || order.productName || order.modelName || order.ballModelName || order?.ballDetails?.modelName || "N/A"

    const companyName = rawCompanyName.toUpperCase()
    const modelName = rawModelName.toUpperCase()
    const categoryDisplay = category === "Flooring" || category === "Court" ? "SPORTS FLOORING" : category === "Ball" ? "PICKLEBALL BALL" : "PICKLEBALL PADDLE"

    // Row 3 values depending on category
    let row3Col1Value = "N/A"
    let row3Col2Value = "N/A"

    if (category === "Paddle") {
      // Col 1: Model Number, Col 2: Paddle Thickness
      row3Col1Value = (order.modelNumber || order?.paddleDetails?.modelNumber || "N/A").toString().toUpperCase()
      let paddleThickness = order.coreThickness || order.paddleThickness || order?.paddleDetails?.coreThickness || order?.paddleDetails?.paddleThickness
      if (paddleThickness) {
        paddleThickness = String(paddleThickness).trim()
        row3Col2Value = paddleThickness.toLowerCase().includes("mm") ? paddleThickness.toUpperCase() : `${paddleThickness} MM`
      }
    } else if (category === "Ball") {
      // Col 1: Type of Use, Col 2: Number of Holes
      row3Col1Value = (order.useType || order.typeOfUse || order?.ballDetails?.useType || "Indoor").toUpperCase()
      row3Col2Value = (order.numberOfHoles || order?.ballDetails?.numberOfHoles || "N/A").toString().toUpperCase()
    } else if (category === "Flooring" || category === "Court") {
      // Col 1: Type of Use, Col 2: Thickness
      row3Col1Value = (order.useType || order.typeOfUse || "Indoor").toUpperCase()
      let flooringThickness = order.totalThickness || order.thickness || order.flooringThickness
      if (flooringThickness) {
        flooringThickness = String(flooringThickness).trim()
        row3Col2Value = flooringThickness.toLowerCase().includes("mm") ? flooringThickness.toUpperCase() : `${flooringThickness} MM`
      }
    }

    // Auto-scale company text if too long (max width: 2000)
    let companyTextSize = textSize
    const companyWidth = font.widthOfTextAtSize(companyName, companyTextSize)
    if (companyWidth > 2000) {
      companyTextSize = Math.max(28, Math.floor(companyTextSize * (2000 / companyWidth)))
    }

    // Auto-scale model name if too long (max width: 720)
    let modelTextSize = textSize
    const modelWidth = font.widthOfTextAtSize(modelName, modelTextSize)
    if (modelWidth > 720) {
      modelTextSize = Math.max(26, Math.floor(modelTextSize * (720 / modelWidth)))
    }

    // Auto-scale row 3 col 1 if needed
    let row3Col1Size = textSize
    const r3c1Width = font.widthOfTextAtSize(row3Col1Value, row3Col1Size)
    if (r3c1Width > 700) {
      row3Col1Size = Math.max(26, Math.floor(row3Col1Size * (700 / r3c1Width)))
    }

    // Auto-scale row 3 col 2 if needed
    let row3Col2Size = textSize
    const r3c2Width = font.widthOfTextAtSize(row3Col2Value, row3Col2Size)
    if (r3c2Width > 720) {
      row3Col2Size = Math.max(26, Math.floor(row3Col2Size * (720 / r3c2Width)))
    }

    // Draw Table Texts
    // Row 1: Issued To
    page.drawText(companyName, { x: 980, y: 1268, size: companyTextSize, font, color: textColor })

    // Row 2: Category & Model Name
    page.drawText(categoryDisplay, { x: 980, y: 1110, size: textSize, font, color: textColor })
    page.drawText(modelName, { x: 2295, y: 1110, size: modelTextSize, font, color: textColor })

    // Row 3: Category-specific values
    page.drawText(row3Col1Value, { x: 980, y: 976, size: row3Col1Size, font, color: textColor })
    page.drawText(row3Col2Value, { x: 2295, y: 976, size: row3Col2Size, font, color: textColor })

    // Row 4: Date of Issue & Date of Expiry
    page.drawText(issueDate, { x: 980, y: 830, size: textSize, font, color: textColor })
    page.drawText(expiryDate, { x: 2295, y: 830, size: textSize, font, color: textColor })

    // Embed QR Code
    const qrImage = await pdfDoc.embedPng(qrBuffer)
    const qrSize = 350
    const qrX = 1754 - (qrSize / 2)
    const qrY = 280
    
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize
    })

    // Certificate Number
    const certNumText = `#${certificateNumber}`
    const certNumWidth = font.widthOfTextAtSize(certNumText, 42)
    page.drawText(certNumText, {
      x: 1754 - (certNumWidth / 2),
      y: qrY - 60,
      size: 42,
      font,
      color: rgb(0, 0, 0)
    })

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "X-Certificate-Number": certificateNumber
      }
    })

  } catch (error) {
    console.error("Error generating certificate:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
