const isType = type => target => Object.prototype.toString.call(target) === `[object ${type}]`;

const transformChild = child => isType('Object')(child) ? child : createTextElement(child);

const createElement = (type, props, ...children) => ({
    type,
    props: {
        ...props,
        children: children.map(transformChild)
    }
});

const createTextElement = text => ({
    type: 'TEXT_ELEMENT',
    props: {
        nodeValue: text,
        children: []
    }
})

const React = {
    createElement
}

function App() {
    console.log("I'm a component");
    return (
        <div>
            A component
        </div>
    )
}

const element = (
    <div id="foo">
        <App />
        <a>bar</a>
        <b />
    </div>
)

const list = [
    {
        type: 'div',
        key: 'A',
        text: 'A',
    },
    {type: 'div', key: 'D', text: 'D'},
    {type: 'div', key: 'C', text: 'C'}
];

console.log(
    <App>A
        <div>s</div>
    </App>
);
