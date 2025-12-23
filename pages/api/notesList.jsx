import { getSheetValues } from '../../libs/googlesheet';
import { SHEET_NOTAS } from '../../libs/utils/const';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  const { sheetId, elementId } = req.query;

  if (!sheetId || !elementId) {
    return res.status(400).json({ status: false, error: 'Missing sheetId or elementId' });
  }

  try {
    let rows = [];
    try {
      rows = await getSheetValues(sheetId, SHEET_NOTAS);
    } catch (err) {
      // Si la hoja no existe o el rango es inválido, devolvemos array vacío
      if (err?.errors?.some(e => e.reason === 'badRequest' && e.message.includes('Unable to parse range'))) {
        console.warn(`La hoja "${SHEET_NOTAS}" no existe o no se puede leer. Se devuelve array vacío.`);
        rows = [];
      } else {
        throw err;
      }
    }

    if (!rows || rows.length <= 1) {
      return res.status(200).json({ status: true, data: [] });
    }

    const [, ...data] = rows;

    const notas = data
      .map(r => ({
        element_id: r[0],
        tipo: r[1],
        archivo: r[2] || '', // ← valor por defecto
        paginas: r[3] || '', // ← valor por defecto
        fecha: r[4] || '',
        usuario: r[5] || '',
      }))
      .filter(r => String(r.element_id) === String(elementId) && r.tipo === 'NOTA');

    return res.status(200).json({ status: true, data: notas });
  } catch (e) {
    console.error('[api/notesList] ERROR:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal error' });
  }
}
