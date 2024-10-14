/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from 'react'

// Styles
import useStyles from '../../../../css/form/form.css.js'
import { useGlobalState } from '../../../../hooks/context'

// Const
import { ROL_DIRECTOR, ROL_ADMIN_SISTEM } from '../../../../libs/utils/const'

// Hooks
import { getCookieData, setCookieRRC } from '../../../../libs/utils/utils'

// Fecth
import { getAllowedUser } from '../../../../hooks/fecth/handlers/handlers'

// Components
import Show from '../../../../share/utils/Show'
import For from '../../../../share/utils/For'

// Material - IU
import { Grid2, Typography } from '@mui/material'

// Regex
const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit.*?gid=([0-9]+)/;

import { useRouter } from 'next/router';

export default () => {
    const classes = useStyles()
    const { globalState } = useGlobalState()

    const [cookieData, setCookieData] = React.useState({} as any)
    const [data, setData] =  React.useState([])
    const [dataFor, setDataFor] =  React.useState([])

    const getUserAllowed = async () => {
        try {
            let allowedUser = await getAllowedUser()
            if (allowedUser?.data.length > 0) {
                setData(allowedUser?.data)
            } 
        } catch (e) {
            console.log(e)
        }
    } 
    
    const optionToPrint = () => {
        if (data.length <= 0) return
        const email_ = cookieData?.email
        const findRol = data.find(person => String(person?.email) === String(email_))
        const dataActive = data.filter((item) => {
            return (
                item.estado === 'Activo' &&
                (item?.url_exel ?? '').match(regex) !== null
            )
        })

        if (ROL_ADMIN_SISTEM.includes(findRol?.rol)) {
            const dataFilter = dataActive.filter(item => item.rol !== findRol?.rol)
            setDataFor(dataFilter)
            return
        }

        if (ROL_DIRECTOR.includes(findRol?.rol)) {
            const dataFilter = dataActive.filter(item => item.programa === findRol?.programa)
            setDataFor(dataFilter)
            return
        }
    }
    
    React.useMemo(optionToPrint, [data])

    React.useEffect(() => {
        const cookie_ = getCookieData('data')
        getUserAllowed()
        setCookieData(cookie_)
    },[])

    return (
        <Show when={dataFor.length > 0}>
            <React.Fragment>
                <Grid2 className={classes.containerTitlePanel}>
                    <Typography variant="h2">Programas con procesos activos</Typography>
                </Grid2>
                <Grid2 className={classes.containerForPanel}>
                    <For func={printActions} list={dataFor}  />
                </Grid2>
            </React.Fragment>
        </Show>            
    )
}

const printActions = (element, index) => {
    const classes = useStyles()
    const router = useRouter();

    const handlerClick = (element) => {
        const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit.*?gid=([0-9]+)/;
        const matches = (element?.url_exel ?? '').match(regex);

        if (matches) {
            const sheetId = matches[1];
            const gid = matches[2];
            console.log(element, sheetId, "sssss")
            setCookieRRC({
                sheetId: sheetId,
                programa: element.programa,
                proceso: element.proceso,
                gid: gid,
                year: element.year,
                nameCookie: 'rrc'
            })
            
            router.push(`/${(element.proceso).toLowerCase()}`)
        }
    }

    return (
        <React.Fragment key={index}>
            <Grid2 onClick={() => handlerClick(element)} className={classes.forItemsPanel} key={index}>
                <Typography variant="h2">
                    {`${element?.programa} - ${element?.proceso} ${element?.year}`}
                </Typography>
            </Grid2>
        </React.Fragment>
    )
}