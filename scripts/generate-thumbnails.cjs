const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../src/images');
const MEDIUM_DIR = path.join(IMAGES_DIR, 'medium');
const PLACEHOLDERS_FILE = path.join(IMAGES_DIR, 'placeholders.json');

// Create medium directory if it doesn't exist
if (!fs.existsSync(MEDIUM_DIR)) {
    fs.mkdirSync(MEDIUM_DIR, { recursive: true });
}

async function generateThumbnails() {
    const placeholders = {};

    // Get all .webp files in images directory (excluding medium subdirectory)
    const files = fs.readdirSync(IMAGES_DIR)
        .filter(file => file.endsWith('.webp') && !file.startsWith('.'));

    console.log(`Found ${files.length} images to process`);

    for (const file of files) {
        const inputPath = path.join(IMAGES_DIR, file);
        const mediumPath = path.join(MEDIUM_DIR, file);

        try {
            // Generate tiny blur placeholder (20x20, base64 data URL)
            const tinyBuffer = await sharp(inputPath)
                .resize(20, 20, { fit: 'cover' })
                .webp({ quality: 20 })
                .toBuffer();

            const base64 = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;
            placeholders[file] = base64;

            console.log(`✓ Placeholder: ${file} (${(tinyBuffer.length / 1024).toFixed(1)}KB)`);

            // Generate medium quality image for gallery (800px max width)
            await sharp(inputPath)
                .resize(800, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 70 })
                .toFile(mediumPath);

            const mediumStats = fs.statSync(mediumPath);
            console.log(`✓ Medium: ${file} (${(mediumStats.size / 1024).toFixed(1)}KB)`);

        } catch (error) {
            console.error(`✗ Error processing ${file}:`, error.message);
        }
    }

    // Write placeholders JSON
    fs.writeFileSync(PLACEHOLDERS_FILE, JSON.stringify(placeholders, null, 2));
    console.log(`\n✓ Generated ${Object.keys(placeholders).length} placeholders`);
    console.log(`✓ Saved to: ${PLACEHOLDERS_FILE}`);

    // Summary
    const placeholderSize = fs.statSync(PLACEHOLDERS_FILE).size;
    console.log(`\nTotal placeholders file size: ${(placeholderSize / 1024).toFixed(1)}KB`);
}

generateThumbnails().catch(console.error);
