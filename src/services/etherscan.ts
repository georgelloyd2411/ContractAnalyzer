/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Etherscan API client for comprehensive blockchain data retrieval and transaction analysis on Ethereum mainnet
 */

import axios from "axios";
import { EtherscanEvent, EtherscanTransaction, InternalTransaction } from "../types/types";
import { sleep } from "@src/utils/utils";

/**
 * Comprehensive Etherscan API client that provides standardized access to Ethereum blockchain data.
 * Offers methods for block information, transaction history, and internal transaction analysis with robust error handling.
 */
export class EtherscanAPI {
  /** Etherscan API key for authenticated requests */
  private apiKey: string;
  
  /** Base URL for Etherscan API v2 endpoints targeting Ethereum mainnet */
  private baseUrl = "https://api.etherscan.io/v2/api?chainid=1";

  /**
   * Initializes the Etherscan API client with authentication credentials.
   * @param {string} apiKey - Valid Etherscan API key for authenticated requests
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Retrieves the current latest block number from the Ethereum blockchain.
   * Uses the eth_blockNumber proxy method for real-time blockchain state information.
   * @returns {Promise<number>} The latest block number on Ethereum mainnet
   * @throws {Error} When API request fails or returns invalid data
   */
  async getLatestBlock(): Promise<number> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "proxy",              // Proxy module for direct Ethereum RPC calls
          action: "eth_blockNumber",    // Standard Ethereum RPC method
          apikey: this.apiKey,
        },
      });

      if (response.data.result) {
        // Convert hexadecimal block number to decimal integer
        return parseInt(response.data.result, 16);
      }
      throw new Error("Failed to get latest block number");
    } catch (error) {
      throw new Error(`Error fetching latest block: ${error}`);
    }
  }

  /**
   * Retrieves the block number closest to a specified timestamp.
   * Useful for time-based blockchain queries and historical data analysis.
   * @param {number} timestamp - Unix timestamp to find the closest block for
   * @param {"before" | "after"} closest - Direction to search for the closest block (default: "before")
   * @returns {Promise<number>} Block number closest to the specified timestamp
   * @throws {Error} When API request fails or timestamp is invalid
   */
  async getBlockByTimestamp(
    timestamp: number,
    closest: "before" | "after" = "before"
  ): Promise<number> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "block",                // Block-related API module
          action: "getblocknobytime",     // Timestamp-to-block conversion action
          timestamp: timestamp,           // Target Unix timestamp
          closest: closest,               // Search direction preference
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return parseInt(response.data.result);
      }
      throw new Error(`Failed to get block for timestamp ${timestamp}`);
    } catch (error) {
      throw new Error(`Error fetching block by timestamp: ${error}`);
    }
  }

  /**
   * Retrieves all transactions for a specific contract within a defined block range.
   * Provides comprehensive transaction history for contract analysis and monitoring.
   * @param {string} contractAddress - Target contract address for transaction retrieval
   * @param {number} startBlock - Starting block number for transaction search (inclusive)
   * @param {number} endBlock - Ending block number for transaction search (inclusive)
   * @returns {Promise<EtherscanTransaction[]>} Array of transactions involving the specified contract
   * @throws {Error} When API request fails or contract address is invalid
   */
  async getContractTransactions(
    contractAddress: string,
    startBlock: number,
    endBlock: number
  ): Promise<EtherscanTransaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "account",              // Account-related API module
          action: "txlist",               // Transaction list retrieval action
          address: contractAddress,       // Target contract address
          startblock: startBlock,         // Block range start
          endblock: endBlock,             // Block range end
          page: 1,                        // Pagination page number
          offset: 10000,                  // Maximum results per request
          sort: "asc",                    // Chronological sorting order
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }
      return []; // Return empty array if no transactions found
    } catch (error) {
      throw new Error(`Error fetching contract transactions: ${error}`);
    }
  }

  /**
   * Retrieves internal transactions for a specific transaction hash.
   * Essential for analyzing complex contract interactions and value flows within transactions.
   * @param {string} txHash - Transaction hash to retrieve internal transactions for
   * @returns {Promise<InternalTransaction[]>} Array of internal transactions, empty if none found
   */
  async getInternalTransactions(
    txHash: string
  ): Promise<InternalTransaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "account",                // Account-related API module
          action: "txlistinternal",         // Internal transaction list action
          txhash: txHash,                   // Target transaction hash
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }
      return []; // Return empty array if no internal transactions found
    } catch (error) {
      // Use warning instead of error to prevent disrupting main analysis flow
      console.warn(
        `Warning: Could not fetch internal transactions for ${txHash}: ${error}`
      );
      return [];
    }
  }

  /**
   * Retrieves internal transactions for a specific transaction hash.
   * Essential for analyzing complex contract interactions and value flows within transactions.
   * @param {string} txHash - Transaction hash to retrieve internal transactions for
   * @returns {Promise<InternalTransaction[]>} Array of internal transactions, empty if none found
   */
  async getInternalTransactionsByAddress(
    address: string,
    startblock: number,
    endblock: number,
  ): Promise<InternalTransaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "account",                // Account-related API module
          action: "txlistinternal",         // Internal transaction list action
          address: address,                   // Target transaction hash
          apikey: this.apiKey,
          startblock: startblock,
          endblock: endblock
        },
      });

      if (response.data.status === "1") {
        return response.data.result;
      }
      return []; // Return empty array if no internal transactions found
    } catch (error) {
      // Use warning instead of error to prevent disrupting main analysis flow
      console.warn(
        `Warning: Could not fetch internal transactions for ${address}: ${error}`
      );
      return [];
    }
  }

  /**
   * Retrieves the current ETH price in USD from Etherscan's price oracle.
   * Used for converting wei values to USD equivalents in financial analysis.
   * @returns {Promise<number>} Current ETH price in USD, 0 if retrieval fails
   */
  async getEthPrice(): Promise<number> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "stats",              // Statistics API module
          action: "ethprice",           // ETH price retrieval action
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "1") {
        return response.data.result.ethusd; // Extract USD price from response
      }
      return 0;
    } catch (error) {
      // Use warning to maintain service stability during price retrieval failures
      console.warn(`Warning: Could not fetch current ETH price: ${error}`);
      return 0;
    }
  }

  /**
   * Get event logs of address and filter by topic
   * @param from : start block number
   * @param to : end block number
   * @param address : contract address
   * @param topic : event topic
   * @returns contract events
   */
  async getEventLogsByAddressAndTopic(from: number, to: number, address: string, topic: string): Promise<EtherscanEvent[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: "logs",
          action: "getLogs",
          fromBlock: from,
          toBlock: to,
          address: address,
          topic0: topic,
          apikey: this.apiKey,
        }
      });
      if (response.data.status !== "1") {
        console.log("Wait for 1 secs and run again");
        await sleep(1000);
        const response = await axios.get(this.baseUrl, {
          params: {
            module: "logs",
            action: "getLogs",
            fromBlock: from,
            toBlock: to,
            address: address,
            topic0: topic,
            apikey: this.apiKey,
          }
        });
        return response.data.result;
      }
      return response.data.result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  /**
   * Get all event logs of contract and filtered by topic in given block range
   * @param address : Contract Address
   * @param topic : Event topic
   * @param from : Start block number
   * @param to : End block number
   * @returns : Array of events
   */
  async getEventLogsByAddress(address: string, topic: string, from: number, to: number): Promise<EtherscanEvent[]> {
    const result = [];
    for (let i = from; i <= to; i += 1000) {
      console.log(`Fetch events from ${i} to ${i + 1000}`);
      const events = await this.getEventLogsByAddressAndTopic(
        i,
        to > i + 1000 ? i + 1000 : to,
        address,
        topic
      );
      console.log(`Get ${events.length} events`);
      result.push(...events);
    }
    return result;
  }
}