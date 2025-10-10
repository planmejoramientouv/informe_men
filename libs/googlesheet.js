import { google } from 'googleapis';
import { sheetValuesToObject } from './utils/utils';

const CLIENT_EMAIL = process.env.NEXT_PUBLIC_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY.replace(/\\n/g, '\n');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const SHEET_PERMISOS = process.env.PERMISOS_SHEET_NAME || 'PERMISOS';
const DRIVE_PARENT_FOLDER_ID = process.env.DRIVE_PARENT_FOLDER_ID || '1qs_oTozwSC4GTtFaeoHo4PMwrxcAEcQT'; // <- tu carpeta padre
const TEMPLATE_SPREADSHEET_ID = process.env.TEMPLATE_SPREADSHEET_ID || '1o6hX_kN4e8GqNUPoMOjp-g6G4QYpQk2M2N5996Yu3Ws';

const jwtClient = new google.auth.JWT(
    CLIENT_EMAIL,
    null,
    PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
);

export const GetDataSheet = async ({ hojaCalculo, spreadsheetId_, defaultSheet }) => {
    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    const range = hojaCalculo || defaultSheet;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId_,
        range,
        key: API_KEY,
    });

    return sheetValuesToObject(response.data.values);
};

export const getPermission = async (hojaCalculo) => {
    const response = await GetDataSheet({
        hojaCalculo,
        spreadsheetId_: SPREADSHEET_ID,
        defaultSheet: 'PERMISOS'
    });
    return response
};

export const getFieldRRC = async ({ sheetId, gid}) => {
    const response = await GetDataSheet({
        gid,
        spreadsheetId_: sheetId,
        defaultSheet: 'Datos Generales RRC'
    });

    if (response?.length < 0) return []

    const regex = /^\d+-\s*$/;

    const containers = response.filter((item) => {
        return regex.test(item?.groups_fields);
    });

    const groups = containers.map(element => {
        const groupWithoutDash = Number(element?.groups_fields.replace("-", ""));
        let dataFilter = []
        let data_ = response.filter(items => {
            const groupId = Number(items?.groups_fields.replace("-", "")) 
            return (
                groupWithoutDash >= Math.floor(groupId) &&
                groupWithoutDash < (Math.floor(groupId) + 1)
            )
        })

        if (data_.length > 0) {
            dataFilter = addSubGroups(groupWithoutDash,data_, dataFilter)
        }

        return { 
            data: dataFilter,
            primary: element
        }
    }) ?? [];

    return groups
}

export const getDataTable = async ({ sheetId, gid }) => {
    if (sheetId === '' ||  gid === '') return []
    if (sheetId === null || gid === null) return []
    const response = await GetDataSheet({
        gid,
        spreadsheetId_: sheetId,
        defaultSheet: 'Hoja 1'
    });
}

export const updateDataField = async ({ data, sheetId, gid }) =>  {
    try {
        data = addSubComponents(data)
        if (data.length <= 0) return false
    
        const arrayIdAvailables = data.map((item) => item.id)
        const existingData  = await GetDataSheet({
            gid,
            spreadsheetId_: sheetId,
            defaultSheet: 'Datos Generales RRC'
        });
        const updateItems = existingData.filter(async (item, index) => {
            if (arrayIdAvailables.includes(item.id)) {
                const updatedData = data.find((d) => d.id === item.id);

                const rowIndex = index + 2;
                const range = `G${rowIndex}`;

                console.log(`Actualizando fila ${rowIndex}, columna G con el valor: ${updatedData.valor}`);

                const sheets = google.sheets({ version: 'v4', auth: jwtClient });
                const response = await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: range,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [[updatedData?.valor  ?? '']]
                    }
                });
                return response
            }
        })
    
        return true
    } catch (e) {
        console.log(e)
        return false
    }
}

export const updateCheckbox = async ({ data, sheetId, gid, row_}) => {
    let response_ = false
    try {
        const arrayIdAvailables = data.map((item) => item.id)
        const existingData  = await GetDataSheet({
            gid,
            spreadsheetId_: sheetId,
            defaultSheet: 'Datos Generales RRC'
        })

        existingData.filter(async (item, index) => {
            if (arrayIdAvailables.includes(item.id)) {
                const updatedData = data.find((d) => d.id === item.id);

                const rowIndex = index + 2;
                const range = `${row_}${rowIndex}`;

                console.log(`Actualizando fila ${rowIndex}, columna G con el valor: ${updatedData.valor}`);

                const sheets = google.sheets({ version: 'v4', auth: jwtClient });
                const response = await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: range,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [[updatedData?.checkbox  ?? '']]
                    }
                });
                return response
            }
        })
        response_ = true
    } catch(e) {
        console.log(e)
    }
    return response_
}

