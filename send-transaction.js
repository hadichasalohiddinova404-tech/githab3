// ============================================================
// send-transaction.js
// TOPSHIRIQ 6: send() metodi orqali kontraktga tranzaksiya yuborish
// ============================================================

const { Web3 } = require("web3");
const { loadContractABI } = require("./contract-instance");

const LOCALHOST_RPC = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// -------------------------------------------------------
// TOPSHIRIQ 6: send() metodi - tranzaksiya yuborish
// .send() — gas sarflaydi, blockchain'ni o'zgartiradi
// -------------------------------------------------------
async function sendTransaction(newValue) {
  console.log("\n" + "=".repeat(60));
  console.log("  TOPSHIRIQ 6: send() orqali tranzaksiya yuborish");
  console.log("=".repeat(60));

  const web3 = new Web3(new Web3.providers.HttpProvider(LOCALHOST_RPC));
  const { abi } = loadContractABI();
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

  // Akkauntlarni olish
  const accounts = await web3.eth.getAccounts();
  const senderAccount = accounts[0];

  console.log(`\n👤 Yuboruvchi: ${senderAccount}`);
  console.log(`📝 Yangi qiymat: ${newValue}`);

  // Tranzaksiyadan OLDINGI qiymat
  const valueBefore = await contract.methods.getValue().call();
  console.log(`\n📊 Tranzaksiyadan OLDIN: ${valueBefore}`);

  // -------------------------------------------------------
  // ASOSIY: .send() metodi bilan tranzaksiya yuborish
  // -------------------------------------------------------
  console.log("\n🚀 send() metodi chaqirilmoqda...");

  const receipt = await contract.methods.setValue(newValue).send({
    from: senderAccount,
    gas: 100000,        // Gas limit
    gasPrice: "20000000000", // 20 Gwei
  });

  console.log("\n✅ TOPSHIRIQ 6: Tranzaksiya muvaffaqiyatli yuborildi!");
  console.log("─".repeat(40));
  console.log(`   📋 Tranzaksiya Hash: ${receipt.transactionHash}`);
  console.log(`   📦 Blok raqami: ${receipt.blockNumber}`);
  console.log(`   ⛽ Gas sarflandi: ${receipt.gasUsed}`);
  console.log(`   ✅ Status: ${receipt.status ? "Muvaffaqiyatli" : "Bekor qilindi"}`);

  // Tranzaksiyadan KEYINGI qiymat
  const valueAfter = await contract.methods.getValue().call();
  console.log(`\n📊 Tranzaksiyadan KEYIN: ${valueAfter}`);
  console.log(`✅ Qiymat o'zgardi: ${valueBefore} → ${valueAfter}`);

  return receipt;
}

// -------------------------------------------------------
// Asosiy ishga tushirish
// -------------------------------------------------------
async function main() {
  try {
    const receipt = await sendTransaction(42);
    console.log("\n" + "=".repeat(60));
    console.log("✅ TOPSHIRIQ 6 muvaffaqiyatli bajarildi!");
    console.log("=".repeat(60));
    return receipt;
  } catch (error) {
    console.error(`\n❌ Tranzaksiya xatosi: ${error.message}`);
  }
}

module.exports = { sendTransaction };

if (require.main === module) {
  main();
}
