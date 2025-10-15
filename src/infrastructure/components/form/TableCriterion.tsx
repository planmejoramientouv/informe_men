"use-client"
/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// React
import React from "react"

// Styles
import useStyles from '../../../../css/form/form.css.js'

// Table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Material - IU
import { Typography, TextField, FormControl, MenuItem, Select, InputLabel, Grid2 } from '@mui/material';

// Hooks
import { firstLevelPermission } from '../../../../libs/utils/utils'

export default ({ element,shared, autoSave = () => {},setOpenDialog, htmlId  }: any) => {
    const classes = useStyles();
    const [values, setValues] = React.useState([])
    const [hydrated, setHydrated] = React.useState(false);
    const [valueNumbers, setValueNumbers] = React.useState([])
    const [printFields, setPrintFields] = React.useState([])
    const [stateInputs, setStateInput] = React.useState({
       valuesSelect: [],
       valuesNumber: []
    })
  
    const handleChange = (event,index,type) => {
      const filterCriterios = shared.filter((item) => item?.typeComponent)
      const rowSelected = printFields[index]
  
      filterCriterios.forEach((item) => {
         const filter = item.data.filter((element_) => {
            return (
              String(element_?.groups_fields) === String(rowSelected?.groups_fields)
            ) 
         })
         const elementSelect = filter.find(item => item.tipo === type)
         if (elementSelect !== undefined) {
            elementSelect.valor = event.target.value
            autoSave(elementSelect)
         }
      })
  
      if (type === 'select') {
        const newValues = [...values];
        newValues[index] = event.target.value;
        setValues(newValues);
      }
      
      if (type === 'number') {
        const newValueNumbers = [...valueNumbers];
        newValueNumbers[index] = event.target.value;
        setValueNumbers(newValueNumbers);
      }
    };
  
    const filterDataInit = (data_, type) => {
      return data_.map((item) => {
        return item.data.filter((subItem) => subItem.tipo === type)
      }).flat();
    }
  
    React.useEffect(() => {
      const filterOptions = shared.filter((item) => item?.typeComponent)
  
      if (filterOptions?.length > 0) {
        setStateInput({
          valuesSelect: filterDataInit(filterOptions,'select'),
          valuesNumber: filterDataInit(filterOptions,'number')
        })
  
        const response = filterDataInit(filterOptions,'Colapsable2')
        setPrintFields(response)

        setValues(Array(response.length).fill(''));
        setValueNumbers(Array(response.length).fill(''));
      }
    },[shared])
  
    React.useEffect(() => {
      if (stateInputs?.valuesNumber?.length <= 0) return
      setValues(stateInputs.valuesSelect.map((row) => row?.valor || ''));
      setValueNumbers(stateInputs.valuesNumber.map((row) => row?.valor || ''));
    },[stateInputs])
  
    React.useEffect(() => {
      setHydrated(true);
    }, []);

    if (!hydrated) return null;

    return (
        <TableContainer id={htmlId} sx={{ scrollMarginTop: '88px' }}  component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '33.3%'}}><b>Criterio</b></TableCell>
                <TableCell sx={{ width: '33.3%'}}><b>Grado de Cumplimiento</b></TableCell>
                <TableCell sx={{ width: '33.3%'}}><b>Calificación</b></TableCell>
              </TableRow>
            </TableHead>
            {/* FILAS */}
            <TableBody>
              {printFields?.length > 0 && printFields.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                  onClick={ () => {
                      setOpenDialog(prev => ({
                        ...prev,
                        [row?.id]: true
                      }));
                  } }
                >
                  {/* Tr */}
                  <TableCell component="th" scope="row">
                    {row?.texto}
                  </TableCell>
  
                  <TableCell component="th" scope="row">
                  <FormControl className={classes.selectInTable} variant="outlined">
                    <InputLabel shrink>Grado de Cumplimiento</InputLabel>
                    <Select
                      disabled={!firstLevelPermission(element)}
                      value={values[index] || ''}
                      onChange={(e) => handleChange(e, index,'select')}
                      label="Grado de Cumplimiento"
                    >
                      <MenuItem value="Plenamente (A)">Plenamente (A)</MenuItem>
                      <MenuItem value="Alto Grado (B)">Alto Grado (B)</MenuItem>
                      <MenuItem value="Aceptable (C)">Aceptable (C)</MenuItem>
                      <MenuItem value="Insatisfactorio (D)">Insatisfactorio (D)</MenuItem>
                    </Select>
                  </FormControl>
                  </TableCell>
  
                  <TableCell component="th" scope="row">
                  <TextField
                      disabled={!firstLevelPermission(element)}
                      className={classes.inputNumberInTable}
                      type="number"
                      value={valueNumbers[index]}
                      onChange={(e) => handleChange(e, index,'number')}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                  />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </TableContainer>
    )
}

/** UTILS */