"use-client"

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
import ComponentsTab from './TabComponents'

// Hoosk
import { useGlobalState } from '../../../../hooks/context'


// Def
export default () => {
    const [formData, setFormData] = React.useState([])
    const [sizeRows, setSizeRows] = React.useState([])
    const [sizeColums, setSizeColumns] = React.useState(0)
    const [hydrated, setHydrated] = React.useState(false);
    const { globalState } = useGlobalState()

    React.useEffect(() => {
      if (globalState.data?.formdata?.length > 0) {
        console.log("FormData", globalState.data?.formdata)
        setFormData(globalState.data?.formdata)
      }
    }, [globalState])

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    return (
      <React.Fragment>
        <Show when={formData.length > 0 && hydrated}>
            <ComponentsTab element={formData} />
        </Show>
      </React.Fragment>
    )
}
