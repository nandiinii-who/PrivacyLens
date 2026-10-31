
// PrivacyLens - Sensitive Information Detection

// Detect email addresses
function detectEmails(text) {

    const emailPattern =
        /\b[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\s*\.\s*[A-Z]{2,}\b/gi;

    return text.match(emailPattern) || [];
}


// Detect Indian mobile phone numbers
function detectPhoneNumbers(text) {

    
const phoneRegex = /(?<!\d)(?:(?:\+91|91)[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g;


    return text.match(phoneRegex) || [];
}


// Detect Aadhaar number formats
function detectAadhaarNumbers(text) {

    
const aadhaarRegex = /(?<!\d)[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}(?!\d)/g;


    return text.match(aadhaarRegex) || [];
}


// Detect Indian PAN number formats
function detectPANNumbers(text) {

    
const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi;


    return text.match(panRegex) || [];
}

// Combine all detection results

function detectSensitiveInformation(text) {

    return {
        emails: detectEmails(text),
        phones: detectPhoneNumbers(text),
        aadhaar: detectAadhaarNumbers(text),
        pan: detectPANNumbers(text)
    };

}

document.getElementById("detectButton")
    .addEventListener("click", function () {

        const text = document.getElementById("testText").value;

        const result = detectSensitiveInformation(text);
        window.testCppDetection();

const totalDetected =
    result.emails.length +
    result.phones.length +
    result.aadhaar.length +
    result.pan.length;

if (totalDetected === 0) {
    document.getElementById("detectionResult").textContent =
        "No sensitive information detected.";
    return;
}
        
const resultContainer =
    document.getElementById("detectionResult");

const categories = [
    { label: "Emails", values: result.emails },
    { label: "Phone Numbers", values: result.phones },
    { label: "Aadhaar Numbers", values: result.aadhaar },
    { label: "PAN Numbers", values: result.pan }
];

resultContainer.replaceChildren();

const summary = document.createElement("div");
summary.className = "detectionSummary";

summary.textContent =
    `${totalDetected} sensitive information match(es) detected`;

resultContainer.appendChild(summary);


categories.forEach(category => {

    if (category.values.length === 0) return;

    const card = document.createElement("div");
    card.className = "detectionCard";

    const heading = document.createElement("strong");
    heading.textContent = category.label;

    const value = document.createElement("p");
    value.textContent = category.values.join(", ");

    card.append(heading, value);

    resultContainer.appendChild(card);
    });

document.getElementById("clearDetectionButton")
    .addEventListener("click", function () {

        document.getElementById("testText").value = "";

        document.getElementById("detectionResult")
            .replaceChildren();

    // Clear and hide C++ backend detection results
    const cppResult = document.getElementById("cppDetectionResult");

    if (cppResult) {
        cppResult.textContent = "";
        cppResult.style.display = "none";
    }


    });

});
