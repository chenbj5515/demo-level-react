export interface IDOMProps {
    [key: string]: unknown;
    children: IVNode[];
}

// export interface IDOMProps extends Omit<HTMLElement, "children">{
//     children: IVNode[];
// }

// VNode可以用来描述某个子树（这里指广义的子树，包括整个组件树，狭义子树或者某个节点）
export interface IVNode {
    // DOM元素类型，如div
    type: string;
    // DOM元素的attrs和children
    props: IDOMProps;
}

export interface IFiber {
    dom: any;
    type: string;
    props: {
        children: IVNode[];
    }
    child: IFiber | null;
    sibling: IFiber | null;
    parent: IFiber | null;
    alternate: IFiber | null;
}