import DemoLevelReact from './demo-level-react';
  
const container = document.getElementById("root");

let replaceHelloWorld = true;

let showHelloWorld = true;

const replaceNode = () => {
    replaceHelloWorld = false;
    App();
}

const deleteNode = () => {
    showHelloWorld = false;
    App();
}

const App = () => {
    /** @jsx DemoLevelReact.createVNode */
    const element = (
        <div>
            <div onClick={replaceNode}>删除用例0：点我删除旧节点，并且渲染新节点</div>
            <div onClick={deleteNode}>删除用例1：点我仅删除旧节点</div>
            {replaceHelloWorld
                ? (
                    <h2>Hello World!</h2>
                )
                : (
                    <div>Hi, I'm looking for a job</div>
                )
            }
            {showHelloWorld
                ? (
                    <h2>Hello World!</h2>
                )
                : (
                    null
                )
            }
        </div>
    )
    container && DemoLevelReact.render(element, container)
};

App();
