"use client"

// React
import React from 'react'
import { useForm } from 'react-hook-form'

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Material - IU
import Box from '@mui/material/Box'
import { Grid2 } from '@mui/material'

// Components
import Show from '../../../../share/utils/Show'
import FormFields from '../../components/form/FormFields'
import EditorsManagerLauncher from '../../components/editors/EditorsManagerLauncher'

export default function FormRRC() {
  const classes = useStyles()
  const [hydrated, setHydrated] = React.useState(false)
  const { handleSubmit, watch } = useForm()

  // Lo que eliges en el formulario ("condición")
  const nivelActual = String(watch('condicion') ?? '')

  const onSubmit = (data:any) => {
    console.log('Datos enviados:', data)
  }

  React.useEffect(() => { setHydrated(true) }, [])

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Show when={hydrated}>
          <Box className={classes.containerForm}>
            {/* <DownloadDoc /> */}
            <Grid2 className={classes.containerFields}>
              <Grid2 className={classes.FormItems}>
                <FormFields />
                <div style={{ marginTop: 12 }}>
                  <EditorsManagerLauncher defaultNivel={nivelActual} />
                </div>
              </Grid2>
            </Grid2>
          </Box>
        </Show>
      </form>
    </React.Fragment>
  )
}
