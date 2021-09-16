import {IFiber, IVNode, EFlags, INormalVNode} from './types';
import {shallowEqual} from './helpers';
import {createDom} from './dom';

export const createFiberFromVNode = (fatherFiber: IFiber | null, newNode: IVNode | string | number) => {
    const common = {
        stateNode: null,
        child: null,
        sibling: null,
        alternate: null,
        parent: fatherFiber || null,
    }
    if (typeof newNode === 'object') {
        return {
            ...common,
            ...newNode
        } as IFiber;
    }
    return {
        ...common,
        pendingProps: newNode
    } as IFiber;
};

export const cloneFromOldFiber = (oldFiber: IFiber, newNode: IVNode) => ({
    oldProps: oldFiber?.props || null,
    alternate: oldFiber,
    ...oldFiber,
    ...newNode,
    // 通过浅比较props来决定是否需要更新
    flags: shallowEqual(oldFiber.props, newNode.props)
        ? oldFiber.flags
        : oldFiber.flags | EFlags.UPDATE
} as IFiber);


export const setFiberDom = (fiber: IFiber, container: INormalVNode) => {
    fiber.stateNode = createDom(container) || fiber.stateNode;
}

export const generateNextFiber = (fiber: IFiber) => {
    if (fiber.child) return fiber.child;
    let curFiber: IFiber | null = fiber;
    // 一直向上找，直到没有了或者找到有sibling的祖辈
    while (curFiber) {
        if (curFiber.sibling) return curFiber.sibling;
        curFiber = curFiber.parent || null;
    }
    return null;
}