const fs = require('fs');
const path = 'src/components/IndependentManualBillGenerator.jsx';
let content = fs.readFileSync(path, 'utf8');

const calculateTaxesRegex = /const calculateTaxes = \(\) => \{[\s\S]*?return result\n  \}/;

const newCalculateTaxes = `const calculateTaxes = () => {
    const result = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      taxableValues: [],
    }

    // Calculate the taxable amount (subtotal + processing fee, WITHOUT separate GST on processing fee)
    const taxableAmount = subtotal + processingFees.processingFee

    // Add regular items to taxable values
    items.forEach((item) => {
      const amount = calculateItemAmount(item)
      // Allow 0 as a valid GST rate
      const taxRate = item.gst === undefined || item.gst === null || item.gst === "" ? 18 : Number(item.gst)

      if (isMaharashtra || isInternational) {
        // For Maharashtra & International: Split into CGST and SGST
        const halfTaxRate = taxRate / 2
        const halfTaxAmount = (amount * halfTaxRate) / 100
        
        result.cgst += halfTaxAmount
        result.sgst += halfTaxAmount

        result.taxableValues.push({
          hsn: item.hsn,
          taxableValue: amount,
          cgstRate: halfTaxRate,
          cgstAmount: halfTaxAmount,
          sgstRate: halfTaxRate,
          sgstAmount: halfTaxAmount,
          totalTax: halfTaxAmount * 2,
        })
      } else {
        // For other states: Apply IGST
        const taxAmount = (amount * taxRate) / 100
        
        result.igst += taxAmount

        result.taxableValues.push({
          hsn: item.hsn,
          taxableValue: amount,
          igstRate: taxRate,
          igstAmount: taxAmount,
          totalTax: taxAmount,
        })
      }
    })

    // Add processing fee if applicable
    if (processingFees.processingFee > 0) {
      const processingHsn = "997158"

      if (isMaharashtra || isInternational) {
        // For Maharashtra & International: Split into CGST and SGST
        const halfTaxAmount = processingFees.processingFee * 0.09
        
        result.cgst += halfTaxAmount
        result.sgst += halfTaxAmount

        result.taxableValues.push({
          hsn: processingHsn,
          taxableValue: processingFees.processingFee,
          cgstRate: 9,
          cgstAmount: halfTaxAmount,
          sgstRate: 9,
          sgstAmount: halfTaxAmount,
          totalTax: halfTaxAmount * 2,
        })
      } else {
        // For other states: Apply IGST
        const taxAmount = processingFees.processingFee * 0.18
        
        result.igst += taxAmount

        result.taxableValues.push({
          hsn: processingHsn,
          taxableValue: processingFees.processingFee,
          igstRate: 18,
          igstAmount: taxAmount,
          totalTax: taxAmount,
        })
      }
    }

    // Calculate total (taxable amount + GST)
    result.total = taxableAmount + result.cgst + result.sgst + result.igst

    // Round to 2 decimal places
    result.total = Math.round(result.total * 100) / 100

    // Calculate roundoff
    result.roundOff = Math.round(result.total) - result.total

    // Final total after rounding
    result.finalTotal = Math.round(result.total)

    return result
  }`;

content = content.replace(calculateTaxesRegex, newCalculateTaxes);

const groupByHsnRegex = /const groupByHsn = \(\) => \{[\s\S]*?return Object\.values\(groups\)\n  \}/;

const newGroupByHsn = `const groupByHsn = () => {
    const groups = {}

    // Add regular items
    items.forEach((item) => {
      const amount = calculateItemAmount(item)
      const taxRate = item.gst === undefined || item.gst === null || item.gst === "" ? 18 : Number(item.gst)
      
      if (!groups[item.hsn]) {
        groups[item.hsn] = {
          hsn: item.hsn,
          taxableValue: 0,
          cgstRate: isMaharashtra || isInternational ? taxRate / 2 : 0,
          cgstAmount: 0,
          sgstRate: isMaharashtra || isInternational ? taxRate / 2 : 0,
          sgstAmount: 0,
          igstRate: !isMaharashtra && !isInternational ? taxRate : 0,
          igstAmount: 0,
          totalTax: 0,
        }
      }

      groups[item.hsn].taxableValue += amount

      if (isMaharashtra || isInternational) {
        const halfTaxRate = taxRate / 2
        const halfTaxAmount = (amount * halfTaxRate) / 100
        groups[item.hsn].cgstAmount += halfTaxAmount
        groups[item.hsn].sgstAmount += halfTaxAmount
        groups[item.hsn].totalTax += halfTaxAmount * 2
      } else {
        const taxAmount = (amount * taxRate) / 100
        groups[item.hsn].igstAmount += taxAmount
        groups[item.hsn].totalTax += taxAmount
      }
    })

    // Add processing fee if applicable
    if (processingFees.processingFee > 0) {
      const processingHsn = "997158"
      if (!groups[processingHsn]) {
        groups[processingHsn] = {
          hsn: processingHsn,
          taxableValue: 0,
          cgstRate: isMaharashtra || isInternational ? 9 : 0,
          cgstAmount: 0,
          sgstRate: isMaharashtra || isInternational ? 9 : 0,
          sgstAmount: 0,
          igstRate: !isMaharashtra && !isInternational ? 18 : 0,
          igstAmount: 0,
          totalTax: 0,
        }
      }

      groups[processingHsn].taxableValue += processingFees.processingFee

      if (isMaharashtra || isInternational) {
        const cgstAmount = processingFees.processingFee * 0.09
        const sgstAmount = processingFees.processingFee * 0.09
        groups[processingHsn].cgstAmount += cgstAmount
        groups[processingHsn].sgstAmount += sgstAmount
        groups[processingHsn].totalTax += cgstAmount + sgstAmount
      } else {
        const igstAmount = processingFees.processingFee * 0.18
        groups[processingHsn].igstAmount += igstAmount
        groups[processingHsn].totalTax += igstAmount
      }
    }

    return Object.values(groups)
  }`;

content = content.replace(groupByHsnRegex, newGroupByHsn);

fs.writeFileSync(path, content, 'utf8');
console.log("calculateTaxes and groupByHsn replaced");
