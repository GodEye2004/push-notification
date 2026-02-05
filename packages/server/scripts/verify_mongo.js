const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function runTest() {
    try {
        // 1. Register App
        console.log('--- Registering App ---');
        const appRes = await axios.post(`${BASE_URL}/register-app`, {
            app_name: "Test MongoDB App",
            package_name: "com.mongo.test"
        });
        console.log('App Response:', appRes.data);
        const { app_id, api_key } = appRes.data;

        // 2. Register Device
        console.log('\n--- Registering Device ---');
        const devRes = await axios.post(`${BASE_URL}/register-device`, {
            app_id,
            device_id: "device_mongo_1",
            platform: "android",
            push_token: "socket_id_123"
        });
        console.log('Device Response:', devRes.data);

        // 3. Send Notification
        console.log('\n--- Sending Notification ---');
        const sendRes = await axios.post(`${BASE_URL}/send-notification`, {
            app_id,
            api_key,
            targets: [],
            type: "all",
            value: "",
            notification: { title: "Mongo Test", body: "It works!" },
            data: { foo: "bar" }
        });
        console.log('Send Response:', sendRes.data);

        // 4. Check Status/History
        console.log('\n--- Checking Status ---');
        const statusRes = await axios.get(`${BASE_URL}/api/status`);
        const history = statusRes.data.history;
        const lastMsg = history[0];

        if (lastMsg.app_id === app_id && lastMsg.notification.title === "Mongo Test") {
            console.log('SUCCESS: Verification Passed!');
        } else {
            console.error('FAILURE: Notification not found in history.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
