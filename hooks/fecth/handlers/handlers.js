import { API_POST_CHECKBOX_UPDATE, API_POST_REPLACEMENTS_KEYS, API_POST_GENERATE_PDF, API_GET_VALUES_KEYS, API_GET_ALLOWED_USER , API_GET_RRC_FORM,  API_GET_TABLE, API_GET_UPDATE} from "../const/api"
import { fetchGetGeneral, fetchPostGeneral } from "../fecth"

export const getAllowedUser = () => {
    return fetchGetGeneral({
        urlEndPoint: API_GET_ALLOWED_USER
    })
}

export const getFormRRC = async ({ sheetId, gid }) => {
  const res = await fetch('/api/rrc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetId, gid }),
  });
  const json = await res.json();
  if (!res.ok || !json?.status) throw new Error(json?.error || 'No se pudo cargar RRC');
  return json; // { status, data }
};

export const getValuesKey = ({ sheetId, gid }) => {
    return fetchGetGeneral({
        urlEndPoint: `${API_GET_VALUES_KEYS}?sheetId=${sheetId}&gid=${gid}`
    })
}

export const getDataTable = () => {
    return fetchGetGeneral({
        urlEndPoint: API_GET_TABLE
    })
}

export const updateDataTable = (data) => {
    return fetchPostGeneral({
        dataSend: data, 
        urlEndPoint: API_GET_UPDATE
    })
}

export const generatePdf = (data) => {
    return fetchPostGeneral({
        dataSend: data, 
        urlEndPoint: API_POST_GENERATE_PDF
    })
}

export const replacementsDocsKeys = (data) => {
    return fetchPostGeneral({
        dataSend: data, 
        urlEndPoint: API_POST_REPLACEMENTS_KEYS
    })
}

export const updateCheckboxClient = (data) => {
    return fetchPostGeneral({
        dataSend: data, 
        urlEndPoint: API_POST_CHECKBOX_UPDATE
    })
}

export const createDocumentGoogle = (data) => {
    return fetchPostGeneral({
        dataSend: data, 
        urlEndPoint: `https://google-doc-api-553236746574.us-central1.run.app/execute`
    })
}

export const postUpdateRRC = async ({ sheetId, gid, data }) => {
  const res = await fetch('/api/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetId, gid, data }),
  });
  const json = await res.json();
  if (!res.ok || !json?.status) throw new Error(json?.error || 'No se pudo actualizar');
  return json;
};

export const postUpdateCheckboxRRC = async ({ sheetId, gid, data }) => {
  const res = await fetch('/api/updateCheckbox', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // 🔴 Para RRC, siempre G
    body: JSON.stringify({ sheetId, gid, data, row_: 'G' }),
  });
  const json = await res.json();
  if (!res.ok || !json?.status) throw new Error(json?.error || 'No se pudo actualizar check');
  return json;
};