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
import PrintTableAspectos from './TableAspectos'
import PrintTableCriterios from './TableCriterion'
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

export default ({ fieldType, labelText, value, element, shared, iframeView, setOpenDialog, htmlId, onSaveValues, onSaveChecks, saving = false,}: any) => {
    const classes = useStyles();
    const [value_, setValue] = React.useState('');
    const [open, setOpen] = React.useState(false)
    const [valueTextArea, setValueTextArea] = React.useState(element.valor || '')
    const [hydrated, setHydrated] = React.useState(false);
    const { globalState } = useGlobalState()

    const [textValue, setTextValue] = React.useState(value ?? '');
    const [richValue, setRichValue] = React.useState(element?.valor ?? '');

    const textDebRef = React.useRef<any>(null);
    const richDebRef = React.useRef<any>(null);

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

    // ===== Helpers de guardado =====
  const saveNow = React.useCallback(async (val: string) => {
    if (!element?.id) return;
    if (typeof onSaveValues === 'function') {
      await onSaveValues([{ id: element.id, valor: val ?? '' }]);
    }
  }, [element?.id, onSaveValues]);

  const queueSaveText = (val: string) => {
    if (textDebRef.current) clearTimeout(textDebRef.current);
    textDebRef.current = setTimeout(() => { saveNow(val); }, 500);
  };

  const queueSaveRich = (val: string) => {
    if (richDebRef.current) clearTimeout(richDebRef.current);
    richDebRef.current = setTimeout(() => { saveNow(val); }, 600);
  };

  const classDisabledTextArea = () => {
    let class_ = classes.containerTextAreaNew
    let hasPermission = firstLevelPermission(element)
      return hasPermission ? class_ : `${class_} ${classes.disabledTextArea}`
    }

    const classDisabledTableExtra = () => {
      let base = { width: '100%', position: "relative" } as any
      let hasPermission = firstLevelPermission(element)
      return hasPermission ? base : { ...base, opacity: "0.2" }
    }

    // Si cambia el valor externo (primera carga), sincroniza estados locales
    React.useEffect(() => {
      setTextValue(value ?? '');
    }, [value]);

    React.useEffect(() => {
      setRichValue(element?.valor ?? '');
    }, [element?.valor]);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    React.useEffect(() => {
      return () => {
        if (textDebRef.current) clearTimeout(textDebRef.current);
        if (richDebRef.current) clearTimeout(richDebRef.current);
      };
    }, []);
  
    if (!hydrated) return null;

    switch (fieldType) {
      case "h1":
        return (
          <Grid2 sx={{ width: '100%' }}>
            <Typography
              id={htmlId}
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
                id={htmlId}
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
            id={htmlId}
            variant="outlined"
            className={classes.inputText}
            label={labelText}
            value={textValue}
            onChange={(e) => {
              if (!firstLevelPermission(element)) return;
              const v = e.target.value ?? '';
              setTextValue(v);
              if (textDebRef.current) clearTimeout(textDebRef.current);
              textDebRef.current = setTimeout(() => { saveNow(v); }, 900); // ← 900ms
            }}
            // onBlur={async () => { if (!firstLevelPermission(element)) return; await saveNow(textValue); }}
            disabled={saving || !firstLevelPermission(element)}
          />
        );
  
      case "textArea":
        return (
          <Grid2 id={htmlId} className={classDisabledTextArea()}>
            <label><b>{labelText}</b></label>
            <ReactQuill
              value={richValue}
              onChange={(v: string) => {
                if (!firstLevelPermission(element)) return;
                setRichValue(v);
                if (richDebRef.current) clearTimeout(richDebRef.current);
                richDebRef.current = setTimeout(() => { saveNow(v); }, 1000); // ← 1000ms
              }}
              // ❌ quita el guardado en blur
              // onBlur={async () => { if (!firstLevelPermission(element)) return; await saveNow(richValue); }}
              readOnly={saving || !firstLevelPermission(element)}
            />
            <Show when={!firstLevelPermission(element)}>
              <Grid2 className={classes.diableBox} />
            </Show>
          </Grid2>
        );
  
      case "TableExtra":
        return (
          <Grid2 id={htmlId} sx={classDisabledTableExtra()}>
            <Show when={firstLevelPermission(element)}>
              <Button sx={{ background: '#C8102E', color: 'white'}} onClick={() => setOpen(true)}>
                  <label><b>{labelText}</b></label>
              </Button>
            </Show>
            {/* @ts-ignore */} 
            <PopUp open={open} onClose={() => setOpen(false)}>
              <Grid2 sx={{ display: `${iframeView? 'none' : 'block'}`}} className={classes.iframe}>
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
        return <PrintTableAspectos htmlId={htmlId} element={element} shared={shared} />
  
      case "Tabla_criterios":
        const autoSave = async (rowOrElement: any) => {
          // Acepta { id, valor } o element con .id y .valor
          const id = String(rowOrElement?.id ?? element?.id);
          const valor = String(rowOrElement?.valor ?? element?.valor ?? '');
          if (typeof onSaveValues === 'function' && id) {
            await onSaveValues([{ id, valor }]);
          }
        };
        return (
          <PrintTableCriterios
            htmlId={htmlId}
            setOpenDialog={setOpenDialog}
            element={element}
            shared={shared}
            autoSave={autoSave}
          />
        );

      default:
        return null;
      }
};

/* UTILS */
