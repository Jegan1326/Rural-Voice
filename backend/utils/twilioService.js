const twilio = require('twilio');

const sendSMS = async (to, body) => {
    // Check if Twilio credentials are configured and not placeholder values
    const isTwilioConfigured = process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER &&
        process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_sid' &&
        process.env.TWILIO_ACCOUNT_SID.startsWith('AC');

    if (!isTwilioConfigured) {
        console.warn('Twilio credentials not configured. SMS not sent.');
        return;
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to // Ensure 'to' number is in E.164 format (e.g., +919876543210)
        });
        console.log(`SMS sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error.message);
    }
};

module.exports = sendSMS;
