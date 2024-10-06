import { API_GET_ALLOWED_USER , API_GET_RRC_FORM } from "../const/api"
import { fetchGetGeneral } from "../fecth"

export const getAllowedUser = () => {
    return fetchGetGeneral({
        urlEndPoint: API_GET_ALLOWED_USER
    })
}

export const getFormRRC = ()=> {
    return fetchGetGeneral({
        urlEndPoint: API_GET_RRC_FORM
    })
}