import {INormalFiber, INormalVNode} from "./types";

export const createDom = (vNode: INormalVNode | INormalFiber) => {
    if (!vNode.type) return null;
    const dom = document.createElement(vNode.type);
    if (vNode.key !== undefined) {
        console.log(`创建了${vNode.key}的dom: ${dom}`);
    }
    for (let attrKey in vNode.props) {
        if (attrKey !== 'children' && !attrKey.startsWith('__')) {
            dom.setAttribute(attrKey, vNode.props[attrKey]);
        }
    }
    return dom;
}