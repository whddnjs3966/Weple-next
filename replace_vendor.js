const fs = require('fs');
const path = require('path');

const DIRS = ['app', 'components', 'lib', 'actions'];

const EXTS = ['.ts', '.tsx', '.css'];

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath, callback);
        } else if (EXTS.includes(path.extname(filepath))) {
            callback(filepath);
        }
    }
}

const replacements = [
    { from: /업체/g, to: '장소' },
    { from: /vendors/g, to: 'places' },
    { from: /Vendors/g, to: 'Places' },
    { from: /VENDORS/g, to: 'PLACES' },
    { from: /vendor/g, to: 'place' },
    { from: /Vendor/g, to: 'Place' },
    { from: /VENDOR/g, to: 'PLACE' },
];

let changedCount = 0;

DIRS.forEach(dir => {
    walk(path.join(__dirname, dir), filepath => {
        let content = fs.readFileSync(filepath, 'utf8');
        let newContent = content;

        replacements.forEach(r => {
            newContent = newContent.replace(r.from, r.to);
        });

        if (content !== newContent) {
            fs.writeFileSync(filepath, newContent, 'utf8');
            console.log('Updated:', filepath);
            changedCount++;
        }
    });
});

console.log('Finished. Files changed:', changedCount);
