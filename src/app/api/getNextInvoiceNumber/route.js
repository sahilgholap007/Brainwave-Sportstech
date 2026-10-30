import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { logger } from "@/lib/errorHandler"

const db = getAdminDb()

// Helper function to get financial year
function getFinancialYear(customDate) {
    const targetDate = customDate ? new Date(customDate) : new Date()
    const validDate = isNaN(targetDate.getTime()) ? new Date() : targetDate
    const currentMonth = validDate.getMonth()
    const currentYear = validDate.getFullYear()

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

    return `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`
}

// Fetch last invoice number using atomic counter with fallback
async function fetchLastInvoiceNumber(financialYear, isIndependent = false) {
    try {
        const fyKey = financialYear.replace("-", "_")
        const counterField = isIndependent ? `independent_FY${fyKey}` : `standard_FY${fyKey}`

        // 1. Try atomic counter in counters/invoiceNumbers
        const counterRef = db.collection("counters").doc("invoiceNumbers")
        const counterSnap = await counterRef.get()

        if (counterSnap.exists) {
            const counterData = counterSnap.data()
            if (typeof counterData[counterField] === "number") {
                return counterData[counterField]
            }
        }

        // 2. Fallback: Query collections if counter not initialized for this FY
        let maxNumber = 0

        if (isIndependent) {
            const indSnapshot = await db.collection("IndependentManualBills").get()
            indSnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.invoiceNumber && data.invoiceNumber.startsWith(`INV-OTR-${financialYear}`)) {
                    const numberPart = data.invoiceNumber.split("/")[1]
                    const number = parseInt(numberPart, 10)
                    if (!isNaN(number) && number > maxNumber) {
                        maxNumber = number
                    }
                }
            })
        } else {
            const [autoSnapshot, manualSnapshot] = await Promise.all([
                db.collection("AutoInvoices").get(),
                db.collection("ManualBills").get(),
            ])

            const parseDoc = (doc) => {
                const data = doc.data()
                if (data.invoiceNumber && data.invoiceNumber.startsWith(financialYear)) {
                    const numberPart = data.invoiceNumber.split("/")[1]
                    const number = parseInt(numberPart, 10)
                    if (!isNaN(number) && number > maxNumber) {
                        maxNumber = number
                    }
                }
            }

            autoSnapshot.forEach(parseDoc)
            manualSnapshot.forEach(parseDoc)
        }

        return maxNumber
    } catch (error) {
        logger.error("Error fetching last invoice number", error)
        return 0
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") || "standard" // standard | independent
        const dateParam = searchParams.get("date")
        const isIndependent = type === "independent"

        const financialYear = getFinancialYear(dateParam)
        const lastInvoiceNumber = await fetchLastInvoiceNumber(financialYear, isIndependent)
        const nextInvoiceNumber = lastInvoiceNumber + 1

        const invoiceNumber = isIndependent
            ? `INV-OTR-${financialYear}/${nextInvoiceNumber.toString().padStart(3, "0")}`
            : `${financialYear}/${nextInvoiceNumber.toString().padStart(3, "0")}`

        return NextResponse.json({
            invoiceNumber,
            financialYear,
            lastNumber: lastInvoiceNumber,
            nextNumber: nextInvoiceNumber,
            type,
        })
    } catch (error) {
        logger.error("Error getting next invoice number", error)
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
    }
}
