import {
  getPermission,
  appendPermissionRowWithUrls,
  updatePermissionRowById,
} from '../../libs/googlesheet' 

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

function normalizeNivel(n) {
  const s = String(n ?? '').trim()
  if (!s) return ''
  // Solo normaliza si la cadena ES exactamente "dígitos" o "dígitos.dígitos"
  const m = s.match(/^(\d+)(?:\.\d+)?$/)
  return m ? m[1] : s
}

export default async function handler(req, res) {
  try {
    // LIST
    if (req.method === 'GET') {
      const { programa = '', proceso = '', year = '' } = req.query || {}
      const all = await getPermission('PERMISOS')

      const list = (all || []).filter(r =>
        norm(r.rol) === 'editor' &&
        norm(r.programa) === norm(programa) &&
        norm(r.proceso) === norm(proceso) &&
        norm(r.year) === norm(year)
      )

      return res.status(200).json({ ok: true, data: list })
    }

    // CREATE / UPSERT
    if (req.method === 'POST') {
      
      const { email, nivel, nivelSugerido, programa, proceso, year } = req.body || {}

      if (!isUnivalleEmail(email)) {
        return res.status(400).json({ ok: false, error: 'Correo no permitido. Usa @correounivalle.edu.co.' })
      }
      if (!email || !programa || !proceso || !year) {
        return res.status(400).json({ ok: false, error: 'Faltan campos: email, programa, proceso, year' })
      }

      
      const normalizedNivel = normalizeNivel(nivel) || normalizeNivel(nivelSugerido)
      if (!normalizedNivel) {
        return res.status(400).json({ ok: false, error: 'Falta nivel (o nivelSugerido).' })
      }

      const all = await getPermission('PERMISOS')
      const existing = findEditor(all || [], { email, programa, proceso, year })

      // copiar URLs de cualquier fila activa del mismo contexto
      const contextAny = findAnyActiveContextRow(all || [], { programa, proceso, year })
      const url_carpeta = contextAny?.url_carpeta ?? ''
      const url_exel    = contextAny?.url_exel ?? ''

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
        return res.status(201).json({ ok: true, created })
      }

      // Ya existe → reactivar/actualizar nivel
      const id = existing.id
      await updatePermissionRowById({
        id,
        
        nivel: normalizedNivel || existing.nivel,
        estado: 'Activo',
      })
      return res.status(200).json({ ok: true, reactivated: id })
    }

    // UPDATE (nivel/email/estado)
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

    // SOFT-DELETE → estado='Inactivo'
    if (req.method === 'DELETE') {
      const { id } = req.query || {}
      if (!id) return res.status(400).json({ ok: false, error: 'Falta id' })

      await updatePermissionRowById({ id, estado: 'Inactivo' })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, error: err?.message ?? 'Internal error' })
  }
}
