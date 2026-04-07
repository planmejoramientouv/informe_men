import { google } from 'googleapis';

function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

let cached = null;

export function getGmailClient() {
  if (cached) return cached;

  const clientId = requireEnv('GMAIL_CLIENT_ID');
  const clientSecret = requireEnv('GMAIL_CLIENT_SECRET');
  const refreshToken = requireEnv('GMAIL_REFRESH_TOKEN');
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground';

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  cached = google.gmail({ version: 'v1', auth: oAuth2Client });
  return cached;
}

export function getMailSender() {
  return (
    process.env.GMAIL_SENDER ||
    process.env.GMAIL_FROM ||
    process.env.PLAN_MEJORAMIENTO_EMAIL ||
    'plan.mejoramiento@correounivalle.edu.co'
  );
}