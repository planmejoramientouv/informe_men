import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureSheetExists, appendRowsToSheet, getSheetValues, getFieldRRC } from '../../libs/googlesheet';
import { SHEET_COMENTARIOS } from '../../libs/utils/const';
import { notifyByEvent, NOTIFICATION_EVENTS } from '../../libs/server/notifications/notificationService';

interface Comentario {
  element_id: string;
  tipo?: string;
  texto: string;
  usuario: string;
  fecha: string;
}

function norm(value: any) {
  return String(value ?? '').trim();
}

function toSectionPrefix(groupsFields: any) {
  const s = norm(groupsFields);
  const m = s.match(/^(\d+)/);
  return m ? m[1] : '';
}

function flattenRowsFromGroupData(items: any[] = []) {
  const out: any[] = [];
  for (const item of items) {
    if (!item) continue;
    out.push(item);
    if (Array.isArray(item.data) && item.data.length > 0) {
      out.push(...flattenRowsFromGroupData(item.data));
    }
  }
  return out;
}

async function resolveCommentLabels({ sheetId, gid, elementId, fallbackSectionName }: any) {
  const defaults = {
    sectionName: norm(fallbackSectionName) || 'Seccion sin nombre',
    elementName: norm(elementId),
  };

  if (!norm(sheetId) || !norm(gid) || !norm(elementId)) {
    return defaults;
  }

  try {
    const groups = await getFieldRRC({ sheetId: norm(sheetId), gid: norm(gid) });
    if (!Array.isArray(groups) || groups.length === 0) return defaults;

    const allRows = groups.flatMap((g: any) => {
      const rows = [];
      if (g?.primary) rows.push(g.primary);
      if (Array.isArray(g?.data)) rows.push(...flattenRowsFromGroupData(g.data));
      return rows;
    });

    const target = allRows.find((r: any) => norm(r?.id) === norm(elementId));
    if (!target) return defaults;

    const targetSectionPrefix = toSectionPrefix(target?.groups_fields);
    const sectionPrimary = groups.find((g: any) => {
      const sectionPrefix = toSectionPrefix(g?.primary?.groups_fields);
      return sectionPrefix && targetSectionPrefix && sectionPrefix === targetSectionPrefix;
    })?.primary;

    const sectionName =
      norm(sectionPrimary?.texto) ||
      norm(sectionPrimary?.variables) ||
      defaults.sectionName ||
      `Seccion ${targetSectionPrefix || ''}`.trim();
    const elementName =
      norm(target?.texto) ||
      norm(target?.variables) ||
      defaults.elementName;

    return { sectionName, elementName };
  } catch (err) {
    console.warn('[api/comments] Could not resolve labels from sheet:', err);
    return defaults;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!['GET', 'POST'].includes(method || '')) {
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  if (method === 'GET') {
    const { sheetId, elementId } = req.query;

    if (!sheetId) return res.status(400).json({ status: false, error: 'Missing sheetId' });
    if (!elementId) return res.status(400).json({ status: false, error: 'Missing elementId' });

    try {
      const rows = await getSheetValues(sheetId as string, SHEET_COMENTARIOS);

      if (!rows || rows.length === 0) {
        return res.status(200).json({ status: true, data: [] });
      }

      const comentarios: Comentario[] = rows
        .filter((row) => String(row[0]) === String(elementId))
        .map((row) => ({
          element_id: row[0],
          tipo: row[1],
          texto: row[2],
          fecha: row[3],
          usuario: row[4],
        }));

      return res.status(200).json({ status: true, data: comentarios });
    } catch (err: any) {
      if (err?.message?.includes('Unable to parse range')) {
        console.warn('La hoja de comentarios no existe todavía:', SHEET_COMENTARIOS);
        return res.status(200).json({ status: true, data: [] });
      }
      console.error('Error cargando comentarios', err);
      return res.status(500).json({ status: false, error: 'Error reading sheet' });
    }
  }

  if (method === 'POST') {
    const {
      sheetId,
      elementId,
      tipo,
      texto,
      usuario,
      gid,
      programa,
      proceso,
      year,
      nivel,
      sectionName,
      actorName,
    } = req.body || {};

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
        'element_id', 'tipo', 'texto', 'fecha', 'usuario',
      ]);

      await appendRowsToSheet(sheetId, SHEET_COMENTARIOS, [newComentario]);

      const hasNotifyContext =
        norm(programa) && norm(proceso) && norm(year) && norm(nivel);

      let notification: any = {
        attempted: false,
        sent: 0,
        skipped: true,
        reason: 'Missing programa/proceso/year/nivel in request payload',
      };

      if (hasNotifyContext) {
        try {
          const labels = await resolveCommentLabels({
            sheetId,
            gid,
            elementId,
            fallbackSectionName: sectionName,
          });

          const notifyResult = await notifyByEvent({
            eventType: NOTIFICATION_EVENTS.COMMENT_ADDED,
            context: {
              programa: norm(programa),
              proceso: norm(proceso),
              year: norm(year),
              nivel: norm(nivel),
            },
            actor: {
              email: norm(usuario) || 'desconocido',
              name: norm(actorName) || '',
            },
            payload: {
              sectionName: labels.sectionName,
              elementId: norm(elementId),
              elementName: labels.elementName,
              commentText: norm(texto),
            },
            dryRun: false,
          });

          notification = {
            attempted: true,
            sent: Number(notifyResult?.count || 0),
            skipped: false,
            eventType: notifyResult?.eventType || NOTIFICATION_EVENTS.COMMENT_ADDED,
          };
        } catch (notifyErr: any) {
          console.error('[api/comments] Notification error:', notifyErr);
          notification = {
            attempted: true,
            sent: 0,
            skipped: false,
            error: notifyErr?.message || 'Notification failed',
          };
        }
      }

      return res.status(200).json({
        status: true,
        data: {
          element_id: newComentario[0],
          tipo: newComentario[1],
          texto: newComentario[2],
          fecha: newComentario[3],
          usuario: newComentario[4],
        },
        notification,
      });
    } catch (err) {
      console.error('Error guardando comentario', err);
      return res.status(500).json({ status: false, error: 'Error saving comment' });
    }
  }
}