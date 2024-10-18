export default interface ForProps<Type> {
    func: (e: Type, index: number, shared?: any) => JSX.Element;
    list: Type[];
    shared?: any;
}