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
        flexWrap: 'wrap',
        borderRadius: '8px',
        padding: '20px',
        width: '95%',
        maxHeight: '100%',
        background: 'white',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.12)',
        '@media (max-width: 700px)': {
       
        }
    },
    FormItems: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: '30px',
        overflow: 'auto',
        '& div.MuiAccordion-root': {
            width: '170px',
            height: '170px',
            margin: '10px 20px',
            '&:hover': {
                // transform: 'scale(1.05)',
                boxShadow: '0px 6px 35px rgba(0, 0, 0, 0.2)',
                backgroundColor: '#f0f0f0',
            },
            '& div.MuiAccordionSummary-root': {
                height: '100%'
            }
        }
    },
    actions: {
        padding: '15px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '10%',
        width: '100%'
    },
    containerCloseButtom: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right:  0,
        background: 'rgba(2,2,2,0.5)',
        zIndex: 999,
        cursor: 'pointer'
    },
    containerFormSection: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right:  0,
        zIndex: 1000,
        width: '85%',
        margin: 'auto',
        display: 'flex',
        flexWrap: 'wrap',
        padding: '25px',
        background: 'white',
        overflow: 'auto',
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
        color: '#5f5b5b', 
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
    listFormSection: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        height: 'min-content',
        gap: '20px',
        marginTop: '20px',
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
        background: '#a9a9a9',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.12)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 6px 35px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#a9a9a9',
        },
        '& h2': {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#fff',
            textTransform: 'uppercase',
            fontSize: '13px !important',
            fontWeight: '700 !important',
            transition: 'color 0.3s ease',
            '@media (max-width: 700px)': {
                fontSize: '10px !important',
            },
        },
        '&:hover h2': {
            color: '#fff',
        }
    },
    ColapsableTwo: {
        width: '100%',
        marginBottom: '20px'
    },
    buttonSave: {
        backgroundColor: 'var(--red-univalle) !important',
        height: '49px'
    }
}));