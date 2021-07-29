import {IFiber, IProps, EEffectTags, IDom} from "./types";
import {TEXT_ELEMENT} from './create-vnode';
import {isEvent, isValueChange, isNormalProp, specKeysof} from './helpers';

const createDom = (type: string) => {
    if (type === TEXT_ELEMENT) {
        return document.createTextNode('');
    }
    return document.createElement(type);
}

export const createFiberDom = (type: string, props: IProps) => {
    const fiberDom = createDom(type);
    updateDom({}, props, fiberDom);
    return fiberDom;
}

const updateDom = (prevProps: IProps, nextProps: IProps, dom: IDom) => {
    const removeListener = (attrKey: keyof IProps) => {
        const eventName = attrKey.toLowerCase().slice(2);
        const eventHandler = prevProps[attrKey] as EventListenerOrEventListenerObject;
        eventHandler && dom?.removeEventListener(eventName, eventHandler);
    };

    const addListener = (attrKey: keyof IProps) => {
        const eventName = attrKey.toLowerCase().slice(2);
        const eventHandler = nextProps[attrKey] as EventListenerOrEventListenerObject;
        eventHandler && dom?.addEventListener(eventName, eventHandler);
    };

    const removeProperty = (attrKey: keyof IProps) => {
        if (dom instanceof Element) {
            dom.setAttribute(attrKey, '');
        }
    };

    const addProperty = (attrKey: keyof IProps) => {
        const attrValue = nextProps[attrKey];
        if (dom instanceof Element) {
            attrValue && dom.setAttribute(attrKey, attrValue.toString());
        } 
        if (dom instanceof Text && attrValue) {
            dom.nodeValue = attrValue.toString();
        }
    };

    const isGoneEvent = (attrKey: keyof IProps) => isEvent(attrKey) && (!(attrKey in nextProps) || isValueChange(prevProps, nextProps)(attrKey));

    const isGoneProperty = (attrKey: keyof IProps) => isNormalProp(attrKey) && !(attrKey in nextProps);

    const isNewProperty = (attrKey: keyof IProps) => isNormalProp(attrKey) && isValueChange(prevProps, nextProps)(attrKey);

    const isNewEvent = (attrKey: keyof IProps) => isEvent(attrKey) && isValueChange(prevProps, nextProps)(attrKey);

    specKeysof(prevProps).forEach(attrKey => {
        if (isGoneEvent(attrKey)) {
            removeListener(attrKey);
        }
        if (isGoneProperty(attrKey)) {
            removeProperty(attrKey);
        }
    });

    specKeysof(nextProps).forEach(attrKey => {
        if (isNewEvent(attrKey)) {
            addListener(attrKey);
        }
        if (isNewProperty(attrKey)) {
            addProperty(attrKey);
        }
    });
}

export const patch = (fiber: IFiber) => {
    const parentDom = fiber.parent?.dom;
    if (fiber.effectTag === EEffectTags.PLACEMENT) {
        fiber.dom && parentDom?.appendChild(fiber.dom);
    }
    if (fiber.effectTag === EEffectTags.UPDATE && fiber.alternate?.props && fiber.props) {
        updateDom(fiber.alternate?.props, fiber.props, fiber.dom);
    }
    if (fiber.effectTag === EEffectTags.DELETION) {
        fiber.dom && parentDom?.removeChild(fiber.dom);
    }
}