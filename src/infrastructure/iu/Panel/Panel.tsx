// React
import React from 'react'

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import Show from '../../../../share/utils/Show'
import PanelItems from '../../components/panel/Panel'

// Material - IU
import Box from '@mui/material/Box'
import { Button, Grid2, Typography } from '@mui/material'

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
                            <Grid2 className={classes.containerPanel}>
                                <PanelItems />
                            </Grid2>
                    </Grid2>
                </Box>
            </Show>
        </React.Fragment>
    )
}