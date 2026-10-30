const fs = require('fs');

let code = fs.readFileSync('src/components/IndependentManualBillGenerator.jsx', 'utf8');

// For PDF: replace Rs. with the dynamic symbol.
code = code.replace(/addText\(`Rs\. \$\{([^}]+)\}`,/g, 'addText(`${getCurrencySymbol(currency)}${$1}`,');

// Fix the Total in INR logic in the PDF:
const pdfTargetOld = `      if (currency !== "INR") {
        addText(\`Conversion Rate\`, margin, lastY, { fontSize: 7 })
        addText(\`1 \${currency} = Rs. \${Number(exchangeRate).toFixed(2)}\`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
        lastY += 5 // Increased spacing
        
        const convertedTotal = (taxes.finalTotal / exchangeRate).toFixed(2);
        addText(\`Total in \${currency}\`, margin, lastY, { fontStyle: "bold", fontSize: 8 })
        addText(\`\${getCurrencySymbol(currency)}\${convertedTotal}\`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })
        lastY += 7 // Increased spacing
      }`;

const pdfTargetNew = `      if (currency !== "INR") {
        addText(\`Conversion Rate\`, margin, lastY, { fontSize: 7 })
        addText(\`1 \${currency} = Rs. \${Number(exchangeRate).toFixed(2)}\`, amountColumnX + amountColumnWidth, lastY, { align: "right", fontSize: 7 })
        lastY += 5 // Increased spacing
        
        const convertedTotal = (taxes.finalTotal * exchangeRate).toFixed(2);
        addText(\`Total in INR\`, margin, lastY, { fontStyle: "bold", fontSize: 8 })
        addText(\`Rs. \${convertedTotal}\`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })
        lastY += 7 // Increased spacing
      }`;
code = code.replace(pdfTargetOld, pdfTargetNew);


// For UI: replace all occurrences of ₹{ with {getCurrencySymbol(currency)}{
code = code.replace(/>₹\{/g, '>{getCurrencySymbol(currency)}{');

// Also fix the Total in INR logic in the UI:
const uiTargetOld = `                  <div className="font-medium text-sm text-gray-500 pt-2 border-t mt-2">Conversion Rate:</div>
                  <div className="text-right text-sm text-gray-500 pt-2 border-t mt-2">1 {currency} = ₹{Number(exchangeRate).toFixed(2)}</div>
                  
                  <div className="font-medium text-lg pt-2 text-indigo-600">Total in {currency}:</div>
                  <div className="text-right text-lg font-bold pt-2 text-indigo-600">
                    {getCurrencySymbol(currency)}{(taxes.finalTotal / exchangeRate).toFixed(2)}
                  </div>`;

const uiTargetNew = `                  <div className="font-medium text-sm text-gray-500 pt-2 border-t mt-2">Conversion Rate:</div>
                  <div className="text-right text-sm text-gray-500 pt-2 border-t mt-2">1 {currency} = ₹{Number(exchangeRate).toFixed(2)}</div>
                  
                  <div className="font-medium text-lg pt-2 text-indigo-600">Total in INR:</div>
                  <div className="text-right text-lg font-bold pt-2 text-indigo-600">
                    ₹{(taxes.finalTotal * exchangeRate).toFixed(2)}
                  </div>`;
code = code.replace(uiTargetOld, uiTargetNew);

fs.writeFileSync('src/components/IndependentManualBillGenerator.jsx', code, 'utf8');
console.log("Done");
