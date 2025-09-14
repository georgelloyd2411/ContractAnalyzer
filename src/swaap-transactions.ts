/**
 * @author Lloyd
 * @date 2025/09/06
 * @description Contract transaction extraction utility that retrieves and exports transaction hashes for comprehensive blockchain analysis
 */

import { EtherscanAPI } from "./services/etherscan";
import { Environment } from "./constants/environment";
import fs from "fs";

/**
 * Main execution function that retrieves all transactions for a specific contract within a defined block range.
 * Processes data in batches to handle API limitations and exports transaction hashes for further analysis.
 */
const main = async () => {
  // Target contract address for comprehensive transaction history retrieval
  const contract = "0xa836912dce3b96cb9f3f1bf2406d6491ed601f66";
  
  // Initialize Etherscan API client with authenticated credentials for blockchain data access
  const etherscan = new EtherscanAPI(Environment.ETHERSCAN_API_KEY ?? "");
  
  // Define blockchain scanning parameters for historical transaction analysis
  const startBlock = 23247586;                                    // Starting block number for transaction search
  const endBlock = await etherscan.getLatestBlock();             // Current blockchain head for complete coverage
  const transactions = [];                                       // Accumulator for all retrieved transactions

  console.log(`Fetching transactions from ${startBlock} to ${endBlock}`);
  
  // Process transaction retrieval in batches of 10,000 blocks to prevent API timeouts and rate limiting
  for (let i = startBlock; i < endBlock; i += 10000) {
    // Calculate batch end block, ensuring it doesn't exceed the target end block
    const batchEndBlock = endBlock > i + 10000 ? i + 10000 : endBlock;
    
    console.log(`Processing from ${i} to ${batchEndBlock}`);
    
    // Retrieve contract transactions for the current block range batch
    const list = await etherscan.getContractTransactions(
      contract,           // Target contract address for transaction filtering
      i,                  // Batch start block number
      batchEndBlock       // Batch end block number
    );
    
    // Accumulate retrieved transactions into the main collection array
    transactions.push(...list);
  }

  console.log(`Fetched ${transactions.length} transations.`);
  
  // Extract transaction hashes from complete transaction objects for streamlined data processing
  const txs = transactions.map((tx) => tx.hash);
  
  // Export transaction hashes to JSON file for persistent storage and further analysis workflows
  fs.writeFileSync("./data/transactions.json", JSON.stringify(txs));
}

// Execute the main contract transaction extraction process
main();