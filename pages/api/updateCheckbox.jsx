import { updateCheckbox } from '../../libs/googlesheet';
import { notifyByEvent, NOTIFICATION_EVENTS } from '../../libs/server/notifications/notificationService';

function norm(v) {
  return String(v ?? '').trim();
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  return String(v ?? '').trim().toLowerCase() === 'true';
}

function toNivelKey(raw) {
  const s = String(raw ?? '').trim();
  const m = s.match(/^(\d+)(?:\.\d+)?/);
  return m ? m[1] : s;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    const { sheetId, gid, data, row_, notify } = req.body || {};
    if (!sheetId || !gid || !Array.isArray(data) || !row_) {
      return res.status(400).json({ status: false, error: 'Missing sheetId/gid/data/row_' });
    }

    const ok = await updateCheckbox({ sheetId, gid, data, row_ });

    let notification = {
      attempted: false,
      skipped: true,
      reason: 'Not applicable',
    };

    // Solo notificar si se guardó bien
    if (ok) {
      const first = Array.isArray(data) && data.length > 0 ? data[0] : {};
      const checked = toBool(first?.checkbox);
      const nivel = norm(notify?.nivel) || toNivelKey(first?.groups_fields);
      const sectionName =
        norm(notify?.sectionName) ||
        norm(first?.texto) ||
        norm(first?.variables) ||
        (nivel ? `Nivel ${nivel}` : 'Seccion');

      const context = {
        programa: norm(notify?.context?.programa),
        proceso: norm(notify?.context?.proceso),
        year: norm(notify?.context?.year),
        nivel: norm(nivel),
      };

      const actor = {
        email: norm(notify?.actor?.email) || 'desconocido',
        name: norm(notify?.actor?.name) || '',
      };

      const hasContext =
        context.programa &&
        context.proceso &&
        context.year &&
        context.nivel;

      // M = Sección Finalizada, N = Aprobado DACA
      let eventType = null;
      if (row_ === 'M' && checked) eventType = NOTIFICATION_EVENTS.SECTION_FINALIZED;
      if (row_ === 'N' && checked) eventType = NOTIFICATION_EVENTS.DACA_APPROVED;
      if (row_ === 'N' && !checked) eventType = NOTIFICATION_EVENTS.DACA_DISAPPROVED;

      if (!eventType) {
        notification = {
          attempted: false,
          skipped: true,
          reason: 'No notification event for this checkbox change',
        };
      } else if (!hasContext) {
        notification = {
          attempted: false,
          skipped: true,
          reason: 'Missing notification context: programa/proceso/year/nivel',
        };
      } else {
        try {
          const result = await notifyByEvent({
            eventType,
            context,
            actor,
            payload: {
              sectionName,
            },
            dryRun: false,
          });

          notification = {
            attempted: true,
            skipped: false,
            eventType,
            sent: Number(result?.count || 0),
          };
        } catch (notifyErr) {
          console.error('[api/updateCheckbox] notify error:', notifyErr);
          notification = {
            attempted: true,
            skipped: false,
            eventType,
            sent: 0,
            error: notifyErr?.message || 'Notification failed',
          };
        }
      }
    }

    return res.status(200).json({
      status: !!ok,
      notification,
    });
  } catch (e) {
    console.error('[api/updateCheckbox] err:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}