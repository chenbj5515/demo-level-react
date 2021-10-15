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

const Didact = {
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

/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <App />
        <a>bar</a>
        <b />
    </div>
)

console.log(<App />);
