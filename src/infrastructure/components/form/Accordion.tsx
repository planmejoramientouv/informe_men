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
import { Dialog, DialogTitle, DialogContent, DialogActions,  Typography, TextField, Grid2, Button,Checkbox, FormControlLabel, CircularProgress} from '@mui/material';

// Hooks
import { useGlobalState } from '../../../../hooks/context'
// import { updateCheckbox } from '../../../../libs/googlesheet'
// Fecth
import { updateCheckboxClient } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { firstLevelPermission, checkboxLevelPermission } from '../../../../libs/utils/utils'

// Print Accordion
export default ({ element, index, onSaveValues, onSaveChecks, saving = false }) => {
    if (!element?.primary) return null;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false)
    const { globalState } = useGlobalState()
    const [hydrated, setHydrated] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState({});

    // Bloquear sección por DACA
    const [sectionLocked, setSectionLocked] = React.useState(
      toSheetBool(element?.primary?.checkbox_daca)
    );

    // --- NUEVO: estados de loading global ---
    const [loadingDirector, setLoadingDirector] = React.useState(false);
    const [loadingDaca, setLoadingDaca] = React.useState(false);
    const loadingGlobal = loadingDirector || loadingDaca;

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    React.useEffect(() => {
      setSectionLocked(toSheetBool(element?.primary?.checkbox_daca));
    }, [element?.primary?.checkbox_daca]);

    if (!hydrated) return null;
    
    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission(element?.primary)}>
          <Box sx={{ position: 'relative' }}>
            {/* Overlay global */}
            {loadingGlobal && (
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 20,
                  right: 24,         
                  bottom: 24,         
                  width: 'auto',      
                  height: 'auto',      
                  bgcolor: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%', 
                  p: 2,               
                  pointerEvents: 'all',
                }}
              >
                <CircularProgress size={56} thickness={5} />
              </Box>
            )}

            <Grid2  className={classes.tabContentPanel} sx={{ opacity: loadingGlobal ? 0.5 : 1, pointerEvents: loadingGlobal ? 'none' : 'auto' }}>
                <Grid2 
                  className={classes.listFormSection}
                  sx={
                    sectionLocked
                    ? { pointerEvents: 'none', opacity: 0.5, transition: 'all .2s ease' }
                    : undefined
                  }
                >
                  <Grid2 className={classes.ColapsableTwo}>
                    <Typography
                        variant="h1"
                        className={classes.titlePrimary}
                        id="node-section-top"          
                        sx={{ scrollMarginTop: '88px' }}> 
                        {element?.primary?.texto}
                    </Typography>
                  </Grid2>
                  {
                    element?.data?.map((el, idx) => 
                      <PrintFields 
                        key={idx} 
                        element={el} 
                        index={idx} 
                        shared={element.data}
                        openDialog={openDialog}
                        setOpenDialog={setOpenDialog}
                        onSaveValues={onSaveValues}
                        onSaveChecks={onSaveChecks}
                        saving={saving}
                      />)
                  }
                </Grid2>
                <CheckboxesWithText 
                  data={element?.primary} 
                  globalState={globalState}
                  onDacaChange={(checked) => setSectionLocked(checked)}
                  locked={sectionLocked}
                  setLoadingDirector={setLoadingDirector}
                  setLoadingDaca={setLoadingDaca}
                />
            </Grid2>
          </Box>
        </Show>
      </React.Fragment>
    )
}

const anchorFrom = (el) => el?.id ? `node-${el.id}` : (el?.texto ? `node-${String(el.texto).toLowerCase().replace(/\s+/g, '-')}` : undefined)

const PrintFields = ({ element, index, shared, openDialog, setOpenDialog, onSaveValues, onSaveChecks, saving }) => {

    const htmlId = anchorFrom(element)
    return (
      <React.Fragment key={index}>
        <Show when={true}>
          <>
          <Show when={!element.typeComponent}>
            <RenderField 
              htmlId={htmlId}
              fieldType={fieldTraslate[element.tipo]}
              labelText={element.texto} 
              value={element.valor} 
              element={element} 
              shared={shared}
              iframeView={null}
              setOpenDialog={setOpenDialog}
              /* NUEVO */
              onSaveValues={onSaveValues}
              onSaveChecks={onSaveChecks}
              saving={saving}
            />
          </Show>
  
          <Show when={element.typeComponent}>
              <RenderFieldColapsable 
                element={element} 
                shared={shared}
                openDialog={openDialog}
                setOpenDialog={setOpenDialog}
                /* NUEVO */
                onSaveValues={onSaveValues}
                onSaveChecks={onSaveChecks}
                saving={saving}
              />
          </Show>
          </>
        </Show>
      </React.Fragment>
    )
}

