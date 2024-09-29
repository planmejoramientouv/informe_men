/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React from "react"

// Components
import Home from "../src/infrastructure/iu/Home"
import Header from "../src/infrastructure/components/Header";

// Home
export default () => {
    return (
        <main className="root-container">
           <Header />
           <Home />
        </main>
    )
}