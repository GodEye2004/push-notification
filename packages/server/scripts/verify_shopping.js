const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const APP_ID = "72709c30-fd4c-4ede-a5f8-02d713b67de6"; // Shopping App

async function verifyTrigger() {
    try {
        // 1. Register Mock Device
        console.log('--- Registering Mock Device for Shopping App ---');
        await axios.post(`${BASE_URL}/register-device`, {
            app_id: APP_ID,
            device_id: "mock_device_shop_1",
            platform: "android",
            push_token: "socket_mock_shop_1"
        });
        console.log('Device Registered');

        // 2. Trigger Product
        console.log('\n--- Triggering New Product ---');
        const triggerRes = await axios.get(`${BASE_URL}/api/trigger-product?product_name=SuperGadget`);
        console.log('Trigger Response:', triggerRes.data);

        if (triggerRes.data.status === 'success' && triggerRes.data.product === 'SuperGadget') {
            console.log('SUCCESS: Trigger endpoint worked.');
        } else {
            console.error('FAILURE: Trigger endpoint did not return success.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

verifyTrigger();
