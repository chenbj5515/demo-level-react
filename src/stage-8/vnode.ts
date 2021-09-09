import { IProps, IVNode } from "../stage-8/types";

export const createVNode = (
    type: string,
    props: IProps,
    ...children: IVNode[]
) => ({
    type,
    props: {
        ...props,
        children
    }
});