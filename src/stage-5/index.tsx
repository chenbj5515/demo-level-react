import React from './demo-level-react';

let showChild = true;

function hanldeClick() {
    showChild = false;
    const container = document.querySelector('#root');
    container && React.render(<App />, container);
}

const Child = () => (
    <div>
        {showChild ? 'child' : null}
    </div>
);

const App = () => (
    /** @jsx React.createVNode */
    <div>
        <p onClick={hanldeClick}>bar</p>
        <Child />
    </div>
);

const container = document.querySelector('#root');

container && React.render(<App />, container);