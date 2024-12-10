/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Components
import Show from '../../../../share/utils/Show'
import For from '../../../../share/utils/For'

// Material - IU
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { Typography, TextField, Grid2, Button } from '@mui/material';

// Dialog
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Fechts
import { getValuesKey, replacementsDocsKeys, generatePdf } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { getCookieData } from '../../../../libs/utils/utils'

// Generate Doc
export default () => {
    const classes = useStyles();
    const [cookie , setCokkie] = React.useState(null)
    const [loading , setLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false);
    const [IsActiveRequest, setIsActiveRequest] = React.useState(false);

    const onHandlerClick = async () => {
        
        if (!IsActiveRequest) {
            setOpen(true)
            return
        }

        setLoading(true)

        const keysValues = await getValuesKey({
            sheetId: cookie.sheetId,
            gid: cookie.gid
        })

        const regex = /^{{[a-zA-Z]+}}$/;
        const dataFilter = keysValues.data.filter(item => regex.test(item?.key));
        const uniqueIds = dataFilter.reduce((acc, current) => {
            if (!acc.some(item => String(item) === String(current.group))) {
              acc.push(current.group);
            }
            return acc;
          }, []);

        if (uniqueIds?.length > 0) {
            uniqueIds.map(async (group) => {
                const groupItems = dataFilter.filter(item => {
                    return String(item?.group) === String(group)
                })

                const responseIdUrl = await generatePdf({
                    data: groupItems,
                    email: cookie.email ?? ""
                })
        
                const remplacements = await replacementsDocsKeys({
                    data: keysValues,
                    newDocId: responseIdUrl.urlDocumento
                })
        
                if (remplacements?.status) {
                    alert("Terminado con exito")
                } else {
                    console.log('Error al descargar el PDF:');
                }
            })
        }

        setTimeout(() => {
            setIsActiveRequest(false)
            setLoading(false)
        }, 300);
    }

    const execute = async () => {
        await onHandlerClick()
    }

    React.useEffect(() => {
        if (cookie !== null) return
        const cookie_  = getCookieData('rrc')
        const dataAuth = getCookieData('data')
        cookie_.email = dataAuth.email
        setCokkie(cookie_)
    },[cookie])

    React.useEffect(() => {
        console.log(IsActiveRequest,"IsActiveRequest")
        if (IsActiveRequest) execute()
    },[IsActiveRequest])

    return (
        <Show when={true}>
            <React.Fragment>
                <Box>
                    <Button 
                        disabled={loading} 
                        onClick={onHandlerClick} 
                        className={classes.buttonDownloadDocs} 
                        variant="contained"> 
                        { loading? 'Generando' : "Generar Documento" }
                    </Button>
                </Box>
                <AlertDialog {...{open, setOpen, setIsActiveRequest}}/>
            </React.Fragment>
        </Show>
    )
}

const AlertDialog = ({ open, setOpen, setIsActiveRequest }) => {
  
    const handleClickOpen = () => {
      setOpen(false);
      setIsActiveRequest(true)
    };
  
    const handleClose = () => {
      setOpen(false);
      setIsActiveRequest(true)
    };
  
    return (
      <React.Fragment>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirmación de creación de documento"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
                La siguiente acción generará una nueva versión del documento, 
                reemplazando la anterior. Ten en cuenta que los cambios 
                realizados fuera de la aplicación no se conservarán. 
                ¿Deseas continuar con la creación del documento?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
            <Button onClick={handleClose} autoFocus>
              Aceptar
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
}