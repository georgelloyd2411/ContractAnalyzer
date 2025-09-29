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
import { Environment } from "@src/constants/environment";

/**
 * Comprehensive contract transaction analyzer that provides detailed profit analysis and performance metrics.
 * Integrates with Etherscan API to retrieve and analyze transaction data for specific contracts and time periods.
 */
export class ContractAnalyzer {
  /** Etherscan API instance for blockchain data retrieval */
  private etherscanAPI: EtherscanAPI;
  
  /** Main wallet address for profit calculation (normalized to lowercase) */
  private mainWalletAddress: string;

  /**
   * Initializes the contract analyzer with required API credentials and addresses.
   * @param {string} apiKey - Etherscan API key for authenticated requests
   * @param {string} mainWalletAddress - Main wallet address for profit calculations
   */
  constructor(
    apiKey: string,
    mainWalletAddress: string
  ) {
    this.etherscanAPI = new EtherscanAPI(apiKey);
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
      Date.UTC(year, month - 1, day, 15, 0, 0) / 1000
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

    const internalTransactions = await this.etherscanAPI.getInternalTransactionsByAddress(
      this.mainWalletAddress,
      startBlock,
      endBlock
    )

    console.log(`📦 Found ${internalTransactions.length} transactions`);

    console.log(internalTransactions);
    console.log(startTimestamp);
    console.log(endTimestamp);

    // Apply precise timestamp filtering to ensure exact date matching
    const dayTransactions = internalTransactions.filter((tx) => {
      const txTimestamp = parseInt(tx.timeStamp);
      return txTimestamp >= startTimestamp && txTimestamp < endTimestamp && tx.to.toLowerCase() === Environment.WALLET_ADDRESS;
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
      analyzedTransactions.push({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        contract: tx.from,
        profit: BigInt(tx.value),
      });
    }

    // Calculate comprehensive daily metrics and aggregated statistics
    const totalProfit = analyzedTransactions.reduce(
      (sum, tx) => sum + tx.profit,
      BigInt(0)
    );

    return {
      date,
      transactions: analyzedTransactions,
      totalProfit,
      totalTransactions: analyzedTransactions.length,
    };
  }
}