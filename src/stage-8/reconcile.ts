import { IDom, IFiber,IVNode, LANE } from "../stage-8/types";
import { shedule, shouldYield } from "./schedule";

let wipRootFiber: IFiber | null = null;

export const creatRoot = (conatiner: IDom) => {
    function render(vNode: IVNode[]) {
        wipRootFiber = { 
            dom: conatiner,
            props: {
                children: vNode
            }
        }
        update(wipRootFiber);
    }
    return {
        render
    }
}

const generateNextFiber = (fiber: IFiber) => {
    return fiber;
}

const performUnitOfWork = (wipFiber: IFiber) => {
    if (wipFiber.type instanceof Function) {

    }
    return generateNextFiber(wipFiber);
}
 
const update = (fiber: IFiber) => {
    fiber.lane = LANE.DIRTY | LANE.UPDATE;
    shedule(() => {
        return reconcile(fiber);
    })
}

const reconcile = (WIP: IFiber) => {
    while (WIP && !shouldYield()) WIP = performUnitOfWork(WIP);
    commit()
}

export const getCurrentFiber = () => currentFiber