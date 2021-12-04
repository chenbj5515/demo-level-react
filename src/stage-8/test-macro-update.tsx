import React, {useState, useEffect, useLayoutEffect} from 'react';
import ReactDOM from 'react-dom';

let counter = 0;
const App = () => {
    console.log('重渲染', counter);
    
    const [_, forceUpdate] = useState(-1);

    useLayoutEffect(() => {
        console.log('layout effect', counter);
    })

    useEffect(() => {
        console.log('普通effect', counter);
    })

    function handleClick() {
        setTimeout(() => {
            console.log('第一个宏任务');
            counter++;
            forceUpdate(1);
            setTimeout(() => {
                console.log('第二个任务');
                counter++;
                forceUpdate(2);
                setTimeout(() => {
                    console.log('第三个宏任务');
                    counter++;
                    forceUpdate(3);
                })
            })
        })
    }

    return (
        <div onClick={handleClick}>
            点我触发更新
            {counter}
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector('#root'));

