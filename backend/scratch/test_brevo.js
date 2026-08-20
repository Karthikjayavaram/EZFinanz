import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const apiKey = process.env.BREVO_API_KEY?.trim();
const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'EZFINANZ';

console.log('Testing Brevo with:', {
  apiKeyExists: !!apiKey,
  apiKeyPrefix: apiKey?.substring(0, 15),
  senderEmail,
  senderName
});

async function testBrevo() {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail.includes('@example.com') ? senderEmail.replace('@example.com', '@gmail.com') : senderEmail
        },
        to: [{ email: 'karthik.virat22042005@gmail.com' }],
        subject: 'Test EZFINANZ Email Verification OTP',
        htmlContent: '<p>Testing Brevo real delivery: <strong>123456</strong></p>'
      })
    });

    const status = res.status;
    const body = await res.text();
    console.log('Brevo Response Status:', status);
    console.log('Brevo Response Body:', body);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testBrevo();
