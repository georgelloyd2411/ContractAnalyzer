import { config } from "dotenv";

config();

export const Environment = {
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  ETHERSCAN_BASE_URL: "https://api.etherscan.io/v2/api",
  WALLET_ADDRESS: process.env.WALLET_ADDRESS,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
};
