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
import renderField from './RenderField'

// Material - IU
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { Typography, TextField, Grid2, Button } from '@mui/material';

// Hooks
import { useGlobalState } from '../../../../hooks/context'

// Fecth
import { updateDataTable } from '../../../../hooks/fecth/handlers/handlers'

// Print Accordion
export default (element, index) => {
    const classes = useStyles();
    const [dataSheet,setDataSheet] = React.useState({} as any)
    const [isLoading, setIsLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [isSuccess, setSuccess] = React.useState(false)
    const [errorText, setErrorText] = React.useState('Guardado Exitoso')
    const { globalState } = useGlobalState()
  
    const submit = async (data) => {
      setIsLoading(true)
      const response  = await updateDataTable({
        sheetId: dataSheet.sheetId,
        gid: dataSheet.gid,
        data: data
      })
  
      if (response?.data) {
        setOpen(true)
        setSuccess(response.data)
        setErrorText(response.data? 'Guardado Exitoso' : 'Error al Guardar')
      }
      setIsLoading(false)
    }
  
    const handleClose = () => {
        setOpen(false)
    }
  
    React.useEffect(() => {
      if (globalState.data?.sheetId) {
        setDataSheet({
          sheetId: globalState.data?.sheetId,
          gid: globalState.data?.gid
        })
      }
    }, [globalState])
  
    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission()}>
            <Grid2 className={classes.tabContentPanel} sx={{ border: `1px solid ${element?.primary?.background}` }}>
                <Grid2 className={classes.listFormSection}>
                  <Grid2 className={classes.ColapsableTwo}>
                    <Typography
                        variant="h1"
                        className={classes.titlePrimary}>
                        {element?.primary?.texto}
                    </Typography>
                    <hr />
                  </Grid2>
                  <For func={printFields} list={element.data} shared={element.data}/>
                </Grid2>
                <Grid2 className={classes.centerButton}>
                    <Button 
                        disabled={isLoading}  
                        onClick={() => submit(element.data)} 
                        variant="contained" 
                        className={classes.buttonSave}>
                      {!isLoading ? 'Guardar' : 'Actualizando'}
                    </Button>
                </Grid2>
                <Box sx={{ width: 500 }}>
                  <Snackbar
                      autoHideDuration={6000}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      open={open}
                      onClose={handleClose}
                      key={2}
                  >
                     <Alert severity={isSuccess? "success" : "error"}>{errorText}</Alert> 
                  </Snackbar>
                </Box>
              </Grid2>
        </Show>
      </React.Fragment>
    )
}

const printFields = (element, index, shared) => {
    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission()}>
          <>
          <Show when={!element.typeComponent}>
              {renderField(
                fieldTraslate[element.tipo],
                element.texto,
                element.valor,
                element,
                shared
              )}
          </Show>
  
          <Show when={element.typeComponent}>
              {renderFieldColapsable(element, shared)}
          </Show>
          </>
        </Show>
      </React.Fragment>
    )
}
  
const renderFieldColapsable = (element,shared) => {
    const classes = useStyles();  
    const colapsable2 = element?.data?.find( item => item.tipo  ===  'Colapsable2')
    
    return (
    <React.Fragment>
        <Accordion className={classes.containerAccordion}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            >
            <Typography><b>{colapsable2?.texto}</b></Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.containerDetailsAccordion}>
            <For func={renderColapsable} list={element.data} shared={shared}/>
            </AccordionDetails>
        </Accordion>
    </React.Fragment>
    )
}

const renderColapsable = (element, index, shared) => {
    return (
        <React.Fragment key={index}>
        <Show when={firstLevelPermission()}>
            {renderField(
            fieldTraslate[element.tipo],
            element.texto,
            element.valor,
            element,
            shared
            )}
        </Show>
        </React.Fragment>
    )
}
  
/* UTILS */ 

const firstLevelPermission = (): boolean => {
    return true
}

const fieldTraslate = {
    "Titulo1": "h1",
    "Titulo2": "h2",
    "Campo": "text",
    "TextArea": "textArea",
    "Colapsable2": "Colapsable2",
    "GradoCumplimiento": "GradoCumplimiento",
    "Criterio": "select",
    "ConclusionCondicion": "ConclusionCondicion",
    "tabla_aspectos": "tabla_aspectos",
    "Tabla_criterios": "Tabla_criterios",
    "TablaExtra": "TableExtra"
  }