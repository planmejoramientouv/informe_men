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
import RenderField from './RenderField'

// Material - IU
import Box from '@mui/material/Box';
import { Dialog, DialogTitle, DialogContent, DialogActions,  Typography, TextField, Grid2, Button,Checkbox, FormControlLabel } from '@mui/material';

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
    const [open, setOpen] = React.useState(false)
    const { globalState } = useGlobalState()
    const [hydrated, setHydrated] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState({});

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
                    element?.data?.map((el, idx) => 
                      <PrintFields 
                          key={idx} 
                          element={el} 
                          index={idx} 
                          shared={element.data}
                          openDialog={openDialog}
                          setOpenDialog={setOpenDialog}
                      />)
                  }
                </Grid2>
                <CheckboxesWithText data={element?.primary} globalState={globalState}/>
              </Grid2>
        </Show>
      </React.Fragment>
    )
}

const PrintFields = ({ element, index, shared, openDialog, setOpenDialog}) => {
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
              setOpenDialog={setOpenDialog}
            />
          </Show>
  
          <Show when={element.typeComponent}>
              <RenderFieldColapsable 
                element={element} 
                shared={shared}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
              />
          </Show>
          </>
        </Show>
      </React.Fragment>
    )
}
  
const RenderFieldColapsable = ({element, shared, openDialog, setOpenDialog}) => {
    console.log(element,shared)
    const classes = useStyles();  
    const colapsable2 = element?.data?.find( item => item.tipo  ===  'Colapsable2')

    const handleOpen = () => {
      setOpenDialog({
        ...openDialog,
        [element.id]: true
      });
    };

    const handleClose = () => {
      setOpenDialog({
        ...openDialog,
        [element.id]: false
      });
    };

    return (
    <React.Fragment>
      <Dialog
        open={Boolean(openDialog[element.id])}
        onClose={handleClose}
        aria-labelledby={`dialog-title-${element.id}`}
        sx={{
            width: '100%',
            zIndex: "1300",
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: '1000px',
              height: 'auto',
              overflowY: 'auto',
            },
        }}
      >
        <DialogTitle id={`dialog-title-${element.id}`}>
          <Typography variant="h6">
            {colapsable2?.texto || "Detalle"}
          </Typography>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {element?.data?.map((el, idx) => {
            // Si no es tabla_aspectos, muéstralo normal
            if (el.tipo !== "tabla_aspectos") {
              return (
                <RenderColapsable
                  key={idx}
                  element={el}
                  shared={shared}
                  index={idx}
                />
              );
            }

            // Si es tabla_aspectos, mostrar solo el primero
            const isFirstAspect = element.data.findIndex(
              (item) => item.tipo === "tabla_aspectos"
            ) === idx;
            if (isFirstAspect) {
              return (
                <RenderColapsable
                  key={idx}
                  element={el}
                  shared={shared}
                  index={idx}
                />
              );
            }

            // Ignorar los demás
            return null;
          })}
        </DialogContent>


        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Guardar y Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
    )
} 

const RenderColapsable = ({element, index, shared}) => {
  console.log(fieldTraslate[element.tipo], element , "shared", shared)
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