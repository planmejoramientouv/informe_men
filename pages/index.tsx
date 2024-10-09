/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React from "react"

// Components
import Header from "../src/infrastructure/components/Header";
import Panel from "../src/infrastructure/iu/Panel/Panel"
import { Box } from "@mui/material";

// Home
export default () => {
    return (
        <main className="root-container">
            <Header />
            <Panel />
        </main>
    )
}