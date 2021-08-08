import React, {useState, useEffect} from './demo-level-react';

const Child = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log(count, '[]作为deps的useEffect');
    }, []);

    useEffect(() => {
        console.log(count, 'count改变了呢');
    }, [count]);

    function hanldeClick() {
        setCount(count => count + 1);
    }

    return (
        <div>
            <div onClick={hanldeClick}>点我add count</div>
            {count}
        </div>
    )
}
    
/** @jsx React.createVNode */
const App = () => {
    console.log('根部rerender');
    
    return (
        <div>
            <p>bar</p>
            <Child />
        </div>
    )
}
  
const container = document.querySelector('#root');

container && React.render(<App />, container);