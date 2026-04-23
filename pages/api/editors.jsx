// pages/api/editors.jsx
import {
  getPermission,
  appendPermissionRowWithUrls,
  updatePermissionRowById,
} from '../../libs/googlesheet'
import { google } from 'googleapis'
import { notifyByEvent, NOTIFICATION_EVENTS } from '../../libs/server/notifications/notificationService'

const isUnivalleEmail = (s) =>
  /@correounivalle\.edu\.co$/i.test(String(s || '').trim())

function norm(s) {
  return (s ?? '').toString().trim().toLowerCase()
}

function findEditor(rows, { email, programa, proceso, year }) {
  const nEmail = norm(email), nProg = norm(programa), nProc = norm(proceso), nYear = norm(year)
  return rows.find(r =>
    norm(r.rol) === 'editor' &&
    norm(r.estado) !== 'eliminado' &&
    norm(r.email) === nEmail &&
    norm(r.programa) === nProg &&
    norm(r.proceso) === nProc &&
    norm(r.year) === nYear
  )
}

function findAnyActiveContextRow(rows, { programa, proceso, year }) {
  const nProg = norm(programa), nProc = norm(proceso), nYear = norm(year)
  return rows.find(r =>
    norm(r.estado) === 'activo' &&
    norm(r.programa) === nProg &&
    norm(r.proceso) === nProc &&
    norm(r.year) === nYear
  )
}

function tokenizeNiveles(s) {
  // "1, 2, 3.4" => ["1","2","3"]  (normaliza cada token)
  return String(s ?? "")
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(normalizeNivel)
    .filter(t => t.length > 0)
}

function mergeNiveles(existing, incoming) {
  const a = tokenizeNiveles(existing)
  const b = tokenizeNiveles(incoming)
  const set = new Set([...a, ...b])

  // Orden numérico ascendente si son números puros; si no, por texto
  const arr = Array.from(set)
  const nums = arr.filter(x => /^\d+$/.test(x)).map(x => Number(x)).sort((x,y) => x-y).map(String)
  const others = arr.filter(x => !/^\d+$/.test(x)).sort((x,y)=> x.localeCompare(y))
  return [...nums, ...others].join(",")
}

function removeNivel(existing, toRemove) {
  const list = normalizeNivelList(existing)
  const nRem = normalizeNivel(toRemove)
  const next = list.filter(n => n !== nRem)
  return next.join(',')
}


function normalizeNivel(n) {
  const s = String(n ?? '').trim()
  if (!s) return ''
  const m = s.match(/^(\d+)(?:\.\d+)?$/)
  return m ? m[1] : s
}

// NUEVO: normaliza listas de nivel separadas por coma
function normalizeNivelList(s) {
  return String(s ?? '')
    .split(',')
    .map(x => normalizeNivel(x))
    .filter(Boolean)
}

function extractSpreadsheetId(url = '') {
  const value = String(url || '').trim()
  if (!value) return ''
  const m = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return m?.[1] || ''
}

function isAlreadyPermissionError(err) {
  const msg = String(err?.message || err?.response?.data?.error?.message || '').toLowerCase()
  return msg.includes('already') && (msg.includes('permission') || msg.includes('access'))
}

async function grantEditorOnSpreadsheet({ fileId, email }) {
  if (!fileId || !email) {
    return { attempted: false, granted: false, reason: 'Missing fileId/email' }
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_CLIENT_EMAIL
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.NEXT_PUBLIC_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  const jwt = new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/drive']
  )

  const drive = google.drive({ version: 'v3', auth: jwt })

  try {
    await drive.permissions.create({
      fileId,
      sendNotificationEmail: false,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: String(email).trim().toLowerCase(),
      },
    })
    return { attempted: true, granted: true }
  } catch (err) {
    if (isAlreadyPermissionError(err)) {
      return { attempted: true, granted: true, reason: 'Already had permission' }
    }
    throw err
  }
}

