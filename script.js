// This is the faceDB list, which I also have mirrored as a Gist on my GitHub!
const faceDB = {
    "xlarge-r": "X-Large",
    "globetrotter": "World Time",
    "smoke-r": "Vapor",
    "utility-r": "Utility",
    "renegade": "Unity",
    "coltan": "Unity Lights",
    "extragalactic": "Unity Mosaic",
    "com.apple.rhizomeface": "Unity Bloom",
    "greyhound": "Typograph",
    "infinity": "Toy Story",
    "timelapse": "Timelapse",
    "margarita": "Stripes",
    "gladius": "Solar Analog",
    "sidereal": "Solar Dial",
    "solar": "Solar Graph",
    "esterbrook": "Snoopy",
    "up-next-r": "Siri",
    "simple-r": "Simple",
    "pride": "Pride Digital",
    "prideweave": "Pride Woven",
    "lilypad": "Pride Threads",
    "com.apple.parameciumface": "Pride Celebration",
    "ultracube": "Portraits",
    "photos": "Photos",
    "crosswind": "Palette",
    "big-numerals-analog": "Numerals Mono",
    "big-numerals-digital": "Numerals Duo",
    "numerals-r": "Numerals",
    "olympus": "Nike Hybrid",
    "vivaldi": "Nike Globe",
    "victory-digital-r": "Nike Digital",
    "shiba": "Nike Compact",
    "magma": "Nike Bounce",
    "victory-analog-r": "Nike Analog",
    "motion": "Motion",
    "cloudraker": "Modular Duo",
    "whistler-subdials": "Modular Compact",
    "whistler-digital": "Modular",
    "mickey-r": "Mickey Mouse",
    "kuiper": "Metropolitan",
    "blackcomb": "Meridian",
    "collie": "Memoji",
    "seltzer": "Lunar",
    "metallic-r": "Liquid Metal",
    "modular": "Legacy Modular",
    "astrononmy": "Legacy Astronomy",
    "kaleidoscope-r": "Kaleidoscope",
    "whistler-analog": "Infograph",
    "spectrum-analog": "Gradient",
    "salmon": "GMT",
    "fire-water-r": "Fire and Water",
    "explorer-r": "Explorer",
    "trout": "Count Up",
    "proteus": "Contour",
    "color-r": "Color",
    "shark": "Chronograph Pro",
    "chronograph-r": "Chronograph",
    "california": "California",
    "breathe-r": "Breathe",
    "aegir": "Astronomy",
    "akita": "Artist",
    "snowglobe": "Playtime",
    "activity-digital-r": "Activity Digital",
    "activity-analog-r": "Activity Analog"
};

// I don't understand any of this JavaScript
async function fetchFaceNames(id, isFaceType) {
    const faceName = faceDB[id];
    return faceName ? faceName : null;
}

document.getElementById('customButton').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const output = document.getElementById('jsonOutput');
    const snapshotImageElement = document.getElementById('snapshotImage');
    
    if (!file) {
        return;
    }

    if (!file.name.endsWith('.watchface')) {
        snapshotImageElement.style.display = 'none';
        snapshotImageElement.src = '';
        output.textContent = 'Unsupported file, only .watchface files can be processed.';
        return;
    }

    const zip = new JSZip();

    try {
        const zipData = await zip.loadAsync(file);
        const faceJsonFile = zipData.file('face.json');
        const metadataJsonFile = zipData.file('metadata.json');
        const snapshotImageFile = zipData.file('snapshot.png');

        let bundleId = '';
        let analyticsId = '';
        let faceType = '';
        let complications = {};

        if (faceJsonFile) {
            const faceJsonText = await faceJsonFile.async('text');
            const faceJson = JSON.parse(faceJsonText);
            bundleId = faceJson['bundle id'] || '';
            analyticsId = faceJson['analytics id'] || '';
            faceType = faceJson['face type'] || '';
        }

        if (metadataJsonFile) {
            const metadataJsonText = await metadataJsonFile.async('text');
            const metadataJson = JSON.parse(metadataJsonText);
            complications = metadataJson.complications_names || {};
        }

        if (snapshotImageFile) {
            const snapshotImageBlob = await snapshotImageFile.async('blob');
            const snapshotImageUrl = URL.createObjectURL(snapshotImageBlob);
            snapshotImageElement.src = snapshotImageUrl;
            snapshotImageElement.style.display = 'block';
        } else {
            snapshotImageElement.style.display = 'none';
            snapshotImageElement.src = '';
        }

        const idToUse = analyticsId || faceType;
        const faceName = await fetchFaceNames(idToUse, !analyticsId);

        let outputText = '';
        if (faceName) {
            outputText += `Name: ${faceName}\n`;
        }
        if (bundleId) {
            outputText += `Bundle ID: ${bundleId}\n`;
        }
        if (analyticsId) {
            outputText += `Analytics ID: ${analyticsId}\n`;
        } else if (faceType) {
            outputText += `Face Type: ${faceType}\n`;
        }
        outputText += `\n`

        if (Object.keys(complications).length > 0) {
            outputText += 'Complications:\n';
            const sortedKeys = Object.keys(complications).sort();
            for (const key of sortedKeys) {
                const formattedKey = formatComplicationKey(key);
                outputText += `${formattedKey}: ${complications[key]}\n`;
            }
        } else {
            outputText += 'Complications Unsupported';
        }

        output.textContent = outputText;
    } catch (err) {
        snapshotImageElement.style.display = 'none';
        snapshotImageElement.src = '';
        output.textContent = `Error: ${err.message}`;
    }
});

function formatComplicationKey(key) {
    const words = key.split('-').map(word => capitalize(word));
    return words.join(' ');
}

function capitalize(word) {
    const parts = word.match(/[a-zA-Z]+|[0-9]+/g);
    if (!parts) return '';
    return parts.map(part => {
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
}