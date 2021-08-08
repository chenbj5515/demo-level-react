import {IProps, IVNode, IFiber, EEffectTags, FunctionCompType, IHook, TAction} from "../stage-6/types";
import {createFiberDom, updateDom, clone, createNewCompFiber} from './helpers';

const TEXT_ELEMENT = 'TEXT_ELEMENT';

const createTextVNode = (child: string) => ({
    type: TEXT_ELEMENT,
    props: {
        nodeValue: child,
        children: []
    }
})

const handleTextChild = (child: IVNode | string) => typeof child === 'string' || typeof child === 'number' ? createTextVNode(child) : child;

const createVNode = (
    type: string | FunctionCompType,
    props: IProps,
    ...children: (IVNode | string)[]
) => {
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
let deletions: IFiber[] = [];
// 当前的函数式组件的fiber，因为每次执行函数式组件前会把该变量置为其fiber对象，所以每个hook内都能访问到组件的fiber
let curCompFiber: IFiber | null = null;
let hookIndex: number = -1;

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
            hooks: oldFiber.hooks,
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
        const newFiber = generateNewFiber(child, oldFiber, wipFiber);
        
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

const performUnitOfWork = (wipFiber: IFiber) => {
    if (wipFiber.type instanceof Function) {
        curCompFiber = wipFiber;
        wipFiber.hooks = wipFiber.hooks || [];
        const children = wipFiber.type();
        reconcileChildren(wipFiber, [children]);
    }
    else {
        if (!wipFiber.dom) {
            const dom = createFiberDom(wipFiber);
            // 赋予DOM属性
            updateDom(dom, null, wipFiber);
            wipFiber.dom = dom;
        }
        wipFiber.props?.children && reconcileChildren(wipFiber, wipFiber.props.children);
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

const commitFiberTree = (rootFiber: IFiber | null) => {
    let curFiber: IFiber | null | undefined = rootFiber?.child;
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
    hookIndex = 0;
};

const updateComp = (compFiber: IFiber | null) => {
    let nextUnitOfWork: IFiber | null = compFiber;
    while (nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
    commitFiberTree(wipRoot);
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
    updateComp(wipRoot);
};

export const useState = <T>(initalState: T) => {
    let res: [T, (action: TAction<T>) => void];
    
    const oldHook =
        curCompFiber?.alternate?.hooks?.[hookIndex] as IHook<T>;

    const hook: IHook<T> = {
        state: oldHook?.state || initalState,
        queue: []
    }

    const actions = oldHook?.queue || [];

    actions.forEach(action => {
        hook.state = action(hook.state);
    });

    const setState = (action: TAction<T>) => {
        hook.queue.push(action);
        let nextUnitOfWork: IFiber | null = curCompFiber && createNewCompFiber(curCompFiber);
        
        if (nextUnitOfWork && curCompFiber) {
            nextUnitOfWork.alternate = clone(curCompFiber);
        }
        while (nextUnitOfWork) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }
        
        commitFiberTree(curCompFiber);
    }

    curCompFiber?.hooks?.push(hook);
    hookIndex++;

    res = [hook.state, setState];
    return res;
}

// const shallowEqual = (left: any, right: any) => left === right;

const isChanged = (prev: any[] = [], next: any[]) => prev.some((item, index) => item !== next[index]); 

export const useEffect = (effect: AnyFunc, deps: any[]) => {
    const oldHook =
        curCompFiber?.alternate?.hooks?.[hookIndex] as IHook;
    
    const hook: IHook = {
        state: oldHook?.state || deps,
        queue: []
    }

    if (!oldHook || isChanged(oldHook?.state, deps)) {
        effect();
    }

    curCompFiber?.hooks?.push(hook);
    hookIndex++;
}

const DemoLevelReact = {
    createVNode,
    render,
}

export default DemoLevelReact;
