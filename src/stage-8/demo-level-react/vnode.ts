import { IVNode, IAttrs } from "./types";

export const createVNode = (
    type: string,
    props: IAttrs,
    ...children: IVNode[]
) => ({
    type,
    key: props?.key,
    isComp: typeof type === 'function',
    props: {
        ...props,
        children
    }
});