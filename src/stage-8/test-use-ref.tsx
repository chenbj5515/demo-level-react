import React, {useEffect, useRef, useState} from './demo-level-react';

export default function App() {
    const countRef = useRef(0);
    const domRef = useRef();
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log(domRef.current, '在useEffect钩子里拿到dom');
    }, []);

    function handleClick() {
        console.log('事件等到响应');
        
        setCount(count => count++);
        const curCount = countRef.current;
        if (curCount !== null) {
            countRef.current = curCount + 1;
        }
        setTimeout(() => {
            console.log(count, '拿不到最新的count');
            console.log(countRef.current, 'countRef.current是最新的');
        }, 1000);
    }
    
    return (
        <>
            {/* @ts-ignore */}
            <div ref={domRef}>normal div</div>
            <div onClick={handleClick}>点我增加count</div>
        </>
    )
}

// const root = React.creatRoot(document.querySelector('#root'));
// root.render(<App />);