const addSubComponents = (data) => {
    const filterCriterios = data.filter((item) => item?.typeComponent);
    if (filterCriterios?.length > 0) {
        filterCriterios.forEach((item) => {
            if (item?.data && Array.isArray(item.data)) {
                data = [...data, ...item.data];
            }
        });
    }
    return data;
};

const addSubGroups = (groupWithoutDash,data_, dataFilter) => {
    let list = []
    let index = 0

    let listDiferentGroup = data_.reduce((arr, current) => {
        const groupId = Number(current?.groups_fields.replace("-", "")) 
        if (!arr.includes(groupId)) arr.push(groupId)
        return arr
    }, list)
    
    dataFilter = data_.filter(items => {
        const groupId = Number(items?.groups_fields.replace("-", "")) 
        return (groupWithoutDash === groupId)
    })
    
    listDiferentGroup = listDiferentGroup.filter(item => item !== groupWithoutDash)
    listDiferentGroup.map((item) => {
        return {
            data: data_.filter((items) => {
                const groupId = Number(items?.groups_fields.replace("-", ""))
                return groupId === item
            }),
            groups_fields: data_.find(items => {
                const groupId = Number(items?.groups_fields.replace("-", ""))
                return groupId === item
            })?.groups_fields
        }
    }).map((item) => {
        dataFilter.push({
            typeComponent: 'colapsable',
            data: item.data,
            id: item.data[0]?.id,
            groups_fields: item.groups_fields,
            menu: item.data?.[0]?.menu ?? null,
            texto: item.data?.[0]?.texto ?? null,
        });
    })

    return dataFilter.sort( (a,b) =>  Number(a?.id) - Number(b?.id))
} 

export const generateVarSaveDoc = async ({ sheetId, gid }) => {
    let response_ = []
    try {
        const response = await GetDataSheet({
            gid,
            spreadsheetId_: sheetId,
            defaultSheet: 'Datos Generales RRC'
        });

        if (response?.length < 0) return []

        response_ = response.map((rrc) => {
            return {
                key: rrc?.variable_en_doc ?? "{{key}}",
                value: rrc?.valor ?? "",
                group: rrc?.groups_fields
            }
        })
    } catch (e) {
        console.log(e)
    }
    return response_
}

/**
 * Lee la hoja PERMISOS y devuelve todas las filas (como arreglo de arreglos)
 */
async function readPermisosRaw(sheets) {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_PERMISOS}!A:H`,
  });
  return data.values || [];
}

/**
 * Calcula el próximo ID buscando el máximo en la columna A (numérico)
 */
function nextIdFromValues(values) {
  // values[0] = headers. Los datos empiezan en values[1]
  let maxId = 0;
  for (let i = 1; i < values.length; i++) {
    const raw = values[i][0]; // Columna A
    const n = Number(raw);
    if (!Number.isNaN(n) && n > maxId) maxId = n;
  }
  return maxId + 1;
}


/**
 * Agrega una fila a PERMISOS (A:H)
 * Campos soportados:
 *  - email (req)
 *  - nivel (opcional, string)
 *  - rol (req)          -> 'admin' | 'director' | 'lectura' | etc.
 *  - programa (opcional)
 *  - proceso (req)      -> 'RRC' | 'RAAC' | etc.
 *  - year (opcional)    -> default: año actual
 *  - estado (opcional)  -> default: 'Activo'
 */
export async function appendPermissionRow({ email, nivel = '', rol, programa = '', proceso, year, estado = 'Activo' }) {
  if (!email || !rol || !proceso) {
    throw new Error('Faltan campos obligatorios: email, rol, proceso');
  }

  const auth = /* reutiliza tu jwtClient existente */ await getAuth(); // <- si ya tienes un helper, úsalo. De lo contrario, crea el JWT igual que en tus otras funciones.
  const sheets = google.sheets({ version: 'v4', auth });

  // 1) Leer para calcular el próximo ID
  const values = await readPermisosRaw(sheets);
  const nextId = nextIdFromValues(values);
  const y = year || new Date().getFullYear();

  // 2) Append (A:H)
  const row = [
    String(nextId),  // A: ID
    String(email),   // B: email
    String(nivel),   // C: nivel
    String(rol),     // D: rol
    String(programa),// E: programa
    String(proceso), // F: proceso
    String(y),       // G: year
    String(estado),  // H: estado
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_PERMISOS}!A:H`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  return { id: nextId, updatedRange: res.data.updates?.updatedRange || null };
}

