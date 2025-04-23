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
import Show from '../../../../share/utils/Show'
// @ts-ignore
import PopUp from '../Popup/Popup'

// Material - IU
import { Typography, TextField, Grid2, Button } from '@mui/material';

// Quicks
import dynamic from 'next/dynamic'; // Importación dinámica
import 'react-quill/dist/quill.snow.css'; // Tema por defecto

// Carga ReactQuill solo en el cliente
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Hooks
import { useGlobalState } from '../../../../hooks/context'

// Fecth
import { updateDataTable } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { firstLevelPermission } from '../../../../libs/utils/utils'

export default (fieldType, labelText, value, element, shared, iframeView) => {
    const classes = useStyles();
    const [value_, setValue] = React.useState('');
    const [open, setOpen] = React.useState(false)
    const [valueTextArea, setValueTextArea] = React.useState(element.valor || '')
    const { globalState } = useGlobalState()

    const handleChange = (event) => {
      element.valor = event.target.value
      setValue(event.target.value);
    };
  
    const handlerTextField = (event) => {
      if (!firstLevelPermission(element)) return
      const newValue = event.target.value;
      element.valor = newValue
      setValueTextArea(newValue);
    }
  
    const autoSave = async (element) => {
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

    const classDisabledTextArea = () => {
      let class_ = classes.containerTextAreaNew
      let hasPermission = firstLevelPermission(element)
      return hasPermission? class_ : `${class_} ${classes.disabledTextArea}`
    }

    const classDisabledTableExtra = () => {
      let class_ = {width: '100%', position: "relative"}
      let hasPermission = firstLevelPermission(element)
      let classDisable = { opacity: "0.2"}
      let diabled = {...{...class_,...classDisable}}
      console.log(diabled)
      return hasPermission? class_ : diabled
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
            disabled={!firstLevelPermission(element)}
          />
        );
  
      case "textArea":
        return (
            <Grid2 className={classDisabledTextArea()}>
                <label><b>{labelText}</b></label>
                <ReactQuill 
                    value={valueTextArea} 
                    onChange={setValueTextArea} 
                    onBlur={async () => {await autoSave(element)}}
                />
                <Show when={!firstLevelPermission(element)}>
                  <Grid2 className={classes.diableBox} />
                </Show>
           </Grid2>
        );
  
      case "TableExtra":
        return (
          <Grid2 sx={classDisabledTableExtra()}>
            <Show when={firstLevelPermission(element)}>
              <Button sx={{ background: '#C8102E', color: 'white'}} onClick={() => setOpen(true)}>
                  <label><b>{labelText}</b></label>
              </Button>
            </Show>
            {/* @ts-ignore */} 
            <PopUp open={open} onClose={() => setOpen(false)}>
              <Grid2 sx={{ display: `${iframeView? 'block' : 'none'}`}} className={classes.iframe}>
                  <iframe
                    src={element?.valor}
                    width="100%"
                    height="800px"
                    frameBorder="0"
                    loading="lazy"
                  />
              </Grid2>
            </PopUp>
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

/* UTILS */
