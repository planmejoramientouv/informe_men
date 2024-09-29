import { Children } from 'react'
import styles from '../../../../css/popup/popup.module.css'

type PropsPopup = {
    actionClose?: () => void
    children?: JSX.Element
}

export default ({
    actionClose,
    children
}: PropsPopup) => {

    const close = () => {
       if (actionClose) actionClose()
    }

    return (
        <section className={styles['container-popup']}>
            <a className={styles['close-popup']} onClick={close}></a>
            <div className={styles['content-popup']}>
                {children}
            </div>
        </section>
    )
}