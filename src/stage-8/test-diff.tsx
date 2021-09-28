import React, {useState, useEffect} from './demo-level-react';
// import React, {useState, useEffect} from 'react';
// import ReactDOM from 'react-dom';

export default function App() {
    const [list, setList] = useState([
        {
            type: 'div',
            key: 'A',
            text: 'A',
        },
        {type: 'div', key: 'D', text: 'D'},
        {type: 'div', key: 'C', text: 'C'}
    ]);
    useEffect(() => {
        setTimeout(() => {
            setList(() => {
                return [
                    {type: 'div', key: 'C', text: 'C'},
                    {
                        type: 'div',
                        key: 'A',
                        text: 'A',
                    },
                    {type: 'div', key: 'D', text: 'D'}
                ]
            })
        }, 2000);
    }, []);
    
    return (
        <>
            {/* 中括号会使vNode的层级多一个，也就是说children[0]才是list map出的vNode */}
            {
                list.map((item: any) => (
                    <div key={item.key}>
                        {item.text}
                        {/* {item?.children?.map((child: any) => (
                            <div key={child.key}>{child.text}</div>
                        ))} */}
                    </div>
                ))
            }
        </>
    )
}

// ReactDOM.render(<App />, document.querySelector('#root'));

const root = React.creatRoot(document.querySelector('#root'));
root.render(<App />);
