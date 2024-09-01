export declare const isValidDUI: (dui: string | number) => boolean;
export declare const formatDUI: (dui: string | number) => string;
export declare const isValidNIT: (nit: string | number, allowDUI?: boolean) => boolean;
export declare const formatNIT: (nit: string | number, allowDUI?: boolean) => string;
declare const _default: {
    isValidDUI: (dui: string | number) => boolean;
    formatDUI: (dui: string | number) => string;
    isValidNIT: (nit: string | number, allowDUI?: boolean) => boolean;
    formatNIT: (nit: string | number, allowDUI?: boolean) => string;
};
export default _default;