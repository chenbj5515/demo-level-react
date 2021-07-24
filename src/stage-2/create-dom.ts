// import produce from 'immer';

const createElementByType = (type: string) => type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type);

const isProperty = (key: string | number) => key !== 'children';

// const setFiberDomAttrs = produce((fiberDom: any, props: any) => {
//     const attrs = Object.keys(props).filter(isProperty);
//     attrs.forEach(attrKey => {
//         fiberDom[attrKey] = props[attrKey];
//     })
// });

const setFiberDomAttrs = (fiberDom: any, props: any) => {
    const attrs = Object.keys(props).filter(isProperty);
    attrs.forEach(attrKey => {
        fiberDom[attrKey] = props[attrKey];
    })
};

const createFiberDom = (type: string, props: any) => {
    const fiberDom = createElementByType(type);
    setFiberDomAttrs(fiberDom, props);
    return fiberDom;
};

export default createFiberDom;

