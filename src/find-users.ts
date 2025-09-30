import fs from "fs";
import pMap from "p-map";
import { EtherscanEvent } from "./types/types";
import { Ethereum } from "./services/ethereum";

const main = async () => {
  const events: EtherscanEvent[] = JSON.parse(fs.readFileSync("./data/bebop-events.json", "utf-8"));
  const hashSet = new Set<string>();
  events.map((event) => hashSet.add(event.transactionHash));
  console.log(`Found ${hashSet.size} transactions`);
  const hashes = [...hashSet.values()];

  const results = await pMap(
    hashes,
    async (hash) => {
      const transaction = await Ethereum.getTransactionByHash(hash);
      return transaction?.to ?? "";
    },
    {
      concurrency: 100,
      stopOnError: false
    }
  );

  const contracts = new Set<string>(results);
  console.log(`Found ${contracts.size} contracts`);
  fs.writeFileSync("./data/bebop-contracts.json", JSON.stringify([...contracts.values()]));
}

main();