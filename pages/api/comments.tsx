import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureSheetExists, appendRowsToSheet, getSheetValues } from '../../libs/googlesheet';
import { SHEET_COMENTARIOS } from '../../libs/utils/const';


// Tipo de comentario
interface Comentario {
  element_id: string;
  tipo?: string;
  texto: string;
  usuario: string;
  fecha: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!['GET', 'POST'].includes(method!)) {
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  if (method === 'GET') {
    const { sheetId, elementId } = req.query;

    if (!sheetId) return res.status(400).json({ status: false, error: 'Missing sheetId' });
    if (!elementId) return res.status(400).json({ status: false, error: 'Missing elementId' });

    try {
      const rows = await getSheetValues(sheetId as string, SHEET_COMENTARIOS);

      // Si la hoja no tiene filas o no existe, devolvemos array vacío
      if (!rows || rows.length === 0) return res.status(200).json({ status: true, data: [] });

      const comentarios: Comentario[] = rows
        .filter(row => String(row[0]) === String(elementId))
        .map(row => ({
          element_id: row[0],
          tipo: row[1],
          texto: row[2],
          fecha: row[3],
          usuario: row[4],
        }));


      return res.status(200).json({ status: true, data: comentarios });
    } catch (err: any) {
      // Captura si la hoja no existe
      if (err?.message?.includes('Unable to parse range')) {
        console.warn('La hoja de comentarios no existe todavía:', SHEET_COMENTARIOS);
        return res.status(200).json({ status: true, data: [] });
      }
      console.error('Error cargando comentarios', err);
      return res.status(500).json({ status: false, error: 'Error reading sheet' });
    }
  }

  if (method === 'POST') {
    const { sheetId, elementId, tipo, texto, usuario } = req.body;

    if (!sheetId) return res.status(400).json({ status: false, error: 'Missing sheetId' });
    if (!elementId || !texto || !usuario) {
      return res.status(400).json({ status: false, error: 'Missing required fields' });
    }

    try {
      const newComentario = [
        String(elementId),
        tipo || '',
        String(texto),
        new Date().toISOString(),
        String(usuario),
      ];

      await ensureSheetExists(sheetId, SHEET_COMENTARIOS, [
        'element_id', 'tipo', 'texto', 'fecha', 'usuario'
      ]);

      await appendRowsToSheet(sheetId, SHEET_COMENTARIOS, [newComentario]);

      return res.status(200).json({
        status: true,
        data: {
          element_id: newComentario[0],
          tipo: newComentario[1],
          texto: newComentario[2],
          fecha: newComentario[3],
          usuario: newComentario[4],
        },
      });
    } catch (err) {
      console.error('Error guardando comentario', err);
      return res.status(500).json({ status: false, error: 'Error saving comment' });
    }
  }
}