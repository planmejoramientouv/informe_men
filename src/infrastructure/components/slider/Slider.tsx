/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import styles from '../../../../css/slider/slider.module.css'
import For from '../../../../share/utils/For';
import { SliderProps, sliderImg } from '../../../domain/types/slider/slider-type'
const arrow_left  = '/assets/icon/arrow_left.svg',
      arrow_right = '/assets/icon/arrow_right.svg';

const defaultImg: sliderImg[] = [
    {
        img: '/assets/slider/4.svg',
        label: 'Test',
        action: '1'
    },
    {
        img: '/assets/slider/1.svg',
        label: 'Andriod',
        action: '2'
    },
    {
        img: '/assets/slider/2.svg',
        label: 'Web',
        action: '3'
    },
    {
        img: '/assets/slider/3.svg',
        label: 'Servicios',
        action: '4'
    }
]

export default ({
    imgList,
    callback
}: SliderProps) => {    
    const listImg = imgList ?? defaultImg

    const forElements = (e: sliderImg, index: number): JSX.Element => {
        return (
            <div key={index} onClick={() => callback(e.action)}>
              <div className={styles['container-items']}>
                <div>
                    <img src={e.img} alt={`slider-${index}`} />
                </div>
                <span>
                    {e.label}
                </span>
              </div>
            </div>
        )
    }

    return (
        <section className={styles['container-slider-root']}>

            <For<sliderImg> 
                func={forElements} 
                list={listImg} 
            />

            {/* Arrow Left */}
            <div className={styles['arrow-left-container']}>
                <img src={arrow_left} alt='left arrow'/>
            </div>

            {/* Arrow Rigth */}
            <div className={styles['arrow-right-container']}>
                <img src={arrow_right} alt='right arrow'/>
            </div>
        </section>
    )
}