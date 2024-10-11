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

// Hoosk
import { useGlobalState } from '../../../../hooks/context'

// Material - IU
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Typography, TextField, TextareaAutosize, MenuItem, FormControl, InputLabel, Select, Grid2 } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';

// Fecth
import { updateDataTable } from '../../../../hooks/fecth/handlers/handlers'

// Def
export default () => {
  const classes = useStyles();
  const [formData, setFormData] = React.useState([])
  const { globalState } = useGlobalState()

  React.useEffect(() => {
    if (globalState.data?.formdata?.length > 0) {
      setFormData(globalState.data?.formdata)
    }
  }, [globalState])

  return (
    <React.Fragment>
      <Show when={formData.length > 0}>
        <For func={printAccordion} list={formData} />
      </Show>
    </React.Fragment>
  )
}

// Print Accordion
const printAccordion = (element, index) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const [dataSheet,setDataSheet] = React.useState({} as any)
  const [isLoading, setIsLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [isSuccess, setSuccess] = React.useState(false)
  const [errorText, setErrorText] = React.useState('Guardado Exitoso')
  const { globalState } = useGlobalState()

  const handleToggleAccordion = () => {
    setExpanded(!expanded);
  };

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

  const handleCloseAccordion = (e) => {
    e.stopPropagation()
    setExpanded(false)
  };

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
        <Accordion expanded={expanded} onChange={handleToggleAccordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <b>{element?.primary?.variables}</b>
          </AccordionSummary>
          <AccordionDetails>
            <a className={classes.containerCloseButtom} onClick={handleCloseAccordion} />
            <Grid2 className={classes.containerFormSection}>
              <Grid2 className={classes.listFormSection}>
                <Grid2 className={classes.ColapsableTwo}>
                  <Typography
                      variant="h1"
                      className={classes.titleInputs}>
                      {element?.primary?.texto}
                  </Typography>
                </Grid2>
                <For func={printFields} list={element.data} />
              </Grid2>
              <Button 
                  disabled={isLoading}  
                  onClick={() => submit(element.data)} 
                  variant="contained" 
                  className={classes.buttonSave}>
                 {!isLoading ? 'Guardar' : 'Actualizando'}
              </Button>
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
          </AccordionDetails>
        </Accordion>
      </Show>
    </React.Fragment>
  )
}

const fieldTraslate = {
  "Titulo1": "h1",
  "Campo": "text",
  "TextArea": "textArea",
  "Colapsable2": "Colapsable2",
  "GradoCumplimiento": "GradoCumplimiento",
  "Criterio": "select",
  "TablaExtra": "TablaExtra",
  "ConclusionCondicion": "ConclusionCondicion"
}

const printFields = (element, index) => {
  return (
    <React.Fragment key={index}>
      <Show when={firstLevelPermission()}>
        {renderField(
          fieldTraslate[element.tipo],
          element.texto,
          element.valor,
          element
        )}
      </Show>
    </React.Fragment>
  )
}

const renderField = (fieldType, labelText, value, element) => {
  const classes = useStyles();

  const [value_, setValue] = React.useState('');

  const handleChange = (event) => {
    element.valor = event.target.value
    setValue(event.target.value);
  };

  const handlerTextField = (event) => {
    element.valor = event.target.value
  }

  switch (fieldType) {
    case "h1":
      return (
        <Grid2 sx={{ width: '100%' }}>
          <Typography
            variant="h1"
            className={classes.titleInputs}
          >
            {labelText}
          </Typography>
        </Grid2>
      );

    case "text":
      return (
        <TextField
          variant="outlined"
          className={classes.inputText}
          onInput={handlerTextField}
          label={labelText}
          defaultValue={value}
        />
      );

    case "textArea":
      return (
        <FormControl sx={{ margin: '10px 0px' }}>
          <label>{labelText}</label>
          <TextareaAutosize
            minRows={3}
            value={value}
            onInput={handlerTextField}
            style={{ width: '100%' }}
          />
        </FormControl>
      );

    case "select":
      return (
        <FormControl sx={{zIndex: 9999}} className={classes.inputText}>
          <InputLabel>{labelText}</InputLabel>
          <Select
            value={value_}
            onChange={handleChange}
          >
            <MenuItem value="Plenamente (A)">Plenamente (A)</MenuItem>
            <MenuItem value="Alto Grado (B)">Alto Grado (B)</MenuItem>
            <MenuItem value="Aceptable (C)">Aceptable (C)</MenuItem>
            <MenuItem value="Insatisfactorio (D)">Insatisfactorio (D)</MenuItem>
          </Select>
        </FormControl>
      );

    case "Colapsable2":
      return(
        <Grid2 className={classes.ColapsableTwo}>
            <hr />
            <Typography
            variant="h1"
            className={classes.titleInputs}
          >
            {labelText}
          </Typography>
        </Grid2>
      )

    default:
      return null;
  }
};

const firstLevelPermission = (): boolean => {
  return true
}