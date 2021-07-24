
import transformJSX from './transform-jsx';
import createFiberDom from './create-dom';
import {IVNode, IFiber} from './types';

let nextUnitOfWork: IFiber | null = null;
let wipRoot: IFiber | null = null;

function commitWork (fiber: IFiber | null) {
    const domParent = fiber?.parent?.dom;
    domParent && domParent.appendChild(fiber?.dom);
    fiber?.child && commitWork(fiber.child);
    fiber?.sibling && commitWork(fiber.sibling);
}

function commitRoot() {
    wipRoot?.child && commitWork(wipRoot.child);
}

function workLoop(ddl: IdleDeadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        if (ddl.timeRemaining() < 1) {
            shouldYield = true;
        }
    }
    if (!nextUnitOfWork && wipRoot) {
        console.log(wipRoot, 'wipRoot===');
        commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function render (vNode: IVNode, container: any) {
    // 初始化wipRoot
    wipRoot = {
        dom: container,
        props: {
            children: [vNode]
        },
        parent: null,
        child: null,
        sibling: null,
        type: 'div',
        alternate: null
    }
    nextUnitOfWork = wipRoot;
}

function performUnitOfWork(fiber: IFiber) {
    if (!fiber.dom) {
        fiber.dom = createFiberDom(fiber.type, fiber.props);
    }
    reconcileChildren(fiber);
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber: IFiber | null = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber?.parent;
    }
    return null;
}

function reconcileChildren(fiber: IFiber) {
    const elements = fiber.props.children;
    let i = 0;
    let prevSibling: IFiber | null = null;
    while (
        i < elements.length
    ) {
        let element = elements[i];
        let newFiber = {
            type: element.type,
            props: element.props,
            dom: null,
            child: null,
            sibling: null,
            parent: fiber,
            alternate: fiber,
        };
        if (i === 0) {
            fiber.child = newFiber;
        }
        else if (prevSibling) {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber;
        i++;
    }
    
}

const Didact = {
    transformJSX,
    render,
}

export default Didact;