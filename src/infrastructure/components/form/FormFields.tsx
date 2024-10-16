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

// Hoosk
import { useGlobalState } from '../../../../hooks/context'

// Material - IU
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Typography, TextField, TextareaAutosize, MenuItem, FormControl, InputLabel, Select, Grid2 } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';

// Tabs
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';

// Fecth
import { updateDataTable } from '../../../../hooks/fecth/handlers/handlers'

// Def
export default () => {
    const classes = useStyles();
    const [formData, setFormData] = React.useState([])
    const [sizeRows, setSizeRows] = React.useState([])
    const [sizeColums, setSizeColumns] = React.useState(0)
    const { globalState } = useGlobalState()

    window.addEventListener("resize", function (event) {
        getRowsAndColumns()
    });

    const getRowsAndColumns = () => {
        const array_ = []
        const width_ = window.innerWidth
        const sizeBox = (width_ * 92.92) / 100
        const sizeColumns =  Math.floor((sizeBox + 20) / 210)
        const sizeRows = Math.ceil(formData.length / sizeColumns)

        for (let i = 0; i < sizeRows; i++) {
          array_.push({
            data:  formData.slice(i * sizeColumns,(sizeColumns * (i+1)))
          })
        }

        setSizeRows(array_)
        setSizeColumns(sizeColumns)
    }

    React.useEffect(() => {
      if (formData.length <= 0) return
      getRowsAndColumns()
    },[formData])

    React.useEffect(() => {
      if (globalState.data?.formdata?.length > 0) {
        setFormData(globalState.data?.formdata)
      }
    }, [globalState])

    return (
      <React.Fragment>
        <Show when={formData.length > 0}>
            <For func={printRowsAccordion} list={sizeRows} />
        </Show>
      </React.Fragment>
    )
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${index}`}
      aria-labelledby={`${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const printRowsAccordion = (element, index) => {
    const classes = useStyles();
    const [value, setValue] = React.useState(-1);

    const handleChange = (e) => {
      const newValue = e.target.getAttribute('aria-controls')
      setValue(Number(newValue));
    };

    const printBodyTab = (element, index) => {
        return (
          <CustomTabPanel value={value} index={index} key={index}>
            {printAccordion(element,index)}
          </CustomTabPanel>
        )
    }

    return (
      <React.Fragment key={index}>
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <Box>
              <Tabs className={classes.containerBox} value={value} onClick={handleChange} aria-label="basic tabs example">
                  <For func={printLabelsTabs} list={element?.data} />
              </Tabs>
            </Box>
          </Box>
          <For func={printBodyTab} list={element?.data} />
      </React.Fragment>
    )
}

const printLabelsTabs = (element, index) => {
    const classes = useStyles();
    function a11yProps(index: number) {
      return {
        id: index,
        'aria-controls': `${index}`,
      };
    }

    return (
      <React.Fragment key={index}>
        <Show when={firstLevelPermission()}>
          <Tab className={classes.containerTab} label={element?.primary?.variables} {...a11yProps(index)} />
        </Show>
      </React.Fragment>
    )
}

// Print Accordion
const printAccordion = (element, index) => {
  console.log(element,'element')
  const classes = useStyles();
  const [dataSheet,setDataSheet] = React.useState({} as any)
  const [isLoading, setIsLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [isSuccess, setSuccess] = React.useState(false)
  const [errorText, setErrorText] = React.useState('Guardado Exitoso')
  const { globalState } = useGlobalState()

  const submit = async (data) => {
    setIsLoading(true)
    const response  = await updateDataTable({
      sheetId: dataSheet.sheetId,
      gid: dataSheet.gid,
      data: data
    })

    if (response?.data) {
      setOpen(true)
      setSuccess(response.data)
      setErrorText(response.data? 'Guardado Exitoso' : 'Error al Guardar')
    }
    setIsLoading(false)
  }

  const handleClose = () => {
      setOpen(false)
  }

  React.useEffect(() => {
    if (globalState.data?.sheetId) {
      setDataSheet({
        sheetId: globalState.data?.sheetId,
        gid: globalState.data?.gid
      })
    }
  }, [globalState])

  return (
    <React.Fragment key={index}>
      <Show when={firstLevelPermission()}>
          <Grid2 className={classes.containerFormSection}>
              <Grid2 className={classes.listFormSection}>
                <Grid2 className={classes.ColapsableTwo}>
                  <Typography
                      variant="h1"
                      className={classes.titleInputs}>
                      {element?.primary?.texto}
                  </Typography>
                </Grid2>
                <For func={printFields} list={element.data} />
              </Grid2>
              <Grid2 className={classes.centerButton}>
                  <Button 
                      disabled={isLoading}  
                      onClick={() => submit(element.data)} 
                      variant="contained" 
                      className={classes.buttonSave}>
                    {!isLoading ? 'Guardar' : 'Actualizando'}
                  </Button>
              </Grid2>
              <Box sx={{ width: 500 }}>
                <Snackbar
                    autoHideDuration={6000}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={open}
                    onClose={handleClose}
                    key={2}
                >
                   <Alert severity={isSuccess? "success" : "error"}>{errorText}</Alert> 
                </Snackbar>
              </Box>
            </Grid2>
      </Show>
    </React.Fragment>
  )
}

const printFields = (element, index) => {
  return (
    <React.Fragment key={index}>
      <Show when={firstLevelPermission()}>
        {renderField(
          fieldTraslate[element.tipo],
          element.texto,
          element.valor,
          element
        )}
      </Show>
    </React.Fragment>
  )
}

const renderField = (fieldType, labelText, value, element) => {
  const classes = useStyles();

  const [value_, setValue] = React.useState('');
  const [valueTextArea, setValueTextArea] = React.useState(element.valor || '')

  const handleChange = (event) => {
    element.valor = event.target.value
    setValue(event.target.value);
  };

  const handlerTextField = (event) => {
    const newValue = event.target.value;
    element.valor = newValue
    setValueTextArea(newValue);
  }

  switch (fieldType) {
    case "h1":
      return (
        <Grid2 sx={{ width: '100%' }}>
          <Typography
            variant="h1"
            className={classes.titleInputs}
          >
            {labelText}
          </Typography>
        </Grid2>
      );

    case "text":
      return (
        <TextField
          variant="outlined"
          className={classes.inputText}
          onInput={handlerTextField}
          label={labelText}
          defaultValue={value}
        />
      );

    case "textArea":
      return (
        <FormControl sx={{ margin: '10px 0px', width: '100%' }}>
          <label sx={{ marginBottom:'10px'}} ><b>{labelText}</b></label>
          <TextareaAutosize
            minRows={3}
            value={valueTextArea}
            onInput={handlerTextField}
            style={{ MaxWidth: '100%' }}
          />
        </FormControl>
      );

    case "select":
      return (
        <FormControl className={classes.inputText}>
          <InputLabel>{labelText}</InputLabel>
          <Select
            value={value_}
            onChange={handleChange}
          >
            <MenuItem value="Plenamente (A)">Plenamente (A)</MenuItem>
            <MenuItem value="Alto Grado (B)">Alto Grado (B)</MenuItem>
            <MenuItem value="Aceptable (C)">Aceptable (C)</MenuItem>
            <MenuItem value="Insatisfactorio (D)">Insatisfactorio (D)</MenuItem>
          </Select>
        </FormControl>
      );

    case "Colapsable2":
      return(
        <Grid2 className={classes.ColapsableTwo}>
            <hr />
            <Typography
            variant="h1"
            className={classes.titleInputs}
          >
            {labelText}
          </Typography>
        </Grid2>
      )

    default:
      return null;
  }
};

const firstLevelPermission = (): boolean => {
  return true
}

const fieldTraslate = {
  "Titulo1": "h1",
  "Campo": "text",
  "TextArea": "textArea",
  "Colapsable2": "Colapsable2",
  "GradoCumplimiento": "GradoCumplimiento",
  "Criterio": "select",
  "TablaExtra": "TablaExtra",
  "ConclusionCondicion": "ConclusionCondicion"
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};