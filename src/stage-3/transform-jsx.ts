const transformChild = (child: Object | string) => typeof child === 'string' ? createTextElement(child) : child;

export default (type: string, props: any, ...children: any) => ({
    type,
    props: {
        ...props,
        children: children.map(transformChild)
    }
});

const createTextElement = (text: string) => ({
    type: 'TEXT_ELEMENT',
    props: {
        nodeValue: text,
        children: []
    }
})