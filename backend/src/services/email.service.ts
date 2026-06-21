import * as Brevo from '@getbrevo/brevo';
import { config } from '../config/env';
import { logger } from '../config/logger';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevo.apiKey);

interface SendEmailOptions {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

async function sendEmail({ to, toName, subject, htmlContent }: SendEmailOptions) {
  try {
    const email = new Brevo.SendSmtpEmail();
    email.sender = { name: config.brevo.fromName, email: config.brevo.fromEmail };
    email.to = [{ email: to, name: toName }];
    email.subject = subject;
    email.htmlContent = htmlContent;
    await apiInstance.sendTransacEmail(email);
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error('Failed to send email', { err, to, subject });
    throw err;
  }
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${config.frontendUrl}/auth/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Verify your Linguara account',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#6366f1;">Welcome to Linguara</h1>
        <p>Hi ${name}, please verify your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:12px;">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${config.frontendUrl}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Reset your Linguara password',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#6366f1;">Password Reset</h1>
        <p>Hi ${name}, click below to reset your password.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendTranslationCompleteEmail(
  email: string,
  name: string,
  translationId: string,
  confidence: number
) {
  const link = `${config.frontendUrl}/dashboard/history/${translationId}`;
  await sendEmail({
    to: email,
    toName: name,
    subject: 'Your translation is ready — Linguara',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#6366f1;">Translation Complete</h1>
        <p>Hi ${name}, your translation has been verified with a confidence score of <strong>${confidence.toFixed(1)}%</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;">
          View Translation
        </a>
      </div>
    `,
  });
}
