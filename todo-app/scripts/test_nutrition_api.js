import http from 'http';

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
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

async function testNutrition() {
    console.log("Starting Nutrition API Test (Simplified)...");

    try {
        // 1. Get/Create Player via Public Route
        console.log("Fetching Player...");
        const playerRes = await makeRequest('/api/player/TestPlayer_' + Date.now(), 'GET');

        let player;
        if (playerRes.status === 200) {
            player = playerRes.body;
            console.log("Player obtained:", player.name, "ID:", player._id);
        } else {
            console.error("Failed to get player:", playerRes.body);
            return;
        }

        // 2. Add Food
        console.log("Adding Food...");
        const foodData = {
            playerId: player._id,
            name: "Test Apple Simplified",
            calories: 95,
            protein: 0,
            carbs: 25,
            fat: 0
        };

        const res = await makeRequest('/api/health/nutrition', 'POST', foodData);
        console.log("Nutrition Response:", JSON.stringify(res.body, null, 2));

        if (res.status === 200 && res.body.log) {
            console.log("TEST PASSED: Nutrition log created.");
        } else {
            console.error("TEST FAILED: Nutrition log not created.");
        }

    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

testNutrition();
