export type GlobalState = {
    isLoad: boolean,
    isLogged: boolean,
    data: {}
}

export type TypeGlobalState = {
    globalState: GlobalState
    setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>
}