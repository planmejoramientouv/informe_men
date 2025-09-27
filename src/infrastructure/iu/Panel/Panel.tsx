// React
import React from 'react'

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import Show from '../../../../share/utils/Show'
import PanelItems from '../../components/panel/Panel'
import CreateItemCard from '../../components/panel/CreateItemCard';

// Material - IU
import Box from '@mui/material/Box'
import { Button, Grid2, Typography } from '@mui/material'

export default () => {
    const classes = useStyles();
    const [hydrated, setHydrated] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    const handleCreateSave = async ({ tipo, sede, programa, periodo, email }) => {
        const res = await fetch('/api/createProgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            tipo, sede, programa, periodo, email,
            rol: 'director', estado: 'Activo',
            }),
        });
        const json = await res.json();
        if (!res.ok || !json?.status) throw new Error(json?.error || 'Falló createProgram');
        // refrescar listado si quieres...
        };


    return (
        <React.Fragment>
            <Show when={hydrated}>
                <Box className={classes.containerForm}>
                    <Grid2 className={classes.containerFields}>
                            <Grid2 className={classes.containerPanel}>
                                <CreateItemCard onSave={handleCreateSave} />
                                <PanelItems />
                            </Grid2>
                    </Grid2>
                </Box>
            </Show>
        </React.Fragment>
    )
}