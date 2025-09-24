/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Contract transaction analyzer for comprehensive profit analysis and daily transaction monitoring on Ethereum blockchain
 */

import { EtherscanAPI } from "./etherscan";
import {
  EtherscanTransaction,
  TransactionProfit,
  DailyAnalysis,
} from "../types/types";
import { getTypeFromValue } from "@src/utils/utils";

/**
 * Comprehensive contract transaction analyzer that provides detailed profit analysis and performance metrics.
 * Integrates with Etherscan API to retrieve and analyze transaction data for specific contracts and time periods.
 */
export class ContractAnalyzer {
  /** Etherscan API instance for blockchain data retrieval */
  private etherscanAPI: EtherscanAPI;
  
  /** Target contract address for transaction analysis (normalized to lowercase) */
  private contractAddress: string;
  
  /** Main wallet address for profit calculation (normalized to lowercase) */
  private mainWalletAddress: string;

  /**
   * Initializes the contract analyzer with required API credentials and addresses.
   * @param {string} apiKey - Etherscan API key for authenticated requests
   * @param {string} contractAddress - Target contract address to analyze
   * @param {string} mainWalletAddress - Main wallet address for profit calculations
   */
  constructor(
    apiKey: string,
    contractAddress: string,
    mainWalletAddress: string
  ) {
    this.etherscanAPI = new EtherscanAPI(apiKey);
    this.contractAddress = contractAddress.toLowerCase();
    this.mainWalletAddress = mainWalletAddress.toLowerCase();
  }

  /**
   * Performs comprehensive analysis of all contract transactions for a specific date.
   * Retrieves transactions, calculates profits, and generates detailed daily analytics.
   * @param {string} date - Target date in YYYY-MM-DD format for analysis
   * @returns {Promise<DailyAnalysis>} Complete daily analysis including profit metrics and transaction details
   */
  async analyzeDailyTransactions(date: string): Promise<DailyAnalysis> {
    console.log(`\n🔍 Analyzing transactions for ${date}...`);

    // Parse input date string and create UTC timestamp range for precise filtering
    const [year, month, day] = date.split("-").map((term) => Number(term));

    // Create 24-hour timestamp range starting from 15:00 UTC
    const startTimestamp = Math.floor(
      Date.UTC(year, month - 1, day, 14, 0, 0) / 1000
    );
    const endTimestamp = startTimestamp + 86400; // Add 24 hours in seconds

    console.log(`📅 Time range: ${startTimestamp} to ${endTimestamp}`);

    // Retrieve blockchain block numbers corresponding to the timestamp range
    const latestBlock = await this.etherscanAPI.getLatestBlock();
    const startBlock = await this.etherscanAPI.getBlockByTimestamp(
      startTimestamp,
      "after"
    );
    
    // Handle future dates by using latest available block
    const currentTimestamp = Date.now() / 1000;
    let endBlock =
      endTimestamp > currentTimestamp
        ? latestBlock
        : await this.etherscanAPI.getBlockByTimestamp(endTimestamp, "before");

    // Ensure end block doesn't exceed the latest available block
    if (endBlock > latestBlock) {
      console.log(
        `⚠️  End block ${endBlock} is beyond latest block ${latestBlock}, using latest block`
      );
      endBlock = latestBlock;
    }

    console.log(`🏗️  Block range: ${startBlock} to ${endBlock}`);

    // Retrieve all transactions for the target contract within the block range
    const transactions = await this.etherscanAPI.getContractTransactions(
      this.contractAddress,
      startBlock,
      endBlock
    );

    console.log(`📦 Found ${transactions.length} transactions`);

    // Apply precise timestamp filtering to ensure exact date matching
    const dayTransactions = transactions.filter((tx) => {
      const txTimestamp = parseInt(tx.timeStamp);
      return txTimestamp >= startTimestamp && txTimestamp < endTimestamp;
    });

    console.log(
      `✅ ${dayTransactions.length} transactions match the exact date range`
    );

    // Process each transaction with detailed profit analysis
    const analyzedTransactions: TransactionProfit[] = [];

    for (let i = 0; i < dayTransactions.length; i++) {
      const tx = dayTransactions[i];
      console.log(
        `\n📋 Processing transaction ${i + 1}/${dayTransactions.length}: ${
          tx.hash
        }`
      );

      // Perform comprehensive transaction analysis including internal transactions
      const profit = await this.analyzeTransaction(tx);
      analyzedTransactions.push(profit);
    }

    // Calculate comprehensive daily metrics and aggregated statistics
    const totalProfit = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.netProfit,
      BigInt(0)
    );
    const totalGasFees = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.gasFee,
      BigInt(0)
    );
    const totalInternalValue = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.totalInternalValue,
      BigInt(0)
    );

    return {
      date,
      transactions: analyzedTransactions,
      totalProfit,
      totalTransactions: analyzedTransactions.length,
      totalGasFees,
      totalInternalValue,
    };
  }

  /**
   * Analyzes a single transaction to calculate detailed profit metrics and internal value flows.
   * Examines gas fees, internal transactions, and value transfers to determine net profitability.
   * @param {EtherscanTransaction} tx - Transaction object to analyze
   * @returns {Promise<TransactionProfit>} Detailed profit analysis including all value flows
   */
  private async analyzeTransaction(
    tx: EtherscanTransaction
  ): Promise<TransactionProfit> {
    // Calculate total gas fees paid for transaction execution
    const gasFee = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);

    // Retrieve all internal transactions to analyze value flows
    const internalTxs = await this.etherscanAPI.getInternalTransactions(
      tx.hash
    );

    // Filter internal transactions from contract to main wallet (profit extraction)
    const contractToWalletTxs = internalTxs.filter(
      (itx) =>
        itx.from.toLowerCase() === this.contractAddress &&
        itx.to.toLowerCase() === this.mainWalletAddress
    );

    // Filter internal transactions from contract to transaction originator (refunds/returns)
    const contractToOriginTxs = internalTxs.filter(
      (itx) =>
        itx.from.toLowerCase() === this.contractAddress &&
        itx.to.toLowerCase() === tx.from.toLowerCase() &&
        itx.to.toLowerCase() !== this.mainWalletAddress
    );

    // Calculate total value transferred from contract to main wallet
    const contractToWalletValue = contractToWalletTxs.reduce(
      (sum, itx) => sum + BigInt(itx.value),
      BigInt(0)
    );

    // Calculate total value transferred from contract to transaction originator
    const contractToOriginValue = contractToOriginTxs.reduce(
      (sum, itx) => sum + BigInt(itx.value),
      BigInt(0)
    );

    // Calculate total internal value and net profit after gas fees
    const totalInternalValue = contractToWalletValue + contractToOriginValue;
    const netProfit = totalInternalValue - gasFee;
    const value = BigInt(tx.value);

    return {
      hash: tx.hash,
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      blockNumber: tx.blockNumber,
      gasFee,
      contractToWalletValue,
      contractToOriginValue,
      totalInternalValue,
      netProfit,
      from: tx.from,
      type: getTypeFromValue(value)
    };
  }
}