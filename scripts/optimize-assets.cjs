const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../src/images');
const MEDIUM_DIR = path.join(IMAGES_DIR, 'medium');
const PLACEHOLDERS_FILE = path.join(IMAGES_DIR, 'placeholders.json');

if (!fs.existsSync(MEDIUM_DIR)) {
    fs.mkdirSync(MEDIUM_DIR, { recursive: true });
}

async function optimizeSpecificImages() {
    // Load existing placeholders
    let placeholders = {};
    if (fs.existsSync(PLACEHOLDERS_FILE)) {
        placeholders = JSON.parse(fs.readFileSync(PLACEHOLDERS_FILE));
    }

    const filesToProcess = [
        { name: 'accesofinca.png', dir: IMAGES_DIR },
        { name: 'galeria.png', dir: path.join(IMAGES_DIR, 'imagesinicio') },
        { name: 'guia.png', dir: path.join(IMAGES_DIR, 'imagesinicio') },
        { name: 'registro.png', dir: path.join(IMAGES_DIR, 'imagesinicio') },
        { name: 'reservas.png', dir: path.join(IMAGES_DIR, 'imagesinicio') }
    ];

    for (const fileObj of filesToProcess) {
        const inputPath = path.join(fileObj.dir, fileObj.name);
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${fileObj.name}, file not found.`);
            continue;
        }

        // Output filename: if inside imagesinicio, prefix it or put in subfolder?
        // Let's just flatten to medium for simplicity, but avoid collisions.
        // Or create subfolder.
        // Let's create subfolder 'medium/imagesinicio'
        let outputDir = MEDIUM_DIR;
        // logic to mirror structure if needed, but for now specific handling
        if (fileObj.dir.endsWith('imagesinicio')) {
            outputDir = path.join(MEDIUM_DIR, 'imagesinicio');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilename = fileObj.name.replace(/\.[^/.]+$/, ".webp");
        const mediumPath = path.join(outputDir, outputFilename);

        try {
            console.log(`Processing ${fileObj.name}...`);

            // 1. Generate Placeholder
            const tinyBuffer = await sharp(inputPath)
                .resize(20, 20, { fit: 'cover' })
                .toFormat('webp', { quality: 20 })
                .toBuffer();

            const base64 = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;
            // Use the relative path from "images" as key? Or just filename?
            // Existing keys are just filenames.
            // If uniqueness is issue, we might need path.
            // But let's assume filename is unique enough for now or use "imagesinicio/filename".
            const key = fileObj.dir.endsWith('imagesinicio') ? `imagesinicio/${fileObj.name}` : fileObj.name;
            placeholders[key] = base64;

            console.log(`✓ Placeholder generated for ${key}`);

            // 2. Generate Medium Version (800px width)
            // For galeria.png (3.8MB), resizing to 800px will be huge savings.
            await sharp(inputPath)
                .resize(800, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFormat('webp', { quality: 80 })
                .toFile(mediumPath);

            console.log(`✓ Medium version saved to ${mediumPath}`);

        } catch (err) {
            console.error(`Error processing ${fileObj.name}:`, err);
        }
    }

    fs.writeFileSync(PLACEHOLDERS_FILE, JSON.stringify(placeholders, null, 2));
    console.log(`Updated ${PLACEHOLDERS_FILE}`);
}

optimizeSpecificImages();
