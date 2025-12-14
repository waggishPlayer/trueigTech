const https = require('https');

const URL = 'https://trueigtech.onrender.com/';

function ping() {
    console.log(`[${new Date().toISOString()}] Pinging ${URL} to keep it alive...`);

    https.get(URL, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('Server is active.');
        } else {
            console.log('Server responded with non-200 status.');
        }
    }).on('error', (e) => {
        console.error(`Error pinging server: ${e.message}`);
    });
}

// Ping immediately on start
ping();

// Schedule ping every 10 minutes (10 * 60 * 1000 ms)
const INTERVAL = 10 * 60 * 1000;
setInterval(ping, INTERVAL);

console.log(`Keep-alive script started. Accessing ${URL} every 10 minutes.`);
