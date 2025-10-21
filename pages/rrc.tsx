"use-client"

/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React from "react"

// Components
import Header from "../src/infrastructure/components/Header"
import Form from "../src/infrastructure/iu/Forms/Form"

// Hoosk
import { useGlobalState } from '../hooks/context'
import { getFormRRC } from '../hooks/fecth/handlers/handlers'

// Hooks
import { getCookieData, setCookieRRC } from '../libs/utils/utils'
import { error } from "console"

// Home
export default function RRCPage() {
  const { setGlobalState } = useGlobalState();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const cookie = getCookieData("rrc"); // ← clave
        if (!cookie?.sheetId || !cookie?.gid) {
          throw new Error("No se encontró el proceso RRC seleccionado. Vuelve al panel y elige uno.");
        }

        const resp = await getFormRRC({ sheetId: cookie.sheetId, gid: cookie.gid });
        if (!alive) return;

        setGlobalState((prev) => ({
          ...prev,
          data: {
            formdata: resp?.data ?? [],
            sheetId: cookie.sheetId,
            gid: cookie.gid,
          },
        }));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "No fue posible cargar el formulario RRC.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [setGlobalState]);

  return (
    <main className="root-container">
      <Header />
      {loading && <div style={{ padding: 16 }}>Cargando RRC…</div>}
      {!loading && error && <div style={{ padding: 16, color: "#b00020" }}>{error}</div>}
      {!loading && !error && <Form />}
    </main>
  );
}