const fs = require('fs');
const path = require('path');

// Use a relative path to the audio directory from the root
const directoryPath = path.join(__dirname, 'audio'); // Updated to use relative path from root
const daysToKeep = 1; // Change this to the number of days you want to keep

fs.readdir(directoryPath, (err, files) => {
    if (err) throw err;

    const now = Date.now();
    const cutoff = now - daysToKeep * 24 * 60 * 60 * 1000;

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        fs.stat(filePath, (err, stats) => {
            if (err) throw err;
            if (stats.mtime < cutoff) {
                fs.unlink(filePath, err => {
                    if (err) throw err;
                    console.log(`Deleted: ${file}`);
                });
            }
        });
    });
});