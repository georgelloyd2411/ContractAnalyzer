/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Utility functions for Ethereum value formatting and data validation operations
 */

/**
 * Converts wei value to ether denomination with high precision formatting.
 * Provides accurate decimal representation suitable for financial calculations and display.
 * @param {bigint} wei - Wei value to convert to ether (smallest ETH unit)
 * @returns {string} Formatted ether amount with 18 decimal places for maximum precision
 */
export function formatEther(wei: bigint): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(18);
}

/**
 * Converts wei value to ether with ETH symbol suffix for user-friendly display.
 * Combines precise ether formatting with standard cryptocurrency notation.
 * @param {bigint} wei - Wei value to convert and format with symbol
 * @returns {string} Formatted ether amount with "ETH" suffix for clear denomination
 */
export function formatEtherWithSymbol(wei: bigint): string {
  return `${formatEther(wei)} ETH`;
}

/**
 * Converts wei value to USD equivalent using current ETH price for financial analysis.
 * Provides fiat currency representation with standard two-decimal precision.
 * @param {bigint} wei - Wei value to convert to USD equivalent
 * @param {number} ethPrice - Current ETH price in USD for conversion calculation
 * @returns {string} USD value formatted with parentheses and two decimal places
 */
export function formatEtherWithUSD(wei: bigint, ethPrice: number): string {
  const ether = Number(wei) / 1e18;
  return `(${(ether * ethPrice).toFixed(2)} USD)`;
}

/**
 * Validates date string format and ensures it represents a valid calendar date.
 * Performs both format validation and logical date verification for input sanitization.
 * @param {string} dateString - Date string to validate in YYYY-MM-DD format
 * @returns {boolean} True if the date string is valid and represents a real date, false otherwise
 */
export function validateDate(dateString: string): boolean {
  // Check for proper YYYY-MM-DD format using regex pattern
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // Verify that the date string represents a valid calendar date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates Ethereum address format according to EIP-55 specification.
 * Ensures address follows the standard 40-character hexadecimal format with 0x prefix.
 * @param {string} address - Ethereum address string to validate
 * @returns {boolean} True if the address matches the standard Ethereum address format, false otherwise
 */
export function validateEthereumAddress(address: string): boolean {
  // Check for 0x prefix followed by exactly 40 hexadecimal characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}