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

// Global Const
const ASPECTS_TABLE = "tabla_aspectos"

export default (element, shared) => {
    const [printFields, setPrintFields] = React.useState([])
  
    React.useEffect(() => {
      const filterOptions = shared.filter((item) => item?.typeComponent)
      if (filterOptions?.length > 0) {
          if (filterOptions?.length > 0) {
            const response = filterOptions.map((item) => {
              return item.data.filter((subItem) => { 
                return (subItem.tipo === ASPECTS_TABLE && 
                        subItem.groups_fields === element.groups_fields
                ) 
              })
            }).flat();
            setPrintFields(response)
          }
      }
    },[shared])
  
    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell><b>{element?.variables}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {printFields?.length > 0 && printFields?.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row?.texto}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </TableContainer>
    )
}