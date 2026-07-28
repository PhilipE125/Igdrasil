/**
 * Client-side accounting engine (Rust compiled to WebAssembly).
 *
 * Same logic that runs server-side via PyO3 — one source of truth.
 * Lazily loaded: first call triggers ~130KB WASM download, then instant.
 *
 * Usage:
 *   import { getEngine } from "@/lib/accounting-engine";
 *   const engine = await getEngine();
 *   const result = engine.validateBalance(linesJson);
 */

import type * as WasmTypes from "@/wasm/accounting-engine/accounting_engine_wasm";

let _instance: typeof WasmTypes | null = null;
let _loading: Promise<typeof WasmTypes> | null = null;

/**
 * Get the accounting engine WASM instance (lazy-loaded, cached).
 * First call downloads ~130KB WASM; subsequent calls are instant.
 */
export async function getEngine(): Promise<typeof WasmTypes> {
  if (_instance) return _instance;
  if (_loading) return _loading;

  _loading = import("@/wasm/accounting-engine/accounting_engine_wasm").then(
    async (mod) => {
      // Initialize the WASM module — must be called before any exports work
      if (typeof mod.default === "function") {
        await mod.default();
      }
      _instance = mod;
      return mod;
    },
  );

  return _loading;
}

// ── Convenience wrappers (sync after first load) ────────────────────────────

export interface BalanceResult {
  is_valid: boolean;
  total_debit: number;
  total_credit: number;
  difference: number;
}

/**
 * Validate voucher line balance — returns null if WASM not loaded yet.
 * For use in React components where you can't await.
 */
export function validateBalanceSync(
  lines: Array<{ debit: number; credit: number }>,
): BalanceResult | null {
  if (!_instance) return null;
  return _instance.validateBalance(JSON.stringify(lines)) as BalanceResult;
}

/**
 * Convert foreign currency to SEK — returns null if WASM not loaded.
 */
export function convertAmountSync(amount: number, rate: number): number | null {
  if (!_instance) return null;
  return _instance.convertAmount(amount, rate);
}

/**
 * Extract VAT amount from gross total — returns null if WASM not loaded.
 */
export function extractVatAmountSync(
  total: number,
  treatment: string,
): number | null {
  if (!_instance) return null;
  return _instance.extractVatAmount(total, treatment);
}

/**
 * Round to 2 decimal places (financial rounding) — returns null if WASM not loaded.
 */
export function round2Sync(value: number): number | null {
  if (!_instance) return null;
  return _instance.round2(value);
}

/**
 * SHA-256 hash of raw file bytes via Rust/WASM.
 * Returns a 64-character lowercase hex string.
 * First call loads the WASM module (~130KB); subsequent calls are instant (~1ms per file).
 */
export async function hashFileBytes(data: Uint8Array): Promise<string> {
  const engine = await getEngine();
  return engine.hashFile(data);
}

// ── Reports (Rust core, newly exposed to WASM) ─────────────────────────────

/**
 * Compute trial balance client-side — returns null if WASM not loaded.
 */
export function computeTrialBalanceSync(accountsJson: string): string | null {
  if (!_instance) return null;
  return _instance.computeTrialBalance(accountsJson);
}

/**
 * Compute income statement client-side — returns null if WASM not loaded.
 */
export function computeIncomeStatementSync(accountsJson: string): string | null {
  if (!_instance) return null;
  return _instance.computeIncomeStatement(accountsJson);
}

/**
 * Compute balance sheet client-side — returns null if WASM not loaded.
 */
export function computeBalanceSheetSync(
  accountsJson: string,
  periodResult: number,
): string | null {
  if (!_instance) return null;
  return _instance.computeBalanceSheet(accountsJson, periodResult);
}

/**
 * Compute general ledger for one account — returns null if WASM not loaded.
 */
export function computeGeneralLedgerSync(
  accountNumber: string,
  accountName: string,
  openingBalance: number,
  transactionsJson: string,
): string | null {
  if (!_instance) return null;
  return _instance.computeGeneralLedger(
    accountNumber,
    accountName,
    openingBalance,
    transactionsJson,
  );
}

/**
 * Compute momsdeklaration client-side — returns null if WASM not loaded.
 */
export function computeMomsdeklarationSync(
  balancesJson: string,
): string | null {
  if (!_instance) return null;
  return _instance.computeMomsdeklaration(balancesJson);
}

/**
 * Compute year-end closing entries — returns null if WASM not loaded.
 */
export function computeYearEndSync(balancesJson: string): string | null {
  if (!_instance) return null;
  return _instance.computeYearEnd(balancesJson);
}

/**
 * Compute FX revaluation — returns null if WASM not loaded.
 */
export function computeRevaluationSync(
  positionsJson: string,
  closingRate: number,
): string | null {
  if (!_instance) return null;
  return _instance.computeRevaluation(positionsJson, closingRate);
}

// ── New classification functions ────────────────────────────────────────────

/**
 * Classify VAT treatment from country code and rate — returns null if WASM not loaded.
 */
export function classifyVatTreatmentSync(
  countryCode: string,
  vatRate: number,
): string | null {
  if (!_instance) return null;
  return _instance.classifyVatTreatment(countryCode, vatRate);
}

/**
 * Check if a country is in the EU — returns null if WASM not loaded.
 */
export function isEuCountrySync(code: string): boolean | null {
  if (!_instance) return null;
  return _instance.isEuCountry(code);
}

/**
 * Get semantic account type for a BAS number — returns null if WASM not loaded.
 */
export function getSemanticTypeSync(
  accountNumber: string,
): string | null {
  if (!_instance) return null;
  return _instance.getSemanticType(accountNumber);
}
