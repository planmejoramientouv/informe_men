/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React from "react"

// Components
import Header from "../src/infrastructure/components/Header"
import Form from "../src/infrastructure/iu/Forms/Form"

// Hoosk
import { useGlobalState } from '../hooks/context'
import { getFormRRC } from '../hooks/fecth/handlers/handlers'

// Home
export default () => {
    const { setGlobalState } = useGlobalState()

    const getDataRRC = async () => {
        const response = await getFormRRC()
        if (response?.data.length > 0) {
            setGlobalState((prev) => ({
                ...prev,
                data: {
                    formdata: response?.data ?? []
                }
            }))
        } 
    }

    React.useEffect(() => {
        window.location.hash = "#rrc";
        getDataRRC()
    }, []);

    return (
        <main className="root-container">
            <Header />
            <Form />
        </main>
    )
}