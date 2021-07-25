import {isEvent} from '../stage-3/helpers';

const createElementByType = (type: string) => type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type);

const isProperty = (key: string | number) => key !== 'children';

const setFiberDomAttrs = (fiberDom: any, props: any) => {
    const attrs = Object.keys(props).filter(isProperty);
    attrs.forEach(attrKey => {
        const attrValue = props[attrKey];
        if (isEvent(attrKey)) {
            const eventName = attrKey.toLowerCase().slice(2);
            fiberDom.addEventListener(eventName, attrValue);
        }
        else {
            fiberDom[attrKey] = attrValue;
        }
    })
};

const createFiberDom = (type: string, props: any) => {
    const fiberDom = createElementByType(type);
    setFiberDomAttrs(fiberDom, props);
    return fiberDom;
};

export default createFiberDom;

