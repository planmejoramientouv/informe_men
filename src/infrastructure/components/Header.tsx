/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import styles from '../../../css/home/header.module.css'
import { useRouter } from 'next/router';
import useStyles from '../../../css/home/sidenav';

// Type
import React from 'react';
import { Avatar, Button, Grid2, Menu, MenuItem, Typography } from '@mui/material';

import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import Sidenav from './navigate/Sidenav';
import Show from '../../../share/utils/Show';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

export default () => {
    const router = useRouter();
    const classes = useStyles();
    const [hydrated, setHydrated] = React.useState(false);

    const [data_, setData] = React.useState({
        img: '',
        name: ''
    })
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handlerCloseSession = () => {
        handleClose()
        Cookies.remove('auth')
        Cookies.remove('data')
        router.push('/login')
    }

    const init_ = () => {
        try {
            const encryptedData = Cookies.get('data');
            if (encryptedData === null) return
            const decryptedData = JSON.parse(CryptoJS?.AES?.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8) || '{}');
            setData(decryptedData)
            setHydrated(true)
        } catch (e) {
            console.log(e)
        }
    }

    React.useEffect(() => {
        init_()
    }, [])

    return (
        <Show when={hydrated}>
            <header className={styles.header}>
                <div className={`${styles['container-logo']} ${classes.hiddentMobile}`}>
                    <img onClick={() => router.push('/')} src={'/assets/img/logo-univalle.png'} alt='logo' />
                </div>
                <div>
                    <Grid2 sx={{ display: 'flex', alignItems: 'center', maxHeight: '50px' }}>
                        <Typography className={classes.hiddentMobile}>
                            {data_.name}
                        </Typography>
                        <Button
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <Avatar
                                alt={data_.name}
                                src={data_.img}
                                sx={{ width: 50, height: 50 }}
                            />
                        </Button>
                    </Grid2>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={handlerCloseSession}>Cerrar Sesion</MenuItem>
                    </Menu>
                </div>
            </header>
        </Show>
    )
}