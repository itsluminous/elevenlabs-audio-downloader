(function() {
    const originalFetch = window.fetch;

    window.fetch = async function(...args) {
        const url = args[0] instanceof Request ? args[0].url : args[0];
        
        // Target the ElevenLabs streaming endpoint
        if (url.includes('elevenlabs.io') && url.includes('/stream')) {
            console.log("%c[Capturer] Stream Intercepted...", "color: #3498db; font-weight: bold;");

            return originalFetch(...args).then(response => {
                const clone = response.clone();
                const reader = clone.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                (async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        
                        if (done) {
                            // Signal background that the stream is complete
                            window.postMessage({ type: "ELEVEN_LABS_DONE" }, "*");
                            console.log("%c[Capturer] Stream finished.", "color: #2ecc71; font-weight: bold;");
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        let parts = buffer.split("\n\n");
                        buffer = parts.pop(); // Hold onto partial JSON

                        for (const part of parts) {
                            const line = part.trim();
                            if (line.includes("audio_base64")) {
                                try {
                                    // Strip 'data:' prefix and parse
                                    const jsonString = line.replace(/^data:/, '').trim();
                                    const data = JSON.parse(jsonString);
                                    if (data.audio_base64) {
                                        window.postMessage({
                                            type: "ELEVEN_LABS_CHUNK",
                                            payload: data.audio_base64
                                        }, "*");
                                    }
                                } catch (e) {
                                    // Skip parsing errors for control messages
                                }
                            }
                        }
                    }
                })();

                return response;
            });
        }

        return originalFetch(...args);
    };

    console.log("[Capturer] Injector Active.");
})();