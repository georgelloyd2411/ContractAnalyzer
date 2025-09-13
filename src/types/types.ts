/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Type definitions for Etherscan API responses and blockchain transaction analysis data structures
 */

/**
 * Represents a standard Ethereum transaction as returned by the Etherscan API.
 * Contains comprehensive transaction metadata including gas information, addresses, and execution details.
 */
export interface EtherscanTransaction {
  /** Block number where the transaction was included */
  blockNumber: string;
  
  /** Unix timestamp when the transaction was mined */
  timeStamp: string;
  
  /** Unique transaction hash identifier */
  hash: string;
  
  /** Transaction nonce from the sender's account */
  nonce: string;
  
  /** Hash of the block containing this transaction */
  blockHash: string;
  
  /** Position index of the transaction within its block */
  transactionIndex: string;
  
  /** Ethereum address of the transaction sender */
  from: string;
  
  /** Ethereum address of the transaction recipient */
  to: string;
  
  /** Amount of ETH transferred in wei */
  value: string;
  
  /** Gas limit set for the transaction */
  gas: string;
  
  /** Gas price paid per unit in wei */
  gasPrice: string;
  
  /** Actual gas consumed during transaction execution */
  gasUsed: string;
  
  /** Total gas used by all transactions up to this point in the block */
  cumulativeGasUsed: string;
  
  /** Transaction input data (calldata) */
  input: string;
  
  /** Number of confirmations received for this transaction */
  confirmations: string;
  
  /** Flag indicating whether the transaction failed (0 = success, 1 = error) */
  isError: string;
}

/**
 * Represents an internal transaction generated during contract execution.
 * Captures value transfers and contract calls that occur within a main transaction.
 */
export interface InternalTransaction {
  /** Block number where the internal transaction occurred */
  blockNumber: string;
  
  /** Unix timestamp of the parent transaction */
  timeStamp: string;
  
  /** Hash of the parent transaction containing this internal transaction */
  hash: string;
  
  /** Source address for the internal value transfer */
  from: string;
  
  /** Destination address for the internal value transfer */
  to: string;
  
  /** Amount of ETH transferred internally in wei */
  value: string;
  
  /** Contract address involved in the internal transaction */
  contractAddress: string;
  
  /** Input data for the internal contract call */
  input: string;
  
  /** Type of internal transaction (call, delegatecall, staticcall, etc.) */
  type: string;
  
  /** Gas allocated for the internal transaction */
  gas: string;
  
  /** Gas actually consumed by the internal transaction */
  gasUsed: string;
  
  /** Unique trace identifier for debugging and analysis */
  traceId: string;
  
  /** Error status flag (0 = success, 1 = error) */
  isError: string;
  
  /** Error code if the internal transaction failed */
  errCode: string;
}

/**
 * Comprehensive profit analysis result for a single transaction.
 * Contains detailed financial metrics including gas costs and value flows.
 */
export interface TransactionProfit {
  /** Unique transaction hash identifier */
  hash: string;
  
  /** ISO timestamp when the transaction was executed */
  timestamp: string;
  
  /** Block number containing the analyzed transaction */
  blockNumber: string;
  
  /** Total gas fees paid for transaction execution in wei */
  gasFee: bigint;
  
  /** Total value transferred from contract to main wallet in wei */
  contractToWalletValue: bigint;
  
  /** Total value transferred from contract to transaction originator in wei */
  contractToOriginValue: bigint;
  
  /** Combined internal value transfers from the contract in wei */
  totalInternalValue: bigint;
  
  /** Net profit after deducting gas fees in wei */
  netProfit: bigint;
  
  /** Original transaction sender address */
  from: string;
}

/**
 * Aggregated daily analysis containing all transactions and comprehensive metrics.
 * Provides complete financial overview for a specific date period.
 */
export interface DailyAnalysis {
  /** Date of analysis in YYYY-MM-DD format */
  date: string;
  
  /** Array of all analyzed transactions with profit calculations */
  transactions: TransactionProfit[];
  
  /** Total net profit for the day across all transactions in wei */
  totalProfit: bigint;
  
  /** Count of transactions processed during the analysis period */
  totalTransactions: number;
  
  /** Sum of all gas fees paid during the day in wei */
  totalGasFees: bigint;
  
  /** Total internal value transfers recorded for the day in wei */
  totalInternalValue: bigint;
}