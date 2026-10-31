
const imageUpload = document.getElementById("imageUpload");
const resetButton = document.getElementById("resetButton");
const previewSection = document.getElementById("previewSection");
const imagePreview = document.getElementById("imagePreview");
const statusMessage = document.getElementById("statusMessage");

const canvas = document.getElementById("protectedCanvas");
const ctx = canvas.getContext("2d");

const placeholder = document.getElementById("protectedPlaceholder");
const blurButton = document.getElementById("blurButton");
const hideSelectionButton =
    document.getElementById("hideSelectionButton");

const downloadButton =
    document.getElementById("downloadButton");

const autoRedactButton =
    document.getElementById("autoRedactButton");

// Stores text locations detected by OCR
let detectedRegions = [];

// Tracks which image has been scanned
let scannedFile = null;



let currentPreviewURL = null;
let originalImage = new Image();

let startX = 0;
let startY = 0;
let selection = null;
let isSelecting = false;

// STEP 1: Upload screenshot

imageUpload.addEventListener("change", function () {

    const file = imageUpload.files[0];

    
const maxFileSize = 10 * 1024 * 1024;

if (file && file.size > maxFileSize) {

    alert("Image is too large. Maximum size is 10 MB.");

    // Clear uploaded file
    imageUpload.value = "";

    // Clear previous screenshot
    imagePreview.removeAttribute("src");
    previewSection.style.display = "none";

    // Clear protected canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset OCR results
    detectedRegions = [];
    scannedFile = null;
    extractedText.textContent = "";
    ocrDetectionResult.textContent = "";
    ocrSection.style.display = "none";

    // Reset editing state
    selection = null;
    savedImage = null;
    isSelecting = false;

    // Disable buttons
    scanButton.disabled = true;
    autoRedactButton.disabled = true;
    blurButton.disabled = true;
    hideSelectionButton.disabled = true;
    downloadButton.disabled = true;
    resetButton.disabled = true;

    statusMessage.textContent =
        "Upload failed. Please select an image under 10 MB.";

    return;
}

// Clear previous automatic detection results

detectedRegions = [];
scannedFile = null;

autoRedactButton.disabled = true;


// Reset OCR results when a new file is selected
scanButton.disabled = true;
ocrSection.style.display = "none";
extractedText.textContent = "";
ocrDetectionResult.textContent = "";

    downloadButton.disabled = true;

    if (!file) {
        previewSection.style.display = "none";
        return;
    }

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
        alert("Please upload a PNG or JPEG image.");
        imageUpload.value = "";
        previewSection.style.display = "none";
        return;
    }

    if (currentPreviewURL) {
        URL.revokeObjectURL(currentPreviewURL);
    }

    currentPreviewURL = URL.createObjectURL(file);

    imagePreview.src = currentPreviewURL;

    originalImage = new Image();

    // Wait until the image finishes loading
    originalImage.onload = function () {
        

        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;

        ctx.drawImage(originalImage, 0, 0);

        canvas.style.display = "block";
        placeholder.style.display = "none";
        previewSection.style.display = "block";

// Enable scanning once the screenshot loads
scanButton.disabled = false;


        blurButton.disabled = true;
        resetButton.disabled = false;

        selection = null;

        statusMessage.textContent =
            "Screenshot ready. Select an area to blur.";
    };

    originalImage.onerror = function () {
        statusMessage.textContent =
            "Could not load the selected screenshot.";
        previewSection.style.display = "none";
    };

    originalImage.src = currentPreviewURL;

});

// STEP 2: Get mouse position on canvas

function getMousePosition(event) {

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

// STEP 3: Start selecting an area

canvas.addEventListener("pointerdown", function (event) {

    const position = getMousePosition(event);

    startX = position.x;
    startY = position.y;

    isSelecting = true;
    selection = null;

    blurButton.disabled = true;
    

    canvas.setPointerCapture(event.pointerId);
});

// STEP 4: Draw selection rectangle

canvas.addEventListener("pointermove", function (event) {

    if (!isSelecting) return;

    const position = getMousePosition(event);

    const x = Math.min(startX, position.x);
    const y = Math.min(startY, position.y);

    const width = Math.abs(position.x - startX);
    const height = Math.abs(position.y - startY);

    selection = { x, y, width, height };

    // Restore image before drawing selection outline
    ctx.putImageData(savedImage, 0, 0);

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);

    ctx.strokeRect(x, y, width, height);

    ctx.setLineDash([]);
});

// STEP 5: Finish selecting