const RenderFieldColapsable = ({element, shared, openDialog, setOpenDialog, onSaveValues, onSaveChecks, saving}) => {
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
                  /* NUEVO */
                  onSaveValues={onSaveValues}
                  onSaveChecks={onSaveChecks}
                  saving={saving}
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
                  /* NUEVO */
                  onSaveValues={onSaveValues}
                  onSaveChecks={onSaveChecks}
                  saving={saving}
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

const RenderColapsable = ({ element, index, shared, onSaveValues, onSaveChecks, saving }) => {
  console.log(fieldTraslate[element.tipo], element , "shared", shared)
  const htmlId = element?.id ? `node-${element.id}` : undefined
    return (
        <React.Fragment key={index}>
          <Show when={firstLevelPermission(element)}>
              <RenderField 
                htmlId={htmlId} 
                fieldType={fieldTraslate[element.tipo]}
                labelText={element.texto} 
                value={element.valor} 
                element={element} 
                shared={shared}
                iframeView={shared[0]?.iframeView}
                /* NUEVO */
                onSaveValues={onSaveValues}
                onSaveChecks={onSaveChecks}
                saving={saving}
              />
          </Show>
        </React.Fragment>
    )
}
 
const toSheetBool = (v: any) => String(v ?? '').trim().toLowerCase() === 'true';

export const toNivelKey = (raw: any) => {
  const s = String(raw ?? '').trim();
  const m = s.match(/^(\d+)(?:\.\d+)?/);
  return m ? m[1] : s;
};

const CheckboxesWithText = ({
  data,
  globalState,
  onDacaChange = (checked: boolean) => {},
  locked = false,
  setLoadingDirector = (loading: boolean) => {},
  setLoadingDaca = (loading: boolean) => {},
}) => {
  const permisoKey = toNivelKey(data?.groups_fields);
  const [checkedDirector, setCheckedDirector] = React.useState(toSheetBool(data?.checkbox_director));
  const [checkedDaca, setCheckedDaca] = React.useState(toSheetBool(data?.checkbox_daca));
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingChecked, setPendingChecked] = React.useState(false);

  React.useEffect(() => {
    setCheckedDirector(toSheetBool(data?.checkbox_director));
    setCheckedDaca(toSheetBool(data?.checkbox_daca));
  }, [data?.checkbox_director, data?.checkbox_daca]);

  // Permisos por checkbox
  const canEditDirector = checkboxLevelPermission(permisoKey, 'director'); // Sección Finalizada
  const canEditDaca = checkboxLevelPermission(permisoKey, 'admin');         // Aprobado Daca

  // Actualiza el checkbox y notifica
  const updateDirectorCheck = async (checked: boolean) => {
    setLoadingDirector(true);
    setCheckedDirector(checked);
    data.checkbox_director = checked ? 'TRUE' : 'FALSE';
    const dataSheet = [{ ...data, checkbox: checked }];
    try {
      await updateCheckboxClient({
        sheetId: globalState.data.sheetId,
        gid: globalState.data.gid,
        data: dataSheet,
        row_: 'M',
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('section-progress-updated', {
            detail: { section: permisoKey, type: 'M', checked }
          })
        );
      }
    } catch (err) {
      console.error('Error actualizando checkbox', err);
    } finally {
      setLoadingDirector(false);
    }
  };

  // Actualiza el checkbox DACA y notifica
  const updateDacaCheck = async (checked: boolean) => {
    setLoadingDaca(true);
    setCheckedDaca(checked);
    onDacaChange(checked);
    data.checkbox_daca = checked ? 'TRUE' : 'FALSE';
    const dataSheet = [{ ...data, checkbox: checked }];
    try {
      await updateCheckboxClient({
        sheetId: globalState.data.sheetId,
        gid: globalState.data.gid,
        data: dataSheet,
        row_: 'N',
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('section-progress-updated', {
            detail: { section: permisoKey, type: 'N', checked }
          })
        );
      }
    } catch (err) {
      console.error('Error actualizando checkbox', err);
    } finally {
      setLoadingDaca(false);
    }
  };

  // Handler para el cambio de los checkboxes
  const handlerChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const checked = e.target.checked;
    if (type === 'M' && checked) {
      setPendingChecked(true);
      setConfirmOpen(true);
      return;
    }
    if (type === 'M') {
      await updateDirectorCheck(checked);
      return;
    }
    if (type === 'N') {
      await updateDacaCheck(checked);
      return;
    }
  };

  // Confirmación del diálogo
  const handleConfirm = async () => {
    setConfirmOpen(false);
    await updateDirectorCheck(true);
  };

  // Cancelar el diálogo
  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingChecked(false);
  };

  return (
    <Box sx={{ marginTop: '20px' }}>
      {/* Checkbox Director */}
      <FormControlLabel
        control={
          <Checkbox
            checked={checkedDirector}
            disabled={!canEditDirector || locked}
            onChange={(e) => handlerChange(e, 'M')}
          />
        }
        label="Sección Finalizada"
      />
      <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '32px' }}>
        Confirmar si el director revisó y aprobó los cambios finales.
      </Typography>

      {/* Checkbox Daca */}
      <FormControlLabel
        control={
          <Checkbox
            checked={checkedDaca}
            disabled={!canEditDaca}
            onChange={(e) => handlerChange(e, 'N')}
          />
        }
        label="Aprobado Daca"
      />
      <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '32px' }}>
        Confirmar si Daca revisó y aprobó los cambios finales.
      </Typography>

      {/* Dialog de confirmación */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          Al realizar esta acción se le notificará a la DACA para revisar la sección: <b>{data?.texto || data?.variables || 'esta sección'}</b>.<br />
          ¿Está seguro de hacerlo?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

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