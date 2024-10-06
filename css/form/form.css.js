import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
    containerForm: {
        display: 'flex',
        padding: '20px',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: 'calc(100% - 262px)',
        marginLeft: '262px',
        height: 'calc(100vh - 80px)',
        '@media (max-width: 700px)': {
            marginLeft: 'unset',
            width: '100%'
        }
    },
    containerFields: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        width: '95%',
        height: '90%',
        background: 'white',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.12)',
        '@media (max-width: 700px)': {
       
        }
    },
    FormItems: {
        height: '90%',
        overflow: 'auto'
    },
    actions: {
        padding: '15px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '10%',
        width: '100%'
    }
}));