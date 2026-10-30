const fs = require('fs');

let code = fs.readFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', 'utf8');

const oldBtn = `className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"`;
const newBtn = `className="text-slate-400 hover:text-blue-600 transition-colors ml-2"`;

code = code.replace(oldBtn, newBtn);

fs.writeFileSync('src/app/admin/(dashboard)/process-orders/page.jsx', code, 'utf8');
console.log("Done");
