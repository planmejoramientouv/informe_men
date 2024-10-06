import { google } from 'googleapis';
import { sheetValuesToObject } from './utils/utils';

const CLIENT_EMAIL = process.env.NEXT_PUBLIC_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY.replace(/\\n/g, '\n');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

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

export const getFieldRRC = async (hojaCalculo) => {
    const response = await GetDataSheet({
        hojaCalculo,
        spreadsheetId_: SPREADSHEET_ID,
        defaultSheet: 'Datos Generales RRC'
    });

    if (response?.length < 0) return []

    const regex = /^\d+-\s*$/;

    const containers = response.filter((item) => {
        return regex.test(item?.groups_fields);
    });

    const groups = containers.map(element => {
        const groupWithoutDash = element?.groups_fields.replace("-", "");
    
        return response.filter(items => 
            items?.groups_fields.replace("-", "") === groupWithoutDash
        );
    }) ?? [];

    return groups
}