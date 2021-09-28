import { cloneDeep } from "lodash-es";

import { IVNode, IFiber, EFlags} from "./types";
import {createFiberFromVNode, cloneFromOldFiber, isTextFiber} from './fiber';
import { exist } from "./helpers";

export const canReuse = (fiber: IFiber, vNode: IVNode) => fiber.key === vNode.key && fiber.type === vNode.type;

const placeChild = (newFiber: IFiber, lastPlacedIndex: number, newIdx: number) => {
    newFiber.idx = newIdx;
    const current = newFiber.alternate;
    if (current) {
        const oldIdx = current.idx;
        
        if (oldIdx! < lastPlacedIndex) {
            newFiber.flags = EFlags.PLACEMENT;
            // This is a move.
            return lastPlacedIndex;
        }
        else {
            newFiber.flags = EFlags.NO_FLAG;
            // This item can stay in place.
            return oldIdx!;
        }
    } else {
        newFiber.flags = EFlags.PLACEMENT;
        // This is an insertion.
        return lastPlacedIndex;
    }
}

const mapRemainingChildren = (oldFiber: IFiber) => {
    const map: Map<string | number, IFiber> = new Map();
    let curFiber: IFiber | null = oldFiber;
    while (curFiber) {
        if (curFiber.key !== null) {
            map.set(curFiber.key, curFiber);
        }
        else {
            map.set(curFiber.idx!, curFiber);
        }
        curFiber = curFiber.sibling || null;
    }
    return map;
}

const dedelteChild = (fatherFiber: IFiber, uselessOldFiber: IFiber) => {
    uselessOldFiber.stateNode && fatherFiber.stateNode?.removeChild(uselessOldFiber.stateNode);
}

const isTextChild = (newChild: IVNode | string | number): newChild is string | number => typeof newChild === 'string' || typeof newChild === 'number';

const updateFromMap = (
    existingKeyFiberMap: Map<React.Key, IFiber>,
    fatherFiber: IFiber,
    newChild: string | number | IVNode
) => {
    let oppoOldFiber: IFiber | null = null,
        newFiber = null
    if (isTextChild(newChild)) {
        newFiber = createFiberFromVNode(fatherFiber, newChild);
    }
    else if (!exist(newChild.key)) {
        newFiber = createFiberFromVNode(fatherFiber, newChild);
    } else {
        oppoOldFiber = existingKeyFiberMap.get(newChild.key!) || null;
        newFiber = oppoOldFiber ? cloneFromOldFiber(oppoOldFiber, newChild) : createFiberFromVNode(fatherFiber, newChild);
    }
    return newFiber;
}

const updateSlot = (
    fatherFiber: IFiber,
    oldFiber: IFiber,
    newChild: IVNode | number | string,
) => {
    let newFiber = null;
    if (isTextChild(newChild)) {
        if (isTextFiber(oldFiber)) {
            newFiber = cloneFromOldFiber(oldFiber, newChild);
        } else {
            newFiber = createFiberFromVNode(fatherFiber, newChild);
        }
    }
    else if (canReuse(oldFiber, newChild)) {
        newFiber = cloneFromOldFiber(oldFiber, newChild);
    }
    return newFiber;
}

export const reconcileChildrenArray = (fatherFiber: IFiber, oldFirstChild: IFiber | null, newChildren: (IVNode | string | number)[]) => {
    console.log(newChildren, 'newChildren==');
    
    let newIdx = 0,
        oldFiber: IFiber | null = oldFirstChild,
        newFirstChild: IFiber | null = null,
        previousNewFiber: IFiber | null = null,
        lastPlacedIndex = 0;

    // 旧fiber链表和newNodes数组逐个比对
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
        let newNode = newChildren[newIdx];
        const newFiber = updateSlot(fatherFiber, oldFiber, newNode)
        
        // 能复用的话就继续逐个比对，直到新旧某个遍历完毕
        if (newFiber) {
            newFiber.idx = newIdx;
            if (!previousNewFiber) {
                // 只有首次才为null，首个newFiber用newFirstChild标记
                newFirstChild = newFiber;
            }
            else {
                // @ts-ignore
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
            oldFiber = oldFiber.sibling || null;
        }
        // 一旦出现不能复用的就终止逐个比对
        else {
            break;
        }
    }
    // 如果没有旧节点了，那只需新节点如有剩余，就都创建新的fiber并插入即可。
    if (!oldFiber) {
        for(;newIdx < newChildren.length; newIdx++) {
            if (!newChildren[newIdx]) break;
            const newFiber = createFiberFromVNode(fatherFiber, newChildren[newIdx]);
            newFiber.idx = newIdx;
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
            
            if (!previousNewFiber) {
                newFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
    }
    else {
        // 如果还有旧节点，那就要建立旧节点的<key/idx, fiber> map, 因为这些就节点中可能还有能复用的节点
        const existingKeyFiberMap = mapRemainingChildren(oldFiber);
        // 遍历剩余新节点，从map中找到可复用的旧节点进行复用
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = updateFromMap(existingKeyFiberMap, fatherFiber, newChildren[newIdx]);
            newFiber.idx = newIdx;
            // 如果newFiber是复用了旧节点，那么就要就可以从map里删掉了，缩短从map找其他newChild的oldFiber的时间
            if (newFiber.alternate && newFiber.key !== null) {
                existingKeyFiberMap.delete(newFiber.key);
            }
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
            
            if (!previousNewFiber) {
                newFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
        existingKeyFiberMap.forEach(oldFiber => dedelteChild(fatherFiber, oldFiber));
    }
    
    
    // 更新child为本次生成的new fiber
    fatherFiber.child = newFirstChild;
}