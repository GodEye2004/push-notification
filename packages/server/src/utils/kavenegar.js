const Kavenegar = require('kavenegar');

class KavenegarService {
    constructor() {
        this.apiKey = process.env.KAVENEGAR_API_KEY;
        this.api = this.apiKey ? Kavenegar.KavenegarApi({ apikey: this.apiKey }) : null;
    }

    async sendOTP(phone, code) {
        if (!this.api) {
            console.warn(`[Kavenegar] API Key not set. SMS NOT SENT. Phone: ${phone}, Code: ${code}`);
            return true; // Simulate success in dev without key
        }

        return new Promise((resolve, reject) => {
            this.api.VerifyLookup({
                receptor: phone,
                token: code,
                template: process.env.KAVENEGAR_TEMPLATE || 'verify'
            }, (response, status) => {
                if (status === 200) {
                    resolve(response);
                } else {
                    reject(new Error(`Kavenegar error: ${status}`));
                }
            });
        });
    }
}

module.exports = new KavenegarService();
