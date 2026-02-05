const axios = require('axios');

async function register() {
    try {
        const res = await axios.post('http://localhost:5001/register-app', {
            app_name: "Shopping Demo App",
            package_name: "com.example.shopping"
        });
        console.log("APP_ID=" + res.data.app_id);
        console.log("API_KEY=" + res.data.api_key);
    } catch (e) {
        console.error(e);
    }
}
register();
