import {getCurrentFiber} from './reconcile';

export const useState = (initialState: any) => {
    return [
        initialState,
        () => {
            const currentFiber = getCurrentFiber();
        }
    ]
}

export const useEffect = () => {

}

export const useReducer = () => {

}

export const useRef = () => {

}

export const useMemo = () => {

}

