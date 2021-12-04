import React, { useEffect, useState, useRef } from "react";
import ReactDOM from 'react-dom';

const App = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [count, updateCount] = useState(0);

  const onClick = () => {
    updateCount((count) => count + 2);
  };

  useEffect(() => {
    const button = buttonRef.current;
    setTimeout(() => updateCount(1), 1000);
    setTimeout(() => button?.click(), 1040);
  }, []);

  return (
    <div>
      <button ref={buttonRef} onClick={onClick}>
        增加2
      </button>
      <div>
        {Array.from(new Array(4500)).map((v, index) => (
          <span key={index}>{count}</span>
        ))}
      </div>
    </div>
  );
};

// ReactDOM.render(<App />, document.querySelector('#root'));

// @ts-ignore
const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render(<App />)