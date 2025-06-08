const fs = require('fs');
const path = require('path');

function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete file: ${filePath}`, err);
    });
}

function generateFilename(originalName) {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);
    return `${base}-${timestamp}${ext}`;
}

module.exports = {
    deleteFile,
    generateFilename
};