import React, {useState} from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    const [counter, setCounter] = useState(0);
    const [counter2, setCounter2] = useState(0);

    console.log('重渲染', counter);

    function handleClick() {
        // debugger;
        setCounter(counter + 2);
        setCounter(counter + 1);
        setCounter2(2);
    }

    return (
        <div onClick={handleClick}>
            点我触发更新
            {counter}
            {counter2}
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector('#root'));
