import { ICompFiber, IDom, IFiber,IVNode, isCompFiber, INormalFiber, IChild } from "./types";
import {createFiberFromVNode, setFiberDom, generateNextFiber} from './fiber';
import {createDom} from './dom';
import {diff} from './diff';

let currentFiber: IFiber | null = null;

export const creatRoot = (conatiner: IDom) => {
    function render(vNode: IVNode) {
        let wipRootFiber = { 
            stateNode: conatiner,
            ...vNode
        } as IFiber;
        update(wipRootFiber);
    }
    return {
        render
    }
}

// fiber的newChildren是vNode，含有本次要更新的信息，我们要把这些vNode->fiber。
// 转化过程就是信息整理过程，我们会通过diff算法来知道如何新的节点能否复用旧节点，复用的话是否需要移动，是否需要更新等信息并附加到fiber上。
// 最终全部转化成fiber后进入提交阶段会统一消费这些信息，执行对应的dom操作
const performUnitOfWork = (wipFiber: IFiber) => {
    isCompFiber(wipFiber) ? updateComp(wipFiber) : updateHost(wipFiber);
    return generateNextFiber(wipFiber);
}
 
const updateComp = (compFiber: ICompFiber) => {
    // type函数就是函数组件，执行函数组件时会执行内部的useState等钩子
    // useState等钩子内部会调用getCurrentFiber方法获取到此时设置的全局变量
    // 所以钩子函数内是这样每次调用前设置全局变量的方式获取到组件fiber的
    currentFiber = compFiber;
    // 创建、更新组件子树无非两件事：1.所有hook函数走一遍 2.return的newVNodes会和oldFiber对比，也就是diff算法，力图找到最小的DOM操作来完成视图更新
    const container = compFiber.type(compFiber.props),
        children = container.props?.children;
    setFiberDom(compFiber, container);
    children && reconcileChildrenArray(compFiber, children);
};

const reconcileChildrenArray = (fatherFiber: IFiber, newChildren: (IChild | IChild[])[]) => {
    let flatNewChildren = newChildren.flat();
    let resultingFirstChild: IFiber | null = null;
    // 是首次渲染，走创建流程
    if (!fatherFiber.child) {
        let newIdx = 0;
        let previousNewFiber = null;
        for(; newIdx < flatNewChildren.length; newIdx++) {
            const newFiber = createFiberFromVNode(fatherFiber, flatNewChildren[newIdx]);
            console.log(newFiber, 'newFiber===');
            if (!previousNewFiber) {
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
        fatherFiber.child = resultingFirstChild;
        console.log(fatherFiber, 'fatherFiber===');
    }
    // 是后续更新，走diff算法
    else {
        diff(fatherFiber, fatherFiber.child, flatNewChildren);
    }
}

const updateHost = (nodeFiber: INormalFiber) => {
    nodeFiber.stateNode = createDom(nodeFiber);
    // console.log(nodeFiber, 'nodeFiber===');
    const children = nodeFiber.props.children;
    // child是文本时，直接更新innerHTML即可
    if (
        children.length === 1
        && (typeof children[0] === 'string' || typeof children[0] === 'number')
        && nodeFiber.stateNode
    ) {
        const text = children[0];
        nodeFiber.stateNode.innerHTML = text.toString();
    }
    // TODO: 有dom的children时，则要继续reconcile
    // children && reconcileChildren(nodeFiber, children);
};

// setState时会调用update方法，我们知道钩子函数内是有着组件fiber的，所以调用update的时候会传入，这样就会更新组件子树了。
const update = (fiber: IFiber) => {
    reconcile(fiber);
}

const getContaienr = (fiber: INormalFiber) => {
    let curFiber = fiber?.parent;
    while (curFiber) {
        if (curFiber.stateNode) return curFiber.stateNode;
        curFiber = curFiber.parent;
    }
    return null;
}

const commitWork = (fiber: INormalFiber) => {
    const container = getContaienr(fiber);
    console.log(container, 'container===');
    
    container && fiber.stateNode && container.appendChild(fiber.stateNode);
}

const commit = (wipFiber: IFiber) => {
    let curFiber: IFiber | null | undefined = wipFiber?.child;
    while (curFiber) {
        commitWork(curFiber as INormalFiber);
        curFiber = generateNextFiber(curFiber);
    };
}

const reconcile = (WIP: IFiber) => {
    let nextUnitOfWork: IFiber | null = WIP;
    while (nextUnitOfWork = performUnitOfWork(nextUnitOfWork)) {}
    
    commit(WIP);
}

export const getCurrentFiber = () => currentFiber
