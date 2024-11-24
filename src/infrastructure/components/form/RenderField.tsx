/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import printTableAspectos from './TableAspectos'
import printTableCriterios from './TableCriterion'


// Material - IU
import { Typography, TextField, Grid2 } from '@mui/material';

// Quicks
import dynamic from 'next/dynamic'; // Importación dinámica
import 'react-quill/dist/quill.snow.css'; // Tema por defecto

// Carga ReactQuill solo en el cliente
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Hooks
import { useGlobalState } from '../../../../hooks/context'

// Fecth
import { updateDataTable } from '../../../../hooks/fecth/handlers/handlers'

export default (fieldType, labelText, value, element, shared, iframeView) => {
    const classes = useStyles();
    const [value_, setValue] = React.useState('');
    const [valueTextArea, setValueTextArea] = React.useState(element.valor || '')
    const { globalState } = useGlobalState()

    const handleChange = (event) => {
      element.valor = event.target.value
      setValue(event.target.value);
    };
  
    const handlerTextField = (event) => {
      const newValue = event.target.value;
      element.valor = newValue
      setValueTextArea(newValue);
    }
  
    const autoSave = async (element) => {
      console.log(element,"elemen")
      if (element?.valor?.length <= 0) return
      
      let data = [element]
      let dataSheet = globalState.data
      console.log(data)
      const response  = await updateDataTable({
        sheetId: dataSheet.sheetId,
        gid: dataSheet.gid,
        data: data
      })

      if (response?.data)
          console.log("Guardado Exitoso!!!")
    }

    React.useEffect(() => {
      element.valor = valueTextArea
    },[valueTextArea])

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
  
      case "h2":
        return (
          <Grid2 sx={{ width: '100%' }}>
              <Typography
                variant="h2"
                className={classes.titleInputs}
              >
                {labelText}
              </Typography>
              <hr />
          </Grid2>
        );
    
      case "text":
        return (
          <TextField
            variant="outlined"
            className={classes.inputText}
            onInput={handlerTextField}
            label={labelText}
            onBlur={async () => {await autoSave(element)}}
            defaultValue={value}
          />
        );
  
      case "textArea":
        return (
          <Grid2 className={classes.containerTextAreaNew}>
              <label><b>{labelText}</b></label>
              <ReactQuill value={valueTextArea} onChange={setValueTextArea} onBlur={async () => {await autoSave(element)}}/>
          </Grid2>
        );
  
      case "TableExtra":
        return (
          <Grid2 sx={{width: '100%'}}>
            <label><b>{labelText}</b></label>
            <Grid2 sx={{ display: `${iframeView? 'block' : 'none'}`}} className={classes.iframe}>
                <iframe
                  src={element?.valor}
                  width="100%"
                  height="400px"
                  frameBorder="0"
                  loading="lazy"
                />
            </Grid2>
          </Grid2>
      );
  
      case "tabla_aspectos":  
        return (printTableAspectos(element, shared));
  
      case "Tabla_criterios":  
        return (printTableCriterios(element, shared, autoSave));
        
      default:
        return null;
    }
};