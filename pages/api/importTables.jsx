// pages/api/importTables.jsx
import { importTablesFromLinks } from '../../libs/googlesheet';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res
        .status(405)
        .json({ status: false, error: 'Method not allowed. Use POST.' });
    }

    const { spreadsheetId, gid } = req.body || {};

    if (!spreadsheetId) {
      return res
        .status(400)
        .json({ status: false, error: 'Missing "spreadsheetId" in body.' });
    }

    if (!gid) {
      return res
        .status(400)
        .json({ status: false, error: 'Missing "gid" in body.' });
    }

    const data = await importTablesFromLinks({
      spreadsheetId,
      gid,
      // keepRows: puedes omitir, usa el arreglo por defecto 49..204
    });

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (e) {
    console.error('Error en /api/importTables:', e);
    return res
      .status(500)
      .json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}
