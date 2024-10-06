/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React from "react"

// Components
import Header from "../src/infrastructure/components/Header";
import Form from "../src/infrastructure/iu/Forms/Form";

// Home
export default () => {

    React.useEffect(() => {
        window.location.hash = "#rrc";
    }, []);

    return (
        <main className="root-container">
            <Header />
            <Form />
        </main>
    )
}