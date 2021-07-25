import DemoLevelReact from './demo-level-react';
  
const container = document.getElementById("root");

let showHelloWorld = true;

const handleClick = () => {
    showHelloWorld = false;
}

const App = (value: string) => {
    /** @jsx DemoLevelReact.createVNode */
    const element = (
        <div>
            <input onClick={handleClick} value={value} />
            {showHelloWorld ? <h2>Hello World!</h2> : null}
        </div>
    )
    container && DemoLevelReact.render(element, container)
};

App("World");
