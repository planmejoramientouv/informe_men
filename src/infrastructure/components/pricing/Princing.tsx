/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import styles from '../../../../css/pricing/princing.module.css'

export default () => {
    return (
        <main className={styles['container-pricing']}>
            <section>
                <h1>Pagina Web Estatica</h1>
                <span>Incluye</span>
                <span></span>
                <ul>
                    <li>Soporte de 30h durante dos meses</li>
                    <li>Asesoría Personalizada</li>
                    <li>Diseño personalizado</li>
                    <li>Hosting durante un año</li>
                    <li>Dominio durante un año</li>
                    <li>Despliegue personalizado en Google Cloud</li>
                    <li>Optimización SEO básica</li>
                    <li>Integración con redes sociales</li>
                    <li>Formulario de contacto</li>
                </ul>
                <b>Precio personalizado según proyecto</b>
            </section>
            <section>
                <h1>Desarrollo de Aplicación Android</h1>
                <span>Incluye</span>
                <ul>
                    <li>Desarrollo de aplicación nativa para Android</li>
                    <li>Interfaz de usuario personalizada</li>
                    <li>Integración de funcionalidades específicas</li>
                    <li>Pruebas y depuración</li>
                    <li>Publicación en Google Play Store</li>
                    <li>Soporte post-lanzamiento</li>
                    <li>Optimización de rendimiento</li>
                    <li>Integración con servicios en la nube</li>
                    <li>Análisis de uso y métricas</li>
                </ul>
                <b>Precio personalizado según requerimientos</b>
            </section>
            <section>
            <h1>Desarrollo de Software Personalizado</h1>
                <span>Incluye</span>
                <ul>
                    <li>Desarrollo de aplicaciones a medida</li>
                    <li>Diseño de interfaz de usuario</li>
                    <li>Integración de bases de datos</li>
                    <li>Implementación de funcionalidades personalizadas</li>
                    <li>Pruebas y depuración exhaustivas</li>
                    <li>Despliegue en servidores dedicados</li>
                    <li>Soporte continuo y mantenimiento</li>
                    <li>Análisis de requisitos y consultoría técnica</li>
                    <li>Capacitación para usuarios finales</li>
                </ul>
                <b>Precio personalizado según proyecto</b>
            </section>
        </main>
    )
}