// pages/api/sendEmail.jsx
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_CLIENT_ID_GOOGLE,
      process.env.NEXT_PUBLIC_API_KEY,
      "https://developers.google.com/oauthplayground" // redirect_uri
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=UTF-8',
      `Subject: ${subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
