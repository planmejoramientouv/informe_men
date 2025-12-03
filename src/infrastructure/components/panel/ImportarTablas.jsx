"use client"

import React from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import { useRouter } from 'next/router'
import { getCookieData } from '../../../../libs/utils/utils'

const ImportarTablas = () => {
  const router = useRouter()

  const [sheetInfo, setSheetInfo] = React.useState({
    programa: '',
    fileName: '',
    spreadsheetId: '',
    gid: '',
    proceso: '',
    loading: true,
  })

  const [working, setWorking] = React.useState(false)
  const [snack, setSnack] = React.useState({
    open: false,
    message: '',
    severity: 'success',
  })

  React.useEffect(() => {
    try {
      const path = (router.pathname || '').toLowerCase()

      let cookieName = 'rrc'
      if (path.includes('raac')) cookieName = 'raac'
      if (path.includes('rrc')) cookieName = 'rrc'

      const cookie = getCookieData(cookieName) || {}
      console.log('[ImportarTablas] cookie usada:', cookieName)
      console.log('[ImportarTablas] cookie data desencriptada:', cookie)

      const programa = cookie.programa || ''
      const sheetId  = cookie.sheetId || ''
      const gid      = cookie.gid || ''

      const proceso = cookieName.toUpperCase()

      const fileName = programa
        ? `Informe MEN - ${proceso} - ${programa}`
        : `Informe MEN - ${proceso} - (Programa sin nombre)`

      console.log('[ImportarTablas] programa:', programa)
      console.log('[ImportarTablas] sheetId (spreadsheetId):', sheetId)
      console.log('[ImportarTablas] gid:', gid)

      setSheetInfo({
        programa,
        fileName,
        spreadsheetId: sheetId,
        gid,
        proceso,
        loading: false,
      })
    } catch (e) {
      console.error('Error leyendo cookie en ImportarTablas:', e)
      setSheetInfo((prev) => ({ ...prev, loading: false }))
    }
  }, [router.pathname])

  const handleClick = async () => {
  try {
    setWorking(true)

    console.log('========== [ImportarTablas] ==========')
    console.log('Programa:', sheetInfo.programa)
    console.log('Nombre de archivo:', sheetInfo.fileName)
    console.log('SpreadsheetId (sheetId):', sheetInfo.spreadsheetId)
    console.log('gid actual:', sheetInfo.gid)
    console.log('Llamando a /api/importTables...')
    console.log('======================================')

    const res = await fetch('/api/importTables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadsheetId: sheetInfo.spreadsheetId,
        proceso: sheetInfo.proceso,
        gid: sheetInfo.gid,
      }),
    })

    const json = await res.json()
    console.log('[ImportarTablas] /api/importTables respuesta:', json)

    if (!res.ok || !json.status) {
      throw new Error(json.error || 'Falló /api/importTables')
    }

    const importedCount = (json.data?.results || []).filter(
      (r) => !r.skipped
    ).length

    setSnack({
      open: true,
      severity: 'success',
      message: `Se importaron ${importedCount} tablas en "${json.data.sheetTitle}".`,
    })

    await router.replace(router.asPath);
  } catch (e) {
    console.error(e)
    setSnack({
      open: true,
      severity: 'error',
      message: e?.message || 'No se pudo importar las tablas.',
    })
  } finally {
    setWorking(false)
  }
}

  const disabled =
    sheetInfo.loading || !sheetInfo.spreadsheetId || working

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        size="small"
        startIcon={working ? <CircularProgress size={16} /> : <CloudSyncIcon />}
        onClick={handleClick}
        disabled={disabled}
      >
        {sheetInfo.loading
          ? 'Cargando…'
          : !sheetInfo.spreadsheetId
          ? 'No hay sheetId en la cookie del proceso'
          : working
          ? 'Procesando…'
          : 'Importar tablas'}
      </Button>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ImportarTablas
