import { createProgramAssets, appendPermissionRowWithUrls } from '../../libs/googlesheet';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ status: false, error: 'Method not allowed' });

    const { tipo, sede, programa, periodo, email, rol = 'admin', estado = 'Activo' } = req.body || {};
    if (!tipo || !sede || !programa || !email) {
      return res.status(400).json({ status: false, error: 'Faltan campos (tipo, sede, programa, email)' });
    }

    // 1) Drive + Spreadsheet
    const assets = await createProgramAssets({ programa, tipo, sede });
    // assets: { folderUrl, urlExcel, ... }

    // 2) Insertar fila en PERMISOS con URLs
    const insert = await appendPermissionRowWithUrls({
      email,
      nivel: "",
      rol,
      programa,
      proceso: String(tipo).toUpperCase(),
      year: periodo || new Date().getFullYear(),
      estado,
      url_carpeta: assets.folderUrl,
      url_exel: assets.urlExcel,
    });

    return res.status(200).json({
      status: true,
      data: {
        insert,
        assets,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}
