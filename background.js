let audioQueue = [];
let isActive = false;

// Keeps the Service Worker alive during long streams
function updateState(capturing) {
    isActive = capturing;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "store_chunk") {
        updateState(true);
        audioQueue.push(message.chunk);
        
        // Show count in Blue while streaming
        chrome.action.setBadgeText({ text: audioQueue.length.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#3498db" });
    }

    if (message.action === "stream_finished") {
        updateState(false);
        // Show the green download arrow when done
        chrome.action.setBadgeText({ text: " ↓ " });
        chrome.action.setBadgeBackgroundColor({ color: "#2ecc71" });
    }
});

chrome.action.onClicked.addListener((tab) => {
    if (audioQueue.length === 0) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => alert("Nothing to download yet! Generate audio first.")
        });
        return;
    }

    try {
        // Convert base64 chunks to raw binary bytes
        const binaryData = audioQueue.map(b64 => {
            const binaryString = atob(b64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        });

        // Create Blob from byte arrays
        const blob = new Blob(binaryData, { type: 'audio/mpeg' });
        const reader = new FileReader();

        reader.onloadend = () => {
            const time = new Date().toLocaleTimeString().replace(/[:\s]/g, '-');
            chrome.downloads.download({
                url: reader.result,
                filename: `ElevenLabs_Capture_${time}.mp3`,
                saveAs: true
            });

            // Cleanup
            audioQueue = [];
            chrome.action.setBadgeText({ text: "" });
        };
        reader.readAsDataURL(blob);
    } catch (err) {
        console.error("Assembly Error:", err);
    }
});