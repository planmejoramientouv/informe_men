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
import { Typography, TextField, Grid2, Button,Checkbox, FormControlLabel } from '@mui/material';

// Hooks
import { useGlobalState } from '../../../../hooks/context'

// Fecth
import { updateDataTable } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { firstLevelPermission, checkboxLevelPermission } from '../../../../libs/utils/utils'

// Print Accordion
export default (element, index) => {
    const classes = useStyles();
    const [dataSheet,setDataSheet] = React.useState({} as any)
    const [isLoading, setIsLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [isSuccess, setSuccess] = React.useState(false)
    const [errorText, setErrorText] = React.useState('Guardado Exitoso')
    const { globalState } = useGlobalState()
  
    const handleClose = () => {
        setOpen(false)
    }
  
    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission(element?.primary)}>
            <Grid2  className={classes.tabContentPanel} sx={{ border: `1px solid ${element?.primary?.background}` }}>
                <Grid2 className={classes.listFormSection}>
                  <Grid2 className={classes.ColapsableTwo}>
                    <Typography
                        variant="h1"
                        className={classes.titlePrimary}>
                        {element?.primary?.texto}aa
                    </Typography>
                    <hr />
                  </Grid2>
                  <For func={printFields} list={element.data} shared={element.data}/>
                </Grid2>
                <CheckboxesWithText data={element?.primary}/>
              </Grid2>
        </Show>
      </React.Fragment>
    )
}

const printFields = (element, index, shared) => {
    return (
      <React.Fragment key={index}>
        <Show when={true}>
          <>
          <Show when={!element.typeComponent}>
              {renderField(
                fieldTraslate[element.tipo],
                element.texto,
                element.valor,
                element,
                shared,
                null
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
    const [expanded, setExpanded] = React.useState(false);

    const handleAccordionChange = () => {
        shared[0].iframeView = !expanded
        setExpanded(!expanded);
    }

    return (
    <React.Fragment>
        <Accordion onChange={handleAccordionChange} className={classes.containerAccordion}>
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
        {/* <Show when={firstLevelPermission(element)}> */}
            {renderField(
            fieldTraslate[element.tipo],
            element.texto,
            element.valor,
            element,
            shared,
            shared[0]?.iframeView
            )}
        {/* </Show> */}
        </React.Fragment>
    )
}
  
const CheckboxesWithText = ({ data }) => {
  console.log(data)
  return (
    <Box sx={{ marginTop: '20px'}}>
      {/* Primer Checkbox */}
      <FormControlLabel
        control={
          <Checkbox 
              defaultChecked={data?.checkbox_director !== 'FALSE'} 
              disabled={checkboxLevelPermission(1)}
          />}
        label="Opción Director"
      />
      <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '32px' }}>
        Confirmar si el director revisó y aprobó los cambios finales.
      </Typography>

      {/* Segundo Checkbox */}
      <FormControlLabel
        control={
          <Checkbox 
              defaultChecked={data?.checkbox_daca !== 'FALSE'} 
              disabled={checkboxLevelPermission(2)}
          />}
        label="Opción Daca"
      />
      <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '32px' }}>
         Confirmar si Daca revisó y aprobó los cambios finales.
      </Typography>
    </Box>
  );
}

/* UTILS */ 

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