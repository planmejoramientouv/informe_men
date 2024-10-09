import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
    containerForm: {
        display: 'flex',
        padding: '20px',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
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
        padding: '20px',
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
    },
    titlePanel: {
        height: '10%',
        '& h2': {
            color: '#222', 
            textTransform: 'uppercase', 
            fontSize: '1.5em !important', 
            fontWeight: '700 !important',
            marginTop: '20px !important',
            '@media (max-width: 700px)': {
                fontSize: '1.2em !important',
            }   
        }
    },
    containerPanel: {
        display: 'flex',
        flexDirection: 'column',
        height: '90%',
        padding: '30px',
        overflow: 'auto',
        '@media (max-width: 700px)': {
            padding: 'unset',
        },
    },
    containerTitlePanel: {
        padding: '30px 0',
        '& h2': {
            color: '#222', 
            textTransform: 'uppercase', 
            fontSize: '1.3em !important', 
            fontWeight: '700 !important',
            '@media (max-width: 700px)': {
                fontSize: '1em !important',
            }   
        }
    },
    containerForPanel: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        '@media (max-width: 700px)': {
            justifyContent:  'center',
        },
    },
    forItemsPanel: {
        display: 'flex',
        alignItems: 'center',
        justifyContent:  'center',
        width: '160px',
        height: '160px',
        padding: '10px',
        borderRadius: '4px',
        background: 'var(--red-univalle)',
        color: 'white',
        cursor: 'pointer'
    }
}));