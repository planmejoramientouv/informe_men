import {
  ensureSheetExists,
  appendRowsToSheet,
  getSheetValues,
} from '../../libs/googlesheet';

import { SHEET_NOTAS, SHEET_COMENTARIOS } from '../../libs/utils/const';

export default async function handler(req, res) {
  try {
    /* =====================================================
       📥 GET → LISTAR NOTAS / COMENTARIOS
    ====================================================== */
    if (req.method === 'GET') {
      const { sheetId, elementId, tipo } = req.query;

      if (!sheetId || !elementId || !tipo) {
        return res.status(400).json({
          status: false,
          error: 'Missing query params',
        });
      }

      const sheetName = tipo === 'NOTA' ? SHEET_NOTAS : SHEET_COMENTARIOS;

      // Leer toda la hoja
      const rows = await getSheetValues(sheetId, sheetName);

      if (!rows || rows.length <= 1) {
        return res.status(200).json({ status: true, data: [] });
      }

      // Quitar encabezados
      const [, ...data] = rows;

      const notas = data
        .map((r) => {
          if (tipo === 'NOTA') {
            return {
              element_id: r[0],
              tipo: r[1],
              archivo: r[2],
              paginas: r[3],
              fecha: r[4],
              usuario: r[5],
            };
          } else {
            return {
              element_id: r[0],
              tipo: r[1],
              texto: r[2],
              fecha: r[3],
              usuario: r[4],
            };
          }
        })
        .filter(
          (r) =>
            String(r.element_id) === String(elementId) &&
            r.tipo === tipo
        );

      return res.status(200).json({ status: true, data: notas });
    }

    /* =====================================================
       📤 POST → GUARDAR NOTA / COMENTARIO
    ====================================================== */
    if (req.method === 'POST') {
      const { sheetId, tipo, rows } = req.body;

      if (!sheetId || !tipo || !Array.isArray(rows)) {
        return res.status(400).json({ status: false, error: 'Missing data' });
      }

      let filasValidas = [];

      if (tipo === 'NOTA') {
        // Validar notas: archivo y paginas obligatorios
        filasValidas = rows.filter((r) => r?.archivo && r?.paginas);
        if (filasValidas.length === 0) {
          return res.status(400).json({ status: false, error: 'Archivo o páginas vacías' });
        }
      } else {
        // Validar comentarios: texto obligatorio
        filasValidas = rows.filter((r) => r?.texto && String(r.texto).trim().length > 0);
        if (filasValidas.length === 0) {
          return res.status(400).json({ status: false, error: 'Texto vacío no permitido' });
        }
      }

      const sheetName = tipo === 'NOTA' ? SHEET_NOTAS : SHEET_COMENTARIOS;

      // Columnas según tipo
      const columns = tipo === 'NOTA'
        ? ['element_id', 'tipo', 'archivo', 'paginas', 'fecha', 'usuario']
        : ['element_id', 'tipo', 'texto', 'fecha', 'usuario'];

      await ensureSheetExists(sheetId, sheetName, columns);

      const values = filasValidas.map((r) =>
        tipo === 'NOTA'
          ? [r.element_id, r.tipo, r.archivo, r.paginas, r.fecha, r.usuario]
          : [r.element_id, r.tipo, r.texto, r.fecha, r.usuario]
      );

      await appendRowsToSheet(sheetId, sheetName, values);

      return res.status(200).json({ status: true });
    }

    /* ===================================================== */
    return res.status(405).json({ status: false });
  } catch (e) {
    console.error('[api/notes] ERROR:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal error' });
  }
}
