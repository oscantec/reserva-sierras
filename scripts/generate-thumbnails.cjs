const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../src/images');
const MEDIUM_DIR = path.join(IMAGES_DIR, 'medium');
const PLACEHOLDERS_FILE = path.join(IMAGES_DIR, 'placeholders.json');

// Ensure medium directories exist
if (!fs.existsSync(MEDIUM_DIR)) {
    fs.mkdirSync(MEDIUM_DIR, { recursive: true });
}
const MEDIUM_INICIO_DIR = path.join(MEDIUM_DIR, 'imagesinicio');
if (!fs.existsSync(MEDIUM_INICIO_DIR)) {
    fs.mkdirSync(MEDIUM_INICIO_DIR, { recursive: true });
}

async function generateThumbnails() {
    // 1. Read existing placeholders to preserve manual entries or previous runs
    let placeholders = {};
    if (fs.existsSync(PLACEHOLDERS_FILE)) {
        try {
            placeholders = JSON.parse(fs.readFileSync(PLACEHOLDERS_FILE, 'utf8'));
        } catch (e) {
            console.warn('Could not read existing placeholders, starting fresh.');
        }
    }

    // 2. Define files to process
    // Scans:
    // - src/images/*.webp (Gallery) -> src/images/medium/*.webp
    // - src/images/imagesinicio/*.png (Inicio) -> src/images/medium/imagesinicio/*.webp
    // - accesofinca.png -> src/images/medium/accesofinca.webp

    const tasks = [];

    // Helper to add tasks
    const addTask = (inputPath, outputSubDir, outputNameVal) => {
        tasks.push({
            input: inputPath,
            output: path.join(MEDIUM_DIR, outputSubDir, outputNameVal.replace(/\.(png|jpg|jpeg)$/, '.webp')), // Force webp output
            key: outputSubDir ? `${outputSubDir}/${outputNameVal}` : outputNameVal
        });
    };

    // A. Scan Gallery (.webp files in root)
    const galleryFiles = fs.readdirSync(IMAGES_DIR)
        .filter(file => file.endsWith('.webp') && !file.startsWith('.'));

    galleryFiles.forEach(file => addTask(path.join(IMAGES_DIR, file), '', file));

    // B. Scan Inicio (.png files in imagesinicio/)
    const inicioDir = path.join(IMAGES_DIR, 'imagesinicio');
    if (fs.existsSync(inicioDir)) {
        const inicioFiles = fs.readdirSync(inicioDir)
            .filter(file => file.endsWith('.png') && !file.startsWith('.'));

        inicioFiles.forEach(file => addTask(path.join(inicioDir, file), 'imagesinicio', file));
    }

    // C. Special files (accesofinca.png)
    if (fs.existsSync(path.join(IMAGES_DIR, 'accesofinca.png'))) {
        addTask(path.join(IMAGES_DIR, 'accesofinca.png'), '', 'accesofinca.png');
    }

    console.log(`Found ${tasks.length} images to process...`);

    for (const task of tasks) {
        const { input, output, key } = task;

        try {
            // Check if output exists to skip? No, force regenerate to be safe.

            // Generate tiny blur placeholder (20x20, base64 data URL)
            const tinyBuffer = await sharp(input)
                .resize(20, 20, { fit: 'cover' })
                .webp({ quality: 20 })
                .toBuffer();

            const base64 = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;
            placeholders[key] = base64; // Update key

            // Generate medium quality image (800px max width)
            await sharp(input)
                .resize(800, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 75 })
                .toFile(output);

            console.log(`✓ Processed: ${key}`);

        } catch (error) {
            console.error(`✗ Error processing ${key}:`, error.message);
        }
    }

    // Write placeholders JSON
    fs.writeFileSync(PLACEHOLDERS_FILE, JSON.stringify(placeholders, null, 2));
    console.log(`\n✓ Generated ${Object.keys(placeholders).length} placeholders`);
    console.log(`✓ Saved to: ${PLACEHOLDERS_FILE}`);
}

generateThumbnails().catch(console.error);
