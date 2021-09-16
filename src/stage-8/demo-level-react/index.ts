import {createVNode} from './vnode';
import {creatRoot} from './reconcile';

export * from './hook';
export * from './types';

export default {
    createElement: createVNode,
    creatRoot,
}