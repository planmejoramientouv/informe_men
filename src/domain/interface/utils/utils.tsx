export default interface ForProps<Type> {
    func: (e: Type, index: number) => JSX.Element;
    list: Type[];
}