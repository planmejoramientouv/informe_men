/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import styles from '../../../css/home/header.module.css'
import { useRouter } from 'next/router';

// Type
import Show from '../../../share/utils/Show';
import Popup from './popup/popup';
import React from 'react';
import SingIn from './sing-in/sing-in';

export default () => {
    const router = useRouter();
    const [enableLogin, setEnableLogin] = React.useState(false)

    const closePopup = () => setEnableLogin(false)

    return( 
        <header className={styles.header}>
            <div className={styles['container-logo']}>
                <img onClick={() =>  router.push('/')} src={'/assets/logo/logo.png'} alt='logo' />
            </div>
            <div className={styles['btn-container-login']}>
                <a onClick={() => setEnableLogin(true)}>
                    Iniciar Sesion
                </a>
                <a onClick={() =>  router.push('/sing-up')}>
                    Crear Cuenta
                </a>
            </div>
            <Show when={enableLogin}>
              <Popup actionClose={closePopup}>
                  <SingIn />
              </Popup>
            </Show>
        </header>
    )
}