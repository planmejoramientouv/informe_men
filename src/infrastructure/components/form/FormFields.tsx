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
import { Typography, TextField, TextareaAutosize, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

// Def
export default () => {
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
    return (
        <React.Fragment key={index}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <b>{element?.primary?.variables}</b>
                </AccordionSummary>
                <AccordionDetails>
                    <For func={printFields} list={element.data} />
                </AccordionDetails>
            </Accordion>
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
            {renderField(
                fieldTraslate[element.tipo], 
                element.texto, 
                element.valor
            )}
        </React.Fragment>
    )
}

const renderField = (fieldType,labelText,value) => {
    console.log(fieldType, labelText)
    switch (fieldType) {
      case "h1":
        return <Typography variant="h1" sx={{ color: '#222', textTransform: 'uppercase', fontSize: '2em' , fontWeight: '700'}}>{labelText}</Typography>;

      case "text":
        return (
          <TextField
            sx={{ margin: '10px 0px'}}
            label={labelText} 
            value={value} 
            fullWidth 
          />
        );

      case "textArea":
        return (
          <FormControl fullWidth sx={{ margin: '10px 0px'}}>
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
          <FormControl fullWidth sx={{ margin: '10px 0px'}}>
            <InputLabel>{labelText}</InputLabel>
            <Select
              value={value}
            >
              <MenuItem value="opcion1">Opción 1</MenuItem>
              <MenuItem value="opcion2">Opción 2</MenuItem>
              <MenuItem value="opcion3">Opción 3</MenuItem>
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

const FormularioDinamico = ({ a, labelText, value, handleChange }) => {
  


  return (
    <div>
      {renderField(fieldTranslate[a])}
    </div>
  );
};