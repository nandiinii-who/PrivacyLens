
# PrivacyLens
### Smart Screenshot Privacy Protection System

PrivacyLens is a web application designed to detect and protect sensitive information in screenshots before sharing them.

## Features
- Screenshot upload (PNG and JPEG)
- OCR-based text extraction
- Sensitive information detection
- Automatic screenshot redaction
- Manual blur and hide tools
- Before-and-after image preview
- Download protected screenshots
- C++ backend integration

## Sensitive Information Detection
PrivacyLens currently detects:
- Email addresses
- Indian mobile numbers
- PAN card number patterns
- Aadhaar-like number patterns

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript
- Tesseract.js for OCR
- Canvas API for image editing

### Backend
- C++17
- Crow Web Framework
- Regular Expressions (Regex)
- JSON-based REST API

## How It Works
1. User uploads a screenshot.
2. Tesseract.js extracts text from the image.
3. JavaScript identifies sensitive information.
4. The user can automatically redact detected areas.
5. The user can manually blur or hide additional areas.
6. The protected screenshot can be downloaded.

The C++ backend separately provides sensitive-text detection through the `/api/detect` endpoint.

## Backend API

GET /api/status
- Checks backend connectivity.

POST /api/detect
- Accepts text in JSON format.
- Returns detected sensitive information.

## Running the Project

### Backend
From the backend folder:

clang++ -std=c++17 main.cpp -o privacylens \
-I/opt/homebrew/include \
-I/opt/homebrew/opt/crow/include \
-pthread && ./privacylens

Backend runs at:
http://localhost:18080

### Frontend
Open the frontend using a local development server.

## Limitations
- Detection uses regex patterns and may produce false positives.
- OCR accuracy depends on screenshot quality.
- Pattern matching does not verify official identity numbers.
- Screenshot OCR and redaction currently run in JavaScript.

## Future Improvements
- Integrate OCR results directly with the C++ backend.
- Improve detection accuracy and validation.
- Add more sensitive information categories.
- Strengthen privacy and security protections.
