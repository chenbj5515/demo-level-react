export const exist = (val?: any | null): val is any => typeof val !== 'undefined' && val !== null;

export const shallowEqual = (a: Object, b: Object) => Object.is(a, b);
