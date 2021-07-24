const element = {
    type: "div",
    props: {
        id: "foo",
        children: [
            {
                type: "a",
                props: {
                    children: [
                        {
                            type: "TEXT_ELEMENT",
                            props: {
                                nodeValue: "bar",
                                children: []
                            }
                        }
                    ]
                }
            },
            {
                type: "b",
                props: {
                    children: []
                }
            }
        ]
    }
}

const render = (element, container) => {
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
    const isProperty = key => key !== 'children';
    element.props.children.forEach(child => render(child, dom));
    Object.keys(element.props).filter(isProperty)
        .forEach(key => {
            dom[key] = element.props[key];
        });
    container.appendChild(dom);
}

render(element, document.querySelector('#app'));