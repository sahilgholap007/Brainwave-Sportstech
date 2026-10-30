const fs = require('fs');

let code = fs.readFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', 'utf8');

// Replace General Details Array
// Search for: ].map(([label, value, editKey]) => (
// Until: ))}
const arrayRegex = /\s*\].map\(\(\[label, value, editKey\]\) => \([\s\S]*?\)\)}/;
const arrayReplacement = `                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(arrayRegex, '\n' + arrayReplacement);


// Replace Ball Specs
const ballRegex = /\{selectedOrder\.category === "Ball" && \([\s\S]*?<\/>\s*\)\}/;
const ballReplacement = `{selectedOrder.category === "Ball" && [
                          ["Certification Type", selectedOrder.certificationType, "certificationType"],
                          ["Ball Type", selectedOrder.ballType, "ballType"],
                          ["Currently Sold", selectedOrder.currentlySold, "currentlySold"],
                          ["Ball Material", selectedOrder.materialOfBall, "materialOfBall"],
                          ["Model Name", selectedOrder.modelName, "modelName"],
                          ["Model Number", selectedOrder.modelNumber, "modelNumber"],
                          ["Use Type", selectedOrder.useType, "useType"]
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(ballRegex, ballReplacement);

// Replace Paddle Specs
const paddleRegex = /\{selectedOrder\.category === "Paddle" && \([\s\S]*?<\/>\s*\)\}/;
const paddleReplacement = `{selectedOrder.category === "Paddle" && [
                          ["Paddle Shape", selectedOrder.paddleShape, "paddleShape"],
                          ["Core Material", selectedOrder.coreMaterial, "coreMaterial"],
                          ["Honeycomb Cell Size", selectedOrder.honeycombCellSize, "honeycombCellSize"],
                          ["Surface Material", selectedOrder.surfaceMaterial, "surfaceMaterial"]
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(paddleRegex, paddleReplacement);


// Replace Court Specs
const courtRegex = /\{selectedOrder\.category === "Court" && \([\s\S]*?<\/>\s*\)\}/;
const courtReplacement = `{selectedOrder.category === "Court" && [
                          ["Facility Name", selectedOrder.facilityName, "facilityName"],
                          ["Facility Location", selectedOrder.facilityLocation, "facilityLocation"],
                          ["Facility Type", selectedOrder.facilityType, "facilityType"],
                          ["Number of Courts", selectedOrder.numberOfCourts, "numberOfCourts"],
                          ["Base Type", selectedOrder.baseType, "baseType"]
                        ].map(([label, value, editKey]) => (
                          <EditableRow key={label} label={label} value={value} fieldKey={editKey} onSave={handleUpdateField} isUpdating={isUpdating} />
                        ))}`;
code = code.replace(courtRegex, courtReplacement);


fs.writeFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', code, 'utf8');
console.log("Done regex replacements");
