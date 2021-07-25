import {IVNode, IProperty} from "./types";

export const TEXT_ELEMENT = 'TEXT_ELEMENT';

const createTextVNode = (text: string) => ({
    type: TEXT_ELEMENT,
    props: {
        nodeValue: text,
        children: []
    }
})

const hanldeTextChild = (child: IVNode | string) => typeof child === 'string' ? createTextVNode(child) : child;

export default function createVNode(type: string, props: IProperty, ...children: (IVNode | string)[]): IVNode {
    return ({
        type,
        props: {
            ...props,
            children: children.map(hanldeTextChild)
        },
    })
}