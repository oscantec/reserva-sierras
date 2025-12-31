const fs = require('fs');
const path = require('path');

const GALERIA_FILE = path.join(__dirname, '../src/pages/Galeria.jsx');
const PLACEHOLDERS_FILE = path.join(__dirname, '../src/images/placeholders.json');

// Read files
const galeriaContent = fs.readFileSync(GALERIA_FILE, 'utf8');
const placeholders = JSON.parse(fs.readFileSync(PLACEHOLDERS_FILE, 'utf8'));

// Step 1: Add placeholders import and medium images imports
const placeholdersImport = `import placeholders from '../images/placeholders.json'\n\n`;

// Insert after the DEFAULT_CONFIG import (line 4)
const lines = galeriaContent.split('\n');
const importIndex = lines.findIndex(line => line.includes("import { DEFAULT_CONFIG }"));
lines.splice(importIndex + 1, 0, placeholdersImport);

// Step 2: Add medium image imports after regular imports
const regularImportEnd = lines.findIndex((line, idx) =>
    idx > 45 && line.trim().startsWith('//') && line.includes('Import all images - EXTERNAS')
);

const mediumImports = [];
// Generate medium imports based on existing imports
for (let i = 45; i < regularImportEnd; i++) {
    const line = lines[i];
    if (line.includes("from '../images/") && !line.includes('//')) {
        const match = line.match(/import\s+(\w+)\s+from\s+'\.\.\/images\/([^']+)'/);
        if (match) {
            const varName = match[1];
            const fileName = match[2];
            mediumImports.push(`import medium${varName.charAt(0).toUpperCase() + varName.slice(1)} from '../images/medium/${fileName}'`);
        }
    }
}

lines.splice(regularImportEnd, 0, '\n// Medium quality images for gallery', ...mediumImports, '');

// Step 3: Update defaultImages array to use new structure
// Find defaultImages array start
const defaultImagesStart = lines.findIndex(line => line.includes('const defaultImages = ['));

// We'll need to programmatically update each image entry
// For now, let's write the updated file
const updatedContent = lines.join('\n');
fs.writeFileSync(GALERIA_FILE, updatedContent);

console.log('✓ Added placeholders and medium image imports');
console.log(`✓ Added ${mediumImports.length} medium image imports`);
console.log('\nNext step: Update defaultImages array manually or with another script');
