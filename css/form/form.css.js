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
        padding: '30px',
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
    },
    containerFormSection: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
    },
    inputText: {
        margin: '10px 0px',  
        width: '45%',
        color: '#222',
        '& input': {
            height: '1em !important',
            padding: '25px !important'
        },
        '@media (max-width: 700px)': {
            width: '100%',
            '& input': {
                height: '1em !important',
                padding: '20px !important'
            }
        },
        '& label': {
            fontWeight: 'bold',
        }
    },
    titleInputs: { 
        color: '#222', 
        textTransform: 'uppercase', 
        fontSize: '1.5em !important', 
        fontWeight: '700 !important',
        marginTop: '20px !important',
        '@media (max-width: 700px)': {
            fontSize: '1.2em !important',
        }
    }
}));