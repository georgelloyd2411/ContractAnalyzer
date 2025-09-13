/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Swaap protocol event log extraction utility that fetches swap transaction data from Ethereum blockchain
 */

import { Log } from "ethers";
import { EthereumConstants } from "./constants/ethereum.constants"
import { Ethereum } from "./services/ethereum"
import fs from "fs";

/**
 * Main execution function that retrieves all Swaap swap events from a specified block range.
 * Processes blockchain data in batches to avoid RPC limitations and exports transaction hashes to JSON file.
 */
const main = async () => {
  // Define blockchain scanning parameters for comprehensive event retrieval
  const startBlock = 17598578;                                    // Historical starting block for Swaap protocol analysis
  const endBlock = await Ethereum.getLatestBlockNumber();        // Current blockchain head for complete coverage
  const logs: Log[] = [];                                        // Accumulator for all retrieved event logs
  const steps = 10000;                                           // Batch size to prevent RPC timeout and rate limiting

  console.log(`Fetching logs from ${startBlock} to ${endBlock}`);
  
  // Process blockchain events in manageable batches to ensure reliable data retrieval
  for (let i = startBlock; i < endBlock; i += steps) {
    // Calculate batch end block, ensuring it doesn't exceed the target end block
    const batchEndBlock = endBlock > i + steps ? i + steps : endBlock;
    
    console.log(`Processing from ${i} to ${batchEndBlock}`);
    
    // Retrieve Swaap swap events for the current block range batch
    const events = await Ethereum.getLogsByAddressAndTopic(
      EthereumConstants.contracts.swaap,           // Target Swaap protocol contract address
      EthereumConstants.eventTopics.swaap_swap,    // Swap event topic hash for filtering
      i,                                           // Batch start block number
      batchEndBlock                                // Batch end block number
    );
    
    // Accumulate retrieved events into the main logs array
    logs.push(...events);
  }

  // Extract and normalize transaction hashes from all retrieved event logs
  const transactionHashes = logs.map((log) => log.transactionHash.toLowerCase());
  
  console.log(`Fetched ${transactionHashes.length} transaction hashes`);
  
  // Export transaction hashes to JSON file for further analysis and processing
  fs.writeFileSync("./data/transactions.json", JSON.stringify(transactionHashes));
}

// Execute the main event log extraction process
main();