"use-client"

/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import Show from '../../../../share/utils/Show'
import For from '../../../../share/utils/For'
import ComponentsTab from './TabComponents'
import { getCookieData } from '../../../../libs/utils/utils'
import { postUpdateRRC, postUpdateCheckboxRRC } from '../../../../hooks/fecth/handlers/handlers'

// Hoosk
import { useGlobalState } from '../../../../hooks/context'

// Def
export default () => {
  const [formData, setFormData] = React.useState([])
  const [hydrated, setHydrated] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const { globalState } = useGlobalState()

  // Lee una sola vez la cookie 'rrc' con sheetId/gid del archivo propio
  const cookie = React.useMemo(() => getCookieData('rrc') || {}, [])

  React.useEffect(() => {
    if (globalState.data?.formdata?.length > 0) {
      console.log("FormData", globalState.data?.formdata)
      setFormData(globalState.data?.formdata)
    }
  }, [globalState])

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  // Guardar valores en columna G (payload: [{ id, valor }, ...])
  const handleSaveValues = async (rows) => {
    const sheetId = cookie?.sheetId || globalState?.data?.sheetId
    const gid = cookie?.gid || globalState?.data?.gid
    if (!sheetId || !gid) {
      throw new Error("Falta sheetId/gid (cookie o globalState). Regresa al panel y selecciona el proceso.")
    }
    setSaving(true)
    try {
      await postUpdateRRC({
        sheetId,
        gid,
        data: (rows || []).map(r => ({
          id: String(r.id),
          valor: r.valor ?? ''
        })),
      })
      return true
    } finally {
      setSaving(false)
    }
  }

  // Guardar checks en columna G (payload: [{ id, checkbox }, ...])
  const handleSaveChecks = async (rows) => {
    const sheetId = cookie?.sheetId || globalState?.data?.sheetId
    const gid = cookie?.gid || globalState?.data?.gid
    if (!sheetId || !gid) {
      throw new Error("Falta sheetId/gid (cookie o globalState).")
    }
    setSaving(true)
    try {
      await postUpdateCheckboxRRC({
        sheetId,
        gid,
        data: (rows || []).map(r => ({
          id: String(r.id),
          checkbox: typeof r.checkbox === 'boolean'
            ? (r.checkbox ? 'TRUE' : '')
            : (r.checkbox || '')
        })),
        // Para RRC usamos G; en el fetcher ya lo forzamos, pero si tu API lo pide:
        // row_: 'G',
        ...(rows?.[0]?.row_ ? { row_: rows[0].row_ } : {}),
      })
      return true
    } finally {
      setSaving(false)
    }
  }

  return (
    <React.Fragment>
      <Show when={formData.length > 0 && hydrated}>
        <ComponentsTab
          element={formData}
          index={null}
          onSaveValues={handleSaveValues}
          onSaveChecks={handleSaveChecks} // si aún no usas checks, puedes omitirla
          saving={saving}
        />
      </Show>
    </React.Fragment>
  )
}
