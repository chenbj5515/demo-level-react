import {IProps} from "./types";

function createElementByType(type: string) {

}

export const createFiberDom = (type: string, props: IProps) => {
    const fiberDom = createElementByType(type);
    return document.createElement(type)
}