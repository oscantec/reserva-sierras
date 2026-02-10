const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            if (/\.(js|jsx|ts|tsx)$/.test(file)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function checkCaseSensitivity(dir, file) {
    const files = fs.readdirSync(dir);
    // Find exact match
    return files.includes(file);
}

function resolveImport(importPath, sourceFile) {
    if (!importPath.startsWith('.')) return null; // Ignore node_modules/aliases for now

    const dir = path.dirname(sourceFile);
    let resolvedPath = path.resolve(dir, importPath);

    // Check extensions
    const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.css'];

    for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        if (fs.existsSync(testPath)) {
            // Verify casing of the FILENAME
            const startDir = path.dirname(testPath);
            const fileName = path.basename(testPath);

            if (!checkCaseSensitivity(startDir, fileName)) {
                // Try to find the actual casing
                const actualFiles = fs.readdirSync(startDir);
                const matching = actualFiles.find(f => f.toLowerCase() === fileName.toLowerCase());
                return { valid: false, error: `Casing mismatch: Import '${fileName}' vs File '${matching}'`, file: testPath };
            }

            // Also need to check directory casing recursively up to src? 
            // For now, let's assume directory structure is mostly correct and check file/immediate parent.
            return { valid: true, file: testPath };
        }
    }

    return { valid: false, error: 'File not found', path: resolvedPath };
}

const files = getAllFiles(SRC_DIR);
let errors = 0;

console.log(`Scanning ${files.length} files for import errors...`);

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Regex for imports: import ... from '...' or import('...')
    const importRegex = /from\s+['"]([^'"]+)['"]|import\s*\(['"]([^'"]+)['"]\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        if (importPath && importPath.startsWith('.')) {
            const result = resolveImport(importPath, file);
            if (result && !result.valid) {
                console.error(`\n[ERROR] in ${path.relative(process.cwd(), file)}`);
                console.error(`  Import: ${importPath}`);
                console.error(`  Issue: ${result.error}`);
                if (result.path) console.error(`  Resolved: ${result.path}`);
                errors++;
            }
        }
    }
});

if (errors === 0) {
    console.log("\nNo case-sensitivity or missing file errors found in relative imports.");
} else {
    console.log(`\nFound ${errors} errors.`);
    process.exit(1);
}
