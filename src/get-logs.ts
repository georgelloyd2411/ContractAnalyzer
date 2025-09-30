/**
 * @author Lloyd
 * @date 2025/09/06
 * @description Contract event log extraction utility for comprehensive blockchain event analysis and data collection
 */

import { Environment } from "./constants/environment";
import { EtherscanAPI } from "./services/etherscan";
import fs from "fs";

/**
 * Main execution function that performs comprehensive contract event log extraction from Ethereum blockchain.
 * Retrieves specific event logs within a defined block range and exports data for further analysis.
 */
const main = async () => {
  // Target contract address for comprehensive event log extraction
  const contract = "0xbbbbbbb520d69a9775e85b458c58c648259fad5f";
  
  // Specific event topic hash for filtering targeted contract events
  const topic = "0xadd7095becdaa725f0f33243630938c861b0bba83dfd217d4055701aa768ec2e";
  
  // Initialize Etherscan API client with authenticated credentials for blockchain data access
  const etherscan = new EtherscanAPI(Environment.ETHERSCAN_API_KEY);
  
  // Retrieve current blockchain head as the ending block for complete coverage
  const end = await etherscan.getLatestBlock();
  const start = end - 100000;
  
  // Execute comprehensive event log retrieval for the specified contract and topic
  const events = await etherscan.getEventLogsByAddress(contract, topic, start, end);
  
  console.log(`Fetched ${events.length} events`);
  
  // Export retrieved event logs to JSON file for persistent storage and further analysis
  fs.writeFileSync("./data/bebop-events.json", JSON.stringify(events));
}

// Execute the contract event extraction process
main();