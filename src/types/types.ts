/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Type definitions for Etherscan API responses and blockchain transaction analysis data structures
 */

import { ArbitrageType } from "@src/constants/constants";

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
  
  /** Block number containing the analyzed transaction */
  blockNumber: string;

  /** Contract address */
  contract: string;

  /** Total value transferred from contract to main wallet in wei */
  profit: bigint;
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
}

export interface EtherscanEvent {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
}