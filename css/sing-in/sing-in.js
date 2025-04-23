import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
    containerPrimary: {
        display: 'flex',
        flexWrap: 'wrap',
        height: '100vh',
        position: 'relative', 
        overflow: 'hidden'
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
        padding: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 400px)',
        width: '80%',
        margin: 'auto',
        '@media(max-width: 1026px)': {
            width: '100%',
            height: 'calc(100vh - 200px)',
        },
        '@media(max-width: 768px)': {
            height: 'calc(100vh - 200px)',
            width: '100%',
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
        height: '250px',
        overflow: 'hidden',
        '@media(max-width: 768px)': {
           display: 'none'
        }
    },
    titleSingIn: {
        fontSize: '1.5em !important',
        textAlign: 'center'
    },
    containerTitlePrimary: {
        display: 'grid',
        placeContent: 'end',
        height: '40%',
        width: '75%',
        '& > h2': {
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: '1',
            color: 'var(--red-univalle)',
            '@media(max-width: 1400px)': {
                fontSize: '3.5em',
            },
            '@media(max-width: 900px)': {
                fontSize: '1.3em',
                height: '50%'
            }
        },
        
    },
    circle: {
        position: 'absolute',
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, #e91e63, #c2185b)',
        opacity: 0.07,
        zIndex: 0,
        pointerEvents: 'none',
    },
    circleTopLeft: {
        width: '350px',
        height: '350px',
        top: '-80px',
        left: '-80px',
        '@media(max-width: 1026px)': {
            width: '230px',
            height: '230px',
            top: '-40px',
            left: '-40px',
        },
        '@media(max-width: 768px)': {
            width: '180px',
            height: '180px',
            top: '-40px',
            left: '-40px',
        },
    },
    circleBottomRight: {
        width: '350px',
        height: '350px',
        bottom: '-120px',
        right: '-120px',
        '@media(max-width: 1026px)': {
            width: '230px',
            height: '230px',
            bottom: '-60px',
            right: '-60px',
        },
        '@media(max-width: 768px)': {
            width: '180px',
            height: '180px',
            bottom: '-60px',
            right: '-60px',
        },
    },    
    containerInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
    },
}));