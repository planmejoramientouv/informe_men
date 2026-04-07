import { getGmailClient, getMailSender } from './gmailClient';

function uniqEmails(input) {
  const arr = Array.isArray(input) ? input : [input];
  const clean = arr
    .map((x) => String(x || '').trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(clean));
}

function buildRawMessage({ from, to, cc, bcc, subject, html }) {
  const encodedSubject = `=?UTF-8?B?${Buffer.from(String(subject || ''), 'utf8').toString('base64')}?=`;
  const headers = [
    `From: ${from}`,
    `To: ${to.join(', ')}`,
    cc.length ? `Cc: ${cc.join(', ')}` : '',
    bcc.length ? `Bcc: ${bcc.join(', ')}` : '',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    `Subject: ${encodedSubject}`,
  ].filter(Boolean);

  const message = [...headers, '', html].join('\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendEmail({
  to,
  cc = [],
  bcc = [],
  subject,
  html,
  from,
}) {
  const toList = uniqEmails(to);
  const ccList = uniqEmails(cc);
  const bccList = uniqEmails(bcc);

  if (toList.length === 0) throw new Error('At least one recipient is required in "to".');
  if (!subject || String(subject).trim() === '') throw new Error('Missing "subject".');
  if (!html || String(html).trim() === '') throw new Error('Missing "html".');

  const gmail = getGmailClient();
  const sender = String(from || getMailSender()).trim();

  const raw = buildRawMessage({
    from: sender,
    to: toList,
    cc: ccList,
    bcc: bccList,
    subject: String(subject).trim(),
    html: String(html),
  });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return {
    ok: true,
    id: response?.data?.id || null,
    threadId: response?.data?.threadId || null,
    recipients: {
      to: toList,
      cc: ccList,
      bcc: bccList,
    },
  };
}