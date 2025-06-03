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
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { Typography, TextField, Grid2, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Dialog
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Fechts
import { createDocumentGoogle, getValuesKey, replacementsDocsKeys, generatePdf } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { getCookieData } from '../../../../libs/utils/utils'

// Generate Doc
export default () => {
    const classes = useStyles();
    const [cookie , setCokkie] = React.useState(null)
    const [loading , setLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [openSnak, setOpenSnak] = React.useState(false)
    const [textError, setTextError] = React.useState("")
    const [IsActiveRequest, setIsActiveRequest] = React.useState(false)
    const [isError, setIsError] = React.useState(false)

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

        const regex = /^{{[0-9a-zA-Z_]+}}$/;
        const dataFilter = keysValues.data.filter(item => regex.test(item?.key));

        await createDocumentGoogle({
            data: dataFilter,
            email: cookie?.email ?? ""
        })

        setOpenSnak(true)
        setTextError("Terminado")
        setIsError(true)
        setLoading(false)
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
        if (IsActiveRequest) execute()
    },[IsActiveRequest])

    const params = {
      open: openSnak,
      setOpen: setOpenSnak,
      textError: textError,
      isError: isError 
    }

    return (
        <Show when={true}>
            <React.Fragment>
              <Box className={classes.contFormDoc}>
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
                <SnackbarAlert {...params}/>
              </Box>
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

const SnackbarAlert = ({ open, setOpen, textError, isError}) => {

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message=""
        action={action}
      >
        <Alert severity={isError? "success" : "error"}>
          {textError}
        </Alert>
      </Snackbar>
    </div>
  );
}