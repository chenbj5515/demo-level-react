// @ts-ignore
import React, {useState, useTransition, useDeferredValue} from 'react';
import ReactDOM from 'react-dom';
import './time-slice.css';

function List({query}: {query: string}) {
    return (
        <>
            {
                Array(20000).fill('').map((_, index) => (
                    <div key={index}>{query}</div>
                ))
            }
        </>
    )
}

function App() {
    const [associatedWord, setAssociatedWord] = useState('');
    const query = useDeferredValue(associatedWord);
    // const [isPending, startTransition] = useTransition();

    // console.log(isPending, 'isPending===');
    

    function handleChange(e: any) {
        setAssociatedWord(e.target.value);
        // startTransition(() => {
        //     setAssociatedWord(e.target.value);
        // });
    }

    return (
      <>
        <input type="text" onChange={handleChange}/>
        <br />
        <List query={query} />
      </>
    )
}

// @ts-ignore
const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<App />);


// ReactDOM.render(<App />, document.querySelector('#root'));
