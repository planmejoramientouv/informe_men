import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
    containerPrimary: {
        display: 'flex',
        flexWrap: 'wrap',
        height: '100vh',
    },
    containerLogo: {
        display: 'flex',
        minHeight: '100%',
        background: 'var(--red-univalle)',
        width: '30%',
        maxWidth: '370px'
    },
    containerContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        width: 'calc(100% - 370px)',
        '@media(max-width: 900px)': {
            width: '70%'
        }
    },
    containerLogin: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        height: 'calc(100%)',
    },
    containerImg: {
        margin: 'auto',
        maxWidth: '70%',
        height: '470px',
        overflow: 'hidden'
    },
    titleSingIn: {
        fontSize: '1.5em !important',
        textAlign: 'center'
    },
    containerTitlePrimary: {
        display: 'grid',
        placeContent: 'center',
        height: '30%',
        '& > h2': {
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'var(--red-univalle)',
            '@media(max-width: 900px)': {
                fontSize: '1.8em'
            }
        }
    }
}));