const fs = require("fs")
const path = require("path")
const solc = require("solc")

// Read the Solidity contract source code
const contractPath = path.resolve(__dirname, "../contracts/ParkingSystem.sol")
const source = fs.readFileSync(contractPath, "utf8")

// Prepare the compiler input
const input = {
  language: "Solidity",
  sources: {
    "ParkingSystem.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
}

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)))

// Extract the ABI
const contractOutput = output.contracts["ParkingSystem.sol"]["ParkingSystem"]
const abi = contractOutput.abi

// Create the directory if it doesn't exist
const abiDir = path.resolve(__dirname, "../contracts/abis")
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true })
}

// Write the ABI to a file
const abiPath = path.resolve(abiDir, "ParkingSystem.json")
fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2))

console.log(`ABI written to ${abiPath}`)

