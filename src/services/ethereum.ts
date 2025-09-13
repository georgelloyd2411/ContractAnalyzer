/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Ethereum blockchain utility class providing essential RPC operations for block and log data retrieval
 */

import { Environment } from "@src/constants/environment"
import { JsonRpcProvider, Log } from "ethers"

/**
 * Ethereum blockchain utility class that provides essential RPC operations for interacting with the Ethereum network.
 * Offers standardized methods for block number retrieval and event log filtering with error handling.
 */
export class Ethereum {
  /**
   * Retrieves the current latest block number from the Ethereum blockchain.
   * Used for determining the current state of the blockchain and setting upper bounds for queries.
   * @returns {Promise<number>} The latest block number on the connected Ethereum network
   */
  static getLatestBlockNumber = async(): Promise<number> => {
    // Initialize JSON-RPC provider using configured endpoint for blockchain communication
    const provider = new JsonRpcProvider(Environment.RPC_URL);

    // Query the blockchain for the most recent block number
    const latestBlock = await provider.getBlockNumber();
    return latestBlock;
  }

  /**
   * Retrieves event logs filtered by contract address and event topic within a specified block range.
   * Provides comprehensive error handling to ensure stability during network connectivity issues.
   * @param {string} address - Contract address to filter logs from
   * @param {string} topic - Event topic hash to filter specific event types
   * @param {number} fromBlock - Starting block number for log retrieval (inclusive)
   * @param {number} toBlock - Ending block number for log retrieval (inclusive)
   * @returns {Promise<Log[]>} Array of matching log entries, empty array if error occurs
   */
  static getLogsByAddressAndTopic = async (address: string, topic: string, fromBlock: number, toBlock: number): Promise<Log[]> => {
    try {
      // Initialize JSON-RPC provider for blockchain log queries
      const provider = new JsonRpcProvider(Environment.RPC_URL);

      // Execute filtered log query with specified parameters
      const logs = await provider.getLogs({
        address: address,        // Target contract address for log filtering
        topics: [topic],         // Event topic array for specific event filtering
        fromBlock: fromBlock,    // Starting block for historical log retrieval
        toBlock: toBlock         // Ending block to limit query scope
      });

      return logs;
    } catch (error) {
      // Log error details for debugging while maintaining service stability
      console.error(error);
      return []; // Return empty array to prevent downstream failures
    }
  }
}