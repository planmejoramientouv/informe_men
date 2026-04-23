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
import { Box, Button, Collapse } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Global Const
const ASPECTS_TABLE = "tabla_aspectos"

export default ({ element, shared,htmlId  }) => {
    const [printFields, setPrintFields] = React.useState([])
    const [hydrated, setHydrated] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    
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

    React.useEffect(() => {
      setHydrated(true);
    }, []);

    if (!hydrated) return null;
  
return (
  <Box sx={{ width: '100%', position: 'relative' }}>
    <Button
      variant="contained"
      onClick={() => setOpen((prev) => !prev)}
      sx={{ width: '100%', mb: 2, backgroundColor: '#1565c0', color: 'white', '&:hover': { backgroundColor: '#0f498c' } }}
      startIcon={<VisibilityIcon sx={{ fontSize: 20 }} />}
    >
      {open ? 'OCULTAR' : 'MOSTRAR'} ASPECTOS A EVALUAR ({printFields.length})
    </Button>

    <Collapse in={open} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
      <Paper elevation={2} sx={{ mb: 2, width: '100%', overflow: 'hidden' }}>
        <TableContainer
          id={htmlId}
          sx={{
            scrollMarginTop: '88px',
            maxHeight: '45vh',
            overflowY: 'auto',
          }}
          className="tabla_aspectos"
          component={Box}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell><b>{element?.variables}</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {printFields?.length > 0 && printFields?.map((row, index) => (
                <TableRow
                  key={`${String(row?.id ?? index)}-${String(row?.groups_fields ?? '')}`}
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
      </Paper>
    </Collapse>
  </Box>
);
}