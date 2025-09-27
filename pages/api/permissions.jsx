// pages/api/permissions.jsx
import { appendPermissionRow, updatePermissionRowById } from '../../libs/googlesheet';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Crear nueva fila
      const { email, nivel, rol, programa, proceso, year, estado } = req.body || {};
      const result = await appendPermissionRow({ email, nivel, rol, programa, proceso, year, estado });
      return res.status(200).json({ status: true, data: result });
    }

    if (req.method === 'PUT') {
      // Actualizar existente por ID
      const { id, email, nivel, rol, programa, proceso, year, estado } = req.body || {};
      const result = await updatePermissionRowById({ id, email, nivel, rol, programa, proceso, year, estado });
      return res.status(200).json({ status: true, data: result });
    }

    return res.status(405).json({ status: false, error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}


