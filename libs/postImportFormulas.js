import { google } from 'googleapis';

const DEFAULT_TABLE_LINK_ROWS = [48, 101, 152, 174, 192, 193, 194, 209, 210, 211, 225, 226, 236, 242, 254, 255, 289, 290];
const TABLE_NUMBER_START = 4;
const TABLE_SCAN_RANGE = 'A1:ZZ200';
const MAX_BLANK_CELLS_PER_TABLE = 5000;

function quoteSheetTitle(title) {
  const t = String(title || '');
  const escaped = t.replace(/'/g, "''");
  return `'${escaped}'`;
}

function normalizeCellValue(value) {
  return String(value ?? '').trim();
}

function toA1(rowIndex1Based, colIndex1Based) {
  let n = colIndex1Based;
  let letters = '';

  while (n > 0) {
    const r = (n - 1) % 26;
    letters = String.fromCharCode(65 + r) + letters;
    n = Math.floor((n - 1) / 26);
  }

  return `${letters}${rowIndex1Based}`;
}

function parseSheetUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return null;

  const spread = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidFromPath = value.match(/[?&#]gid=([0-9]+)/);
  const gidFromFragment = value.match(/#gid=([0-9]+)/);

  return {
    spreadsheetId: spread?.[1] || null,
    gid: Number(gidFromPath?.[1] || gidFromFragment?.[1] || NaN),
  };
}

function buildBlankCellList(values = []) {
  const rows = Array.isArray(values) ? values : [];

  const lastRow = rows.length;
  if (lastRow <= 0) return [];

  const lastCol = rows.reduce((max, row) => {
    if (!Array.isArray(row)) return max;
    return Math.max(max, row.length);
  }, 0);

  if (lastCol <= 0) return [];

  let firstRowWithData = 1;
  let firstColWithData = 1;
  let found = false;

  for (let r = 1; r <= lastRow && !found; r++) {
    const row = rows[r - 1] || [];
    for (let c = 1; c <= lastCol; c++) {
      const cell = normalizeCellValue(row[c - 1]);
      if (cell) {
        firstRowWithData = r;
        firstColWithData = c;
        found = true;
        break;
      }
    }
  }

  const scanStartRow = Math.min(lastRow, firstRowWithData + 1);
  const scanStartCol = Math.min(lastCol, firstColWithData + 1);
  const blanks = [];

  for (let c = scanStartCol; c <= lastCol; c++) {
    for (let r = scanStartRow; r <= lastRow; r++) {
      const row = rows[r - 1] || [];
      const cellValue = normalizeCellValue(row[c - 1]);

      if (!cellValue) {
        blanks.push(toA1(r, c));
      }
    }
  }

  return blanks;
}

function getServiceAccountAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.NEXT_PUBLIC_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  return new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ]
  );
}

function buildG50ToG101FromTable4Formulas(sourceSheetTitle) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const safeSource = quoteSheetTitle(sourceSheetTitle);
  const rows = [];

  for (const letter of letters) {
    for (let i = 1; i <= 4; i++) {
      rows.push([`=${safeSource}!${letter}${i + 1}`]);
    }
  }

  return rows;
}

function resolveImportedTableTitle({ importResults, tableNumber }) {
  const found = (importResults || []).find((r) => !r?.skipped && Number(r?.tableNumber) === Number(tableNumber));
  return found?.newSheetTitle || null;
}

const POST_IMPORT_RULES = [
  {
    id: 'fill-g50-g101-from-table-4',
    targetRange: ({ mainSheetTitle }) => `${quoteSheetTitle(mainSheetTitle)}!G49:G100`,
    tableNumber: 4,
    formulasBuilder: ({ sourceSheetTitle }) => buildG50ToG101FromTable4Formulas(sourceSheetTitle),
  },
];

