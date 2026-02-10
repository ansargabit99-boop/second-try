import http from 'http';

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testOpenAI() {
    console.log("Testing OpenAI Integration...");

    // 1. Test Chat
    console.log("1. Sending Chat Request...");
    const chatRes = await makeRequest('/api/openai/chat', 'POST', {
        message: "Identify yourself.",
        context: { level: 10, rank: "E" }
    });

    if (chatRes.status === 200 && chatRes.body.reply) {
        console.log("✅ Chat Success: ", chatRes.body.reply);
    } else {
        console.error("❌ Chat Failed: ", chatRes.body);
    }

    // 2. Test TTS
    console.log("\n2. Sending TTS Request...");
    const ttsRes = await makeRequest('/api/openai/speak', 'POST', {
        text: "System check complete."
    });

    if (ttsRes.status === 200 && ttsRes.body.audioUrl) {
        console.log("✅ TTS Success: Audio URL received (length: " + ttsRes.body.audioUrl.length + ")");
    } else {
        console.error("❌ TTS Failed: ", ttsRes.body);
    }
}

testOpenAI();
