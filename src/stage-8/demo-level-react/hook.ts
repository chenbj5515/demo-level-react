import {getCurrentFiber, reconcile} from './reconcile';
import { IFiber, IHook, IState, IEffect } from './types';

export interface ITransformer<T> {
    (oldState: T): T;
}

let curHook: IHook | null = null;

export const resetCursor = () => {
    const currentFiber = getCurrentFiber();
    curHook = currentFiber?.hooks || null;
}

const getHook = (fiber: IFiber, newHook: IHook) => {
    setHook(fiber, newHook);
    const cur = curHook;
    curHook = curHook?.next || null;
    return cur;
}

// 1.首次创建，且是第一个，这时需要设置fiber.hook这个链表表头和curHook这个全局变量
// 2.首次创建，且不是第一个，这时设置curHook为当前
// 3.非首次不需要进行操作，curHook在函数组件执行前会被重置为组件fiber的hooks即表头
const setHook = (fiber: IFiber, newHook: IState | IEffect | null) => {
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

export const useState = <T>(initialState: any) => {
    const compFiber = getCurrentFiber();
    if (!compFiber) throw new Error('hook获取组件fiber失败');
    const newHook = {
        state: initialState,
        next: null
    }
    let hook = getHook(compFiber, newHook) as IState;
    
    const getState = () => hook ? hook.state : initialState;
    return [
        getState(),
        (transformer: ITransformer<T>) => {
            hook.state = transformer(getState());
            compFiber.renderTimes++;
            reconcile(compFiber);
        }
    ]
}

export const isChanged = (prevDeps: any[] | undefined, curDeps: any[]) => {
    return !prevDeps || prevDeps.length !== curDeps.length || curDeps.some((arg, index) => arg !== prevDeps[index])
}

export const useEffect = (effect: any, deps: any[]) => {
    const compFiber = getCurrentFiber();
    if (!compFiber) throw new Error('hook获取组件fiber失败');
    let newHook = {
        effect,
        deps,
        next: null
    }
    let hook = getHook(compFiber, newHook) as IEffect;
    if (isChanged(hook?.deps, deps) || compFiber.renderTimes === 0) {
        // updateHook(newHook);
        hook.effect = effect;
        hook.deps = deps;
        effect();
    }
}

export const useReducer = () => {

}

export const useRef = () => {

}

export const useMemo = () => {

}

