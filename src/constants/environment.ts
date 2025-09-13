/**
 * @author Lloyd
 * @date 2025/09/12
 * @description Environment configuration module that loads and exports application environment variables for secure credential management
 */

import { config } from "dotenv";

// Load environment variables from .env file into process.env
config();

/**
 * Centralized environment configuration object containing all application-specific environment variables.
 * Provides secure access to sensitive credentials and configuration parameters loaded from environment files.
 */
export const Environment = {
  /** Etherscan API key for blockchain data retrieval and transaction monitoring */
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  
  /** Base URL for Etherscan API v2 endpoints for consistent API communication */
  ETHERSCAN_BASE_URL: "https://api.etherscan.io/v2/api",
  
  /** Primary wallet address for transaction execution and account management */
  WALLET_ADDRESS: process.env.WALLET_ADDRESS,
  
  /** Smart contract address for application-specific contract interactions */
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  
  /** Ethereum RPC endpoint URL for blockchain network communication */
  RPC_URL: process.env.RPC_URL
};