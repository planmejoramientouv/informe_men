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
import RenderField from './RenderField'

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
// import { updateCheckbox } from '../../../../libs/googlesheet'
// Fecth
import { updateDataTable, updateCheckboxClient } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { firstLevelPermission, checkboxLevelPermission } from '../../../../libs/utils/utils'

// Print Accordion
export default ({ element, index }) => {
    if (!element?.primary) return null;
    const classes = useStyles();
    const [dataSheet,setDataSheet] = React.useState({} as any)
    const [isLoading, setIsLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [isSuccess, setSuccess] = React.useState(false)
    const [errorText, setErrorText] = React.useState('Guardado Exitoso')
    const { globalState } = useGlobalState()
    const [hydrated, setHydrated] = React.useState(false);

    const handleClose = () => {
        setOpen(false)
    }

    React.useEffect(() => {
        setHydrated(true);
    }, []);
  
    if (!hydrated) return null;
    
    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission(element?.primary)}>
            <Grid2  className={classes.tabContentPanel} sx={{ border: `1px solid ${element?.primary?.background}` }}>
                <Grid2 className={classes.listFormSection}>
                  <Grid2 className={classes.ColapsableTwo}>
                    <Typography
                        variant="h1"
                        className={classes.titlePrimary}>
                        {element?.primary?.texto}
                    </Typography>
                    <hr />
                  </Grid2>
                  {/* <For func={printFields} list={element.data} shared={element.data}/> */}
                  {
                    element?.data?.map((el, idx) => <PrintFields key={idx} element={el} index={idx} shared={element.data} />)
                  }
                </Grid2>
                <CheckboxesWithText data={element?.primary} globalState={globalState}/>
              </Grid2>
        </Show>
      </React.Fragment>
    )
}

const PrintFields = ({ element, index, shared }) => {
    return (
      <React.Fragment key={index}>
        <Show when={true}>
          <>
          <Show when={!element.typeComponent}>
            <RenderField 
              fieldType={fieldTraslate[element.tipo]}
              labelText={element.texto} 
              value={element.valor} 
              element={element} 
              shared={shared}
              iframeView={null} 
            />
          </Show>
  
          <Show when={element.typeComponent}>
              <RenderFieldColapsable element={element} shared={shared} />
          </Show>
          </>
        </Show>
      </React.Fragment>
    )
}
  
const RenderFieldColapsable = ({element,shared}) => {
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
            {/* <For func={renderColapsable} list={element.data} shared={shared}/> */}
            {element?.data?.map((el, idx) => <RenderColapsable key={idx} element={element.data} shared={shared} index={idx} />)}
            </AccordionDetails>
        </Accordion>
    </React.Fragment>
    )
} 

const RenderColapsable = ({element, index, shared}) => {
    return (
        <React.Fragment key={index}>
          <Show when={firstLevelPermission(element)}>
              <RenderField 
                fieldType={fieldTraslate[element.tipo]}
                labelText={element.texto} 
                value={element.valor} 
                element={element} 
                shared={shared}
                iframeView={shared[0]?.iframeView} 
              />
          </Show>
        </React.Fragment>
    )
}
  
const CheckboxesWithText = ({ data, globalState }) => {
  
  const handlerChange = async (e:  React.ChangeEvent<HTMLInputElement>, type: string) => {
      let dataSheet = []
      data.checkbox = (e.target).checked
      dataSheet.push(data)
      console.log(globalState.data,data,data.checkbox)
      const update = await updateCheckboxClient({
        sheetId: globalState.data.sheetId,
        gid: globalState.data.gid,
        data: dataSheet,
        row_: type
      })
  }

  return (
    <Box sx={{ marginTop: '20px'}}>
      {/* Primer Checkbox */}
      <FormControlLabel
        control={
          <Checkbox 
              defaultChecked={data?.checkbox_director !== 'FALSE'} 
              disabled={checkboxLevelPermission(1)}
              onChange={(e) => handlerChange(e,'M')}
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
              onChange={(e) => handlerChange(e,'N')}
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