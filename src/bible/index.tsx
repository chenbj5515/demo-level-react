import React, {useState,useEffect} from 'react';
import ReactDOM from 'react-dom';

export default function App() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setCount(count + 1);
        }, 1000);
    }, []);
    return (
        <div>
            {
                count === 0
                    ? (
                        <>
                            <div key="A">A</div>
                            <div key="B">B</div>
                            <div key="C">C</div>
                            <div key="D">D</div>
                        </>
                    )
                    : (
                        <>
                            <div key="D">updated D</div>
                            <div key="A">updated A</div>
                            <div key="B">B</div>
                            <div key="C">C</div>
                        </>
                    )
            }
        </div>
    )
}

ReactDOM.render(<App />, document.querySelector('#root'))
  