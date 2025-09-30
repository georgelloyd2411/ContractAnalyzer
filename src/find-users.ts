/**
 * @author Lloyd
 * @date 2025/09/06
 * @description Bebop transaction analysis utility for extracting unique contract addresses from event-based transaction data
 */

import fs from "fs";
import pMap from "p-map";
import { EtherscanEvent } from "./types/types";
import { Ethereum } from "./services/ethereum";

/**
 * Main execution function that processes Bebop event data to extract unique contract addresses.
 * Analyzes transaction hashes from events, retrieves transaction details, and identifies target contracts.
 */
const main = async () => {
  // Load Bebop event data from previously generated JSON file for transaction analysis
  const events: EtherscanEvent[] = JSON.parse(fs.readFileSync("./data/bebop-events.json", "utf-8"));
  
  // Create set for efficient deduplication of transaction hashes from multiple events
  const hashSet = new Set<string>();
  events.map((event) => hashSet.add(event.transactionHash));
  
  console.log(`Found ${hashSet.size} transactions`);
  
  // Convert set to array for parallel processing optimization
  const hashes = [...hashSet.values()];

  // Execute parallel transaction detail retrieval for all unique transaction hashes
  const results = await pMap(
    hashes,
    async (hash) => {
      // Retrieve complete transaction data from blockchain using transaction hash
      const transaction = await Ethereum.getTransactionByHash(hash);
      
      // Extract target contract address from transaction, defaulting to empty string if null
      return transaction?.to ?? "";
    },
    {
      concurrency: 100,     // Process up to 100 requests simultaneously for optimal throughput
      stopOnError: false    // Continue processing remaining hashes even if individual requests fail
    }
  );

  // Create set of unique contract addresses, filtering out any empty strings from failed requests
  const contracts = new Set<string>(results);
  
  console.log(`Found ${contracts.size} contracts`);
  
  // Export unique contract addresses to JSON file for persistent storage and further analysis
  fs.writeFileSync("./data/bebop-contracts.json", JSON.stringify([...contracts.values()]));
}

// Execute the Bebop contract address extraction analysis
main();