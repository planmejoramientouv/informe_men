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

// Fechts
import { getValuesKey } from '../../../../hooks/fecth/handlers/handlers'

// Hooks
import { getCookieData } from '../../../../libs/utils/utils'

// Generate Doc
export default () => {
    const classes = useStyles();
    const [cookie , setCokkie] = React.useState(null)
    const [loading , setLoading] = React.useState(false)

    const generatePdf = async ({ data_ }) => {
        const response = await fetch('/api/genDoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data_ }),
        });

        if (!response.ok) {
            throw new Error('Error al generar el PDF');
        }

        return response;
    };

    const onHandlerClick = async () => {
        setLoading(true)
        const keysValues = await getValuesKey({
            sheetId: cookie.sheetId,
            gid: cookie.gid
        })
        
        const response = await generatePdf({
            data_: keysValues
        })
        console.log(response,"log")
        if (response.ok) {
            const clonedResponse = response.clone();
            const blob = await clonedResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "documento.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            console.log('Error al descargar el PDF:');
        }

        setTimeout(() => {
            setLoading(false)
        }, 300);
    }

    React.useEffect(() => {
        if (cookie !== null) return
        const cookie_ = getCookieData('rrc')
        setCokkie(cookie_)
    },[cookie])

    return (
        <React.Fragment>
            <Show when={true}>
                <Box>
                    <Button 
                        disabled={loading} 
                        onClick={onHandlerClick} 
                        className={classes.buttonDownloadDocs} 
                        variant="contained"> 
                        { loading? 'Generando' : "Generar Documento" }
                    </Button>
                </Box>
            </Show>
        </React.Fragment>
    )
}