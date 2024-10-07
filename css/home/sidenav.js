import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
    containerNav: {
        position: 'fixed',
        left: 0,
        bottom: 0,
        minHeight: 'calc(100vh - 80px)',
        padding: '6px',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.12)',
        '@media (max-width: 700px)': {
            minHeight: '100vh',
            zIndex: '9999',
            background: 'white',
        }
    },
    closeNav: {
        display: 'block',
        position: 'fixed',
        left: 0,
        bottom: 0,
        right: 0,
        top: 0,
        width: '100%',
        minHeight: '100vh',
        zIndex: '999',
        background: 'rgba(2,2,2,0.5)'
    },
    hiddentMobile: {
        '@media (max-width: 700px)': {
            display: 'none'
        }
    },
    showMobile: {
        display: 'none',
        '@media (max-width: 700px)': {
            display: 'block'
        }
    }
}));