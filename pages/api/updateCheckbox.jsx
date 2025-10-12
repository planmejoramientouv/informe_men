// pages/api/updateCheckbox.jsx
import { updateCheckbox } from '../../libs/googlesheet';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    const { sheetId, gid, data, row_ } = req.body || {};
    if (!sheetId || !gid || !Array.isArray(data) || !row_) {
      return res.status(400).json({ status: false, error: 'Missing sheetId/gid/data/row_' });
    }

    const ok = await updateCheckbox({ sheetId, gid, data, row_ }); // ← usa row_ (G)
    return res.status(200).json({ status: !!ok });
  } catch (e) {
    console.error('[api/updateCheckbox] err:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}
