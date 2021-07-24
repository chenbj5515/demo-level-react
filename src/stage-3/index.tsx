import Didact from './didact';
  
const container = document.getElementById("root");

const updateValue = (e: any) => {
    App(e.target.value);
}

const App = (value: string) => {
    /** @jsx Didact.transformJSX */
    const element = (
        <div>
            <input onInput={updateValue} value={value} />
            <h2>Hello {value}</h2>
        </div>
    )
    container && Didact.render(element, container)
};

App("World");
