/**
 * Email Notification Service for EZFINANZ
 * Sends transactional notifications to customers for loan approval and rejection.
 */

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

/**
 * Send email using Brevo API or Resend API with graceful fallback.
 */
const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@ezfinanz.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'EZFINANZ';

  // 1. Try Brevo API
  if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent,
          textContent: textContent || subject
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[EmailService:Brevo] Successfully sent email to ${to}. MessageId: ${data.messageId || 'OK'}`);
        return { success: true, provider: 'brevo', data };
      } else {
        console.warn(`[EmailService:Brevo] Brevo returned status ${response.status}:`, data);
      }
    } catch (err) {
      console.error('[EmailService:Brevo] Failed sending via Brevo:', err.message);
    }
  }

  // 2. Try Resend API fallback
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${senderName} <onboarding@resend.dev>`,
          to: [to],
          subject,
          html: htmlContent,
          text: textContent || subject
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[EmailService:Resend] Successfully sent email to ${to}. ID: ${data.id || 'OK'}`);
        return { success: true, provider: 'resend', data };
      } else {
        console.warn(`[EmailService:Resend] Resend returned status ${response.status}:`, data);
      }
    } catch (err) {
      console.error('[EmailService:Resend] Failed sending via Resend:', err.message);
    }
  }

  // 3. Fallback log for local dev / offline mode
  console.log(`[EmailService:LocalFallback] Email intended for ${to} | Subject: ${subject}`);
  return { success: true, provider: 'console_fallback' };
};

/**
 * Send Loan Approved Email
 */
export const sendLoanApprovalEmail = async ({ toEmail, recipientName, applicationNumber, loanAmount, tenure, emi }) => {
  if (!toEmail) return;

  const subject = `Congratulations! Your Loan Application #${applicationNumber || ''} is Approved - EZFINANZ`;
  const name = recipientName || 'Valued Customer';
  const formattedAmount = formatCurrency(loanAmount);
  const formattedEmi = formatCurrency(emi);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f172a; padding: 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-top: 8px; }
        .content { padding: 32px; }
        .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .terms-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .term-row:last-child { border-bottom: none; }
        .term-label { color: #64748b; }
        .term-val { font-weight: 700; color: #0f172a; }
        .button { display: block; text-align: center; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EZFINANZ</h1>
          <div class="badge">Loan Sanctioned & Approved</div>
        </div>
        <div class="content">
          <div class="greeting">Dear ${name},</div>
          <p class="text">
            We are pleased to inform you that your personal loan application <strong>#${applicationNumber || ''}</strong> has been successfully reviewed, sanctioned, and approved by our underwriting team!
          </p>
          
          <div class="terms-box">
            <div class="term-row">
              <span class="term-label">Approved Loan Amount</span>
              <span class="term-val">${formattedAmount}</span>
            </div>
            <div class="term-row">
              <span class="term-label">Repayment Duration</span>
              <span class="term-val">${tenure || 12} Months</span>
            </div>
            <div class="term-row">
              <span class="term-label">Monthly Installment (EMI)</span>
              <span class="term-val" style="color: #2563eb;">${formattedEmi}/month</span>
            </div>
          </div>

          <p class="text">
            The sanctioned loan amount will be electronically transferred to your verified bank account. You can track your loan overview and view your official Sanction Letter directly from your dashboard.
          </p>
        </div>
        <div class="footer">
          © 2026 EZFINANZ Technologies. All rights reserved.<br>
          This is an automated transactional message. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    htmlContent,
    textContent: `Dear ${name}, your loan application #${applicationNumber} for ${formattedAmount} has been approved by EZFINANZ.`
  });
};

/**
 * Send Loan Declined/Rejected Email
 */
export const sendLoanRejectionEmail = async ({ toEmail, recipientName, applicationNumber }) => {
  if (!toEmail) return;

  const subject = `Update Regarding Your Loan Application #${applicationNumber || ''} - EZFINANZ`;
  const name = recipientName || 'Valued Customer';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f172a; padding: 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .badge { display: inline-block; background: #64748b; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-top: 8px; }
        .content { padding: 32px; }
        .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px; font-size: 13px; color: #64748b; line-height: 1.5; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EZFINANZ</h1>
          <div class="badge">Application Update</div>
        </div>
        <div class="content">
          <div class="greeting">Dear ${name},</div>
          <p class="text">
            Thank you for your interest in EZFINANZ and for taking the time to apply for a personal loan with reference <strong>#${applicationNumber || ''}</strong>.
          </p>
          <p class="text">
            After a detailed review of your application against our current internal credit policy and underwriting guidelines, we regret to inform you that we are unable to approve your loan request at this time.
          </p>
          
          <div class="info-box">
            Please note that this decision is based on our automated risk evaluation parameters and does not reflect upon your overall financial standing. You are eligible to submit a fresh application after <strong>90 days</strong>.
          </div>

          <p class="text">
            We appreciate your interest in EZFINANZ and look forward to serving your financial needs in the future.
          </p>
        </div>
        <div class="footer">
          © 2026 EZFINANZ Technologies. All rights reserved.<br>
          This is an automated transactional message. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    htmlContent,
    textContent: `Dear ${name}, we regret to inform you that we are unable to approve your loan application #${applicationNumber} at this time.`
  });
};