canvas.addEventListener("pointerup", function () {

    isSelecting = false;

    if (selection && selection.width > 2 && selection.height > 2) {
        blurButton.disabled = false;
        hideSelectionButton.disabled = false;
    }
});


// STEP 6: Save canvas before selection

let savedImage = null;

canvas.addEventListener("pointerdown", function () {
    savedImage = ctx.getImageData(
        0, 0, canvas.width, canvas.height
    );
});

// STEP 7: Blur selected area

blurButton.addEventListener("click", function () {

    if (!selection || !savedImage) return;

    ctx.putImageData(savedImage, 0, 0);

    const { x, y, width, height } = selection;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.max(1, Math.ceil(width));
    tempCanvas.height = Math.max(1, Math.ceil(height));

    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.filter = "blur(12px)";

    tempCtx.drawImage(
        canvas,
        x, y, width, height,
        0, 0, tempCanvas.width, tempCanvas.height
    );

    ctx.drawImage(tempCanvas, x, y, width, height);

    selection = null;
    blurButton.disabled = true;

downloadButton.disabled = false;


    statusMessage.textContent =
        "Selected area blurred successfully!";
});

// STEP 8: Reset screenshot



resetButton.onclick = function () {

    console.log("RESET BUTTON CLICKED");

    if (!originalImage.complete || !originalImage.naturalWidth) {
        statusMessage.textContent = "No original image available.";
        return;
    }

    // Restore the original screenshot
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;

    ctx.drawImage(originalImage, 0, 0);

    // Clear selection state
    selection = null;
    savedImage = null;
    isSelecting = false;

    // Reset editing buttons
    blurButton.disabled = true;
    hideSelectionButton.disabled = true;
    downloadButton.disabled = true;

    // Allow Auto-Protect again if OCR results exist
    autoRedactButton.disabled =
        scannedFile !== imageUpload.files[0] ||
        detectedRegions.length === 0;

    statusMessage.textContent =
        "Original screenshot restored successfully!";

    console.log("RESET COMPLETED");

};




// STEP 9: Download Protected Screenshot

downloadButton.addEventListener("click", function () {

    // Prevent downloading while a selection is unfinished
    if (isSelecting || selection !== null) {

        statusMessage.textContent =
            "Please Blur or Hide the selected area before downloading.";

        alert(
            "You have an unfinished selection. Apply Blur or Hide Selection first."
        );

        return;
    }

    // Ask user to review the protected screenshot
    const confirmed = confirm(
        "Have you checked that all sensitive information " +
        "is properly hidden?\n\n" +
        "Click OK to download or Cancel to review."
    );

    if (!confirmed) {
        statusMessage.textContent =
            "Download cancelled. Review your screenshot.";
        return;
    }

    // Convert the canvas into a PNG image
    const imageData = canvas.toDataURL("image/png");

    // Create a temporary download link
    const downloadLink = document.createElement("a");

    // Set the image as the download source
    downloadLink.href = imageData;

    
    // Get original screenshot filename
    const originalFile = imageUpload.files[0];

    // Remove the original file extension
    const originalName = originalFile
        ? originalFile.name.replace(/\.[^.]+$/, "")
        : "Screenshot";

    // Create a descriptive download filename
    downloadLink.download =
        `PrivacyLens_Protected_${originalName}.png`;


    // Trigger the download
    downloadLink.click();

    // Update the status message
    statusMessage.textContent =
        "Protected screenshot downloaded successfully!";

});

// STEP 11: OCR Screenshot Scanning

const scanButton =
    document.getElementById("scanButton");

const ocrSection =
    document.getElementById("ocrSection");

const extractedText =
    document.getElementById("extractedText");

const ocrDetectionResult =
    document.getElementById("ocrDetectionResult");

let isScanning = false;

