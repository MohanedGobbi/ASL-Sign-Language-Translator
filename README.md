# ASL Sign Language Translator

A real-time American Sign Language (ASL) fingerspelling translator built as a modern web application. The application uses your webcam to detect hand gestures, translates them into text, and reads the translated sentences aloud using text-to-speech.

## Features

- Real-Time ASL Alphabet Recognition: Detects the ASL alphabet (A-Z) using advanced computer vision.
- Hold-to-Confirm: Hold a sign steady for a short duration (0.8s) to confirm and add the letter, preventing accidental inputs.
- Word and Sentence Builder: String letters together to form words, and commit words to build full sentences.
- Text-to-Speech Integration: Uses the browser's native Web Speech API to speak the translated text aloud.
- 100% Local Processing: All AI tracking and processing runs locally in your browser for maximum privacy. No video data is sent to external servers.
- Neobrutalism Design System: Features a bold, high-contrast, modern neobrutalist UI with warm surfaces, thick borders, and offset shadows.

## Technology Stack

- Frontend: HTML, CSS (Vanilla, Neobrutalism Design System), JavaScript (ES6 Modules)
- Hand Tracking: Google MediaPipe Tasks Vision (WebAssembly)
- Build Tool: Vite
- Audio: Web Speech API

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local server address provided by Vite (usually http://localhost:5173).

## How to Use

1. Click "Start Translating" and grant the browser permission to access your camera.
2. Hold your hand in front of the camera and form an ASL letter shape.
3. The AI will highlight your hand and display the detected letter and its confidence score.
4. Hold the sign steady. A progress bar will fill up; once full, the letter is added to your current word.
5. Click "Space" (or the spacebar button in the UI) to commit the word to the sentence.
6. Click "Speak" to have the browser read your sentence aloud.
7. Use the "Backspace" or "Clear" buttons to correct mistakes.

## Accuracy Notes

- Lighting: Ensure you are in a well-lit environment for optimal hand tracking.
- Confusable Letters: Some letters look very similar to the camera (e.g., U and V, M and N). Make sure your hand gestures are clear and deliberate.
- Motion Letters: Letters J and Z typically require motion in ASL. In this static model, they are detected based on their static shape components (similar to I and D respectively).

## License

This project is licensed under the MIT License.
