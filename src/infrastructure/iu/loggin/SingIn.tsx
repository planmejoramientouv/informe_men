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
        try {
            let allowedUser = await getAllowedUser()
            if (allowedUser?.data?.length > 0) {
                setGlobalState((prev) => ({
                    ...prev,
                    data: {
                        users: allowedUser?.data ?? []
                    }
                }))
            } 
        } catch (e) {
            console.log(e)
        }
    } 

    React.useEffect(() => {
        getUserAllowed()
        setHydrated(true);
    }, []);

    if (!hydrated) return null;  

    return (
            <main className={classes.containerPrimary}>
                {/* Circulitos decorativos */}
                <div className={`${classes.circle} ${classes.circleTopLeft}`} />
                <div className={`${classes.circle} ${classes.circleBottomRight}`} />
        
                {/* Sección Contenido */}
                <section className={classes.containerContent}>
                <Grid2 className={classes.containerImg}>
                        <img src="/assets/img/logo-univalle.png" alt="ilustre" />
                    </Grid2>
                    <Grid2 className={classes.containerInfo}>
                        <Grid2 className={classes.containerTitlePrimary}>
                            <Typography variant="h1" component="h2">
                                Procesos de calidad Programas académicos
                            </Typography>
                        </Grid2>
                        <Grid2 className={classes.containerLogin}>
                            <Typography classes={{ root: classes.titleSingIn }}>
                                Inicia Sesión
                            </Typography>
                            <GoogleLogin />
                        </Grid2>
                    </Grid2>
                </section>
            </main>     
    )
}