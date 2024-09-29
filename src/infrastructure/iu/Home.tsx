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
            <section className={styles['section-info-data']}>
                <div className={styles['container-slider-images']}>
                    <img src="/assets/img/secundary.svg" alt="ilustre" />
                </div>
            </section>
            <section className={styles['section-info-data']}>
                <div className={styles['container-slider-primary']}>
                    <h1 className={styles['title-primary']}>
                        ¿Desbloquear el Potencial de tu Negocio con un Sitio Web o Dominar la Play Store con una Aplicación?
                    </h1>
                    <span className={styles['content-text-primary']}>
                        En la actualidad, la presencia digital es crucial
                        para cualquier negocio que busque crecimiento y éxito.
                        Decidir entre desarrollar un sitio web o una aplicación
                        para la Play Store puede ser determinante para alcanzar
                        tus objetivos. Un sitio web te permite llegar a una audiencia global
                        y ofrece accesibilidad 24/7 desde cualquier dispositivo con internet.
                        Por otro lado, una aplicación en la Play Store
                        proporciona una experiencia de usuario personalizada y una mayor
                        interacción con los clientes a través de notificaciones y funcionalidades
                        avanzadas. Evaluar tus necesidades y objetivos te ayudará a elegir
                        la opción que mejor se adapte a tu negocio y maximice tu potencial
                        en el mundo digital.
                    </span>
                    <div>
                        <a className={styles['btn-primary']} onClick={handlerClosePopup}>
                            ¡Actúa Ahora!
                        </a>
                    </div>
                    <div>
                        <Slider callback={handlerClickSlider} />
                        <Show when={confPopup.ofrecer}>
                            <Popup actionClose={closePopupSlider}>
                                <h2>¡Descubre Nuestras Ofertas Exclusivas!</h2>
                            </Popup>
                        </Show>
                        <Show when={confPopup.android}>
                            <Popup actionClose={closePopupSlider}>
                                <>
                                    <h2>¡Lleva Tu Negocio a la Palma de la Mano con una App Android!</h2>
                                    <ul>
                                        <li>Alcance masivo en dispositivos móviles.</li>
                                        <li>Notificaciones push para mayor interacción.</li>
                                        <li>Experiencia de usuario personalizada.</li>
                                        <li>Integración con servicios de Google.</li>
                                    </ul>
                                </>
                            </Popup>
                        </Show>
                        <Show when={confPopup.web}>
                            <Popup actionClose={closePopupSlider}>
                                <>
                                    <h2>¡Haz que Tu Presencia en Línea Brille con un Sitio Web!</h2>
                                    <ul>
                                        <li>Accesibilidad global 24/7.</li>
                                        <li>Diseño adaptable a cualquier dispositivo.</li>
                                        <li>Optimización para motores de búsqueda (SEO).</li>
                                        <li>Fácil mantenimiento y actualización.</li>
                                    </ul>
                                </>
                            </Popup>
                        </Show>
                        <Show when={confPopup.service}>
                            <Popup actionClose={closePopupSlider}>
                                <>
                                    <h2>¡Soporte y Mantenimiento para tu Sitio Web!</h2>
                                    <ul>
                                        <li>Actualizaciones regulares de seguridad.</li>
                                        <li>Optimización del rendimiento.</li>
                                        <li>Soporte técnico continuo.</li>
                                        <li>Mejoras y nuevas funcionalidades.</li>
                                    </ul>
                                </>
                            </Popup>
                        </Show>
                    </div>
                </div>
            </section>
        </main>
    )
}