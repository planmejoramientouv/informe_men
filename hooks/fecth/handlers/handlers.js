import { API_GET_ALLOWED_USER } from "../const/api"
import { fetchGetGeneral } from "../fecth"

export const getAllowedUser = () => {
    return fetchGetGeneral({
        urlEndPoint: API_GET_ALLOWED_USER
    })
}