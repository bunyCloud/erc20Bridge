const fs = require("fs");
const chalk = require("chalk");


const deploymentsDir = "./deployments";
const publishDir = "./react/";



async function main() {
  const directories = fs.readdirSync(deploymentsDir);
  directories.forEach(function (directory) {
    const files = fs.readdirSync(`${deploymentsDir}/${directory}`);
    files.forEach(function (file) {
      if (file.indexOf(".json") >= 0) {
        const contractName = file.replace(".json", "");
        
      }
    });
  });
  console.log("✅  Published contracts to the subgraph package.");
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
