// ============================================================
// error-handling.js
// TOPSHIRIQ 7: Xatoliklarni (error handling) ushlash va
//              foydalanuvchiga chiqarish mexanizmi
// ============================================================

const { Web3 } = require("web3");
const { loadContractABI } = require("./contract-instance");

const LOCALHOST_RPC = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// -------------------------------------------------------
// Xato turlarini aniqlash va foydalanuvchiga chiqarish
// -------------------------------------------------------
function handleError(error, operationName) {
  console.log("\n" + "⚠️ ".repeat(20));
  console.log(`❌ XATO [${operationName}]:`);
  console.log("─".repeat(50));

  // 1. Tarmoq ulanish xatosi
  if (error.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED")) {
    console.log("🔴 TUR: Tarmoq ulanmagan");
    console.log("📌 SABAB: Ethereum node ishlamayapti");
    console.log("💡 YECHIM: Ganache yoki Hardhat node ni ishga tushiring:");
    console.log("   → npx hardhat node");
    console.log("   → ganache-cli");
    return;
  }

  // 2. Gas yetarli emas
  if (error.message.includes("gas") || error.message.includes("out of gas")) {
    console.log("🔴 TUR: Gas yetarlicha emas");
    console.log("📌 SABAB: Gas limit tranzaksiya uchun yetmadi");
    console.log("💡 YECHIM: Gas limitni oshiring (masalan: gas: 500000)");
    return;
  }

  // 3. Noto'g'ri adres
  if (error.message.includes("invalid address") || error.message.includes("Invalid address")) {
    console.log("🔴 TUR: Noto'g'ri adres");
    console.log("📌 SABAB: Berilgan Ethereum adresi noto'g'ri formatda");
    console.log("💡 YECHIM: Adres 0x bilan boshlanib, 42 ta belgi bo'lishi kerak");
    return;
  }

  // 4. Tranzaksiya rad etildi (revert)
  if (error.message.includes("revert") || error.message.includes("REVERT")) {
    console.log("🔴 TUR: Kontrakt tranzaksiyani rad etdi (REVERT)");
    console.log("📌 SABAB: Smart-kontrakt ichidagi shartlar bajarilmadi");
    const revertMsg = error.message.match(/reason string: '(.+?)'/);
    if (revertMsg) {
      console.log(`📝 KONTRAKT XABARI: "${revertMsg[1]}"`);
    }
    console.log("💡 YECHIM: Kontrakt shartlarini tekshiring");
    return;
  }

  // 5. Akkaunt topilmadi
  if (error.message.includes("unknown account") || error.message.includes("sender")) {
    console.log("🔴 TUR: Akkaunt topilmadi");
    console.log("📌 SABAB: 'from' adresi node da mavjud emas");
    console.log("💡 YECHIM: MetaMask yoki Ganache akkauntidan foydalaning");
    return;
  }

  // 6. ABI/Method xato
  if (error.message.includes("is not a function") || error.message.includes("method")) {
    console.log("🔴 TUR: Funksiya topilmadi");
    console.log("📌 SABAB: ABI da bu funksiya mavjud emas");
    console.log("💡 YECHIM: ABI faylini va funksiya nomini tekshiring");
    return;
  }

  // 7. Noma'lum xato
  console.log("🔴 TUR: Kutilmagan xato");
  console.log(`📝 XABAR: ${error.message}`);
  console.log(`🔎 KOD: ${error.code || "yo'q"}`);
  console.log("💡 YECHIM: Yuqoridagi xabar asosida muammoni aniqlang");
}

// -------------------------------------------------------
// TOPSHIRIQ 7: Xatolarni sinab ko'rish
// -------------------------------------------------------
async function demonstrateErrorHandling() {
  console.log("\n" + "=".repeat(60));
  console.log("  TOPSHIRIQ 7: Xato ushlash mexanizmi namoyishi");
  console.log("=".repeat(60));

  const web3 = new Web3(new Web3.providers.HttpProvider(LOCALHOST_RPC));
  const { abi } = loadContractABI();

  // --- TEST 1: Noto'g'ri adres ---
  console.log("\n📌 TEST 1: Noto'g'ri adres bilan urinish");
  try {
    const badContract = new web3.eth.Contract(abi, "0xNOTVALID");
    await badContract.methods.getValue().call();
  } catch (err) {
    handleError(err, "Noto'g'ri adres");
  }

  // --- TEST 2: To'g'ri ishlash ---
  console.log("\n📌 TEST 2: To'g'ri ishlash namoyishi");
  try {
    const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    const value = await contract.methods.getValue().call();
    console.log(`✅ Muvaffaqiyatli: qiymat = ${value}`);
  } catch (err) {
    handleError(err, "getValue");
  }

  // --- TEST 3: Tarmoq xatosi simulyatsiyasi ---
  console.log("\n📌 TEST 3: Noto'g'ri RPC URL (xato simulyatsiyasi)");
  try {
    const badWeb3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9999"));
    await badWeb3.eth.net.isListening();
  } catch (err) {
    handleError(err, "RPC ulanish");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ TOPSHIRIQ 7: Xato ushlash mexanizmi muvaffaqiyatli!");
  console.log("=".repeat(60));
}

module.exports = { handleError, demonstrateErrorHandling };

if (require.main === module) {
  demonstrateErrorHandling();
}
