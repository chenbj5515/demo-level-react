export interface IDOMProps {
    [key: string]: unknown;
    children: IVNode[];
}

// VNode可以用来描述某个子树（这里指广义的子树，包括整个组件树，狭义子树或者某个节点）
export interface IVNode {
    // DOM元素类型，如div
    type: string;
    // DOM元素的attrs和children
    props: IDOMProps;
}

export enum EEffectTags {
    UPDATE = 'UPDATE',
    PLACEMENT = 'PLACEMENT',
    DELETION = 'DELETION'
}

export type IDom = Element | Text | null;

export type TAction<T> = (state: T) => T;

export interface IHook<T> {
    state: T;
    queue: (TAction<T> | AnyFunc)[];
}

export interface IFiber<T = any> {
    dom: IDom;
    type: string | FunctionCompType;
    props: IProps;
    child: IFiber | null;
    sibling: IFiber | null;
    parent: IFiber | null;
    alternate: IFiber | null;
    effectTag?: EEffectTags;
    hooks?: IHook<T>[];
    dirty?: boolean;
}

export interface IProps extends Partial<Omit<Element, "children">>{
    children?: IVNode[];
}

export type IProperty = Partial<Omit<Element, "children">>;

export type FunctionCompType = () => IVNode;

export type ITaskCallback = ((time: boolean) => boolean) | null

export interface ITask {
    callback?: ITaskCallback
    fiber: IFiber
}

// 和effectTag差不多，描述该fiber
export const enum LANE {
    UPDATE = 1 << 1,
    INSERT = 1 << 2,
    REMOVE = 1 << 3,
    DIRTY = 1 << 4,
}