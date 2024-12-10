import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

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
  if (encryptedData === null) return {}
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

export const firstLevelPermission = (element) => {
  const cookie_ = getCookieData('data')
  if (cookie_?.rol === 'admin') return true
  const isValidPermision = (cookie_?.nivel ?? "").split(',') ?? []
  return isValidPermision?.includes(element?.permiso)
}

export const checkboxLevelPermission = (type) => {
  const cookie_ = getCookieData('data')
  if (cookie_?.rol === 'admin') return false
  if (cookie_?.rol === 'director' && type === 1) return false
  if (cookie_?.rol === 'daca' && type === 2) return false
  return true
}