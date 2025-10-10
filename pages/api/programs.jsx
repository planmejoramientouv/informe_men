// pages/api/programs.jsx
import { listProgramsFromIndex } from '../../libs/googlesheet';
import { listProgramsWithPeriod, getExistingProgramPeriodKeys } from '../../libs/googlesheet';


const MAP = {
  RRC: {
    Cali:        { spreadsheetId: '1Hkan0w_kS59iGHDvSNtLsVgYurs8hWvA1I6pcurSaqM', sheetName: 'Indice',             periodCol: 'E' },
    Regionales:  { spreadsheetId: '1Hkan0w_kS59iGHDvSNtLsVgYurs8hWvA1I6pcurSaqM', sheetName: 'Indice-regionales',  periodCol: 'G' },
  },
  RAAC: {
    Cali:        { spreadsheetId: '1FM2jFQKz2pLwa5OgI13V1tKhH-I_B2mXKMbJ3ddBFLk', sheetName: 'Indice',             periodCol: 'E' },
    'Ampliación':{ spreadsheetId: '1FM2jFQKz2pLwa5OgI13V1tKhH-I_B2mXKMbJ3ddBFLk', sheetName: 'Indice Ampliación',  periodCol: 'F' },
  },
};

function norm(s){ return (s ?? '').toString().trim().toLowerCase(); }

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ status: false, error: 'Method not allowed' });

    const { tipo, sede } = req.query;
    if (!tipo || !sede) return res.status(400).json({ status: false, error: 'Missing tipo or sede' });

    const cfg = MAP[String(tipo).toUpperCase()]?.[sede];
    if (!cfg) return res.status(400).json({ status: false, error: 'Invalid tipo/sede combination' });

    // 1) Trae todos los programas + periodo del índice
    const all = await listProgramsWithPeriod({
      spreadsheetId: cfg.spreadsheetId,
      sheetName: cfg.sheetName,
      programCol: 'D',
      periodCol: cfg.periodCol,
    }); // [{ program, period }]

    // 2) Lee PERMISOS y arma set de existentes para este proceso
    const existing = await getExistingProgramPeriodKeys({ proceso: String(tipo).toUpperCase() });

    // 3) Filtra: deja solo los NO existentes (programa + periodo)
    const data = all.filter(({ program, period }) => {
      const key = `${norm(program)}|${norm(period)}`;
      return !existing.has(key);
    });

    return res.status(200).json({ status: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: false, error: e?.message || 'Internal Server Error' });
  }
}