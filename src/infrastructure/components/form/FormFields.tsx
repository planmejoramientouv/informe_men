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

// Table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
        id: `${index}`,
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
        <>
        <Show when={!element.typeComponent}>
            {renderField(
              fieldTraslate[element.tipo],
              element.texto,
              element.valor,
              element
            )}
        </Show>

        <Show when={element.typeComponent}>
            {renderFieldColapsable(element)}
        </Show>
        </>
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
        <FormControl className={classes.containerTextArea}>
          <label><b>{labelText}</b></label>
          <TextareaAutosize
            minRows={3}
            value={valueTextArea}
            onInput={handlerTextField}
            style={{ maxWidth: '100%' }}
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
    
    case "tabla_aspectos":  
      return (printTableAspctos(element));

    default:
      return null;
  }
};

const renderFieldColapsable = (element) => {
    const classes = useStyles();  
    const colapsable2 = element?.data?.find( item => item.tipo  ===  'Colapsable2')
    
    return (
      <React.Fragment>
        <Accordion className={classes.containerAccordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography><b>{colapsable2?.texto}</b></Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.containerDetailsAccordion}>
                  <For func={renderColapsable} list={element.data} />
            </AccordionDetails>
        </Accordion>
      </React.Fragment>
    )
}

const renderColapsable = (element, index) => {
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

const firstLevelPermission = (): boolean => {
  return true
}

function createData(
  content: string
) {
  return { content };
}


const printTableAspctos = (element) => {
  const { globalState, setGlobalState } = useGlobalState()

  React.useEffect(() => {
    let array = globalState.fieldForm
    array.push(createData(element.texto))
    setGlobalState((prev) => ({
      ...prev,
      fieldForm: array
  }))
  },[element])

  return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{element?.variables}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {globalState?.fieldForm?.length > 0 && globalState?.fieldForm.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.content}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </TableContainer>
  )
}


const fieldTraslate = {
  "Titulo1": "h1",
  "Campo": "text",
  "TextArea": "textArea",
  "Colapsable2": "Colapsable2",
  "GradoCumplimiento": "GradoCumplimiento",
  "Criterio": "select",
  "TablaExtra": "TablaExtra",
  "ConclusionCondicion": "ConclusionCondicion",
  "tabla_aspectos": "tabla_aspectos"
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};