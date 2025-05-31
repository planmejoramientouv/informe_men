import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
    containerForm: {
        display: 'flex',
        padding: '20px',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        width: '100%',
        marginTop: '80px',
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
        maxWidth: '1162px',
        background: 'white',
    },
    FormItems: {
        // display: 'flex',
        gap: '20px',
        // flexWrap: 'wrap',
        overflow: 'auto',
        '& >  div[role="tabpanel"]': {
            width: '100%',
            '& > div.MuiBox-root': {
                padding: 'unset',
            }
        }
    },
    FormItemsMobile: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: '30px',
        overflow: 'auto',
        '& div.MuiAccordion-root': {
            width: '100%',
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
    titlePrimary: { 
        color: '#5f5b5b', 
        textTransform: 'uppercase', 
        fontSize: '1.5em !important', 
        fontWeight: '700 !important',
        marginTop: '20px !important',
        '@media (max-width: 700px)': {
            fontSize: '1.2em !important',
        }
    },
    titleInputs: { 
        color: '#5f5b5b', 
        textTransform: 'uppercase', 
        fontSize: '1.1em !important', 
        fontWeight: '700 !important',
        marginTop: '20px !important',
        '@media (max-width: 700px)': {
            fontSize: '1.2em !important',
        }
    },
    titleSecundaryInputs: { 
        color: '#5f5b5b', 
        textTransform: 'uppercase', 
        fontSize: '1em !important', 
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
        gap: '40px',
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
        background: '#fff',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.12)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 6px 35px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#c3c3c3',
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
        margin: 'auto',
        backgroundColor: 'var(--red-univalle) !important',
        height: '40px'
    },
    containerTab: {
        width: '170px',
        height: '170px',
        borderRadius: '8px',
        border: '1px solid #c3c3c3 !important',
        backgroundColor: '#c3c3c3 !important',
        backgroundRepeat: 'no-repeat !important',
        backgroundSize: 'cover !important',
        backgroundPosition: 'center !important',
        transition: 'all 0.3s ease',
        opacity: '0.6 !important',
        '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 6px 35px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#c3c3c3',
        }
    },
    centerButton: {
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
    },
    containerTextArea: {
        width: '100%',
        maxWidth: '100%',
        '& > textarea': {
            padding: '20px',
            minHeight: '100px',
            maxHeight: '150px',
            overflow: 'auto'
        },
        overflow: 'auto'
    },
    containerAccordion: {
        padding: '5px',
        width: '100%',
        '& div.MuiTableContainer-root': {
            display: 'none',
          },
          '& div.MuiTableContainer-root:nth-of-type(1)': {
            display: 'block',
        },
    },
    containerDetailsAccordion: {
        display: 'flex',
        gap: '30px',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    containerTextAreaNew: {
        position: "relative",
        width: '100%',
        '& > div > div.ql-container': {
            minHeight: '200px'
        }
    },
    selectInTable:  {
        width: '90%',
        margin: '0 auto'
    },
    inputNumberInTable: {
        width: '90%',
        '& input': {
            height: '56px',
        }
    },
    iframe: {
        borderRadius: '5px',
        border: '2px solid #222',
        minHeight: '400px',
        width: '100%',
        overflow: 'hidden',
        '& iframe': {
            marginTop: '-140px',
        }
    },
    tabContentPanel: {
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(219, 219, 219, 0.9)',
        padding: '24px',
    },
    clickedButton: {
        opacity: '0.8 !important',
    },
    disabledTextArea: {
        opacity: "0.4"
    },
    diableBox: {
        opacity: "0.4",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 100,
        cursor: 'not-allowed'
    },
    buttonDownloadDocs: {
        backgroundColor: 'var(--red-univalle) !important',
    },
    contFormDoc: {
        display: 'flex',
        justifyContent: 'start',
        width: '100%',
        maxWidth: '1162px',
    },
    drawer: {
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
        width: 240,
        boxSizing: 'border-box',
        backgroundColor: '#fafafa',
        },
    },
    listItem: {
        paddingLeft: 2,
    },
    nested: {
        paddingLeft: 4,
    },
    content: {
        flexGrow: 1,
        padding: 3,
        scrollBehavior: 'smooth',
    },
}));