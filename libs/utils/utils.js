import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { ROL_ADMIN_SISTEM, ROL_DIRECTOR, ROL_EDITOR_SISTEM } from './const';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

const addHeadings = (people, headings) => {
    return people.map(personAsArray => {
      const personAsObj = {};
  
      headings.forEach((heading, i) => {
        personAsObj[heading] = personAsArray[i];
      });
  
      return personAsObj;
    });
}

const normalizeString = (value) => {
    return String(value || '')
      .trim()
      .toLowerCase();
}

export const sheetValuesToObject = (sheetValues, headers) => {
    const headings = headers || sheetValues[0].map(normalizeString);
    let people = null;
    if (sheetValues) people = headers ? sheetValues : sheetValues.slice(1);
    const peopleWithHeadings = addHeadings(people, headings);
    return peopleWithHeadings;
}

export const getCookieData = (cookieName) => {
  const encryptedData = Cookies.get(cookieName);
  if (!encryptedData) return {};
  return JSON.parse(CryptoJS?.AES?.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8) || '{}');
}

export const setCookieRRC = ({sheetId, programa, proceso, gid, year, nameCookie}) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        sheetId: sheetId,
        programa: programa,
        proceso: proceso,
        gid: gid,
        year: year,
    }), secretKey).toString();
    Cookies.set(nameCookie, encryptedData, { expires: 4 });
}

function permisoKeyFromNode(node = {}) {
  const p = node && node.permiso;
  // acepta 0 como válido, y cualquier otro valor truthy
  return (p === 0 || p) ? String(p).trim() : '';
}

export const firstLevelPermission = (node = {}) => {
  const cookie = getCookieData('data') || {};
  const rol    = String(cookie && cookie.rol || '').toLowerCase();
  const nivel  = String(cookie && cookie.nivel || '');

  // Admin: siempre ve todo
  if (ROL_ADMIN_SISTEM.includes(rol)) return true;

  // Director: ve TODO (sin depender de "nivel")
  if (ROL_DIRECTOR.includes(rol)) return true;

  // Editor: depende de "nivel" -> necesita permiso de VISTA (n)
  const permisoKey = permisoKeyFromNode(node); // p.ej. "9"
  if (!permisoKey) return true;               // si no hay clave, no bloqueamos
  return hasViewPermission(nivel, permisoKey);
};


export const checkboxLevelPermission = (type = 0, permisoKey = '') => {
  const cookie = getCookieData('data') || {};
  const rol    = String(cookie?.rol || '').toLowerCase();
  const nivel  = String(cookie?.nivel || '');

  console.log("rol ", rol, nivel, permisoKey);

  // Admin: edita todo
  if (ROL_ADMIN_SISTEM.includes(rol)) return true;

  // Director: edita TODO (sin depender de "nivel")
  if (ROL_DIRECTOR.includes(rol)) return true;

  // Editor: sólo edita si tiene el permiso con guion (n-)
  if (ROL_EDITOR_SISTEM.includes(rol)) {
    return hasEditPermission(nivel, String(permisoKey));
  }

  // Otros roles: no pueden editar (ajústalo si necesitas)
  return false;
};


// Normaliza y separa permisos de vista/edición desde el string nivel:
export const parseNivelTokens = (nivelStr = '') => {
  const tokens = String(nivelStr || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const view = new Set();  // ej. '1', '2'
  const edit = new Set();  // ej. '1', '2' (para los que tengan '1-', '2-')
  for (const t of tokens) {
    if (/-$/.test(t)) {
      const k = t.replace(/-$/, '');
      if (k) edit.add(k);
    } else {
      view.add(t);
    }
  }
  return { view, edit };
};

// ¿Tiene permiso de VER un menú (primer nivel)?
export const hasViewPermission = (nivelStr = '', permisoKey = '') => {
  const { view } = parseNivelTokens(nivelStr);
  return view.has(String(permisoKey));
};

// ¿Tiene permiso de EDITAR un menú/campo?
export const hasEditPermission = (nivelStr = '', permisoKey = '') => {
  const { edit } = parseNivelTokens(nivelStr);
  return edit.has(String(permisoKey));
};

