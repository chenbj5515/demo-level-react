import {EEffectTags, IFiber, IVNode} from './types';
import {createFiberDom} from './create-dom';
import createVNode from './create-vnode';

let wipRoot: IFiber | null = null;
let currentRoot: IFiber | null = null;
let nextUnitOfWork: IFiber | null = null;
let delections: IFiber[] = [];

function performUnitOfWork(wipFiber: IFiber) {
    // if (!wipFiber.dom) {
    //     wipFiber.dom = createFiberDom(wipFiber.type, wipFiber.props);
    // }
    reconcileChildren(wipFiber);
    return getNextFiber(wipFiber);
}

function vNode2Fiber(
    vNode: IVNode,
    fatherFiber: IFiber,
    oldFiber?: IFiber | null
) {
    const sameType = vNode?.type === oldFiber?.type;
    if (oldFiber && sameType) {
        return {
            dom: oldFiber?.dom,
            parent: fatherFiber,
            sibling: null,
            child: null,
            type: oldFiber.type,
            alternate: oldFiber,
            props: vNode.props,
            effectTag: EEffectTags.UPDATE
        }
    }
    if (vNode && !sameType) {
        return {
            dom: null,
            parent: fatherFiber,
            sibling: null,
            child: null,
            type: vNode.type,
            alternate: null,
            props: vNode.props,
            effectTag: EEffectTags.PLACEMENT
        }
    }
    if (oldFiber && !sameType) {
        oldFiber.effectTag = EEffectTags.DELETION,
        delections.push(oldFiber);
    }
}

function reconcileChildren(fatherFiber: IFiber) {
    let lastOldFiber = fatherFiber?.alternate?.child;
    let vNodes = fatherFiber?.props?.children;
    let i = 0;
    let lastSibling: IFiber | null = null;
    while (i < vNodes.length) {
        const newFiber = vNode2Fiber(vNodes[i], fatherFiber, lastOldFiber);
        if (!newFiber) {
            lastOldFiber = lastOldFiber?.sibling;
            break;
        }
        if (i === 0) {
            fatherFiber.child = newFiber;
        }
        if (lastSibling) {
            lastSibling.sibling = newFiber;
        }
        lastSibling = newFiber;
        i++;
    }
}

function getNextFiber(curFiber: IFiber): IFiber | null {
    if (curFiber?.child) {
        return curFiber.child;
    }
    let nextFiber: IFiber | null = curFiber;
    while (nextFiber) {
        if (nextFiber?.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber?.parent;
    }
    return null;
}

function render(vNode: IVNode, container: Element) {
    console.log(vNode, '检测vNode是否正确');
    
    wipRoot = {
        dom: container,
        type: 'div',
        sibling: null,
        child: null,
        parent: null,
        alternate: currentRoot,
        props: {
            children: [vNode]
        },
    }
    nextUnitOfWork = wipRoot;
    while(nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    console.log(wipRoot, '全部转为fiber后的wipRoot');
}

const DemoLevelReact = {
    createVNode,
    render,
}

export default DemoLevelReact;
