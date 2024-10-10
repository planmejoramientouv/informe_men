import { API_GET_ALLOWED_USER , API_GET_RRC_FORM,  API_GET_TABLE} from "../const/api"
import { fetchGetGeneral } from "../fecth"

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