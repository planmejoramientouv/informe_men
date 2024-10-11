import { API_GET_ALLOWED_USER , API_GET_RRC_FORM,  API_GET_TABLE, API_GET_UPDATE} from "../const/api"
import { fetchGetGeneral, fetchPostGeneral } from "../fecth"

export const getAllowedUser = () => {
    return fetchGetGeneral({
        urlEndPoint: API_GET_ALLOWED_USER
    })
}

export const getFormRRC = ({ sheetId, gid }) => {
    return fetchGetGeneral({
        urlEndPoint: `${API_GET_RRC_FORM}?sheetId=${sheetId}&gid=${gid}`
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