"use-client"

// React
import React from 'react'
import { useForm } from 'react-hook-form';

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Material - IU
import Box from '@mui/material/Box'
import { Button, Grid2 } from '@mui/material'

// Components
import Show from '../../../../share/utils/Show'
import FormFields from '../../components/form/FormFields'
import DownloadDoc from '../../components/Docs/Docs'

export default () => {
    const classes = useStyles();
    const [hydrated, setHydrated] = React.useState(false);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log('Datos enviados:', data);
    };

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    return (
        <React.Fragment>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Show when={hydrated}>
                    <Box className={classes.containerForm}>
                        {/* <DownloadDoc /> */}
                        <Grid2 className={classes.containerFields}>
                            <Grid2 className={classes.FormItems}>
                                <FormFields />
                            </Grid2>
                        </Grid2>
                    </Box>
                </Show>
            </form>
        </React.Fragment>
    )
}