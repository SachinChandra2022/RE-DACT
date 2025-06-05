const { providers } = require("ethers");
const hre = require("hardhat");
require("dotenv").config({path:'./.env.local'});


async function main() {
  const Redact = await hre.ethers.getContractFactory(
    "Redact"
  );
  const redact = await Redact.deploy(process.env.NEXT_PUBLIC_SALT);

  await redact.deployed();

  console.log("Redact contract deployed to : ", redact.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(0);
  });