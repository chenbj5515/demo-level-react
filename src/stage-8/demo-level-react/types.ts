export type IVNode = INormalVNode | ICompVNode;

export type IChild = IVNode | string | number;

export type IAttrs = Record<string, unknown>;

export interface IDOMProps {
    [key: string]: unknown;
    children: IVNode[];
}

/** 
 * 最简例子：\<Comp someKey={123}><div>aaa</div></Comp>
 * 这个最简例子中，props中包括someKey和div(以vNode的形式作为children)
 * 也就是说组件调用时有时会有children也要作为props传入组件函数，也就是说组件函数的props.children就是子元素
 * 使用过Vue的可以理解成Vue中的插槽功能
*/
export interface IProps {
    [key: string]: any;
    children: (IVNode | string | number)[] | (IVNode | string | number)[][];
}

interface ICommonVNode {
    isComp?: boolean;
    props: IProps;
    key: React.Key | null;
}

// VNode可以用来描述某个子树（这里指广义的子树，包括整个组件树，狭义子树或者某个节点）
export interface INormalVNode extends ICommonVNode {
    type: string;
}

// 组件的vnode, 如你代码里的<App />就会被babel的jsx插件转为ICompVNode结构
export interface ICompVNode extends ICommonVNode {
    type: () => IVNode;
}

export type IDom = Element | Text | null;

export type TAction<T> = (state: T) => T;

export interface IStateHook<T> {
    state: T;
    next: IHook<T>;
}

export interface IEffectHook {
    effect: Function;
    deps: any[];
    next: IHook<any>;
}

export interface IRef<T> {
    current: T | null;
}

export interface IRefHook<T> {
    ref: IRef<T>;
    next: IHook<T>;
}

export type IHook<T> = IStateHook<T> | IEffectHook | IRefHook<T> |null;

interface ICommonFiber {
    isComp: boolean;
    stateNode?: IDom;
    child?: IFiber | null;
    sibling?: IFiber | null;
    parent?: IFiber | null;
    alternate?: IFiber | null;
    flags: EFlags;
    idx?: number;
    key: string | number | null;
    hooks?: IHook<any>;
    renderTimes?: number | null;
}

/**
 * @description 当\<div>a\<p>b\</p>\</div>这种结构时，会存在text element对应的fiber
 * @description 其特征是pendingProps属性不是含有children等属性的对象，而是文本的字符串
 */
export interface ITextFiber extends ICommonFiber {
    stateNode: Text | null;
    type: null;
    pendingProps: string | number;
    memoizedProps?: string | number;
}

export interface INormalTextFiber extends ICommonFiber {
    key: string | number | null;
    stateNode: Element;
    type: string;
    pendingProps: {
        children: (string | number)[]
    };
    memoizedProps: {
        children: (string | number)[]
    };
}

export type IFiber = ICompFiber | INormalFiber | ITextFiber;

export interface ICompFiber extends ICommonFiber {
    key: string | number;
    type: (props: IProps) => INormalVNode | string | number;
    pendingProps: IProps;
    memoizedProps?: IProps;
    renderTimes: number;
    effect: Function;
}

export interface INormalFiber extends ICommonFiber {
    key: string | number | null;
    type: string;
    pendingProps: IProps;
    memoizedProps?: IProps;
}

export const isCompFiber = (fiber: IFiber): fiber is ICompFiber => fiber.isComp;

export type IProperty = Partial<Omit<Element, "children">>;

export type FunctionCompType = () => IVNode;

export type ITaskCallback = ((time: boolean) => boolean) | null

export interface ITask {
    callback?: ITaskCallback
    fiber: IFiber
}

// fiber的Dom有三种处理方式：1.插入到上一个fiber的dom后2.仅更新3.删除，1和2又可以结合成既更新又插入。
export const enum EFlags {
    NO_FLAG = 0,
    PLACEMENT = 1 << 1,
    UPDATE = 1 << 2,
    UPDATE_AND_PLACEMENT = 1 << 1 | 1 << 2,
    DELETION = 1 << 3,
}