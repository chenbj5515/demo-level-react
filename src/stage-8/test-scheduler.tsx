import React from './demo-level-react';
// import React from 'react';

let divs: any[] = []

for (let i = 0; i <= 10; i++) {
    divs.push({
        text: i
    });
}

export default function App() {
    
    return (
        <>
            <input type="text" name="" id="" />
            {
                divs.map(item => (
                    <div>{item.text}</div>
                ))
            }
        </>
    )
}
