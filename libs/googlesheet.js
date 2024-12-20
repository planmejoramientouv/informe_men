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
            groups_fields: item.groups_fields
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