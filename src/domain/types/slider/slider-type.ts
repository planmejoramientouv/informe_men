
export type SliderProps = {
    imgList?: sliderImg[]
    callback?: (e: string) => void
}

export type sliderImg = {
    img: string
    label: string
    action: string
}