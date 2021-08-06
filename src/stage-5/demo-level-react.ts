import { IProps, IVNode, IFiber, EEffectTags, FunctionCompType} from "../stage-5/types";
import {createFiberDom, updateDom} from './helpers';

const TEXT_ELEMENT = 'TEXT_ELEMENT';

const createTextVNode = (child: string) => ({
    type: TEXT_ELEMENT,
    props: {
        nodeValue: child,
        children: []
    }
})

const handleTextChild = (child: IVNode | string) => typeof child === 'string' ? createTextVNode(child) : child;

const createVNode = (
    type: string | FunctionCompType,
    props: IProps,
    ...children: (IVNode | string)[]
) => {
    console.log(type, props, children);
    
    return {
        type,
        props: {
            ...props,
            children: children.map(handleTextChild)
        }
    }
};

let wipRoot: IFiber | null = null;
let currentRoot: IFiber | null = null;
let nextUnitOfWork: IFiber | null = null;
let deletions: IFiber[] = [];

const generateNextFiber = (fiber: IFiber) => {
    if (fiber.child) {
        return fiber.child;
    }
    let curFiber: IFiber | null = fiber;
    while (curFiber) {
        if (curFiber.sibling) {
            return curFiber.sibling;
        }
        curFiber = curFiber.parent;
    }
    return null;
}

const generateNewFiber = (vNode?: IVNode, oldFiber?: IFiber | null, fatherFiber?: IFiber) => {
    const sameType = vNode?.type === oldFiber?.type;
    if (!vNode) {
        if (oldFiber && !sameType) {
            oldFiber.effectTag = EEffectTags.DELETION;
            deletions.push(oldFiber);
        }
        return null;
    }
    if (sameType && oldFiber) {
        return {
            dom: oldFiber.dom,
            child: null,
            sibling: null,
            alternate: oldFiber,
            type: oldFiber.type,
            props: vNode?.props,
            parent: fatherFiber || null,
            effectTag: EEffectTags.UPDATE
        }
    }
    if (oldFiber && !sameType) {
        oldFiber.effectTag = EEffectTags.DELETION;
        deletions.push(oldFiber);
    }
    return {
        dom: null,
        child: null,
        sibling: null,
        alternate: null,
        type: vNode.type,
        props: vNode.props,
        parent: fatherFiber || null,
        effectTag: EEffectTags.PLACEMENT
    }
}

const reconcileChildren = (wipFiber: IFiber, children?: IVNode[]) => {
    let oldFiber = wipFiber.alternate?.child;
    let lastSibling: IFiber | null = null;
    if (!children) {
        return;
    }
    for (let i = 0; i < children?.length; i++) {
        const child = children[i];
        const newFiber = generateNewFiber(child, oldFiber, wipFiber)
        if (i === 0) {
            wipFiber.child = newFiber;
        }
        else if (lastSibling) {
            lastSibling.sibling = newFiber;
        }
        lastSibling = newFiber;
        oldFiber = oldFiber?.sibling;
    }
}

const performNextUnitOfWork = (wipFiber: IFiber) => {
    if (typeof wipFiber.type === 'string') {
        if (!wipFiber.dom) {
            const dom = createFiberDom(wipFiber);
            // 赋予DOM属性
            updateDom(dom, null, wipFiber);
            wipFiber.dom = dom;
        }
        reconcileChildren(wipFiber, wipFiber.props.children);
    }
    if (wipFiber.type instanceof Function) {
        const children = wipFiber.type();
        reconcileChildren(wipFiber, [children]);
    }
    return generateNextFiber(wipFiber);
};

const commitWork = (fiber: IFiber) => {
    const oldFiber = fiber.alternate;
    const oldDom = oldFiber?.dom;
    if (fiber.effectTag === EEffectTags.PLACEMENT) {
        let curFiber: IFiber | null | undefined = fiber.parent;
        while (!curFiber?.dom) {
            curFiber = curFiber?.parent;
        }
        fiber.dom && curFiber.dom?.appendChild(fiber.dom);
    }
    if (fiber.effectTag === EEffectTags.UPDATE) {
        oldFiber && oldDom && updateDom(oldDom, oldFiber, fiber);
    }
}

const commitRoot = (rootFiber: IFiber) => {
    let curFiber: IFiber | null = rootFiber.child;
    while (curFiber) {
        commitWork(curFiber);
        curFiber = generateNextFiber(curFiber);
    }
    deletions.forEach(fiber => {
        let parentFiber: IFiber | null | undefined = fiber?.parent;
        let curFiber: IFiber | null | undefined = fiber;
        while (!parentFiber?.dom) {
            parentFiber = parentFiber?.parent;
        }
        while (!curFiber?.dom) {
            curFiber = curFiber?.child;
        }
        const parentDom = parentFiber.dom;
        const toDeleteDom = curFiber.dom;
        parentDom.removeChild(toDeleteDom);
    });
    currentRoot = wipRoot;
};

const render = (vNode: IVNode, container: Element) => {
    wipRoot = {
        child: null,
        sibling: null,
        dom: container,
        type: 'div',
        props: {
            children: [vNode]
        },  
        parent: null,
        alternate: currentRoot
    }
    nextUnitOfWork = wipRoot;
    while (nextUnitOfWork) {
        nextUnitOfWork = performNextUnitOfWork(nextUnitOfWork)
    }
    commitRoot(wipRoot);
};

const DemoLevelReact = {
    createVNode,
    render
}

export default DemoLevelReact;
