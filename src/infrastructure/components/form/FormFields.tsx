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
import renderField from './RenderField'
import printRowsAccordion from './TabComponents'

// Hoosk
import { useGlobalState } from '../../../../hooks/context'

// Material - IU
import { Button, Typography, TextField, TextareaAutosize, MenuItem, FormControl, InputLabel, Select, Grid2 } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

// Tabs
import PropTypes from 'prop-types';

// Def
export default () => {
    const [formData, setFormData] = React.useState([])
    const [sizeRows, setSizeRows] = React.useState([])
    const [sizeColums, setSizeColumns] = React.useState(0)
    const { globalState } = useGlobalState()

    window.addEventListener("resize", function (event) {
        getRowsAndColumns()
    });

    const getRowsAndColumns = () => {
        const array_ = []
        const widthCurrent = window.innerWidth
        const maxWidth_ = (widthCurrent - 1240) >= 0 ? widthCurrent - 1360 : 0 
        const width_ = widthCurrent - maxWidth_
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


const firstLevelPermission = (): boolean => {
  return true
}

const fieldTraslate = {
  "Titulo1": "h1",
  "Titulo2": "h2",
  "Campo": "text",
  "TextArea": "textArea",
  "Colapsable2": "Colapsable2",
  "GradoCumplimiento": "GradoCumplimiento",
  "Criterio": "select",
  "ConclusionCondicion": "ConclusionCondicion",
  "tabla_aspectos": "tabla_aspectos",
  "Tabla_criterios": "Tabla_criterios",
  "TablaExtra": "TableExtra"
}