const fs = require('fs');
const filesToDelete = ['index.tsx', 'metadata.json', 'server.js'];

filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`Successfully deleted: ${file}`);
        } catch (err) {
            console.error(`Error deleting ${file}: ${err.message}`);
        }
    } else {
        console.log(`File not found, skipping: ${file}`);
    }
});