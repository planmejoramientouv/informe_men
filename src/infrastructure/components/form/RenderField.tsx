"use client"
/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React, { useState } from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import PrintTableAspectos from './TableAspectos'
import PrintTableCriterios from './TableCriterion'
import Show from '../../../../share/utils/Show'
// @ts-ignore
import PopUp from '../Popup/Popup'

// Material - IU

import {
  Typography,
  TextField,
  Grid2,
  Button,
  Box,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Popover,
  InputAdornment,
} from "@mui/material";

import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"; 


// Quicks
import dynamic from 'next/dynamic'; // Importación dinámica
// @ts-ignore
import 'react-quill/dist/quill.snow.css'; // Tema por defecto

// Carga ReactQuill solo en el cliente
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Hooks
import { useGlobalState } from '../../../../hooks/context'

// Fecth
import { saveNote } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import {useRouteCookie, hasEditPermission, firstLevelPermission , getCookieData} from '../../../../libs/utils/utils'
import { ROL_ADMIN_SISTEM, ROL_DIRECTOR, NOTE_TYPES } from "../../../../libs/utils/const.js"


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
    const sheetId = globalState?.data?.sheetId;

    const [notas, setNotas] = useState<any[]>([]);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const notasCount = notas.length;



    const { cookie } = useRouteCookie();
    const cookieData = getCookieData("data");
    
    const rol = String(cookieData?.rol || cookie?.rol || "").toLowerCase();
    const nivel = String(cookie.nivel || "");

    const nivelesUsuario = nivel.split(",").map(n => n.trim()).filter(Boolean);
    const menuNumber = String(getMenuNumber(element)).trim();
    
    const esAdmin = ROL_ADMIN_SISTEM.includes(rol);
    const esDirector = ROL_DIRECTOR.includes(rol);
    const puedeEditar = esAdmin || esDirector || nivelesUsuario.includes(menuNumber);
    
    const [modalComentario, setModalComentario] = useState({
      open: false,
      element: null,
      texto: "",
    });

    const [modalNota, setModalNota] = useState({
      open: false,
      element: null,
      archivo: "",
      paginas: "",
    });


    const agregarComentario = (element) => {
      if (richDebRef.current) clearTimeout(richDebRef.current);

      setModalComentario({
        open: true,
        element,
        texto: "",
      });
    };


    const cerrarModalComentario = () => {
      setModalComentario({
        open: false,
        element: null,
        texto: "",
      });
    };

    const agregarNotaDeReferencia = async (element) => {
      if (richDebRef.current) clearTimeout(richDebRef.current);
      setModalNota({
        open: true,
        element,
        archivo: "",
        paginas: "",
      });

      if (notas.length === 0) {
        await cargarNotas(element);
      }
    };


    const cerrarModalNota = () => {
      setModalNota({
        open: false,
        element: null,
        archivo: "",
        paginas: "",
      });
    };

const guardarComentario = async () => {
  if (!modalComentario.texto.trim()) return;
  if (!modalComentario.element) return;
  if (!globalState.data.sheetId) {
    console.error('No se puede guardar comentario: sheetId no definido');
    return;
  }

  try {
    const commentNivel = String(getMenuNumber(modalComentario.element) || '').trim();

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId: globalState.data.sheetId,
        gid: globalState.data.gid,
        elementId: modalComentario.element.id,
        texto: modalComentario.texto,
        usuario: cookieData?.email || 'desconocido',
        fecha: new Date().toISOString(),

        programa: cookie?.programa || cookieData?.programa || '',
        proceso: cookie?.proceso || '',
        year: String(cookie?.year || ''),
        nivel: commentNivel,
        sectionName: String(
          modalComentario?.element?.menu ||
          modalComentario?.element?.texto ||
          `Nivel ${commentNivel || ''}`
        ).trim(),
        actorName: cookieData?.name || '',
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.status) {
      console.error('Error guardando comentario', json);
      return;
    }

    if (json?.notification?.error) {
      console.warn('Comentario guardado, pero fallo notificación:', json.notification.error);
    }

    cerrarModalComentario();
    cargarComentarios(modalComentario.element);
  } catch (err) {
    console.error('Error guardando comentario', err);
  }
};

const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null);

const openInfo = Boolean(infoAnchorEl);

