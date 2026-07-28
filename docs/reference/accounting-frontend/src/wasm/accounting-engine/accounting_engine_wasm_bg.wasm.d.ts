/* tslint:disable */
 
export const memory: WebAssembly.Memory;
export const correctBalance: (a: number, b: number) => [number, number, number, number];
export const extractNetAmount: (a: number, b: number, c: number) => number;
export const extractVatAmount: (a: number, b: number, c: number) => number;
export const getVatRate: (a: number, b: number) => number;
export const hashFile: (a: number, b: number) => [number, number];
export const validateAccountNumber: (a: number, b: number) => number;
export const validateBalance: (a: number, b: number) => [number, number, number];
export const convertAmount: (a: number, b: number) => number;
export const reverseConvert: (a: number, b: number) => number;
export const round2: (a: number) => number;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
