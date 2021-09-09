import {ITask} from './types';

const transitions: Function[] = [];
let deadline = 0;
const queue: ITask[] = [];
const threshold: number = 1000 / 60;

export const shedule = (callback: Function) => {
    queue.push({callback});
    startTransition(flush);
}

export const startTransition = (cb: Function) => {
    transitions.push(cb) && postMessage();
}

const postMessage = () => {
    const cb = () => transitions.forEach(cb => cb());
    const {port1, port2} = new MessageChannel();
    port1.onmessage = cb;
    return () => port2.postMessage(null);
}

const flush = () => {
    deadline = getTime() + threshold;
    let job = queue[0];
    while (job && !shouldYield) {
        const {callback} = job;
        job.callback = null;
        const next = callback();
        if (next) {
            job.callback = next;
        } else {
            queue.shift();
        }
        job = queue[0];
    }
    job && startTransition(flush);
}

// 当检测到用户IO行为，那么就立即yield让出线程，来保证用户交互优先执行
// 或者执行时间超过阈值，表明fiber🌲的建立耗时过长了，也应该yield
export const shouldYield = () => (navigator as any)?.scheduling?.isInputPending() || getTime() >= deadline;

export const getTime = () => performance.now();

