import {IDOMProps} from '../../stage-3/types';

export const specKeysof = <T>(target: T) => Object.keys(target) as (keyof T)[];

export const isEvent = (propKey: string) => propKey.startsWith('on');

export const isNormalProp = (propKey: string) => propKey !== 'children' && !isEvent(propKey);

export const isNewValueProp = (prevProps: IDOMProps, nextProps: IDOMProps) => (propKey: string) => prevProps[propKey] !== nextProps[propKey];

export const isGoneProp =  (prevProps: IDOMProps, nextProps: IDOMProps) => (propKey: string) => !(propKey in nextProps);
