import {getCurrentFiber, reconcile} from './reconcile';
import { IFiber, IHook, IStateHook, IEffectHook, IRefHook, IRef } from './types';

export interface ITransformer<T> {
    (oldState: T): T;
}

let curHook: IHook<any> | null = null;

export const resetCursor = () => {
    const currentFiber = getCurrentFiber();
    curHook = currentFiber?.hooks || null;
}

const getHook = <T>(fiber: IFiber, newHook: IHook<T>) => {
    setHook<T>(fiber, newHook);
    const cur = curHook;
    curHook = curHook?.next || null;
    return cur;
}

// 1.首次创建，且是第一个，这时需要设置fiber.hook这个链表表头和curHook这个全局变量
// 2.首次创建，且不是第一个，这时设置curHook为当前
// 3.非首次不需要进行操作，curHook在函数组件执行前会被重置为组件fiber的hooks即表头
const setHook = <T>(fiber: IFiber, newHook: IHook<T>) => {
    // case 1
    if (!fiber.hooks) {
        fiber.hooks = newHook;
        curHook = newHook;
    }
    // case 2
    else if (!curHook) {
        curHook = newHook;
    }
}

export const useState = <T>(initialState: T) => {
    const compFiber = getCurrentFiber();
    if (!compFiber) throw new Error('hook获取组件fiber失败');
    const newHook = {
        state: initialState,
        next: null
    }
    let hook = getHook(compFiber, newHook) as IStateHook<T>;
    
    const getState = () => hook ? hook.state : initialState;
    const result: [T, ((transformer: ITransformer<T>) => void)] = [
        getState(),
        (transformer: ITransformer<T> | T) => {
            hook.state = typeof transformer === 'function' ? (transformer as Function)(getState()) : transformer;
            compFiber.renderTimes++;
            reconcile(compFiber);
        }
    ];
    return result;
}

export const isChanged = (prevDeps: any[] | undefined, curDeps: any[]) => {
    return !prevDeps || prevDeps.length !== curDeps.length || curDeps.some((arg, index) => arg !== prevDeps[index])
}

export const useEffect = (effect: any, deps: any[]) => {
    const compFiber = getCurrentFiber();
    if (!compFiber) throw new Error('hook获取组件fiber失败');
    const newHook = {
        effect,
        deps,
        next: null
    }
    let hook = getHook(compFiber, newHook) as IEffectHook;
    if (isChanged(hook?.deps, deps) || compFiber.renderTimes === 0) {
        hook.effect = effect;
        hook.deps = deps;
        compFiber.effect = effect;
    }
}

type Reducer<S, A> = (prevState: S, action: A) => S;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
type Dispatch<A> = (value: A) => void;

export const useReducer = <R extends Reducer<any, any>>(reducer: R, initialState: ReducerState<R>) => {
        const compFiber = getCurrentFiber();
        if (!compFiber) throw new Error('hook获取组件fiber失败');
        const newHook = {
            state: typeof initialState === 'undefined' ? null : initialState,
            next: null
        }
        let hook = getHook(compFiber, newHook) as IStateHook<ReducerState<R>>;
        
        const getState = () => hook ? hook.state : initialState;
        const result: [ReducerState<R>, Dispatch<ReducerAction<R>>] = [
            getState(),
            (action: ReducerAction<R>) => {
                hook.state = reducer(getState(), action);
                compFiber.renderTimes++;
                reconcile(compFiber);
            }
        ];
        return result;
}

export const useRef = <T>(initialValue?: T) => {
    const compFiber = getCurrentFiber();
    if (!compFiber) throw new Error('hook获取组件fiber失败');
    const ref: IRef<T> = {current: typeof initialValue === 'undefined' ? null : initialValue};
    const newHook = {
        ref,
        next: null
    }
    let hook = getHook(compFiber, newHook) as IRefHook<T>;
    console.log(hook.ref, 'ref hook');
    
    return hook.ref;
}

export const useMemo = () => {

}

