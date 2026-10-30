const fs = require('fs');
const path = 'src/components/IndependentManualBillGenerator.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace in JSX
content = content.replace(/\{getCurrencySymbol\(currency\)\}/g, '₹');

// Replace in PDF
content = content.replace(/\$\{getCurrencySymbol\(currency\)\}/g, 'Rs. ');

// Now fix the specific spots that *should* use getCurrencySymbol(currency)
// 1. PDF convertedTotal
content = content.replace(
  /addText\(`Rs\. \$\{convertedTotal\}`\, amountColumnX \+ amountColumnWidth\, lastY\, \{ fontStyle\: "bold"\, align\: "right"\, fontSize\: 8 \}\)/,
  'addText(`${getCurrencySymbol(currency)}${convertedTotal}`, amountColumnX + amountColumnWidth, lastY, { fontStyle: "bold", align: "right", fontSize: 8 })'
);

// 2. UI converted total block
const uiBlockToReplace = `<div className="font-medium text-lg pt-2 text-indigo-600">Total in INR:</div>
                  <div className="text-right text-lg font-bold pt-2 text-indigo-600">
                    ₹{(taxes.finalTotal * exchangeRate).toFixed(2)}
                  </div>`;
const newUiBlock = `<div className="font-medium text-lg pt-2 text-indigo-600">Total in {currency}:</div>
                  <div className="text-right text-lg font-bold pt-2 text-indigo-600">
                    {getCurrencySymbol(currency)}{(taxes.finalTotal / exchangeRate).toFixed(2)}
                  </div>`;
                  
if (content.includes(uiBlockToReplace)) {
  content = content.replace(uiBlockToReplace, newUiBlock);
} else {
  console.log("Could not find UI block to replace.");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed currency symbols.');
