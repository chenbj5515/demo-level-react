import {IProps} from "./types";
import {TEXT_ELEMENT} from './create-vnode';
import {isNormalProp, isEvent, specKeysof} from './helpers';

function createElementByType(type: string) {
    if (type === TEXT_ELEMENT) {
        return document.createTextNode('')
    }
    return document.createElement(type);
}

let key: keyof Element = 'id';
let dom: Element = document.createElement('div');
dom[key]

function setAttrs(fiberDom: Element, props: IProps) {
    const attrs = specKeysof(props).filter(isNormalProp);
    attrs.forEach(attrKey => {
        // fiberDom[attrKey] = attrs[attrKey];
        fiberDom.setAttribute(attrKey, props[attrKey]);
    })
}

export const createFiberDom = (type: string, props: IProps) => {
    const fiberDom = createElementByType(type);
    setAttrs(fiberDom, props);
}