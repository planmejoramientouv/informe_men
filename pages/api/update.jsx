// pages/api/update.jsx
import { updateDataField } from '../../libs/googlesheet';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    const { sheetId, gid, data } = req.body || {};
    if (!sheetId || !gid || !Array.isArray(data)) {
      return res.status(400).json({ status: false, error: 'Missing sheetId/gid/data' });
    }

    const ok = await updateDataField({ sheetId, gid, data });
    return res.status(200).json({ status: !!ok });
  } catch (e) {
    console.error('[api/update] err:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}
