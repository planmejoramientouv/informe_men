import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { ROL_ADMIN_SISTEM, ROL_DIRECTOR, ROL_EDITOR_SISTEM } from './const';
import { usePathname } from "next/navigation";

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

export const setCookieRRC = ({sheetId, programa, proceso, gid, year, rol, nivel, nameCookie}) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        sheetId: sheetId,
        programa: programa,
        proceso: proceso,
        gid: gid,
        year: year,
        rol: rol,
        nivel: nivel,
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

  if (ROL_EDITOR_SISTEM.includes(rol)) return true;

  // Editor: depende de "nivel" -> necesita permiso de VISTA (n)
  // const permisoKey = permisoKeyFromNode(node); // p.ej. "9"
  // if (!permisoKey) return true;               // si no hay clave, no bloqueamos
  // return hasViewPermission(nivel, permisoKey);
};


export const checkboxLevelPermission = (permisoKey = '', tipo = '') => {
  const routeCookie = useRouteCookie() || {};
  const cookieData = getCookieData("data") || {};
  const cookie = routeCookie.cookie || {};
  
  const rol = String(cookie.rol || cookieData?.rol || '').toLowerCase();
  const niveles = String(cookie.nivel || cookieData?.nivel || '');
  const nivelesArray = niveles.split(',').map(s => s.trim()).filter(Boolean);

  // Admin puede todo
  if (ROL_ADMIN_SISTEM.includes(rol)) return true;

  // Director solo checkbox "director"
  if (ROL_DIRECTOR.includes(rol)) return tipo === 'director';

  // Editor solo puede checkbox director si su nivel incluye el permiso
  if (ROL_EDITOR_SISTEM.includes(cookieData.rol)) {
    return tipo === 'director' && nivelesArray.includes(String(permisoKey).trim());
  }

  // Otros roles: no pueden editar
  return false;
};





// Normaliza y separa permisos de vista/edición desde el string nivel:
export const parseNivelTokens = (nivelStr = '') => {
  const tokens = String(nivelStr || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const view = new Set();  // opcional si aún lo necesitas
  const edit = new Set();  // ahora aquí va TODO

  for (const t of tokens) {
    // Todos los números son permisos de edición
    edit.add(t);

    // Y también sirven como permisos de vista si sigues usándolo
    view.add(t);
  }

  return { view, edit };
};

export const useRouteCookie = () => {
  const pathname = usePathname(); // Ej: "/rrc/form/123"

  // Primer segmento
  const segment = pathname.split("/").filter(Boolean)[0] || "";

  // Nombre de la cookie = primer segmento
  const cookieName = segment;

  // Leer cookie
  const cookie = getCookieData(cookieName) || {};

  return { cookieName, cookie };
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

export function canEditMenu(element, nivelStr) {
  const raw = element?.groups_fields || element?.primary?.groups_fields || "";
  const match = String(raw).match(/^\d+/);
  const menuNumber = match ? match[0] : "";

  return can;
}