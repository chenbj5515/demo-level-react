
import transformJSX from './transform-jsx';
import createFiberDom from './create-dom';
import {isNormalProp, isGoneProp, isNewValueProp} from '../stage-3/helpers'
import {IVNode, IFiber, EEffectTags, IDOMProps} from './types';

let nextUnitOfWork: IFiber | null = null;
let wipRoot: IFiber | null = null;
// 用于记录一次flush中要被删除的元素们
let delections: IFiber[] = [];
// 当前存在的fiber树的根，首次肯定是null，首次提交后就有值了，rerender时会用到currentRoot
let currentRoot: IFiber | null = null;

function updateDOM(
    dom: any,
    prevProps: IDOMProps,
    nextProps: IDOMProps
) {
    Object.keys(prevProps)
        .filter(isNormalProp)
        .filter(propKey => 
            isGoneProp(prevProps, nextProps)(propKey)
            || isNewValueProp(prevProps, nextProps)(propKey)
        ).forEach(attrKey => {
            dom[attrKey] = nextProps[attrKey];
        })
}

/**
 * 提交当前fiber子树的工作，每次提交干三件事儿
 * @desp 1.根据当前的fiber节点的effectTag，执行对应的DOM操作
 * @desp 2.提交child子树
 * @desp 3.提交sibling子树
 */
function commitWork (fiber: IFiber | null) {
    const domParent = fiber?.parent?.dom;
    if (fiber?.effectTag === EEffectTags.PLACEMENT) {
        fiber?.dom && domParent.appendChild(fiber.dom);
    } 
    if (fiber?.effectTag === EEffectTags.UPDATE) {
        fiber?.dom && fiber.alternate?.props && updateDOM(fiber.dom, fiber.alternate?.props, fiber.props);
    }
    fiber?.child && commitWork(fiber.child);
    fiber?.sibling && commitWork(fiber.sibling);
}

function commitRoot() {
    wipRoot?.child && commitWork(wipRoot.child);
    currentRoot = wipRoot;
}

/**
 * @param vNode 
 * @param container 
 * @desp render函数里并没有真正render，而仅仅是根据vNode创建wipRoot，并且把下一个工作单元置为wipRoot
 */
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
        alternate: currentRoot
    }
    nextUnitOfWork = wipRoot;
    while (nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    commitRoot();
}

/**
 * 找到下一个fiber，顺位关系：1.长子，2.兄弟，3.叔叔节点
 */
function generateNextFiber(fiber: IFiber) {
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

/**
 * 一个工作单元干三件事儿：
 * @desp 1.创建fiber的dom
 * @desp 2.将当前fiber的子元素转为fiber
 * @desp 3.找到下一个fiber并返回
 */
function performUnitOfWork(fiber: IFiber) {
    if (!fiber.dom) {
        fiber.dom = createFiberDom(fiber.type, fiber.props);
    }
    reconcileChildren(fiber);
    return generateNextFiber(fiber);
}

/**
 * 根据已转为fiber的父节点、上次渲染的oldFiber以及本地的新vDom,生成节点的newFiber
 */
function generateNewFiber(element: IVNode, wipFiber: IFiber | null, oldFiber: IFiber | null) {
    const sameType = oldFiber && element && element.type === oldFiber.type;

    let newFiber = null;

    if (sameType) {
        newFiber = {
            type: oldFiber!.type,
            props: element.props,
            dom: oldFiber?.dom,
            child: null,
            sibling: null,
            parent: wipFiber,
            alternate: oldFiber,
            effectTag: EEffectTags.UPDATE
        };
    }

    if (element && !sameType) {
        newFiber = {
            type: element.type,
            props: element.props,
            dom: null,
            child: null,
            sibling: null,
            parent: wipFiber,
            alternate: null,
            effectTag: EEffectTags.PLACEMENT
        };
    }

    if (oldFiber && !sameType) {
        oldFiber.effectTag = EEffectTags.DELETION;
        delections.push(oldFiber);
    }
    return newFiber;
}

/**
 * 将当前已转为fiber的节点所有子节点从vNode转为fiber
 * @param fiber 
 */
function reconcileChildren(wipFiber: IFiber) {
    const vNodes = wipFiber.props.children;
    let i = 0;
    // 刚开始上一个兄弟肯定是null，长子的fiber创建时，上一个兄弟才创建。
    let prevSibling: IFiber | null = null;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    
    while (
        i < vNodes.length
    ) {
        let curVNode = vNodes[i];
        const newFiber = generateNewFiber(curVNode, wipFiber, oldFiber);
        if (i === 0 && newFiber) {
            wipFiber.child = newFiber;
        }
        else if (prevSibling) {
            prevSibling.sibling = newFiber!
        }
        prevSibling = newFiber;
        oldFiber = oldFiber?.sibling ? oldFiber.sibling : null;
        i++;
    }
}

const Didact = {
    transformJSX,
    render,
}

export default Didact;