export async function applyPostImportFormulas({ spreadsheetId, mainSheetTitle, importResults }) {
  if (!spreadsheetId) throw new Error('Falta spreadsheetId');
  if (!mainSheetTitle) throw new Error('Falta mainSheetTitle');

  const auth = getServiceAccountAuth();
  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });
  const applied = [];
  const skipped = [];

  for (const rule of POST_IMPORT_RULES) {
    const sourceSheetTitle = resolveImportedTableTitle({
      importResults,
      tableNumber: rule.tableNumber,
    });

    if (!sourceSheetTitle) {
      skipped.push({
        ruleId: rule.id,
        reason: `No se importó la tabla ${rule.tableNumber}`,
      });
      continue;
    }

    const range = rule.targetRange({ mainSheetTitle });
    const values = rule.formulasBuilder({ sourceSheetTitle });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    applied.push({
      ruleId: rule.id,
      range,
      rows: values.length,
      sourceSheetTitle,
    });
  }

  const metadataRanges = DEFAULT_TABLE_LINK_ROWS.flatMap((row) => [
    `${quoteSheetTitle(mainSheetTitle)}!A${row}`,
    `${quoteSheetTitle(mainSheetTitle)}!F${row}`,
    `${quoteSheetTitle(mainSheetTitle)}!G${row}`,
  ]);

  const { data: metaBatch } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: metadataRanges,
  });

  const metaByTableNumber = new Map();
  for (let i = 0; i < DEFAULT_TABLE_LINK_ROWS.length; i++) {
    const row = DEFAULT_TABLE_LINK_ROWS[i];
    const tableNumber = TABLE_NUMBER_START + i;
    const idCell = metaBatch?.valueRanges?.[i * 3]?.values?.[0]?.[0] || '';
    const varCell = metaBatch?.valueRanges?.[i * 3 + 1]?.values?.[0]?.[0] || '';
    const linkCell = metaBatch?.valueRanges?.[i * 3 + 2]?.values?.[0]?.[0] || '';

    if (!idCell || !varCell || !linkCell) {
      skipped.push({
        ruleId: 'auto-generate-table-variables',
        tableNumber,
        row,
        reason: 'Faltan datos en columnas A/F/G de la fila de tabla',
      });
      continue;
    }

    metaByTableNumber.set(tableNumber, {
      row,
      tableNumber,
      tableId: String(idCell).trim(),
      tableVar: String(varCell).trim(),
      tableLink: String(linkCell).trim(),
    });
  }

  const { data: spreadsheetMeta } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  });

  const titleByGid = new Map(
    (spreadsheetMeta?.sheets || []).map((s) => [
      Number(s?.properties?.sheetId),
      s?.properties?.title || '',
    ])
  );

  const sourceTitleByTableNumber = new Map();
  for (const meta of metaByTableNumber.values()) {
    const parsed = parseSheetUrl(meta.tableLink);

    if (parsed?.spreadsheetId === spreadsheetId && Number.isFinite(parsed?.gid)) {
      const linkedTitle = titleByGid.get(Number(parsed.gid));
      if (linkedTitle) {
        sourceTitleByTableNumber.set(meta.tableNumber, linkedTitle);
        continue;
      }
    }

    const imported = (importResults || []).find(
      (r) => !r?.skipped && Number(r?.tableNumber) === Number(meta.tableNumber)
    );

    if (imported?.newSheetTitle) {
      sourceTitleByTableNumber.set(meta.tableNumber, imported.newSheetTitle);
      continue;
    }

    skipped.push({
      ruleId: 'auto-generate-table-variables',
      tableNumber: meta.tableNumber,
      row: meta.row,
      reason: 'No se pudo resolver la pestaña origen de la tabla',
    });
  }

  const tableRanges = [];
  const tableNumbersInRangeOrder = [];
  for (const [tableNumber, title] of sourceTitleByTableNumber.entries()) {
    tableRanges.push(`${quoteSheetTitle(title)}!${TABLE_SCAN_RANGE}`);
    tableNumbersInRangeOrder.push(tableNumber);
  }

  const blankCellsByTable = new Map();
  if (tableRanges.length > 0) {
    const { data: tableValuesBatch } = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: tableRanges,
    });

    for (let i = 0; i < tableNumbersInRangeOrder.length; i++) {
      const tableNumber = tableNumbersInRangeOrder[i];
      const values = tableValuesBatch?.valueRanges?.[i]?.values || [];
      const blankCells = buildBlankCellList(values);

      if (blankCells.length > MAX_BLANK_CELLS_PER_TABLE) {
        skipped.push({
          ruleId: 'auto-generate-table-variables',
          tableNumber,
          reason: `La tabla supera el máximo permitido de celdas vacías (${MAX_BLANK_CELLS_PER_TABLE})`,
          blankCells: blankCells.length,
        });
        continue;
      }

      blankCellsByTable.set(tableNumber, blankCells);
    }
  }

  const { data: existingVarsData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTitle(mainSheetTitle)}!F:F`,
  });

  const existingVars = new Set(
    (existingVarsData?.values || [])
      .map((r) => normalizeCellValue(r?.[0]))
      .filter(Boolean)
  );

  const rowsToAppend = [];
  for (const [tableNumber, blankCells] of blankCellsByTable.entries()) {
    const meta = metaByTableNumber.get(tableNumber);
    const sourceSheetTitle = sourceTitleByTableNumber.get(tableNumber);

    if (!meta || !sourceSheetTitle || blankCells.length === 0) {
      skipped.push({
        ruleId: 'auto-generate-table-variables',
        tableNumber,
        reason: 'No hay metadata de tabla o no se encontraron celdas vacías',
      });
      continue;
    }

    const safeSourceTitle = quoteSheetTitle(sourceSheetTitle);
    for (let i = 0; i < blankCells.length; i++) {
      const cell = blankCells[i];
      const variable = `{{${meta.tableVar}_${cell}}}`;

      if (existingVars.has(variable)) continue;

      rowsToAppend.push([
        `${meta.tableId}.${i + 1}`,
        '',
        '',
        '',
        '',
        variable,
        `=${safeSourceTitle}!${cell}`,
      ]);
      existingVars.add(variable);
    }
  }

  if (rowsToAppend.length > 0) {
    const appendRange = `${quoteSheetTitle(mainSheetTitle)}!A:G`;
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: appendRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rowsToAppend,
      },
    });

    applied.push({
      ruleId: 'auto-generate-table-variables',
      range: appendRange,
      rows: rowsToAppend.length,
      tablesProcessed: blankCellsByTable.size,
    });
  } else {
    skipped.push({
      ruleId: 'auto-generate-table-variables',
      reason: 'No se encontraron filas nuevas para insertar',
    });
  }

  return { applied, skipped };
}
