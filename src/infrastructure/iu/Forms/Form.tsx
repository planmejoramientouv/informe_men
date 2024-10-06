import React from 'react'

import useStyles from '../../../../css/form/form.css.js'
import Box from '@mui/material/Box'
import Show from '../../../../share/utils/Show'
import { Button, Grid2 } from '@mui/material'

export default () => {
    const classes = useStyles();
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    return (
        <React.Fragment>
            <Show when={hydrated}>
                <Box className={classes.containerForm}>
                    <Grid2 className={classes.containerFields}>
                        <Grid2 className={classes.FormItems}>

                        </Grid2>
                        <Grid2 className={classes.actions}>
                            <Button sx={{ background:'var(--red-univalle)'}} variant="contained" disableElevation>
                                Guardar
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </Show>
        </React.Fragment>
    )
}