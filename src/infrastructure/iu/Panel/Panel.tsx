// React
import React from 'react'

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import Show from '../../../../share/utils/Show'
import PanelItems from '../../components/panel/Panel'
import CreateItemCard from '../../components/panel/CreateItemCard';

// Para manejar cookies y roles
import { getCookieData } from '../../../../libs/utils/utils'
import { ROL_ADMIN_SISTEM, ROL_DIRECTOR, ROL_EDITOR_SISTEM } from '../../../../libs/utils/const'


// Material - IU
import Box from '@mui/material/Box'
import { Button, Grid2, Typography } from '@mui/material'

export default () => {
    const classes = useStyles();
    const [hydrated, setHydrated] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);

    const [role, setRole] = React.useState('');
    const canCreate = React.useMemo(() => {
        // Mostrar botón SOLO a admin o director
        return !ROL_EDITOR_SISTEM.includes(role);
    }, [role]);

    React.useEffect(() => {
        setHydrated(true);
        try {
            const cookie = getCookieData('data') || {};
            setRole(String(cookie?.rol || '').toLowerCase());
        } catch (e) {
        setRole('');
        }
    }, []);
    

    const handleCreateSave = async ({ tipo, sede, programa, periodo, email }) => {
          try {
            const res = await fetch('/api/createProgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, sede, programa, periodo, email, rol: 'director', estado: 'Activo' }),
            });
            const json = await res.json();
            if (!res.ok || !json?.status) throw new Error(json?.error || 'Falló createProgram');

            setRefreshKey(k => k + 1);
            return json; // opcional, por si lo usas después
        } catch (err) {
            // deja que CreateItemCard muestre el snackbar de error
            throw err;
        }
        };


    return (
        <React.Fragment>
            <Show when={hydrated}>
                <Box className={classes.containerForm}>
                    <Grid2 className={classes.containerFields}>
                        <Grid2 className={classes.containerPanel}>
                            {canCreate && <CreateItemCard onSave={handleCreateSave} />}
                            <Box sx={{
                                maxHeight: '100vh',
                                overflowY: 'auto',
                                pr: 1,                  
                            }}>
                            <PanelItems key={refreshKey} />
                            </Box>
                        </Grid2>
                    </Grid2>
                </Box>
            </Show>
        </React.Fragment>
    )
}