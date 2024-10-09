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
import { Typography, TextField, TextareaAutosize, MenuItem, FormControl, InputLabel, Select, Grid2 } from '@mui/material';

// Def
export default () => {
  const classes = useStyles();
  const [formData, setFormData] = React.useState([])
  const { globalState } = useGlobalState()

  React.useEffect(() => {
    if (globalState.data?.formdata?.length > 0) {
      console.log(globalState.data?.formdata)
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

const printAccordion = (element, index) => {
  const classes = useStyles();

  return (
    <React.Fragment key={index}>
      <Show when={firstLevelPermission}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <b>{element?.primary?.variables}</b>
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 className={classes.containerFormSection}>
              <For func={printFields} list={element.data} />
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
      <Show when={firstLevelPermission}>
        {renderField(
          fieldTraslate[element.tipo],
          element.texto,
          element.valor
        )}
      </Show>
    </React.Fragment>
  )
}

const renderField = (fieldType, labelText, value) => {
  const classes = useStyles();

  const [value_, setValue] = React.useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

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
            style={{ width: '100%' }}
          />
        </FormControl>
      );

    case "select":
      return (
        <FormControl className={classes.inputText}>
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

    default:
      return null;
  }
};

const firstLevelPermission = () => {
  return true
}