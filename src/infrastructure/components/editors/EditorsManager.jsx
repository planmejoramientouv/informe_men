"use client"

import React from "react"
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Tooltip, Chip
} from "@mui/material"
import { Add, Delete, Edit, Restore  } from "@mui/icons-material"

// --- helpers en cliente ---
const isUnivalleEmail = (s) =>
  /@correounivalle\.edu\.co$/i.test(String(s || "").trim())

// Solo normaliza si *toda* la cadena es "dígitos" o "dígitos.dígitos"
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
      // import dinámico (evita SSR)
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
}) {
  const cookie = useProcesoContext(contextOverride)

  // tabla
  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  // crear
  const [openCreate, setOpenCreate] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [nivel, setNivel] = React.useState(defaultNivel || "")

  // editar
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editId, setEditId] = React.useState(null)
  const [editNivel, setEditNivel] = React.useState("")
  const [editOriginalNivel, setEditOriginalNivel] = React.useState("")

  React.useEffect(() => {
    setNivel(defaultNivel || "")
  }, [defaultNivel])

  const fetchList = React.useCallback(async () => {
    if (!cookie?.programa || !cookie?.proceso || !cookie?.year) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        programa: cookie.programa,
        proceso:  cookie.proceso,
        year:     String(cookie.year),
      }).toString()

      const res = await fetch(`/api/editors?${qs}`)
      const json = await res.json()
      if (json?.ok) setRows(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [cookie?.programa, cookie?.proceso, cookie?.year])

  React.useEffect(() => {
    if (open) fetchList()
  }, [open, fetchList])

  const handleCreate = async () => {
    if (!email) return
    if (!isUnivalleEmail(email)) {
      alert("El correo debe ser @correounivalle.edu.co.")
      return
    }

    try {
      setLoading(true)

      // nivel sugerido desde defaultNivel (que viene del tab activo)
      const sugerido = normalizeNivel(defaultNivel)
      const nivelToSend = normalizeNivel(nivel || sugerido)

      const res = await fetch("/api/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(email).trim().toLowerCase(),
          nivel: nivelToSend || "",
          nivelSugerido: sugerido || "",
          programa: cookie.programa,
          proceso:  cookie.proceso,
          year:     cookie.year,
        }),
      })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error creando editor")
      setOpenCreate(false)
      setEmail("")
      setNivel(defaultNivel || "")
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Quitar editor? Se marcará como Inactivo.")) return
    try {
      setLoading(true)
      const res = await fetch(`/api/editors?id=${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error al eliminar")
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Activar (reactivar) un editor inactivo
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

  const openEditNivel = (row) => {
    setEditId(row.id)
    setEditNivel(row.nivel || "")
    setEditOriginalNivel(row.nivel || "")
    setOpenEdit(true)
  }

  const handleSaveNivel = async () => {
    if (!editId) return
    try {
      setLoading(true)
      const next = (editNivel ?? "").trim()
      const prev = (editOriginalNivel ?? "").trim()

      // si no cambió, no dispares PUT
      if (next === prev) {
        setOpenEdit(false)
        setEditId(null)
        setEditNivel("")
        return
      }

      const res = await fetch("/api/editors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, nivel: next }),
      })
      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Error guardando nivel")
      setOpenEdit(false)
      setEditId(null)
      setEditNivel("")
      await fetchList()
    } catch (e) {
      console.error(e)
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Editores – {cookie?.programa} · {cookie?.proceso} {cookie?.year}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              La <b>condición seleccionada</b> del formulario se usará como <code>nivel</code> al crear el editor (editable).
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
              Asignar editor
            </Button>
          </Stack>
        </Box>

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
              <TableRow>
                <TableCell colSpan={4}>No hay editores asignados.</TableCell>
              </TableRow>
            )}
            {rows?.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.nivel || "-"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.estado}
                    color={String(r.estado).toLowerCase() === "activo" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar nivel">
                    <span>
                      <IconButton onClick={() => openEditNivel(r)}>
                        <Edit />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {String(r.estado).toLowerCase() === "activo" ? (
                    <Tooltip title="Quitar (Inactivar)">
                      <span>
                        <IconButton color="error" onClick={() => handleDelete(r.id)}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activar">
                      <span>
                        <IconButton color="success" onClick={() => handleActivate(r.id)}>
                          <Restore />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Crear */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
          <DialogTitle>Asignar editor</DialogTitle>
          <DialogContent>
            <TextField
              label="Correo del editor"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Nivel (opcional)"
              fullWidth
              margin="normal"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              placeholder="1,2,5 por ejemplo"
              helperText="Se prellena con la condición seleccionada en el formulario."
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Contexto: <b>{cookie?.programa}</b> – {cookie?.proceso} {cookie?.year}.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleCreate} disabled={!email || loading}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Editar nivel */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs">
          <DialogTitle>Editar nivel</DialogTitle>
          <DialogContent>
            <TextField
              label="Nivel"
              fullWidth
              margin="normal"
              value={editNivel}
              onChange={(e) => setEditNivel(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveNivel} disabled={!editId || loading}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
