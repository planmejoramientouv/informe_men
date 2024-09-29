import React, { useEffect } from 'react';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';

const _get_auth = (loader) => {
    try {
        google.accounts.id.initialize({
            client_id: '273121662645-779bflr2qqhih1qblrdp35v8nr7fiplp.apps.googleusercontent.com',
            callback: (response) => handleCredentialResponse(response, loader),
        });

        google.accounts.id.renderButton(
            document.getElementById('buttonDiv'),
            { theme: 'outline', size: 'large', text: 'login with google' }
        );

        google.accounts.id.prompt();
        //const _container_button = document.getElementById('section-button-google');
        //_container_button.classList.remove('_display_none');
    } catch (error) {
        console.log('error', error);
    }
};

const have_permission = ({ data, dataToken }) => {
    // Implement your permission logic here
};

const handleCredentialResponse = async (response, loader) => {
    try {
        loader(true);

        const decodedToken = decodeToken(response.credential);

        // const result = await getData('USERS');
        // const data = await getDataLoggued();

        if (false) {
            Cookies.set('token', decodedToken, { expires: 5 });
            if (data) {
                loader(false);
            }
        } else {
            loader(false);
            alert('No tienes permiso para acceder');
        }
    } catch (error) {
        console.log('error', error);
    }
};

const GoogleLogin = ({ setIsLoad }) => {
    useEffect(() => {
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
        _root.appendChild(_script);

        _script.onload = () => {
            _get_auth(setIsLoad);
        };
    }, [setIsLoad]);

    return <div id="buttonDiv"></div>;
};

export default GoogleLogin;
