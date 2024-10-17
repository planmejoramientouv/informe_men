/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React from "react"

// Components
import Header from "../src/infrastructure/components/Header"
import Form from "../src/infrastructure/iu/Forms/Form"

// Hoosk
import { useGlobalState } from '../hooks/context'
import { getFormRRC } from '../hooks/fecth/handlers/handlers'

// Hooks
import { getCookieData, setCookieRRC } from '../libs/utils/utils'

// Home
export default () => {
    const { setGlobalState } = useGlobalState()
    const [dataCookie, setDataCookie] = React.useState({} as any)

    const getDataRRC = async ({sheetId, gid}) => {
        const response = await getFormRRC({
            sheetId: sheetId,
            gid: gid
        })
        if (response?.data.length > 0) {
            console.log(response)
            setGlobalState((prev) => ({
                ...prev,
                data: {
                    formdata: response?.data ?? [],
                    sheetId: sheetId,
                    gid: gid
                }
            }))
        } 
    }

    const getDataCookie = () =>  {
        const rcc_ = getCookieData('rrc')
        setDataCookie(rcc_)
    }

    React.useEffect(() => {
        getDataCookie()
    }, []);

    React.useEffect(() => {
        if (!dataCookie.sheetId) return 
        getDataRRC({
            sheetId: dataCookie.sheetId,
            gid: dataCookie.gid
        })
    }, [dataCookie]);

    return (
        <main className="root-container">
            <Header />
            <Form />
        </main>
    )
}