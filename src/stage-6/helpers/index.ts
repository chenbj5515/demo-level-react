import {IFiber, IDom, IProps} from "../../stage-5/types";

export const createDom = (type: string) => {
    if (type === 'TEXT_ELEMENT') {
        return document.createTextNode('');
    }
    return document.createElement(type);
};

export const createFiberDom = (fiber: IFiber) => {
    return createDom(fiber.type as string);
};

const specKeysof = <T>(obj: T) => Object.keys(obj) as (keyof T)[];

const isNormalProp = (propKey: string) => propKey !== 'children' && !isEvent(propKey);

const isEvent = (propKey: string) => propKey.startsWith('on');

const isGone = (propKey: keyof IProps, prevProps: IProps, nextProps: IProps) => 
    prevProps[propKey] && !nextProps[propKey];

const isValueChange = (propKey: keyof IProps, prevProps: IProps, nextProps: IProps) => 
    prevProps[propKey] !== nextProps[propKey];

export const updateDom = (dom: IDom, oldFiber: IFiber | null, nextFiber: IFiber) => {
    const prevProps = oldFiber?.props || {};
    const nextProps = nextFiber?.props || {};

    specKeysof(prevProps).forEach(propKey => {
        if (isEvent(propKey)) {
            const eventName = propKey.slice(2).toLowerCase();
            const handler = prevProps[propKey] as EventListenerOrEventListenerObject;
            handler && dom?.removeEventListener(eventName, handler)
        }
        if (isNormalProp(propKey) && isGone(propKey, prevProps, nextProps)) {
            if (dom instanceof Element) {
                dom.setAttribute(propKey, '');
            }
        }
    });

    specKeysof(nextProps).forEach(propKey => {
        if (isEvent(propKey) && isValueChange(propKey, prevProps, nextProps)) {
            const eventName = propKey.slice(2).toLowerCase();
            const handler = nextProps[propKey] as EventListenerOrEventListenerObject;
            handler && dom?.addEventListener(eventName, handler)
        }
        if (isNormalProp(propKey) && isValueChange(propKey, prevProps, nextProps)) {
            const propValue = nextProps[propKey];
            if (dom instanceof Element) {
                propValue && dom.setAttribute(propKey, propValue.toString());
            }
            else if (dom) {
                dom.nodeValue = propValue?.toString() || '';
            }
        }
    });
}
