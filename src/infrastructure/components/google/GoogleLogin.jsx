import React, { useEffect } from 'react';
import { decodeToken } from 'react-jwt';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'next/router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';

// Hoosk
import { useGlobalState } from '../../../../hooks/context'
import { ROL_ALLOWED_SISTEM, ROL_ADMIN_SISTEM } from '../../../../libs/utils/const'
import { setCookieRRC } from '../../../../libs/utils/utils'


import Show from '../../../../share/utils/Show';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

const _get_auth = (loader, data, router, setOpen, setErrorText) => {
    try {
        google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_CLIENT_ID_GOOGLE,
            callback: (response) => handleCredentialResponse(response, loader, data, router, setOpen, setErrorText),
        });

        google.accounts.id.renderButton(
            document.getElementById('buttonDiv'),
            { theme: 'outline', size: 'large', text: 'login with google' }
        );

        google.accounts.id.prompt();
    } catch (error) {
        console.log('error', error);
    }
};

const have_permission = ({ data, dataToken }) => {
    if (data?.length < 0) return false
    
    // Regex
    const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit.*?gid=([0-9]+)/;
    
    // Validate user and rol
    const isUserActive = data.find(item => String(item?.email) === String(dataToken?.email))
    const isAdmin = ROL_ADMIN_SISTEM.includes(isUserActive?.rol)
    const hasUrl = (isUserActive?.url_exel ?? '').match(regex) !== null
    const hasUrlDoc = isAdmin || hasUrl
    
    return {
        response: isUserActive?.id && hasUrlDoc,
        hasUrl: !hasUrl && !(isUserActive?.id),
        userFound: isUserActive,
        urlData: (isUserActive?.url_exel ?? '').match(regex)
    }
};

const handleCredentialResponse = async (response, loader, data, router, setOpen, setErrorText) => {
    loader(true);
    try {
        const decodedToken = decodeToken(response.credential);        
        const havePermission = have_permission({ data: data || [], dataToken: decodedToken })
        if (havePermission.response) {
            const currentRol = havePermission?.userFound?.rol
            const currentProcess = havePermission?.userFound?.proceso
            const sheetId = havePermission.urlData[1] ?? ''
            const gid = havePermission.urlData[2] ?? ''
            
            // Set Cookie
            Cookies.set('auth', havePermission , { expires: 4 })
            const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
                img: decodedToken.picture,
                name: `${decodedToken.name}`,
                rol: havePermission.userFound?.rol,
                nivel: havePermission.userFound?.nivel,
                programa: havePermission.userFound?.programa,
                email: decodedToken.email
            }), secretKey).toString();
            Cookies.set('data', encryptedData, { expires: 4 });

            if (ROL_ALLOWED_SISTEM.includes(currentRol)) {
                router.push('/');
                return;
            }

            setCookieRRC({
                sheetId: sheetId,
                programa: havePermission.userFound?.programa,
                proceso: currentProcess,
                gid: gid,
                nameCookie: (currentProcess).toLowerCase()
            })
            router.push(`/${(currentProcess).toLowerCase()}`)
        }
        else {
            const textError = havePermission.hasUrl ? 'No Tienes Acceso' : 'El programa no tiene informe'
            setErrorText(textError)
            setOpen(true)
        }
    } catch (error) {
        console.log('error', error);
    }

    setTimeout(() => {
        loader(false)
    }, 2000)
};

export default () => {
    const router = useRouter();

    const { globalState } = useGlobalState()
    const [isload, setIsLoad] =  React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [data, setData] = React.useState([])
    const [errorText, setErrorText] = React.useState('No Tienes Acceso')

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        setData(globalState.data.users || [])
    },[globalState.data])

    useEffect(() => {
        if (data?.length <= 0 || isload) return
        const _root = document.querySelector('body');
        const script_id = document.getElementById('google-login');

        if (script_id) {
            _root.removeChild(script_id);
        }

        const _script = document.createElement('script');
        _script.src = 'https://accounts.google.com/gsi/client';
        _script.async = true;
        _script.id = 'google-login';
        _script.defer = true;
        _root.appendChild(_script, globalState);

        _script.onload = () => {
            _get_auth(setIsLoad, data,router, setOpen, setErrorText);
        };
    }, [isload, data]);

    return (
        <>
            <Show when={isload}>
                <LoadingButton loading variant="outlined" sx={{width: '190px'}}>
                    Submit
                </LoadingButton>
            </Show>
            <Show when={!isload}>
                <div id="buttonDiv" />
            </Show>
            <Box sx={{ width: 500 }}>
                <Snackbar
                    autoHideDuration={6000}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={open}
                    onClose={handleClose}
                    key={2}
                >
                   <Alert severity="error">{errorText}</Alert> 
                </Snackbar>
            </Box>
        </>
    )
};