export default async function handler(req, res) {
  try {
    // LIST
    if (req.method === 'GET') {
      const { programa = '', proceso = '', year = '', nivel = '' } = req.query || {}
      const all = await getPermission('PERMISOS')

      let list = (all || []).filter(r =>
        norm(r.rol) === 'editor' &&
        norm(r.programa) === norm(programa) &&
        norm(r.proceso) === norm(proceso) &&
        norm(r.year) === norm(year)
      )

      // si llega nivel, incluir también filas cuyo r.nivel contenga ese nivel entre comas
      const nNivel = normalizeNivel(nivel)
      if (nNivel) {
        list = list.filter(r => normalizeNivelList(r.nivel).includes(nNivel))
      }

      return res.status(200).json({ ok: true, data: list })
    }

    // CREATE / UPSERT (igual que antes: usar SOLO nivelSugerido)
    if (req.method === 'POST') {
      const { email, nivelSugerido, programa, proceso, year } = req.body || {}

      if (!isUnivalleEmail(email)) {
        return res.status(400).json({ ok: false, error: 'Correo no permitido. Usa @correounivalle.edu.co.' })
      }
      if (!email || !programa || !proceso || !year) {
        return res.status(400).json({ ok: false, error: 'Faltan campos: email, programa, proceso, year' })
      }

      const normalizedNivel = normalizeNivel(nivelSugerido)
      if (!normalizedNivel) {
        return res.status(400).json({ ok: false, error: 'Falta nivel por defecto (nivelSugerido).' })
      }

      const all = await getPermission('PERMISOS')
      const existing = findEditor(all || [], { email, programa, proceso, year })

      const contextAny = findAnyActiveContextRow(all || [], { programa, proceso, year })
      const url_carpeta = contextAny?.url_carpeta ?? ''
      const url_exel    = contextAny?.url_exel ?? ''
      const spreadsheetId = extractSpreadsheetId(url_exel)

      let notification = {
        attempted: false,
        sent: false,
      }
      let spreadsheetAccess = {
        attempted: false,
        granted: false,
      }

      if (!existing) {
        const created = await appendPermissionRowWithUrls({
          email: String(email).trim().toLowerCase(),
          nivel: String(normalizedNivel),
          rol: 'editor',
          programa,
          proceso,
          year,
          estado: 'Activo',
          url_carpeta,
          url_exel,
        })

        try {
          spreadsheetAccess = await grantEditorOnSpreadsheet({
            fileId: spreadsheetId,
            email: String(email).trim().toLowerCase(),
          })
        } catch (accessErr) {
          console.error('[api/editors] spreadsheet access error (create):', accessErr)
          spreadsheetAccess = {
            attempted: true,
            granted: false,
            error: accessErr?.message || 'Failed granting spreadsheet access',
          }
        }

        try {
          const result = await notifyByEvent({
            eventType: NOTIFICATION_EVENTS.EDITOR_ASSIGNED,
            context: {
              programa,
              proceso,
              year,
              nivel: normalizedNivel,
            },
            payload: {
              assignedEditorEmail: String(email).trim().toLowerCase(),
            },
          })
          notification = {
            attempted: true,
            sent: true,
            reason: 'Editor created and notified',
            count: Number(result?.count || 0),
          }
        } catch (notifyErr) {
          console.error('[api/editors] notify error (create):', notifyErr)
          notification = {
            attempted: true,
            sent: false,
            error: notifyErr?.message || 'Notification failed',
          }
        }

        return res.status(201).json({ ok: true, created, notification, spreadsheetAccess })
      }

      const existingNiveles = normalizeNivelList(existing.nivel)
      const nivelAlreadyAssigned = existingNiveles.includes(normalizedNivel)
      const mergedNivel = mergeNiveles(existing.nivel, normalizedNivel)

      await updatePermissionRowById({
        id: existing.id,
        // (opcional) conservar el email tal cual
        email: existing.email,
        nivel: mergedNivel,      // 👈 aquí está el cambio clave
        rol: 'editor',
        programa: existing.programa,
        proceso: existing.proceso,
        year: existing.year,
        estado: 'Activo',
      })

      if (!nivelAlreadyAssigned) {
        try {
          spreadsheetAccess = await grantEditorOnSpreadsheet({
            fileId: extractSpreadsheetId(existing.url_exel || url_exel),
            email: String(existing.email).trim().toLowerCase(),
          })
        } catch (accessErr) {
          console.error('[api/editors] spreadsheet access error (reactivate/add-level):', accessErr)
          spreadsheetAccess = {
            attempted: true,
            granted: false,
            error: accessErr?.message || 'Failed granting spreadsheet access',
          }
        }
      }

      if (!nivelAlreadyAssigned) {
        try {
          const result = await notifyByEvent({
            eventType: NOTIFICATION_EVENTS.EDITOR_ASSIGNED,
            context: {
              programa: existing.programa,
              proceso: existing.proceso,
              year: existing.year,
              nivel: normalizedNivel,
            },
            payload: {
              assignedEditorEmail: String(existing.email).trim().toLowerCase(),
            },
          })
          notification = {
            attempted: true,
            sent: true,
            reason: 'Editor level added and notified',
            count: Number(result?.count || 0),
          }
        } catch (notifyErr) {
          console.error('[api/editors] notify error (reactivate/add-level):', notifyErr)
          notification = {
            attempted: true,
            sent: false,
            error: notifyErr?.message || 'Notification failed',
          }
        }
      } else {
        notification = {
          attempted: false,
          sent: false,
          reason: 'No new level assignment to notify',
        }
      }

      return res.status(200).json({ ok: true, reactivated: existing.id, nivel: mergedNivel, notification, spreadsheetAccess })
    }

    // UPDATE (soporta cambiar email/nivel/estado)
    if (req.method === 'PUT') {
      const { id, email, nivel, estado } = req.body || {}
      if (!id) return res.status(400).json({ ok: false, error: 'Falta id' })

      const payload = { id }

      if (email !== undefined) {
        if (!isUnivalleEmail(email)) {
          return res.status(400).json({ ok: false, error: 'Correo no permitido. Usa @correounivalle.edu.co.' })
        }
        payload.email = String(email).trim().toLowerCase()
      }

      if (nivel !== undefined) {
        const n = normalizeNivel(nivel)
        if (!n) return res.status(400).json({ ok: false, error: 'Nivel inválido' })
        payload.nivel = n
      }

      if (estado !== undefined) {
        payload.estado = estado
      }

      await updatePermissionRowById(payload)
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { id, nivel } = req.query || {}
      if (!id) return res.status(400).json({ ok: false, error: 'Falta id' })
      if (!nivel) return res.status(400).json({ ok: false, error: 'Falta nivel a eliminar' })

      // 1) Trae permisos y busca la fila por id
      const all = await getPermission('PERMISOS')
      const row = (all || []).find(r => String(r.id) === String(id))
      if (!row) return res.status(404).json({ ok: false, error: 'No existe el editor' })

      // 2) Quita el nivel solicitado
      const nextNivel = removeNivel(row.nivel, nivel)

      // 3) Si queda vacío -> inactivar; si no -> actualizar solo nivel
      if (!nextNivel) {
        await updatePermissionRowById({ id, estado: 'Inactivo', nivel: '' })
      } else {
        await updatePermissionRowById({ id, nivel: nextNivel })
      }
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, error: err?.message ?? 'Internal error' })
  }
}
