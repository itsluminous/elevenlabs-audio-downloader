// Inject the page script to hook into fetch
try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('pageScript.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
} catch (err) {
    console.error("[Capturer] Script injection failed:", err);
}

// Listen for messages from pageScript.js
window.addEventListener("message", (event) => {
    // Security check: only listen to messages from our own window
    if (event.source !== window) return;

    if (event.data?.type === "ELEVEN_LABS_CHUNK") {
        chrome.runtime.sendMessage({ 
            action: "store_chunk", 
            chunk: event.data.payload 
        });
    }

    if (event.data?.type === "ELEVEN_LABS_DONE") {
        chrome.runtime.sendMessage({ 
            action: "stream_finished" 
        });
    }
});