// Scan the uploaded screenshot
scanButton.addEventListener("click", async function () {

    const file = imageUpload.files[0];

    if (!file || isScanning) {
        return;
    }

    isScanning = true;
    scanButton.disabled = true;
    scanButton.textContent = "Scanning...";

    ocrSection.style.display = "block";
    extractedText.textContent = "Reading screenshot...";
    ocrDetectionResult.textContent = "";

    try {

        // Recognize text using Tesseract OCR
       
const result = await Tesseract.recognize(
    file,
    "eng",
    {},
    { text: true, blocks: true }
);


// Request recognized word positions from OCR output



// Detect sensitive regions using complete OCR lines

detectedRegions = findSensitiveRegions(
    result.data.blocks || []
);
console.log("OCR blocks:", result.data.blocks);
console.log("Detected regions:", detectedRegions);
console.log("Region count:", detectedRegions.length);

scannedFile = file;

autoRedactButton.disabled = detectedRegions.length === 0;

console.log("OCR Text:", result.data.text);

console.log("OCR Blocks:", result.data.blocks);

console.log("Detected Regions:", detectedRegions);

console.log("Region Count:", detectedRegions.length);

console.log(
    "Sensitive Information:",
    detectSensitiveInformation(result.data.text)
);


console.log("OCR Blocks:", result.data.blocks);

console.log("Detected Regions:", detectedRegions);

console.log("Number of Regions:", detectedRegions.length);



scannedFile = file;

// Enable Auto-Protect when sensitive regions are found
autoRedactButton.disabled = detectedRegions.length === 0;

console.log("Final Region Count:", detectedRegions.length);
console.log("Button Disabled:", autoRedactButton.disabled);



        // Get the recognized text
        
const text = result.data.text;

// Split OCR text into individual lines
const lines = text.split("\n");

// Keep only lines containing sensitive information

const sensitiveLines = lines.filter(function (line) {

    const result = detectSensitiveInformation(line);

    return (
        result.emails.length > 0 ||
        result.phones.length > 0 ||
        result.aadhaar.length > 0 ||
        result.pan.length > 0
    );

});

// Display only sensitive lines
extractedText.textContent =
    sensitiveLines.length > 0
        ? sensitiveLines.join("\n")
        : "No sensitive information detected.";


        // Use our existing detection functions
        
const detection = detectSensitiveInformation(text);
console.log("PAN detected by OCR:", detection.pan);

const emailCount = detection.emails.length;
const phoneCount = detection.phones.length;
const aadhaarCount = detection.aadhaar.length;
const panCount = detection.pan.length;

ocrDetectionResult.textContent =
    `Detected ${emailCount} email(s), ` +
    `${phoneCount} phone number(s), ` +
    `${aadhaarCount} Aadhaar number(s), and ` +
    `${panCount} PAN number(s).`;


        statusMessage.textContent =
            "Screenshot scan completed!";

    } catch (error) {

        console.error("OCR Error:", error);

        extractedText.textContent =
            "Unable to scan screenshot.";

        statusMessage.textContent =
            "OCR scanning failed. Please try again.";

    } finally {

        isScanning = false;
        scanButton.textContent = "Scan Screenshot";
        scanButton.disabled = !imageUpload.files[0];

    }

});


// STEP 12: Automatically Redact Sensitive Information


autoRedactButton.addEventListener("click", function () {

    console.log("Auto-Protect clicked!");
    console.log("Regions:", detectedRegions);

    if (detectedRegions.length === 0) {
        statusMessage.textContent =
            "No sensitive regions found. Scan first.";
        return;
    }

    if (scannedFile !== imageUpload.files[0]) {
        statusMessage.textContent =
            "Please scan the current screenshot first.";
        return;
    }

    // Remove any manual selection outline
    if (selection && savedImage) {
        ctx.putImageData(savedImage, 0, 0);
    }

    // Draw black rectangles over sensitive regions
    detectedRegions.forEach(function (box) {

        console.log("Redacting box:", box);

        const padding = 5;

        const x = Math.max(0, box.x0 - padding);
        const y = Math.max(0, box.y0 - padding);

        const width = Math.min(
            canvas.width - x,
            box.x1 - box.x0 + padding * 2
        );

        const height = Math.min(
            canvas.height - y,
            box.y1 - box.y0 + padding * 2
        );

        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y, width, height);

    });

    selection = null;
    savedImage = null;

    blurButton.disabled = true;
    downloadButton.disabled = false;

autoRedactButton.disabled = true;

    statusMessage.textContent =
        "Auto-Protect applied. Review the protected screenshot.";

});

// STEP 13: Find sensitive regions in OCR results


