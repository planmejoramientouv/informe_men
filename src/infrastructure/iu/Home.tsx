/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

import React from "react";
import styles from "../../../css/home/home.module.css";
import Popup from "../components/popup/popup";
import Slider from "../components/slider/Slider";
import Show from "../../../share/utils/Show";
import { preview } from "vite";

export default () => {
    // States
    const [isClosePopup, setIsClosePopup] = React.useState(false)
    const [confPopup, setConfPopup] = React.useState({
        android: false,
        web: false,
        service: false,
        ofrecer: false
    })

    const handlerClosePopup = () => {
        setIsClosePopup(true)
    }

    const handlerClickSlider = (e: string) => {
        setConfPopup(prev => ({
            ...prev,
            android: e == '2',
            web: e == '3',
            service: e == '4',
            ofrecer: e == '1'
        }))
    }

    const closePopupSlider = () => {
        setConfPopup({
            android: false,
            web: false,
            service: false,
            ofrecer: false
        })
    }

    return (
        <main className="container_primary">
        </main>
    )
}