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

// Const
const BORDER_COLORS = [
  '#C8102E',
  '#FFCD00',
  '#0051BA',
  '#A7A8AA',
]

export default function Panel() {
  const classes = useStyles()
  const { globalState } = useGlobalState()
  const router = useRouter();

  const [cookieData, setCookieData] = React.useState({} as any)
  const [data, setData] =  React.useState<any[]>([])
  const [dataFor, setDataFor] =  React.useState<any[]>([])

  const getUserAllowed = async () => {
    try {
      let allowedUser = await getAllowedUser()
      if (allowedUser?.data?.length > 0) {
        setData(allowedUser.data)
      } 
    } catch (e) {
      console.log(e)
    }
  } 

  const optionToPrint = () => {
    if (!Array.isArray(data) || data.length <= 0) return

    const email_ = String(cookieData?.email || '').trim().toLowerCase()

    // Todas las filas del usuario (mismo correo)
    const rowsUser = data.filter(person => 
      String(person?.email || '').trim().toLowerCase() === email_
    )

    // Solo Activo + URL válida (para tener sheetId y gid)
    const dataActive = data.filter((item) => {
      const hasUrl = (item?.url_exel ?? '').match(regex) !== null
      const isActive = String(item?.estado || '').toLowerCase() === 'activo'
      return isActive && hasUrl
    })

    // Si el usuario es admin → ve todo lo activo excepto filas con rol admin
    const isAdmin = rowsUser.some(r => 
      ROL_ADMIN_SISTEM.includes(String(r?.rol || '').toLowerCase())
    )

    if (isAdmin) {
      const dataFilter = dataActive.filter(item => 
        !ROL_ADMIN_SISTEM.includes(String(item?.rol || '').toLowerCase())
      )
      setDataFor(dataFilter)
      return
    }

    // Director (u otros): ver TODOS los programas asociados a su correo
    const allowedPrograms = new Set(rowsUser.map(r => r.programa))
    const dataFilter = dataActive.filter(item => allowedPrograms.has(item.programa))
    setDataFor(dataFilter)
    return
  }

  // recalcular cuando cambien los datos
  React.useEffect(() => {
    optionToPrint()
  }, [data, cookieData])

  React.useEffect(() => {
    const cookie_ = getCookieData('data')
    setCookieData(cookie_)
    getUserAllowed()
  },[])

  // Render item (dentro del componente para usar router/classes)
  const printActions = (element: any, index: number) => {
    const color = BORDER_COLORS[index % BORDER_COLORS.length]

    const handlerClick = (el: any) => {
      const matches = String(el?.url_exel || '').match(regex)
      if (!matches) return

      const sheetId = matches[1]
      const gid = matches[2]
      const cookieName = String(el?.proceso || '').toLowerCase() // "rrc" | "raac"
      
      setCookieRRC({
        sheetId,
        programa: el?.programa,
        proceso: el?.proceso,
        gid,
        year: el?.year,
        nameCookie: cookieName
      })
      
      router.push(`/${cookieName}`)
    }

    return (
      <React.Fragment key={`${element?.programa}-${element?.proceso}-${index}`}>
        <Grid2 
          style={{ borderTop: `6px solid ${color}` }} 
          onClick={() => handlerClick(element)} 
          className={classes.forItemsPanel}
        >
          <Typography style={{ color }} variant="h2">
            {`${element?.programa} - ${element?.proceso} ${element?.year}`}
          </Typography>
        </Grid2>
      </React.Fragment>
    )
  }

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