function findSensitiveRegions(blocks) {

    const regions = [];

    blocks.forEach(function (block) {
        (block.paragraphs || []).forEach(function (paragraph) {
            (paragraph.lines || []).forEach(function (line) {

                const words = line.words || [];
                const positions = [];
                let lineText = "";

                // Record the text and position of each OCR word
                words.forEach(function (word) {

                    if (lineText.length > 0) {
                        lineText += " ";
                    }

                    const start = lineText.length;
                    lineText += word.text;
                    const end = lineText.length;

                    positions.push({
                        start: start,
                        end: end,
                        bbox: word.bbox
                    });
                });

                // Patterns for email and Indian phone numbers
                
const patterns = [

    // Email addresses
    /\b[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\s*\.\s*[A-Z]{2,}\b/gi,

    // Indian mobile numbers
    /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g,

    // Aadhaar number formats
// Aadhaar: 12 digits, allowing spaces or hyphens
/(?<!\d)[2-9](?:[\s-]*\d){11}(?!\d)/g,

// Indian PAN number format
/\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi



];


                patterns.forEach(function (pattern) {

                    for (const match of lineText.matchAll(pattern)) {

                        const matchStart = match.index;
                        const matchEnd = matchStart + match[0].length;

                        // Find only words belonging to the sensitive value
                        const matchingWords = positions.filter(function (word) {
                            return (
                                word.bbox &&
                                word.start < matchEnd &&
                                word.end > matchStart
                            );
                        });

                        if (matchingWords.length === 0) {
                            continue;
                        }

                        // Create a box around only the matched words
                        regions.push({
                            x0: Math.min(...matchingWords.map(w => w.bbox.x0)),
                            y0: Math.min(...matchingWords.map(w => w.bbox.y0)),
                            x1: Math.max(...matchingWords.map(w => w.bbox.x1)),
                            y1: Math.max(...matchingWords.map(w => w.bbox.y1))
                        });
                    }
                });
            });
        });
    });



    return regions;
}
hideSelectionButton.addEventListener("click", function () {

    // Make sure an area is selected
    if (!selection || !savedImage) {
        return;
    }

    // Remove the blue selection outline
    ctx.putImageData(savedImage, 0, 0);

    // Get selected area coordinates
    const { x, y, width, height } = selection;

    // Cover selected area with black
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, width, height);

    // Clear selection
    selection = null;
    savedImage = null;

    // Disable selection buttons
    hideSelectionButton.disabled = true;
    blurButton.disabled = true;

    // Enable download
    downloadButton.disabled = false;

    // Show success message
    statusMessage.textContent =
        "Selected area hidden successfully!";

});

async function checkBackendConnection() {
    try {
        const response = await fetch("http://localhost:18080/api/status");

        if (!response.ok) {
            throw new Error("Backend returned an error");
        }

        const data = await response.json();

        console.log("Backend Status:", data.status);
        console.log("Backend Message:", data.message);

    } catch (error) {
        console.error("Backend connection failed:", error);
    }
}


let isCppDetecting = false;

async function testCppDetection() {

    // Prevent multiple requests at once
    if (isCppDetecting) {
        return;
    }

    isCppDetecting = true;

    const detectButton = document.getElementById("detectButton");

    if (detectButton) {
        detectButton.disabled = true;
        detectButton.textContent = "Detecting...";
    }

    try {


const loadingResult = document.getElementById("cppDetectionResult");

if (loadingResult) {
    loadingResult.style.display = "block";
    loadingResult.style.backgroundColor = "";
    loadingResult.style.borderColor = "";
    loadingResult.style.color = "";
    loadingResult.textContent = "Analyzing sensitive information...";
}

        const response = await fetch(
            "http://localhost:18080/api/detect",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                
body: JSON.stringify({
    text: document.getElementById("testText").value
})

            }
        );

        if (!response.ok) {
            throw new Error("Detection request failed");
        }

        
const data = await response.json();

// Log only the detection count, not sensitive values
console.log("C++ Detection Count:", data.count);


const cppResult = document.getElementById("cppDetectionResult");




if (cppResult) {
    cppResult.style.display = "block";

    if (data.count === 0) {
        cppResult.textContent =
            "No sensitive information detected by the C++ backend.";
    } else {
        let resultText =
            `C++ Backend detected ${data.count} sensitive information item(s).\n\n`;

        data.matches.forEach((item, index) => {
            resultText +=
                `${index + 1}. ${item.type}: ${item.value}\n`;
        });

        cppResult.textContent = resultText;
    }
}



    
    
} catch (error) {

    console.error("C++ Detection Error:", error);

    const cppResult =
        document.getElementById("cppDetectionResult");

if (cppResult) {
    // Restore the original CSS styling
    cppResult.style.backgroundColor = "";
    cppResult.style.borderColor = "";
    cppResult.style.color = "";
}


    if (cppResult) {
        cppResult.style.display = "block";

        cppResult.textContent =
            "Unable to connect to the C++ backend. Please make sure the server is running.";

        cppResult.style.backgroundColor = "#fff1f2";
        cppResult.style.borderColor = "#fda4af";
        cppResult.style.color = "#be123c";
    }

    }


finally {
    isCppDetecting = false;

    if (detectButton) {
        detectButton.disabled = false;
        detectButton.textContent = "Detect Sensitive Information";
    }
}
}

// Make the function accessible from the browser console
window.testCppDetection = testCppDetection;

// Check backend connection when the page loads
checkBackendConnection();

