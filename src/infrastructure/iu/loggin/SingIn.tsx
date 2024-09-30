/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from 'react'

// Components
import GoogleLogin from '../../components/google/GoogleLogin'

// Material - IU
import Typography from '@mui/material/Typography'
import { Grid2 } from '@mui/material'
import useStyles from '../../../../css/sing-in/sing-in'

// Hoosk
import { useGlobalState } from '../../../../hooks/context'

// Fecth
import { getAllowedUser } from '../../../../hooks/fecth/handlers/handlers'

export default () => {
    const classes = useStyles();
    const { setGlobalState } = useGlobalState()
    
    const [hydrated, setHydrated] = React.useState(false);

    const getUserAllowed = async () => {
        let allowedUser = await getAllowedUser()
        if (allowedUser?.data.length > 0) {
            setGlobalState((prev) => ({
                ...prev,
                data: {
                    users: allowedUser?.data ?? []
                }
            }))
        } 
    } 

    React.useMemo(() => {
        getUserAllowed()
    },[])

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) return null;  

    return (
        <main className={classes.containerPrimary}>
            <section className={classes.containerLogo}>
                <Grid2 className={classes.containerImg}>
                    <img src="/assets/img/logo-univalle.png" alt="ilustre" />
                </Grid2>
            </section>
            <section className={classes.containerContent}>
                <Grid2 className={classes.containerTitlePrimary}>
                    <Typography variant="h1" component="h2">
                        DACA UNIVALLE
                    </Typography>
                </Grid2>
                <Grid2 className={classes.containerLogin}>
                    <Typography classes={{ root: classes.titleSingIn }}>
                        Inicia Sesión
                    </Typography>
                    <GoogleLogin />
                </Grid2>
            </section>
        </main>
    )
}