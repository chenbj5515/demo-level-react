import {IFiber, IVNode} from './types';
import {createFiberDom} from './create-dom';
import createVNode from './create-vnode';

let wipRoot: IFiber | null = null;
let currentRoot: IFiber | null = null;
let nextUnitOfWork: IFiber | null = null;

function performUnitOfWork(wipFiber: IFiber) {
    if (!wipFiber.dom) {
        wipFiber.dom = createFiberDom(wipFiber.type, wipFiber.props);
    }
    reconcileChildren(wipFiber);
    return getNextFiber(wipFiber);
}

function reconcileChildren(wipFiber: IFiber) {

}

function getNextFiber(curFiber: IFiber) {
    return curFiber;
}

function render(vNode: IVNode, container: Element) {
    console.log(vNode, '检测vNode是否正确');
    
    // wipRoot = {
    //     dom: container,
    //     type: 'div',
    //     sibling: null,
    //     child: null,
    //     parent: null,
    //     alternate: currentRoot,
    //     props: {
    //         children: [vNode]
    //     },
    // }
    // nextUnitOfWork = wipRoot;
    // while(nextUnitOfWork) {
    //     nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // }
}

const DemoLevelReact = {
    createVNode,
    render,
}

export default DemoLevelReact;
