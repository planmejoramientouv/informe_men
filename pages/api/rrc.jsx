// pages/api/rrc.jsx
import { getFieldRRC } from '../../libs/googlesheet';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ status: false, error: `Method ${req.method} Not Allowed` });
    }

    // POST → body, GET → query
    const sheetId = req.method === 'POST' ? req.body?.sheetId : req.query?.sheetId;
    const gid     = req.method === 'POST' ? req.body?.gid     : req.query?.gid;

    if (!sheetId || !gid) {
      return res.status(400).json({ status: false, error: 'Missing sheetId or gid' });
    }

    const data = await getFieldRRC({ sheetId, gid }); // ← lee del archivo propio
    return res.status(200).json({ status: true, data });
  } catch (e) {
    console.error('[api/rrc] error:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}
