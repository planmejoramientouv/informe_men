import { ShowType } from "../../src/domain/types/show/show";

export default (props: ShowType) => {
    return <>{props.when && props.children}</>
}