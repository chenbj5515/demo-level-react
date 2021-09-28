import { isNormalTextFiber, isTextFiber } from "./fiber";
import {INormalFiber, IDom, INormalVNode, ITextFiber} from "./types";

const isNormalAttr = (attrKey: string) => attrKey !== 'children' && !attrKey.startsWith('__') && !attrKey.startsWith('on') && attrKey !== 'ref';

const isEvent = (attrKey: string) => attrKey.startsWith('on');

const isRef = (attrKey: string) => attrKey === 'ref';

export const createElement = (fiber: INormalFiber) => {
    if (!fiber.type) {
        throw new Error(`fiber上未检查到${fiber}type信息`)
    }
    const dom = document.createElement(fiber.type);
    if (fiber.key !== undefined) {
        console.log(`创建了${fiber.key}的dom: ${dom}`);
    }
    for (let attrKey in fiber.pendingProps) {
        if (attrKey !== 'children' && !attrKey.startsWith('__')) {
            dom.setAttribute(attrKey, fiber.pendingProps[attrKey]);
        }
        if (isNormalAttr(attrKey)) {
            dom.setAttribute(attrKey, fiber.pendingProps[attrKey]);
        }
        else if (isEvent(attrKey)) {
            dom.addEventListener(attrKey.slice(2).toLowerCase(), fiber.pendingProps[attrKey]);
        }
        else if (isRef(attrKey)) {
            fiber.pendingProps[attrKey].current = dom;
            console.log(fiber.pendingProps[attrKey]);
        }
    }
    // 如果只有text element一个child, 那么直接在这里创建innerHTML即可
    if (isNormalTextFiber(fiber)) {
        dom.innerHTML = fiber.pendingProps.children[0].toString();
    } 
    return dom;
}

export const updateNormalTextElement = (newText: string, dom: Element) => {
    console.log(`更新了normal text element: 新text: ${newText}`);
    dom.innerHTML = newText;
}

export const createTextElement = (fiber: ITextFiber | string | number) => {
    const val = typeof fiber === 'string' || typeof fiber === 'number' ? fiber.toString() : fiber.pendingProps.toString();
    console.log(`创建了text element: ${val}`);
    return document.createTextNode(val);
}

export const updateTextElement = (nodeValue: string, dom: Text) => {
    console.log(`更新了text element: 新text: ${nodeValue}`);
    dom.nodeValue = nodeValue;
}

export const moveAfter = (newNode: IDom | undefined, refNode: IDom | undefined, fatherNode: Element | null) => {
    if (!newNode) return;
    if (refNode) {
        console.log(`节点${(newNode as Element).innerHTML}移动到了了: ${(refNode as Element).innerHTML}后面`);
    }
    if (refNode?.nextSibling) {
        newNode && document.insertBefore(newNode, refNode.nextSibling);
    }
    else {
        fatherNode && fatherNode.appendChild(newNode);
    }
}