const handleOpenInfo = (e: React.MouseEvent<HTMLElement>) => {
  setInfoAnchorEl(e.currentTarget);
};

const handleCloseInfo = () => {
  setInfoAnchorEl(null);
};


    const guardarNota = async () => {
      await saveNote({
        sheetId: globalState.data.sheetId,
        tipo: NOTE_TYPES.NOTA,
        rows: [
          {
            element_id: modalNota.element.id,
            tipo: NOTE_TYPES.NOTA,
            archivo: modalNota.archivo,
            paginas: modalNota.paginas,
            fecha: new Date().toISOString(),
            usuario: cookieData?.email || 'desconocido',
          },
        ],
      });

      if (modalNota.element) await cargarNotas(modalNota.element); // ✅ recarga
      cerrarModalNota();
    };



    const cargarNotas = async (element: any) => {
      if (!sheetId || !element?.id) return;
      try {
        setLoadingNotas(true);
        const res = await fetch(`/api/notesList?sheetId=${sheetId}&elementId=${element.id}`);
        if (!res.ok) {
          console.warn('No se pudieron cargar las notas, status:', res.status);
          setNotas([]);
          return;
        }
        const json = await res.json();
        setNotas(json.data || []);
      } catch (err) {
        console.error('Error cargando notas', err);
        setNotas([]);
      } finally {
        setLoadingNotas(false);
      }
    };


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

    const isTextoVacio = (text?: string) => {
      if (!text) return true;

      const limpio = text
        .replace(/<(.|\n)*?>/g, '') // quita HTML
        .replace(/&nbsp;/g, ' ')
        .trim();

      return limpio.length === 0;
    };


    // ===== Helpers de guardado =====
    const hayModalAbierto = modalComentario.open || modalNota.open;
  const saveNow = React.useCallback(async (val: string) => {
    if (!element?.id) return;
    if (typeof onSaveValues === 'function') {
      await onSaveValues([{ id: element.id, valor: val ?? '' }]);
    }
  }, [element?.id, onSaveValues]);

  function getMenuNumber(element) {
    const raw = element?.groups_fields || element?.primary?.groups_fields || "";
    const match = String(raw).match(/^\d+/);
    return match ? match[0] : "";
  }

  // const nivelesUsuario = nivel.split(",").map(n => n.trim()).filter(Boolean);
  // const menuNumber = String(getMenuNumber(element)).trim();
  
  // const esAdmin = ROL_ADMIN_SISTEM.includes(rol);
  // const esDirector = ROL_DIRECTOR.includes(rol);
  // const puedeEditar = esAdmin || esDirector || nivelesUsuario.includes(menuNumber);

  // console.log("nivel del usuario:", nivel);

  // console.log("permiso para editar:", puedeEditar);

  const [comentarios, setComentarios] = useState<any[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);

