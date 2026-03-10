"use client"

import React from "react"
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Tooltip, Chip
} from "@mui/material"
import { Add, Delete, Edit, Restore, Save, Close, PersonAdd } from "@mui/icons-material"
import useStyles from '../../../../css/form/form.css.js'
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert'; 
import CircularProgress from '@mui/material/CircularProgress';

const isUnivalleEmail = (s) =>
  /@correounivalle\.edu\.co$/i.test(String(s || "").trim())

const normalizeNivel = (n) => {
  const s = String(n ?? "").trim()
  if (!s) return ""
  const m = s.match(/^(\d+)(?:\.\d+)?$/)
  return m ? m[1] : s
}

function useProcesoContext(contextOverride) {
  const [ctx, setCtx] = React.useState({ programa: "", proceso: "", year: "" })
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      if (contextOverride && contextOverride.programa) {
        if (!alive) return
        setCtx(contextOverride)
        return
      }
      const { getCookieData } = await import("../../../../libs/utils/utils")
      const c = getCookieData("rrc") || getCookieData("raac") || getCookieData("data") || {}
      if (!alive) return
      setCtx({
        programa: c.programa || "",
        proceso:  c.proceso  || "",
        year:     c.year     || "",
      })
    })()
    return () => { alive = false }
  }, [contextOverride])
  return ctx
}

export default function EditorsManager({
  open = true,
  onClose = () => {},
  contextOverride = null,
  defaultNivel = "",
  sectionName = "",
}) {
  const classes = useStyles();
  const cookie = useProcesoContext(contextOverride)

  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  // Crear en línea (sin sub-modal)
  const [email, setEmail] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  // Editar correo inline
  const [editEmailId, setEditEmailId] = React.useState(null)
  const [editEmailValue, setEditEmailValue] = React.useState("")

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success'); // o 'error', 'info', 'warning'

  // Handler para cerrar el snackbar
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const nivelFiltro = normalizeNivel(defaultNivel)

  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage(""); // Opcional: limpia el error al escribir
  };

  const fetchList = React.useCallback(async () => {
    if (!cookie?.programa || !cookie?.proceso || !cookie?.year) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        programa: cookie.programa,
        proceso:  cookie.proceso,
        year:     String(cookie.year),
        nivel:    String(nivelFiltro || ""),
      }).toString()

      const res = await fetch(`/api/editors?${qs}`)
      const json = await res.json()
      if (json?.ok) setRows(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [cookie?.programa, cookie?.proceso, cookie?.year, nivelFiltro])

  React.useEffect(() => {
    if (open) fetchList()
  }, [open, fetchList])

  const handleCreate = async () => {
    if (!email) return
    if (!isUnivalleEmail(email)) {
      alert("El correo debe ser @correounivalle.edu.co.")
      return
    }
    if (!nivelFiltro) {
      alert("No hay nivel por defecto disponible para este tab.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(email).trim().toLowerCase(),
          nivelSugerido: nivelFiltro,
          programa: cookie.programa,
          proceso:  cookie.proceso,
          year:     cookie.year,
        }),
      })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error creando editor")
      setEmail("")
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ⬇️ CAMBIO: eliminar SOLO el nivel actual (no inactivar)
  const handleDeleteLevelFromRow = async (id) => {
    if (!id || !nivelFiltro) return
    if (!confirm(`¿Quitar el nivel ${nivelFiltro} de este editor?`)) return
    try {
      setLoading(true)
      const qs = new URLSearchParams({ id: String(id), nivel: String(nivelFiltro) }).toString()
      const res = await fetch(`/api/editors?${qs}`, { method: "DELETE" })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error al quitar el nivel")
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (id) => {
    try {
      setLoading(true)
      const res = await fetch("/api/editors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: "Activo" }),
      })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error al activar")
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  // --- EDITAR CORREO INLINE ---
  const startEditEmail = (row) => {
    setEditEmailId(row.id)
    setEditEmailValue(row.email || "")
  }

  const cancelEditEmail = () => {
    setEditEmailId(null)
    setEditEmailValue("")
  }

  const saveEditEmail = async () => {
    if (!editEmailId) return
    const next = String(editEmailValue || "").trim().toLowerCase()
    if (!isUnivalleEmail(next)) {
      alert("El correo debe ser @correounivalle.edu.co.")
      return
    }
    try {
      setLoading(true)
      const res = await fetch("/api/editors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editEmailId, email: next }),
      })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error guardando correo")
      cancelEditEmail()
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }
  // --- FIN EDITAR CORREO INLINE ---

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Editores – {cookie?.programa} · {cookie?.proceso} {cookie?.year}  
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
        <Box sx={{ mb: 0, mt: 1 }}>
          <span style={{ fontSize: 16, color: '#444' }}>
            
            Gestiona o añade los editores asignados para la sección:{" "}
            <b>{sectionName || nivelFiltro} (Nivel {nivelFiltro})</b>
          </span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, background: "#fafafa", borderRadius: 2, mb: 2 }}>
          <form onSubmit={handleCreate}>
            <Stack direction="row" spacing={2} alignItems="stretch">
              <TextField
                className={classes.inputText}
                label="Correo del editor"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                error={touched && !isUnivalleEmail(email)}
                helperText={
                  touched && !isUnivalleEmail(email)
                    ? "Debe ser un correo @correounivalle.edu.co"
                    : ""
                }
                fullWidth
                size="medium"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<PersonAdd />}
                disabled={!email || !nivelFiltro || loading}
                sx={{
                  minWidth: 120,
                  height: 50, // igual al input estándar de MUI (puedes ajustar)
                  alignSelf: 'flex-start'
                }}
              >
                {loading ? <CircularProgress size={20} /> : "Asignar"}
              </Button>
            </Stack>
          </form>
        </Box>
        {/* Tabla y búsqueda aquí */}
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!rows || rows.length === 0) && (
              <TableRow><TableCell colSpan={4}>No hay editores en este nivel.</TableCell></TableRow>
            )}
            {rows?.map((r) => {
              const isEditing = editEmailId === r.id
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={editEmailValue}
                        onChange={(e) => setEditEmailValue(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ maxWidth: 480 }}
                      />
                    ) : (
                      r.email
                    )}
                  </TableCell>
                  <TableCell>{r.nivel || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.estado}
                      color={String(r.estado).toLowerCase() === "activo" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <>
                        <Tooltip title="Guardar">
                          <span>
                            <IconButton color="success" onClick={saveEditEmail} disabled={loading}>
                              <Save />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <span>
                            <IconButton onClick={cancelEditEmail} disabled={loading}>
                              <Close />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Editar correo">
                        <span>
                          <IconButton onClick={() => startEditEmail(r)} disabled={loading}>
                            <Edit />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {/* ⬇️ AHORA eliminar quita SOLO el nivel actual */}
                    <Tooltip title={`Quitar nivel ${nivelFiltro || ""}`}>
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteLevelFromRow(r.id)}
                          disabled={loading || !nivelFiltro}
                        >
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>

                    {String(r.estado).toLowerCase() !== "activo" && (
                      <Tooltip title="Activar">
                        <span>
                          <IconButton color="success" onClick={() => handleActivate(r.id)} disabled={loading}>
                            <Restore />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DialogContent>

      {/* <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions> */}
    </Dialog>
  )
}
