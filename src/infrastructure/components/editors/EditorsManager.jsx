"use client"

import React from "react"
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Tooltip, Chip
} from "@mui/material"
import { Add, Delete, Edit, Restore, Save, Close } from "@mui/icons-material"

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
}) {
  const cookie = useProcesoContext(contextOverride)

  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  // Crear en línea (sin sub-modal)
  const [email, setEmail] = React.useState("")

  // Editar correo inline
  const [editEmailId, setEditEmailId] = React.useState(null)
  const [editEmailValue, setEditEmailValue] = React.useState("")

  const nivelFiltro = normalizeNivel(defaultNivel)

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
        Editores – {cookie?.programa} · {cookie?.proceso} {cookie?.year} {nivelFiltro ? `· Nivel ${nivelFiltro}` : ""}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ textAlign: { xs: "center", md: "left" } }}>
              Se listan editores de cualquier fila cuyo <b>nivel</b> incluya <b>{nivelFiltro || "(sin nivel)"}</b>.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" sx={{ width: "100%", maxWidth: 760 }}>
              <TextField
                label="Correo del editor"
                type="email"
                size="medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                sx={{ minWidth: 420, maxWidth: 640 }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={!email || !nivelFiltro || loading}
              >
                Asignar
              </Button>
            </Stack>
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

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
