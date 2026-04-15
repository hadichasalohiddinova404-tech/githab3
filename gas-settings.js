// ============================================================
// gas-settings.js
// TOPSHIRIQ 8: Gas limit va gas price parametrlarini sozlash
// ============================================================

const { Web3 } = require("web3");
const { loadContractABI } = require("./contract-instance");

const LOCALHOST_RPC = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// -------------------------------------------------------
// Gas hisoblash yordamchi funksiyalar
// -------------------------------------------------------
function weiToGwei(wei) {
  return Number(wei) / 1e9;
}

function gweiToWei(gwei) {
  return BigInt(Math.floor(gwei * 1e9));
}

// -------------------------------------------------------
// TOPSHIRIQ 8: Gas parametrlarini sozlash va solishtirib ko'rish
// -------------------------------------------------------
async function demonstrateGasSettings() {
  console.log("\n" + "=".repeat(60));
  console.log("  TOPSHIRIQ 8: Gas limit va Gas price sozlamalari");
  console.log("=".repeat(60));

  const web3 = new Web3(new Web3.providers.HttpProvider(LOCALHOST_RPC));
  const { abi } = loadContractABI();
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];

  // -------------------------------------------------------
  // 1. Joriy tarmoq gas narxini olish
  // -------------------------------------------------------
  const currentGasPrice = await web3.eth.getGasPrice();
  console.log("\n📊 JORIY TARMOQ GAS MA'LUMOTLARI:");
  console.log("─".repeat(40));
  console.log(`   Gas Price (Wei):  ${currentGasPrice}`);
  console.log(`   Gas Price (Gwei): ${weiToGwei(currentGasPrice).toFixed(2)} Gwei`);

  // -------------------------------------------------------
  // 2. Tranzaksiya uchun Gas limit taxminini olish
  // -------------------------------------------------------
  console.log("\n⛽ GAS TAXMINI (estimateGas):");
  console.log("─".repeat(40));

  const estimatedGas = await contract.methods.setValue(100).estimateGas({
    from: sender,
  });
  console.log(`   Taxminiy gas: ${estimatedGas}`);
  console.log(`   +10% zahira: ${Math.ceil(Number(estimatedGas) * 1.1)}`);

  // -------------------------------------------------------
  // 3. VARIANT A — Kam gas (standart)
  // -------------------------------------------------------
  console.log("\n🔹 VARIANT A — Standart gas sozlamalari:");
  console.log("─".repeat(40));
  const optionA = {
    from: sender,
    gas: 100000,               // Gas limit: 100,000
    gasPrice: "20000000000",   // 20 Gwei
  };
  console.log(`   gas (limit): ${optionA.gas}`);
  console.log(`   gasPrice:    ${weiToGwei(Number(optionA.gasPrice))} Gwei`);
  console.log(
    `   Max to'lov:  ${(Number(optionA.gas) * Number(optionA.gasPrice) / 1e18).toFixed(8)} ETH`
  );

  try {
    const receiptA = await contract.methods.setValue(10).send(optionA);
    console.log(`   ✅ Tranzaksiya muvaffaqiyatli | Hash: ${receiptA.transactionHash.slice(0, 20)}...`);
    console.log(`   ⛽ Haqiqiy gas: ${receiptA.gasUsed}`);
  } catch (err) {
    console.log(`   ❌ Xato: ${err.message.slice(0, 80)}`);
  }

  // -------------------------------------------------------
  // 4. VARIANT B — Yuqori gas (tezkor tranzaksiya)
  // -------------------------------------------------------
  console.log("\n🔹 VARIANT B — Yuqori gas (tezkor):");
  console.log("─".repeat(40));
  const optionB = {
    from: sender,
    gas: 300000,               // Gas limit: 300,000
    gasPrice: "50000000000",   // 50 Gwei (tezkor)
  };
  console.log(`   gas (limit): ${optionB.gas}`);
  console.log(`   gasPrice:    ${weiToGwei(Number(optionB.gasPrice))} Gwei`);
  console.log(
    `   Max to'lov:  ${(Number(optionB.gas) * Number(optionB.gasPrice) / 1e18).toFixed(8)} ETH`
  );

  try {
    const receiptB = await contract.methods.setValue(20).send(optionB);
    console.log(`   ✅ Tranzaksiya muvaffaqiyatli | Hash: ${receiptB.transactionHash.slice(0, 20)}...`);
    console.log(`   ⛽ Haqiqiy gas: ${receiptB.gasUsed}`);
  } catch (err) {
    console.log(`   ❌ Xato: ${err.message.slice(0, 80)}`);
  }

  // -------------------------------------------------------
  // 5. VARIANT C — Auto gas (tarmoq o'zi hisoblaydi)
  // -------------------------------------------------------
  console.log("\n🔹 VARIANT C — Avtomatik gas (tavsiya etiladi):");
  console.log("─".repeat(40));
  const safeGasLimit = Math.ceil(Number(estimatedGas) * 1.2); // +20% zahira
  const optionC = {
    from: sender,
    gas: safeGasLimit,
    // gasPrice ko'rsatilmasa — tarmoq o'zi belgilaydi
  };
  console.log(`   gas (limit): ${optionC.gas}  (estimateGas + 20%)`);
  console.log(`   gasPrice:    tarmoqdan avtomatik olinadi`);

  try {
    const receiptC = await contract.methods.setValue(30).send(optionC);
    console.log(`   ✅ Tranzaksiya muvaffaqiyatli | Hash: ${receiptC.transactionHash.slice(0, 20)}...`);
    console.log(`   ⛽ Haqiqiy gas: ${receiptC.gasUsed}`);
  } catch (err) {
    console.log(`   ❌ Xato: ${err.message.slice(0, 80)}`);
  }

  // -------------------------------------------------------
  // 6. Gas narxi jadvalini ko'rsatish
  // -------------------------------------------------------
  console.log("\n📋 GAS NARX JADVALI:");
  console.log("─".repeat(50));
  console.log(" Tur          | Gas Price | Kutish vaqti");
  console.log("─".repeat(50));
  console.log(" 🐢 Sekin     |   1 Gwei  | 10-30 daqiqa");
  console.log(" 🚶 Standart  |  20 Gwei  | 1-5 daqiqa  ");
  console.log(" 🚀 Tez       |  50 Gwei  | ~30 soniya  ");
  console.log(" ⚡ Juda tez  | 100 Gwei  | ~15 soniya  ");
  console.log("─".repeat(50));

  console.log("\n" + "=".repeat(60));
  console.log("✅ TOPSHIRIQ 8: Gas sozlamalari muvaffaqiyatli!");
  console.log("=".repeat(60));
}

module.exports = { demonstrateGasSettings };

if (require.main === module) {
  demonstrateGasSettings().catch(console.error);
}
