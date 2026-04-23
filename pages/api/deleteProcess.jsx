import { deleteProcessByPermissionId } from '../../libs/googlesheet';
import { ROL_ADMIN_SISTEM } from '../../libs/utils/const';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    const { id, requesterRole } = req.body || {};
    const role = String(requesterRole || '').toLowerCase();

    if (!ROL_ADMIN_SISTEM.includes(role)) {
      return res.status(403).json({ status: false, error: 'No autorizado para eliminar procesos' });
    }

    if (id === undefined || id === null || String(id).trim() === '') {
      return res.status(400).json({ status: false, error: 'Falta id del proceso' });
    }

    const data = await deleteProcessByPermissionId({ id, removeFolder: true });

    const hasWarning = Boolean(data?.rowAction?.warning);

    return res.status(200).json({
      status: true,
      warning: hasWarning ? data.rowAction.warning : null,
      data,
    });
  } catch (e) {
    console.error('Error en /api/deleteProcess:', e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}