const cargarComentarios = async (element: any) => {
  if (!sheetId || !element?.id) return;

  try {
    setLoadingComentarios(true);

    const res = await fetch(`/api/comments?sheetId=${sheetId}&elementId=${element.id}`);
    const json = await res.json();

    console.log('API comentarios response:', json);  // 🔹 revisa aquí

    if (!res.ok) {
      console.warn('No se pudo cargar comentarios, status:', res.status);
      setComentarios([]);
      return;
    }

    setComentarios(json.data || []);
  } catch (err) {
    console.error('Error cargando comentarios', err);
    setComentarios([]);
  } finally {
    setLoadingComentarios(false);
  }
};



  const classDisabledTextArea = () => {
    let class_ = classes.containerTextAreaNew
    let hasPermission = puedeEditar
      return hasPermission ? class_ : `${class_} ${classes.disabledTextArea}`
    }

    const classDisabledTableExtra = () => {
      let base = { width: '100%', position: "relative" } as any
      let hasPermission = puedeEditar
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

    const initializedRef = React.useRef(false);

    React.useEffect(() => {
  if (fieldType !== "textArea") return;

  const elementId = String(element?.id || "").trim();
  if (!sheetId || !elementId) return;

  if (initializedRef.current) return; // ya cargado para ESTE componente

  cargarComentarios({ ...element, id: elementId });
  cargarNotas({ ...element, id: elementId });

  initializedRef.current = true;
}, [fieldType, element?.id, sheetId]);




    React.useEffect(() => {
      return () => {
        if (textDebRef.current) clearTimeout(textDebRef.current);
        if (richDebRef.current) clearTimeout(richDebRef.current);
      };
    }, []);

    const ayudaBox = element?.ayuda ? (
      <Box
        sx={{
          mt: 1.5,
          p: 1.2,
          background: "#f7f7f7",
          borderRadius: "6px",
          border: "1px solid #e0e0e0",
          whiteSpace: "pre-line",
          fontSize: "0.78rem",
          color: "#444",
          lineHeight: 1.4,
        }}
      >
        {element.ayuda}
      </Box>
    ) : null;

  
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
            {ayudaBox}

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
              {ayudaBox}

              <hr />
          </Grid2>
        );
    
      case "text":
        return (
          <>
            <TextField
              id={htmlId}
              variant="outlined"
              className={classes.inputText}
              label={labelText}
              value={textValue}
              onChange={(e) => {
                if (!puedeEditar) return;
                const v = e.target.value ?? "";
                setTextValue(v);
                element.valor = v;
                if (textDebRef.current) clearTimeout(textDebRef.current);
                textDebRef.current = setTimeout(() => saveNow(v), 900);
              }}
              disabled={saving || !puedeEditar}
            />

            {ayudaBox}
          </>
        );
  
      case "textArea":
        return (
          <>
            <Grid2 id={htmlId} className={classDisabledTextArea()}>
              
              <label><b>{labelText}</b></label>

              <Box sx={{ display: "flex", gap: 1 }}>
                {/* ReactQuill ocupa todo el espacio */}
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 180, // 👈 altura similar a la versión anterior
                    "& .ql-container": {
                      minHeight: 140,
                    },
                    "& .ql-editor": {
                      minHeight: 140,
                    },
                  }}
                >
                  <ReactQuill
                    value={richValue}
                    onChange={(v) => {
                      if (!puedeEditar) return;
                      if (modalComentario.open || modalNota.open) return; // 👈 CLAVE

                      setRichValue(v);
                      element.valor = v;

                      if (richDebRef.current) clearTimeout(richDebRef.current);
                      richDebRef.current = setTimeout(() => {
                        saveNow(v);
                      }, 1000);
                    }}
                    readOnly={saving || !puedeEditar}
                  />
                </Box>

                {/* Botones */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center" }}>
                {/* Nota */}
                <Tooltip title={notasCount > 0 ? `Notas (${notasCount})` : "Agregar nota"}>
                  <Badge
                    badgeContent={notasCount}
                    color="primary"
                    overlap="circular"
                    invisible={notasCount === 0}
                  >
                    <IconButton size="small" onClick={() => agregarNotaDeReferencia(element)}>
                      <StickyNote2OutlinedIcon fontSize="small" />
                    </IconButton>
                  </Badge>
                </Tooltip>

                {/* Comentario (solo admin) */}
                {esAdmin && (
                  <Tooltip title="Agregar comentario">
                    <Badge
                      badgeContent={comentarios.length}
                      color="secondary"
                      overlap="circular"
                      invisible={comentarios.length === 0}
                    >
                      <IconButton
                        size="small"
                        onClick={() => agregarComentario(element)}
                        sx={{ color: "#2528f5ff" }}   // 👈 color distinto (rojo Univalle)
                      >
                        <ChatBubbleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Badge>
                  </Tooltip>
                )}
                {element?.ayuda && (
                  <Tooltip title="Ayuda">
                    <IconButton size="small" onClick={handleOpenInfo}>
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              </Box>
              <Popover
                open={openInfo}
                anchorEl={infoAnchorEl}
                onClose={handleCloseInfo}
                anchorOrigin={{ vertical: "center", horizontal: "right" }}
                transformOrigin={{ vertical: "center", horizontal: "left" }}
              >
                <Box
                  sx={{
                    p: 1.2,
                    maxWidth: 260,
                    fontSize: "0.78rem",
                    color: "#444",
                    whiteSpace: "pre-line",
                    lineHeight: 1.4,
                  }}
                >
                  {element?.ayuda || "Sin ayuda disponible."}
                </Box>
              </Popover>


              <Show when={!puedeEditar}>
                <Grid2 className={classes.diableBox} />
              </Show>

              <Box
                sx={{
                  mt: 1.5,
                  p: 1.2,
                  background: "#f7f7f7",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                }}
              >

                {/* Comentarios */}
                {loadingComentarios ? (
                <Box sx={{ mt: 1, fontSize: "0.75rem", color: "#888" }}>
                  Cargando comentarios...
                </Box>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <b style={{ fontSize: "0.8rem" }}>Comentarios:</b>

                  {comentarios.length === 0 ? (
                    <Box sx={{ mt: 0.8, fontSize: "0.75rem", color: "#666" }}>
                      Sin comentarios.
                    </Box>
                  ) : (
                    comentarios.map((c, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          mt: 1,
                          p: 1,
                          background: "#fafafa",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div>{c.texto}</div>
                        <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 4 }}>
                          {c.usuario} · {c.fecha}
                        </div>
                      </Box>
                    ))
                  )}
                </Box>
              )}

                {/* Notas */}
                {loadingNotas && (
                  <Box sx={{ mt: 1, fontSize: "0.75rem", color: "#888" }}>
                    Cargando notas...
                  </Box>
                )}

                {notas.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <b style={{ fontSize: "0.8rem" }}>Notas:</b>

                    {notas.map((n, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          mt: 1,
                          p: 1,
                          background: "#eef7ff",
                          border: "1px solid #c0d4eb",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div><b>Archivo:</b> {n.archivo}</div>
                        <div><b>Páginas:</b> {n.paginas}</div>
                        <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 4 }}>
                          {n.usuario} · {n.fecha}
                        </div>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

            </Grid2>
            <Dialog
              open={modalComentario.open}
              onClose={cerrarModalComentario}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Agregar comentario</DialogTitle>

              <DialogContent>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  placeholder="Escribe tu comentario aquí..."
                  value={modalComentario.texto}
                  onChange={(e) =>
                    setModalComentario({ ...modalComentario, texto: e.target.value })
                  }
                />
              </DialogContent>

              <DialogActions>
                <Button onClick={cerrarModalComentario}>Cancelar</Button>
                <Button
                  variant="contained"
                  disabled={isTextoVacio(modalComentario.texto)}
                  onClick={guardarComentario}
                >
                  Guardar
                </Button>

              </DialogActions>
            </Dialog>
            <Dialog
              open={modalNota.open}
              onClose={cerrarModalNota}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Nota de referencia</DialogTitle>

              <DialogContent>
                <TextField
                  fullWidth
                  label="Nombre del archivo"
                  placeholder="Ej. evidencia.pdf"
                  value={modalNota.archivo || ""}
                  onChange={(e) => setModalNota({ ...modalNota, archivo: e.target.value })}
                  size="medium"
                  sx={{ mb: 2, fontSize: '1rem', mt: 1 }} 
                  inputProps={{
                    style: { minHeight: 56, display: 'flex' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Número de la(s) página(s)"
                  placeholder="Ej. Pág. 45 - 46"
                  value={modalNota.paginas || ""}
                  onChange={(e) => setModalNota({ ...modalNota, paginas: e.target.value })}
                  sx={{ fontSize: '1rem' }} 
                  inputProps={{
                    style: { minHeight: 56, display: 'flex' }
                  }}
                />

              </DialogContent>

              <DialogActions>
                <Button onClick={cerrarModalNota}>Cancelar</Button>
                <Button
                  variant="contained"
                  disabled={isTextoVacio(modalNota.archivo) || isTextoVacio(modalNota.paginas)}
                  onClick={guardarNota}
                >
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
  
      case "TableExtra":
        return (
          <>
          <Grid2
            id={htmlId}
            sx={{
              ...classDisabledTableExtra(),
              width: '100%',
            }}
          >
            <Show when={puedeEditar}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  width: '100%',
                  backgroundColor: '#70777f',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#4f6175',
                  },
                }}
                onClick={() => setOpen(true)}
              >
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
          {ayudaBox}
          </>
      );
  
      case "tabla_aspectos":
        return (
        <>
          <PrintTableAspectos htmlId={htmlId} element={element} shared={shared} />
           {ayudaBox}
        </>
      );
  
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
          <>
          <PrintTableCriterios
            htmlId={htmlId}
            setOpenDialog={setOpenDialog}
            element={element}
            shared={shared}
            autoSave={autoSave}
            puedeEditar={puedeEditar}
            />
          {ayudaBox}
          </>
        );

      default:
        return null;
      }
};

/* UTILS */
