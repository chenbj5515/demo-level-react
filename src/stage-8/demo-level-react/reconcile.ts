// import {cloneDeep} from 'lodash-es';
import {ICompFiber, IDom, IFiber,IVNode, isCompFiber, INormalFiber, ITextFiber, EFlags} from "./types";
import {createFiberFromVNode, generateNextFiber, isTextFiber, isNormalTextFiber, cloneFromOldFiber} from './fiber';
import {createElement, createTextElement, updateTextElement, updateNormalTextElement, moveAfter} from './dom';
import {reconcileChildrenArray} from './diff';
import {resetCursor} from './hook';


let currentFiber: IFiber | null = null;

export const creatRoot = (conatiner: IDom) => {
    function render(vNode: IVNode) {
        const wipRootFiber = createFiberFromVNode(null, vNode);
        wipRootFiber.stateNode = conatiner;
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

// 对于直接返回字符串的组件，每次直接patch dom即可
const updateTextComp = (compFiber: ICompFiber, newText: string | number) => {
    if (!compFiber.stateNode) {
        compFiber.stateNode = createTextElement(newText);
    }
    else {
        (compFiber.stateNode as Text).nodeValue = newText.toString();
    }
}

const updateComp = (compFiber: ICompFiber) => {
    // type函数就是函数组件，执行函数组件时会执行内部的useState等钩子
    // useState等钩子内部会调用getCurrentFiber方法获取到此时设置的全局变量
    // 所以钩子函数内是这样每次调用前设置全局变量的方式获取到组件fiber的
    currentFiber = compFiber;
    // 到了新组件，当然要重置组件内hook的指针
    resetCursor();
    // 创建、更新组件子树无非两件事：1.所有hook函数走一遍 2.return的newVNodes会和oldFiber对比，也就是diff算法，力图找到最小的DOM操作来完成视图更新
    const root = compFiber.type(compFiber.pendingProps);
    
    if (typeof root === 'string' || typeof root === 'number') {
        updateTextComp(compFiber, root);
    }
    else {
        let newFiber;
        // 组件的根是<></>的话，则直接reconcile children
        if (!root.type) {
            const newChildren = (root.props.children as IVNode[]);
            reconcileChildrenArray(compFiber, compFiber.alternate?.child || null, newChildren);
            compFiber.alternate = compFiber;
        }
        else if (root.type === compFiber.alternate?.type) {
            newFiber = cloneFromOldFiber(compFiber.alternate, root);
            compFiber.child = newFiber;
        }
        else {
            newFiber = createFiberFromVNode(compFiber, root);
            compFiber.child = newFiber;
        }
    }
};

const updateHost = (nodeFiber: INormalFiber | ITextFiber) => {
    // 如果当前fiber本身是text element的话，直接创建、更新即可无需reconcile
    if (isTextFiber(nodeFiber) ) {
        // 创建dom
        if (!nodeFiber.stateNode) {
            nodeFiber.stateNode = createTextElement(nodeFiber);
        }
        // 如果需要则更新text dom
        if (nodeFiber.pendingProps !== nodeFiber.memoizedProps) {
            updateTextElement(nodeFiber.pendingProps.toString(), nodeFiber.stateNode);
        }
    }
    // 如只有#text作为子元素的普通div标签
    else if (isNormalTextFiber(nodeFiber)) {
        // 创建dom
        if (!nodeFiber.stateNode) {
            nodeFiber.stateNode = createElement(nodeFiber);
        }
        // 如果需要则更新text dom
        if (nodeFiber.pendingProps.children[0] !== nodeFiber.memoizedProps?.children[0]) {
            updateNormalTextElement(nodeFiber.pendingProps.children[0].toString(), nodeFiber.stateNode);
        }
    }
    // 嵌套了div的div，或者子元素包括#text和普通标签
    else {
        if (!nodeFiber.stateNode) {
            nodeFiber.stateNode = createElement(nodeFiber);
        }
        const children = nodeFiber.pendingProps.children;
        children && reconcileChildrenArray(nodeFiber, nodeFiber.child || null, children as (IVNode | string | number)[]);
    }
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

const commitWork = (fiber: INormalFiber, lastFiber: IFiber | null) => {
    if (fiber.flags === EFlags.PLACEMENT) {
        const last = lastFiber?.stateNode;
        const container = getContaienr(fiber) as Element | null;
        moveAfter(fiber.stateNode, last, container)
    }
}

const commit = (wipFiber: IFiber) => {
    console.log(wipFiber);
    
    // 提交阶段执行effect
    isCompFiber(wipFiber) && (wipFiber.effect?.());
    let curFiber: IFiber | null | undefined = wipFiber?.child,
        lastFiber: IFiber | null = null;
    while (curFiber) {
        commitWork(curFiber as INormalFiber, lastFiber);
        lastFiber = curFiber;
        curFiber = generateNextFiber(curFiber);
    };
}

export const reconcile = (WIP: IFiber) => {
    let nextUnitOfWork: IFiber | null = WIP;
    
    while (nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
    commit(WIP);
}

export const getCurrentFiber = () => currentFiber as ICompFiber;
