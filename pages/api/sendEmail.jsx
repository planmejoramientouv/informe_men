import { sendEmail } from '../../libs/server/mail/sendEmail';

function normalizeToList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  try {
    const {
      to,
      cc = [],
      bcc = [],
      subject,
      html,
      body,
      from,
    } = req.body || {};

    const toList = normalizeToList(to);
    const htmlBody = html || body;

    const result = await sendEmail({
      to: toList,
      cc,
      bcc,
      subject,
      html: htmlBody,
      from,
    });

    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error('[api/sendEmail] error:', error);
    return res.status(500).json({
      status: false,
      error: error?.message || 'Internal Server Error',
    });
  }
}