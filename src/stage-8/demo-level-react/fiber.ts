import {IFiber, IVNode, EFlags, INormalVNode, ITextFiber, INormalFiber, INormalTextFiber, ICompFiber} from './types';
import {shallowEqual} from './helpers';
import {cloneDeep} from 'lodash-es';

export const createFiberFromVNode = (fatherFiber: IFiber | null, newNode?: IVNode | string | number | IVNode[]) => {
    const common = {
        stateNode: null,
        child: null,
        sibling: null,
        alternate: null,
        parent: fatherFiber || null,
        flags: EFlags.PLACEMENT,
    }
    if (Array.isArray(newNode)) {
        return {
            ...common,
            ...newNode[0],
            pendingProps: newNode[0].props,
            renderTimes: 0
        } as IFiber;
    }
    else if (typeof newNode === 'object') {
        return {
            ...common,
            ...newNode,
            pendingProps: newNode.props,
            renderTimes: 0
        } as IFiber;
    }
    return {
        type: null,
        isComp: false,
        ...common,
        pendingProps: newNode,
    } as IFiber;
};

export const cloneFromOldFiber = (oldFiber: IFiber, newNode: IVNode | string | number) => {
    const common = {
        ...oldFiber,
        child: null,
        sibling: null,
        memoizedProps: oldFiber?.pendingProps || null,
        alternate: oldFiber,
    }
    let newFiber;
    if (typeof newNode === 'string' || typeof newNode === 'number') {
        newFiber = {
            ...common,
            pendingProps: newNode,
        } as IFiber;
    }
    else {
        newFiber = {
            ...newNode,
            ...common,
            renderTimes: newNode.isComp ? (oldFiber as ICompFiber).renderTimes++ : undefined,
            pendingProps: newNode.props,
            // 通过浅比较props来决定是否需要更新
            flags: shallowEqual(oldFiber.pendingProps, newNode.props)
                ? oldFiber.flags
                : oldFiber.flags | EFlags.UPDATE
        };
    }
    return newFiber as IFiber;
};

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

/**
 * @desciption fiber自身是text（处在list中有其他normal element的text element）
 */
// 
export const isTextFiber = (fiber: IFiber): fiber is ITextFiber =>
    typeof fiber.pendingProps === 'string'
    || typeof fiber.pendingProps === 'number';

/**
 * @desciption fiber是normal element并且只有一个text element作为child
 */
export const isNormalTextFiber = (fiber: INormalFiber): fiber is INormalTextFiber => {
    return fiber.pendingProps.children.length === 1
        && (
            typeof fiber.pendingProps.children[0] === 'string'
            || typeof fiber.pendingProps.children[0] === 'number'
        )
}
    