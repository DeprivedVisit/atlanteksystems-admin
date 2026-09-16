// Skindoctors WA Number Updater
// Uso: node update-wa.js <nuevo-numero>
// Ejemplo: node update-wa.js 50688887777

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const OLD_WA = '50663144171';
const OLD_WA_FORMATTED = '+506 6314-4171';

function updateFile(filePath, newWA, newWAFormatted) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace phone number in wa.me links
  const waLinkRegex = new RegExp(`wa\\.me/${OLD_WA}`, 'g');
  if (waLinkRegex.test(content)) {
    content = content.replace(waLinkRegex, `wa.me/${newWA}`);
    changed = true;
  }
  
  // Replace formatted phone in display text
  const formattedRegex = new RegExp(OLD_WA_FORMATTED.replace('+', '\\+').replace(' ', '\\s?'), 'g');
  if (formattedRegex.test(content)) {
    content = content.replace(formattedRegex, newWAFormatted);
    changed = true;
  }
  
  // Replace bare number in tel: links or data attributes
  const bareRegex = new RegExp(OLD_WA, 'g');
  if (bareRegex.test(content)) {
    content = content.replace(bareRegex, newWA);
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
  
  return changed;
}

function walkDir(dir, newWA, newWAFormatted) {
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!['node_modules', '.git', '.vscode'].includes(entry.name)) {
        total += walkDir(fullPath, newWA, newWAFormatted);
      }
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.js') || entry.name.endsWith('.gs')) {
      if (updateFile(fullPath, newWA, newWAFormatted)) {
        total++;
      }
    }
  }
  
  return total;
}

// CLI
const newWA = process.argv[2];
if (!newWA) {
  console.log('Uso: node update-wa.js <nuevo-numero>');
  console.log('Ejemplo: node update-wa.js 50688887777');
  console.log('');
  console.log('Número actual:', OLD_WA, '(' + OLD_WA_FORMATTED + ')');
  process.exit(1);
}

// Validate: should be digits only, 10-12 chars
if (!/^\d{10,12}$/.test(newWA)) {
  console.error('❌ Número inválido. Debe ser solo dígitos (10-12), ej: 50688887777');
  process.exit(1);
}

// Format for display: +506 XXXX-XXXX
let newWAFormatted;
if (newWA.startsWith('506') && newWA.length === 11) {
  newWAFormatted = `+506 ${newWA.slice(3,7)}-${newWA.slice(7)}`;
} else {
  newWAFormatted = `+${newWA}`;
}

console.log(`🔄 Actualizando WA de ${OLD_WA} (${OLD_WA_FORMATTED}) a ${newWA} (${newWAFormatted})`);
console.log('');

const updated = walkDir(PROJECT_ROOT, newWA, newWAFormatted);

console.log('');
console.log(`✅ Completado: ${updated} archivos actualizados`);
console.log('');
console.log('⚠️  Recuerda:');
console.log('  1. Hacer commit de los cambios');
console.log('  2. Deployar a S3/CloudFront');
console.log('  3. Invalidar caché de CloudFront');