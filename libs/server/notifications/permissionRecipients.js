import { getPermission } from '../../googlesheet';

const PLAN_EMAIL_DEFAULT = 'plan.mejoramiento@correounivalle.edu.co';

function norm(s) {
  return String(s ?? '').trim().toLowerCase();
}

function normalizeNivel(n) {
  const s = String(n ?? '').trim();
  if (!s) return '';
  const m = s.match(/^(\d+)(?:\.\d+)?$/);
  return m ? m[1] : s;
}

function normalizeNivelList(s) {
  return String(s ?? '')
    .split(',')
    .map((x) => normalizeNivel(x))
    .filter(Boolean);
}

function uniqEmails(list) {
  return Array.from(
    new Set(
      (list || [])
        .map((x) => String(x || '').trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export async function getEditorEmailsByNivel({
  programa,
  proceso,
  year,
  nivel,
}) {
  const nivelNorm = normalizeNivel(nivel);
  if (!nivelNorm) return [];

  const all = await getPermission('PERMISOS');
  const rows = Array.isArray(all) ? all : [];

  const filtered = rows.filter((r) => {
    const isEditor = norm(r.rol) === 'editor';
    const isActive = norm(r.estado) === 'activo';
    const samePrograma = norm(r.programa) === norm(programa);
    const sameProceso = norm(r.proceso) === norm(proceso);
    const sameYear = norm(r.year) === norm(year);
    const niveles = normalizeNivelList(r.nivel);
    const hasNivel = niveles.includes(nivelNorm);

    return isEditor && isActive && samePrograma && sameProceso && sameYear && hasNivel;
  });

  return uniqEmails(filtered.map((r) => r.email));
}

export async function getRecipientsForNivelEvent({
  programa,
  proceso,
  year,
  nivel,
  includePlanEmail = true,
  planEmail = PLAN_EMAIL_DEFAULT,
}) {
  const editorEmails = await getEditorEmailsByNivel({
    programa,
    proceso,
    year,
    nivel,
  });

  const extra = includePlanEmail ? [planEmail] : [];

  return {
    nivel: normalizeNivel(nivel),
    editorEmails,
    allRecipients: uniqEmails([...editorEmails, ...extra]),
  };
}