/* tslint:disable */
/* eslint-disable */

/**
 * Convert an amount in foreign currency to SEK.
 */
export function convertAmount(amount: number, rate: number): number;

/**
 * Correct an imbalanced set of voucher lines.
 */
export function correctBalance(lines_json: string): string;

/**
 * Extract net amount from gross total: total / (1 + rate).
 */
export function extractNetAmount(total: number, treatment: string): number;

/**
 * Extract VAT amount from gross total: total - net.
 */
export function extractVatAmount(total: number, treatment: string): number;

/**
 * Get the VAT rate for a treatment code.
 */
export function getVatRate(treatment: string): number;

/**
 * SHA-256 hash of raw file bytes — used for deterministic client-side duplicate detection.
 * Returns the hash as a lowercase hex string (64 characters).
 */
export function hashFile(data: Uint8Array): string;

/**
 * Reverse-convert a SEK amount back to the original currency.
 */
export function reverseConvert(sek_amount: number, rate: number): number;

/**
 * Round a number to 2 decimal places (financial rounding, half-up).
 */
export function round2(value: number): number;

/**
 * Validate a Swedish BAS account number (4 digits, 1000-9999).
 */
export function validateAccountNumber(num: string): boolean;

/**
 * Validate that voucher lines balance (total debit == total credit).
 */
export function validateBalance(lines_json: string): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly correctBalance: (a: number, b: number) => [number, number, number, number];
    readonly extractNetAmount: (a: number, b: number, c: number) => number;
    readonly extractVatAmount: (a: number, b: number, c: number) => number;
    readonly getVatRate: (a: number, b: number) => number;
    readonly hashFile: (a: number, b: number) => [number, number];
    readonly validateAccountNumber: (a: number, b: number) => number;
    readonly validateBalance: (a: number, b: number) => [number, number, number];
    readonly convertAmount: (a: number, b: number) => number;
    readonly reverseConvert: (a: number, b: number) => number;
    readonly round2: (a: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
