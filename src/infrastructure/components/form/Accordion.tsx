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
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Grid2, Button, Checkbox, FormControlLabel, CircularProgress, RadioGroup, Radio } from '@mui/material';
// Hooks
import { useGlobalState } from '../../../../hooks/context'
// import { updateCheckbox } from '../../../../libs/googlesheet'
// Fecth
import { updateCheckboxClient } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { firstLevelPermission, checkboxLevelPermission, getCookieData } from '../../../../libs/utils/utils'
import { ROL_ADMIN_SISTEM } from '../../../../libs/utils/const.js';

// Print Accordion
export default ({ element, index, onSaveValues, onSaveChecks, saving = false }) => {
    if (!element?.primary) return null;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false)
    const { globalState } = useGlobalState()
    const [hydrated, setHydrated] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState({});

    // Bloquear sección
    const [sectionLocked, setSectionLocked] = React.useState(
      toSheetBool(element?.primary?.checkbox_director)
    );

    // estados de loading global
    const [loadingDirector, setLoadingDirector] = React.useState(false);
    const [loadingDaca, setLoadingDaca] = React.useState(false);
    const loadingGlobal = loadingDirector || loadingDaca;
        
    const authData = getCookieData('data') || {};
    const rol = String(authData.rol || '').toLowerCase();
    const isAdmin = ROL_ADMIN_SISTEM.includes(rol);
    const effectiveSectionLocked = sectionLocked && !isAdmin;

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    React.useEffect(() => {
      setSectionLocked(toSheetBool(element?.primary?.checkbox_director));
    }, [element?.primary?.checkbox_director]);

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
                    effectiveSectionLocked
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
                        key={`${String(el?.id ?? 'no-id')}-${String(el?.groups_fields ?? 'no-group')}-${String(el?.tipo ?? 'no-type')}`}
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
                  locked={effectiveSectionLocked}
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
                  key={`${String(el?.id ?? idx)}-${String(el?.groups_fields ?? '')}-${String(el?.tipo ?? '')}`}
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
                  key={`${String(el?.id ?? idx)}-${String(el?.groups_fields ?? '')}-${String(el?.tipo ?? '')}`}
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
  const [dacaDecision, setDacaDecision] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingChecked, setPendingChecked] = React.useState(false);

  const authData = getCookieData('data') || {};
  const processData = getCookieData('rrc') || getCookieData('raac') || {};
  const rol = String(authData?.rol || '').toLowerCase();
  const isAdmin = ROL_ADMIN_SISTEM.includes(rol);

  React.useEffect(() => {
    const directorChecked = toSheetBool(data?.checkbox_director);
    const dacaChecked = toSheetBool(data?.checkbox_daca);
    setCheckedDirector(directorChecked);
    setCheckedDaca(dacaChecked);
    setDacaDecision(dacaChecked ? 'approve' : '');
  }, [data?.checkbox_director, data?.checkbox_daca]);

  const canEditDirector = checkboxLevelPermission(permisoKey, 'director');
  const canEditDaca = checkboxLevelPermission(permisoKey, 'admin');

  const notifyContext = {
    context: {
      programa: String(processData?.programa || authData?.programa || '').trim(),
      proceso: String(processData?.proceso || '').trim(),
      year: String(processData?.year || '').trim(),
    },
    actor: {
      email: String(authData?.email || '').trim().toLowerCase(),
      name: String(authData?.name || '').trim(),
      rol: String(authData?.rol || '').trim().toLowerCase(),
    },
    nivel: String(permisoKey || '').trim(),
    sectionName: String(data?.texto || data?.variables || `Nivel ${permisoKey || ''}`).trim(),
  };

  const updateDirectorCheck = async (checked: boolean) => {
    onDacaChange(checked);
    setLoadingDirector(true);
    setCheckedDirector(checked);
    data.checkbox_director = checked ? 'TRUE' : 'FALSE';
    const dataSheet = [{ ...data, checkbox: checked }];

    try {
      const json = await updateCheckboxClient({
        sheetId: globalState.data.sheetId,
        gid: globalState.data.gid,
        data: dataSheet,
        row_: 'M',
        notify: notifyContext,
      });

      if (json?.notification?.error) {
        console.warn('Checkbox M guardado, pero falló notificación:', json.notification.error);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('section-progress-updated', {
            detail: { section: permisoKey, type: 'M', checked },
          })
        );
      }
    } catch (err) {
      console.error('Error actualizando checkbox', err);
    } finally {
      setLoadingDirector(false);
    }
  };

  const updateDacaCheck = async (checked: boolean) => {
    setLoadingDaca(true);
    setCheckedDaca(checked);
    setDacaDecision(checked ? 'approve' : 'reject');
    data.checkbox_daca = checked ? 'TRUE' : 'FALSE';
    const dataSheet = [{ ...data, checkbox: checked }];

    try {
      const json = await updateCheckboxClient({
        sheetId: globalState.data.sheetId,
        gid: globalState.data.gid,
        data: dataSheet,
        row_: 'N',
        notify: notifyContext,
      });

      if (json?.notification?.error) {
        console.warn('Checkbox N guardado, pero falló notificación:', json.notification.error);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('section-progress-updated', {
            detail: { section: permisoKey, type: 'N', checked },
          })
        );
      }
    } catch (err) {
      console.error('Error actualizando checkbox', err);
    } finally {
      setLoadingDaca(false);
    }
  };

  // const handlerChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
  //   const checked = e.target.checked;

  //   if (type === 'M' && checked) {
  //     setPendingChecked(true);
  //     setConfirmOpen(true);
  //     return;
  //   }

  //   if (type === 'M') {
  //     await updateDirectorCheck(checked);
  //     return;
  //   }

  //   if (type === 'N') {
  //     await updateDacaCheck(checked);
  //     return;
  //   }
  // };

  const handlerDirectorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    if (checked) {
      setPendingChecked(true);
      setConfirmOpen(true);
      return;
    }
  await updateDirectorCheck(false);
  };

  const handlerDacaDecision = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const decision = e.target.value;
    setDacaDecision(decision);

    if (decision === 'approve') {
      await updateDacaCheck(true);
      return;
    }

    await updateDacaCheck(false);

    if (checkedDirector) {
      await updateDirectorCheck(false);
    }
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    await updateDirectorCheck(true);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingChecked(false);
  };

  const finalizationLabel = checkedDaca
    ? 'Sección finalizada y aprobada'
    : (checkedDirector
      ? 'Sección marcada como finalizada'
      : 'Finalizar esta sección');

  const finalizationHelpText = checkedDaca
    ? 'Esta sección ya se encuentra aprobada por DACA y no requiere modificaciones.'
    : (checkedDirector
      ? 'En este momento la sección se encuentra en proceso de aprobación. Se le notificará por correo el resultado.'
      : 'Confirmar si la sección actual ya ha sido diligenciada en su totalidad.');

  return (
    <Box sx={{ marginTop: '20px' }}>
      {!isAdmin && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkedDirector}
                disabled={!canEditDirector || locked}
                onChange={handlerDirectorChange}
              />
            }
            label={finalizationLabel}
          />
          <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '32px' }}>
            {finalizationHelpText}
          </Typography>
        </>
      )}

      {/* <FormControlLabel
        control={
          <Checkbox
            checked={checkedDaca}
            disabled={!canEditDaca}
            onChange={(e) => handlerChange(e, 'N')}
          />
        }
        label="Aprobado Daca"
      /> */}
      {isAdmin && checkedDirector && (
        <>
          <Typography
            variant="body2"
            sx={{ mt: 2, fontWeight: 600, marginBottom: '10px' }}
          >
            Revisión DACA
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginLeft: '0px' }}>
            Selecciona si deseas aprobar esta sección. En cualquier caso, <b>se notificará</b> a los editores correspondientes.
          </Typography>

          <RadioGroup
            row
            value={dacaDecision}
            onChange={handlerDacaDecision}
            sx={{ mt: 1, ml: 2 }}
          >
            <FormControlLabel
              value="approve"
              control={<Radio disabled={!canEditDaca} />}
              label="Aprobar"
              sx={{ mr: 3 }}
            />

            <FormControlLabel
              value="reject"
              control={<Radio disabled={!canEditDaca} />}
              label="No aprobar"
            />
          </RadioGroup>
        </>
      )}

      {/* <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, ml: 4 }}
      >
        Si seleccionas No aprobar, se desmarca automáticamente Sección Finalizada.
      </Typography> */}


      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Marcar como finalizada</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Estás a punto de finalizar la sección: <b>{data?.texto || data?.variables || 'esta sección'}</b>
          </Typography>

          <Typography variant="body2">
            Esta acción deshabilitará completamente la sección y notificará a DACA para su revisión.
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Deseas continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            Cancelar
          </Button>

          <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
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