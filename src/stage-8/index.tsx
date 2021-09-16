import React, {useState} from './demo-level-react';
// import React, {useState,useEffect} from 'react';
// import ReactDOM from 'react-dom';

export default function App() {
    const [list, setList] = useState([
        {type: 'div', key: 'A', text: 'A'},
        {type: 'div', key: 'D', text: 'D'}]);
    return (
        <>
            {
                list.map((item: any) => (
                    <div key={item.key}>{item.text}</div>
                ))
            }
        </>
    )
} 

const nextList = [
    {type: 'div', key: 'C', text: 'C'},
    {type: 'text', value: 'updated B'}
];

// ReactDOM.render(<App />, document.querySelector('#root'));

const root = React.creatRoot(document.querySelector('#root'));
root.render(<App />);
