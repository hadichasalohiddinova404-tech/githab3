// ============================================================
// contract-instance.js
// TOPSHIRIQ 3: ABI faylini yuklash
// TOPSHIRIQ 4: Kontrakt adresi orqali kontrakt obyektini yaratish
// ============================================================

const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

// -------------------------------------------------------
// TOPSHIRIQ 3: ABI faylini loyihaga yuklash
// -------------------------------------------------------
function loadContractABI() {
  console.log("\n" + "=".repeat(60));
  console.log("  TOPSHIRIQ 3: ABI faylini yuklash");
  console.log("=".repeat(60));

  const abiPath = path.join(__dirname, "contract", "SimpleStorage.json");

  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI fayli topilmadi: ${abiPath}`);
  }

  const contractJSON = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const abi = contractJSON.abi;

  console.log("✅ TOPSHIRIQ 3: ABI fayli muvaffaqiyatli yuklandi!");
  console.log(`   Kontrakt nomi: ${contractJSON.contractName}`);
  console.log(`   ABI funksiyalar soni: ${abi.length}`);

  // ABI ning view va send funksiyalarini ko'rsatish
  const viewFunctions = abi.filter(
    (item) => item.type === "function" && item.stateMutability === "view"
  );
  const sendFunctions = abi.filter(
    (item) =>
      item.type === "function" &&
      item.stateMutability !== "view" &&
      item.stateMutability !== "pure"
  );

  console.log(`\n   📖 VIEW funksiyalar:`);
  viewFunctions.forEach((fn) => console.log(`      - ${fn.name}()`));

  console.log(`   ✍️  Tranzaksiya funksiyalar:`);
  sendFunctions.forEach((fn) => console.log(`      - ${fn.name}()`));

  return { abi, contractJSON };
}

// -------------------------------------------------------
// TOPSHIRIQ 4: Kontrakt obyektini yaratish
// -------------------------------------------------------
function createContractInstance(web3, abi, contractAddress) {
  console.log("\n" + "=".repeat(60));
  console.log("  TOPSHIRIQ 4: Kontrakt obyektini yaratish");
  console.log("=".repeat(60));

  if (!web3.utils.isAddress(contractAddress)) {
    throw new Error(`Noto'g'ri kontrakt adresi: ${contractAddress}`);
  }

  // Kontrakt obyektini yaratish
  const contract = new web3.eth.Contract(abi, contractAddress);

  console.log("✅ TOPSHIRIQ 4: Kontrakt obyekti muvaffaqiyatli yaratildi!");
  console.log(`   Kontrakt adresi: ${contractAddress}`);
  console.log(`   Obyekt turi: ${typeof contract}`);
  console.log(`   Metodlar: ${Object.keys(contract.methods).slice(0, 8).join(", ")}...`);

  return contract;
}

// -------------------------------------------------------
// Asosiy funksiya
// -------------------------------------------------------
async function main() {
  const LOCALHOST_RPC = "http://127.0.0.1:8545";

  // Kontrakt adresi (Ganache/Hardhat da deploy qilingandan keyin o'zgartiring)
  const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(LOCALHOST_RPC));

    // TOPSHIRIQ 3
    const { abi } = loadContractABI();

    // TOPSHIRIQ 4
    const contract = createContractInstance(web3, abi, CONTRACT_ADDRESS);

    return { web3, contract };
  } catch (error) {
    console.error(`\n❌ Xato: ${error.message}`);
    return null;
  }
}

module.exports = { loadContractABI, createContractInstance, main };

if (require.main === module) {
  main();
}
