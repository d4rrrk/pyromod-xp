const fs = require('fs/promises');
const path = require('path');

// Set this to the directory where your JSON files are stored
const DATA_DIR = './userData'; 

async function revertLevels() {
    try {
        const files = await fs.readdir(DATA_DIR);
        let processedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            if (path.extname(file) === '.json') {
                const filePath = path.join(DATA_DIR, file);

                try {
                    const rawData = await fs.readFile(filePath, 'utf8');
                    const userData = JSON.parse(rawData);

                    // Ensure the level property exists
                    if (typeof userData.level === 'number') {
                        
                        // NEW LOGIC: Only subtract if their level is strictly greater than 5
                        if (userData.level > 5) {
                            userData.level += 3; 

                            await fs.writeFile(filePath, JSON.stringify(userData, null, 4));
                            console.log(`✅ Updated ${file} -> New Level: ${userData.level}`);
                            processedCount++;
                        } else {
                            // If they are 5 or below, skip them and log it
                            console.log(`⏩ Skipped ${file}: Level is ${userData.level} (5 or below).`);
                            skippedCount++;
                        }

                    } else {
                        console.log(`⚠️ Skipped ${file}: No 'level' property found.`);
                    }
                } catch (err) {
                    console.error(`❌ Error parsing or writing to ${file}:`, err.message);
                }
            }
        }
        console.log(`\n🎉 Finished processing! Reverted ${processedCount} users. Skipped ${skippedCount} low-level users.`);
    } catch (err) {
        console.error('Fatal Error reading the directory:', err.message);
    }
}

revertLevels();
