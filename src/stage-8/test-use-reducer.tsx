import React, {useReducer} from './demo-level-react';

// import {useReducer} from 'react';

type Action =
    | {type: 'increase', payload: number}
    | {type: 'decrease', payload: number}

const reducer = (state: number, action: Action) => {
    switch (action.type) {
        case 'increase':
            return state + action.payload;
        case 'decrease':
            return state - action.payload;
        default:
            return state;
    }
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, 0);
    

    function handleClick() {
        dispatch({type: 'increase', payload: 1});
    }
    
    return (
        <>
            <div>{state}</div>
            <div onClick={handleClick}>点我增加count</div>
        </>
    )
}
