import { Environment } from "./constants/environment";
import { EtherscanAPI } from "./services/etherscan";
import fs from "fs";

const main = async () => {
  const contract = "0xbbbbbbb520d69a9775e85b458c58c648259fad5f";
  const topic = "0xadd7095becdaa725f0f33243630938c861b0bba83dfd217d4055701aa768ec2e";
  const start = 19783283;
  const etherscan = new EtherscanAPI(Environment.ETHERSCAN_API_KEY);
  const end = await etherscan.getLatestBlock();
  const events = await etherscan.getEventLogsByAddress(contract, topic, start, end);
  console.log(`Fetched ${events.length} events`);
  fs.writeFileSync("./data/contract-events", JSON.stringify(events));
}

main();