/**
 * Actualiza una fila existente por ID (columna A)
 * Solo sobreescribe B:H (email, nivel, rol, programa, proceso, year, estado)
 */
export async function updatePermissionRowById({ id, email, nivel = '', rol, programa = '', proceso, year, estado }) {
  if (!id) throw new Error('Falta ID');
  const auth = /* jwtClient o helper */ await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // 1) Encontrar la fila (rowIndex) cuyo A == id
  const values = await readPermisosRaw(sheets);
  let targetRow = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      targetRow = i + 1; // +1 por 1-based index de Sheets (y otra +1 por headers)
      break;
    }
  }
  if (targetRow === -1) throw new Error(`No se encontró fila con ID=${id}`);

  // Armar payload a actualizar (B:H)
  const y = year ?? values[targetRow - 1]?.[6] ?? new Date().getFullYear(); // conserva si no llega
  const row = [
    email   ?? values[targetRow - 1]?.[1] ?? '',
    nivel   ?? values[targetRow - 1]?.[2] ?? '',
    rol     ?? values[targetRow - 1]?.[3] ?? '',
    programa?? values[targetRow - 1]?.[4] ?? '',
    proceso ?? values[targetRow - 1]?.[5] ?? '',
    String(y),
    estado  ?? values[targetRow - 1]?.[7] ?? 'Activo',
  ];

  const range = `${SHEET_PERMISOS}!B${targetRow}:H${targetRow}`;
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  return { id, updatedRange: res.data.updatedRange || range };
}

/**
 * Si no tienes un helper global para auth, crea uno:
 */
async function getAuth() {
  // Usa las mismas vars y scopes que ya usas en este archivo (SERVICE ACCOUNT)
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_CLIENT_EMAIL;
  const privateKey  = (process.env.GOOGLE_PRIVATE_KEY || process.env.NEXT_PUBLIC_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const jwt = new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ]
  );
  await jwt.authorize();
  return jwt;
}


export async function listProgramsFromIndex({ spreadsheetId, sheetName, column = 'D' }) {
  const auth = await getAuth(); // usa tu helper o tu jwtClient ya existente
  const sheets = google.sheets({ version: 'v4', auth });

  // D2:D (toda la columna desde fila 2)
  const range = `${sheetName}!${column}2:${column}`;

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    // valueRenderOption, etc. si te interesa; por defecto está bien
  });

  const raw = data.values || [];
  // flatten + filtrar vacíos
  const list = raw
    .map((row) => (Array.isArray(row) ? row[0] : row))
    .map((v) => (typeof v === 'string' ? v.trim() : v))
    .filter((v) => v && String(v).length > 0);

  return list;
}

export async function listProgramsWithPeriod({
  spreadsheetId,
  sheetName,
  programCol = 'D',
  periodCol, // <- E | F | G según caso
}) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Traemos un rango de D..periodCol (desde fila 2)
  const range = `${sheetName}!${programCol}2:${periodCol}`;
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = data.values || [];

  // Mapea cada fila a { program, period }
  const colSpan = periodCol.charCodeAt(0) - programCol.charCodeAt(0); // 0..?
  const programIdx = 0;
  const periodIdx = colSpan; // última columna del rango

  return rows
    .map(r => ({
      program: (r[programIdx] || '').toString().trim(),
      period:  (r[periodIdx]  || '').toString().trim(),
    }))
    .filter(x => x.program); // sin vacíos
}


async function createDriveFolder({ name, parentId }) {
  const auth = await getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { data } = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id, webViewLink',
  });
  return { id: data.id, url: data.webViewLink };
}

// Copia el spreadsheet de plantilla a una carpeta y lo renombra
async function copySpreadsheetToFolder({ templateId, name, parentId }) {
  const auth = await getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { data } = await drive.files.copy({
    fileId: templateId,
    requestBody: {
      name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.spreadsheet',
    },
    fields: 'id, webViewLink',
  });
  return { id: data.id, url: data.webViewLink };
}

