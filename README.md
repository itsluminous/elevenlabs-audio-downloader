## ElevenLabs Stream Capturer

A lightweight Chrome Extension that intercepts, buffers, and merges real-time audio streams from ElevenLabs.io into a single, high-quality MP3 file. No need to login now.

---

### Features

* **Real-time Interception:** Hooks into the browser's `fetch` API to capture streaming fragments before they are even played.
* **Intelligent Buffering:** Uses in-memory binary concatenation to prevent audio choppiness or skips.
* **UI Status Indicators:**
* **Blue Badge:** Displays a live count of audio chunks being captured.
* **Green Download Icon (`↓`):** Signals that the stream is complete and the file is ready.



---

### ⚠️ Important: Download Behavior

* **Partial Downloads:** If you click the extension icon while the **Blue counter** is still increasing, the extension will generate and download an MP3 containing only the audio captured up to that millisecond.
* **Complete Downloads:** For the full generation, wait until the badge turns **Green (`↓`)** before clicking.
* **Automatic Reset:** Once you click the icon (whether for a partial or full file), the internal buffer is cleared to make room for the next generation.

---

### Installation

1. **Download/Clone** the project files into a local folder.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the folder.

---

### Usage

1. Navigate to elevenlabs website.
2. Input your text and click **Generate**.
3. **Watch the Badge:**
* **Blue + Number:** Capturing in progress...
* **Green + `↓`:** Stream complete.


4. Click the icon to save your MP3.

---

### Technical Architecture

The extension navigates the "Isolated World" security model of Chrome by using a three-tier communication bridge:

* **Main World (`pageScript.js`):** Injected directly into the page to monkey-patch `window.fetch`. It intercepts the `ReadableStream` and parses the Server-Sent Events (SSE).
* **Isolated World (`content.js`):** Acts as a secure relay, passing base64 chunks from the page to the extension's background process.
* **Service Worker (`background.js`):** Managed in-memory buffer. It converts base64 strings into `Uint8Array` fragments and joins them into a single `Blob` for the final download.

---

### Troubleshooting

* **Choppy Audio?** Ensure you don't have other extensions that manipulate network requests active on the ElevenLabs tab.
* **No Badge Appearing?** Refresh the ElevenLabs page after installing or updating the extension to ensure the capture script is properly injected.

---

### File Manifest

* `manifest.json`: Configuration and permissions.
* `pageScript.js`: Fetch-interception logic (Main World).
* `content.js`: Bridge between the page and extension.
* `background.js`: Storage management and MP3 assembly.