// Obtiene el gid (sheetId) de una pestaña por título
async function getSheetGidByTitle({ spreadsheetId, title }) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  });
  const hit = (data.sheets || []).find(s => s.properties.title === title);
  return hit?.properties?.sheetId ?? null;
}

// Construye URL con gid
function buildSheetUrl({ spreadsheetId, gid }) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}#gid=${gid}`;
}

// Helper para renombrar la hoja 
async function renameSheet({ spreadsheetId, sheetId, newTitle }) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Sanitizar título (Sheets no permite algunos caracteres / longitud)
  const safeTitle = String(newTitle)
    .replace(/[\\/*?:\[\]]/g, ' ') // caracteres prohibidos
    .slice(0, 100); // límite razonable

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              title: safeTitle,
            },
            fields: 'title',
          },
        },
      ],
    },
  });
  return safeTitle;
}

async function deleteSheetById({ spreadsheetId, sheetId }) {
  if (!sheetId) return false;
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteSheet: { sheetId }
        }
      ],
    },
  });
  return true;
}

// Crea carpeta + copia archivo + resuelve gid y arma URLs
export async function createProgramAssets({ programa, tipo, sede, periodo }) {
  // 1) Crea carpeta
  const isRRC = String(tipo).toUpperCase() === 'RRC';
  const oppositeTitle = isRRC ? 'Datos Generales RAAC' : 'Datos Generales RRC';
  const folderName = `${programa} - ${tipo.toUpperCase()} - ${sede}`;
  const folder = await createDriveFolder({
    name: folderName,
    parentId: DRIVE_PARENT_FOLDER_ID,
  });

  // 2) Copia spreadsheet
  const fileName = `Informe MEN - ${programa}`;
  const file = await copySpreadsheetToFolder({
    templateId: TEMPLATE_SPREADSHEET_ID,
    name: fileName,
    parentId: folder.id,
  });

  // 3) Determinar título de la hoja a usar
  const baseTitle =
    String(tipo).toUpperCase() === 'RRC'
      ? 'Datos Generales RRC'
      : 'Datos Generales RAAC';

  // 4) Obtener sheetId (gid) de esa hoja
  let gid = await getSheetGidByTitle({ spreadsheetId: file.id, title: baseTitle });

  // 5) Renombrar la pestaña seleccionada a "<programa> - <periodo>"
  const newSheetTitle = `${programa} - ${periodo || ''}`.trim();
  if (gid) {
    await renameSheet({
      spreadsheetId: file.id,
      sheetId: gid,
      newTitle: newSheetTitle,
    });
  }

    // 6) borrar la hoja opuesta si existe
  const oppositeGid = await getSheetGidByTitle({ spreadsheetId: file.id, title: oppositeTitle });
  if (oppositeGid) {
    await deleteSheetById({ spreadsheetId: file.id, sheetId: oppositeGid });
  }

  // 7) Construir URL con el (posible) mismo gid
  const sheetUrl = gid
    ? buildSheetUrl({ spreadsheetId: file.id, gid })
    : file.url;

  return {
    folderId: folder.id,
    folderUrl: folder.url,
    fileId: file.id,
    fileUrl: file.url,
    gid,
    sheetTitle: newSheetTitle,
    urlExcel: sheetUrl,
  };
}



/**
 * Agrega una fila a PERMISOS con URLs (A:J)
 * A: ID (autoincrement)
 * B: email
 * C: nivel (sede)
 * D: rol
 * E: programa
 * F: proceso
 * G: year (periodo)
 * H: estado
 * I: url_carpeta
 * J: url_exel
 */
export async function appendPermissionRowWithUrls({
  email, nivel = '', rol, programa = '', proceso, year, estado = 'Activo', url_carpeta = '', url_exel = '',
}) {
  if (!email || !rol || !proceso) throw new Error('Faltan campos obligatorios: email, rol, proceso');

  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const values = await readPermisosRaw(sheets);
  const nextId = nextIdFromValues(values);
  const y = year || new Date().getFullYear();

  const row = [
    String(nextId), String(email), String(nivel), String(rol), String(programa),
    String(proceso), String(y), String(estado), String(url_carpeta), String(url_exel),
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_PERMISOS}!A:J`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  return {
    id: nextId,
    updatedRange: res.data.updates?.updatedRange || null,
  };
}