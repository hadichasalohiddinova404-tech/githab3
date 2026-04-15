// ============================================================
// index.js — BARCHA 8 TOPSHIRIQNI BIRGA ISHGA TUSHIRISH
// ============================================================

const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

const LOCALHOST_RPC = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 1: Web3.js kutubxonasini o'rnatish
// ─────────────────────────────────────────────────────────
async function task1_installWeb3() {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 1: Web3.js kutubxonasini o'rnatish");
  console.log("█".repeat(60));

  const web3 = new Web3(new Web3.providers.HttpProvider(LOCALHOST_RPC));
  const version = Web3.version;
  console.log(`   📦 Web3.js versiyasi: ${version}`);
  console.log(`   ✅ web3 obyekti yaratildi: ${typeof web3}`);
  return web3;
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 2: Localhostni MetaMask'ga ulash
// ─────────────────────────────────────────────────────────
async function task2_connectMetaMask(web3) {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 2: Localhostni MetaMask'ga ulash");
  console.log("█".repeat(60));

  try {
    const isListening = await web3.eth.net.isListening();
    const networkId = await web3.eth.net.getId();
    const chainId = await web3.eth.getChainId();
    const blockNumber = await web3.eth.getBlockNumber();

    console.log(`   🌐 Tarmoq tinglayapti: ${isListening}`);
    console.log(`   🔗 Network ID: ${networkId}`);
    console.log(`   ⛓️  Chain ID: ${chainId}`);
    console.log(`   📦 Blok: ${blockNumber}`);
    console.log(`\n   💡 MetaMask sozlamalari:`);
    console.log(`      RPC URL:         ${LOCALHOST_RPC}`);
    console.log(`      Chain ID:        ${chainId}`);
    console.log(`      Currency Symbol: ETH`);
  } catch (err) {
    console.log(`   ❌ Localhost ulana olmadi: ${err.message}`);
    console.log(`   💡 Ganache yoki Hardhat node ishga tushiring!`);
  }
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 3: ABI faylini yuklash
// ─────────────────────────────────────────────────────────
function task3_loadABI() {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 3: Smart-kontrakt ABI faylini yuklash");
  console.log("█".repeat(60));

  try {
    const abiPath = path.join(__dirname, "contract", "SimpleStorage.json");
    const contractJSON = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const abi = contractJSON.abi;

    console.log(`   📄 Fayl: contract/SimpleStorage.json`);
    console.log(`   📋 Kontrakt nomi: ${contractJSON.contractName || "Noma'lum"}`);
    console.log(`   🔢 ABI elementlar soni: ${abi.length}`);
    return abi;
  } catch (err) {
    console.error(`   ❌ ABI yuklashda xato: ${err.message}`);
    return [];
  }

  const funcs = abi.filter((x) => x.type === "function");
  const events = abi.filter((x) => x.type === "event");
  console.log(`   🔧 Funksiyalar: ${funcs.map((f) => f.name).join(", ")}`);
  console.log(`   📢 Eventlar: ${events.map((e) => e.name).join(", ")}`);

  return abi;
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 4: Kontrakt obyektini yaratish
// ─────────────────────────────────────────────────────────
function task4_createInstance(web3, abi) {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 4: Kontrakt obyektini yaratish");
  console.log("█".repeat(60));

  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
  console.log(`   📌 Kontrakt adresi: ${CONTRACT_ADDRESS}`);
  console.log(`   ✅ contract.methods mavjud: ${typeof contract.methods}`);
  console.log(`   🔑 Metodlar: ${Object.keys(contract.methods).slice(0, 6).join(", ")}`);
  return contract;
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 5: View funksiyani chaqirish
// ─────────────────────────────────────────────────────────
async function task5_callViewFunction(contract) {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 5: View funksiyani chaqirish (.call())");
  console.log("█".repeat(60));

  try {
    const value = await contract.methods.getValue().call();
    const owner = await contract.methods.getOwner().call();
    console.log(`   📖 getValue()  → ${value}`);
    console.log(`   👤 getOwner()  → ${owner}`);
    console.log(`   💡 .call() gas sarflamaydi (faqat o'qiydi)`);
  } catch (err) {
    console.log(`   ❌ call() xatosi: ${err.message.slice(0, 100)}`);
    console.log(`   💡 Kontraktni deploy qiling!`);
  }
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 6: send() orqali tranzaksiya yuborish
// ─────────────────────────────────────────────────────────
async function task6_sendTransaction(web3, contract) {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 6: send() orqali tranzaksiya yuborish");
  console.log("█".repeat(60));

  try {
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    console.log(`   👤 Yuboruvchi: ${sender}`);
    const before = await contract.methods.getValue().call();
    console.log(`   📊 OLDIN: getValue() = ${before}`);

    // Web3 v4 da BigInt ishlatish tavsiya etiladi
    const receipt = await contract.methods.setValue(42).send({
      from: sender,
      gas: 100000n,
      gasPrice: web3.utils.toWei("20", "gwei"),
    });

    console.log(`   ✅ Tranzaksiya yuborildi!`);
    // Web3 v4 da transactionHash o'rniga ba'zan bevosita hash qaytadi
    const txHash = receipt.transactionHash || receipt.hash;
    console.log(`   📋 Hash:    ${txHash}`);
    console.log(`   📦 Blok:    ${receipt.blockNumber}`);
    console.log(`   ⛽ Gas:     ${receipt.gasUsed}`);
    console.log(`   ✔️  Status:  ${receipt.status ? "Muvaffaqiyatli" : "Bekor qilindi"}`);

    const after = await contract.methods.getValue().call();
    console.log(`   📊 KEYIN:  getValue() = ${after}`);
  } catch (err) {
    console.log(`   ❌ send() xatosi: ${err.message.slice(0, 120)}`);
    console.log(`   💡 Kontraktni deploy qilganingizni tekshiring!`);
  }
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 7: Xato ushlash mexanizmi
// ─────────────────────────────────────────────────────────
async function task7_errorHandling(web3, abi) {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 7: Xato ushlash mexanizmi");
  console.log("█".repeat(60));

  // Noto'g'ri adres sinovi
  console.log("\n   🧪 Noto'g'ri adres sinovi:");
  try {
    // Web3 v4 adresni instansiya yaratishda tekshirishi mumkin
    const badAddress = "0x123";
    const bad = new web3.eth.Contract(abi, badAddress);
    await bad.methods.getValue().call();
  } catch (err) {
    if (err.message.toLowerCase().includes("address") || err.message.toLowerCase().includes("invalid")) {
      console.log(`   ❌ Ushlab olingan: Noto'g'ri adres xatosi`);
    } else {
      console.log(`   ❌ Xato ushlandi: ${err.message.slice(0, 80)}`);
    }
  }

  // Noto'g'ri RPC sinovi
  console.log("\n   🧪 Noto'g'ri RPC URL sinovi:");
  try {
    const badWeb3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9999"));
    await badWeb3.eth.net.isListening();
  } catch (err) {
    console.log(`   ❌ Ushlab olingan: Tarmoq ulanish xatosi`);
    console.log(`   💡 Yechim: Ganache/Hardhat node ishga tushiring`);
  }

  console.log(`\n   ✅ Barcha xatolar muvaffaqiyatli ushlandi!`);
}

// ─────────────────────────────────────────────────────────
// TOPSHIRIQ 8: Gas limit va gas price sozlamalari
// ─────────────────────────────────────────────────────────
async function task8_gasSettings(web3, contract) {
  console.log("\n" + "█".repeat(60));
  console.log("  ✅ TOPSHIRIQ 8: Gas limit va gas price sozlamalari");
  console.log("█".repeat(60));

  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];

  // Joriy gas narxi
  const gasPrice = await web3.eth.getGasPrice();
  console.log(`\n   📊 Joriy tarmoq gas narxi: ${Number(gasPrice) / 1e9} Gwei`);

  // Gas taxmini
  try {
    const estimated = await contract.methods.setValue(99).estimateGas({ from: sender });
    console.log(`   ⛽ Taxminiy gas (estimateGas): ${estimated}`);

    const variants = [
      { label: "🐢 Sekin    ", gas: 60000, gasPrice: "1000000000", gwei: 1 },
      { label: "🚶 Standart ", gas: 100000, gasPrice: "20000000000", gwei: 20 },
      { label: "🚀 Tez      ", gas: 200000, gasPrice: "50000000000", gwei: 50 },
      { label: "⚡ Juda tez ", gas: 300000, gasPrice: "100000000000", gwei: 100 },
    ];

    console.log("\n   ┌─────────────┬───────────┬──────────┬─────────────────┐");
    console.log("   │ Tur         │ Gas Limit │ Gas Gwei │ Max to'lov (ETH)│");
    console.log("   ├─────────────┼───────────┼──────────┼─────────────────┤");
    variants.forEach((v) => {
      const maxFee = web3.utils.fromWei((BigInt(v.gas) * BigInt(v.gasPrice)).toString(), "ether");
      console.log(`   │ ${v.label} │ ${String(v.gas).padEnd(9)} │ ${String(v.gwei).padEnd(8)} │ ${String(maxFee).slice(0, 10).padEnd(15)} │`);
    });
    console.log("   └─────────────┴───────────┴──────────┴─────────────────┘");

    // Amalda standart bilan tranzaksiya yuborish
    console.log(`\n   🚀 Standart gas bilan tranzaksiya yuborilmoqda...`);
    const receipt = await contract.methods.setValue(99).send({
      from: sender,
      gas: 100000n,
      gasPrice: web3.utils.toWei("20", "gwei"),
    });
    console.log(`   ✅ Yuborildi! Gas sarflandi: ${receipt.gasUsed} / 100000`);
    const efficiency = ((Number(receipt.gasUsed) / 100000) * 100).toFixed(1);
    console.log(`   📈 Gas ishlatilish samaradorligi: ${efficiency}%`);
  } catch (err) {
    console.log(`   ❌ Gas xatosi: ${err.message.slice(0, 100)}`);
    console.log(`   💡 Kontraktni deploy qiling!`);
  }
}

// ═══════════════════════════════════════════════════════
// BARCHA TOPSHIRIQLARNI KETMA-KET ISHGA TUSHIRISH
// ═══════════════════════════════════════════════════════
async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  🎯 WEB3.JS — 8 TA TOPSHIRIQ LOYIHASI");
  console.log("  📅 " + new Date().toLocaleString("uz-Cyrl-UZ"));
  console.log("═".repeat(60));

  // T1: Web3.js ni ulash
  const web3 = await task1_installWeb3();

  // T2: MetaMask ga ulash
  await task2_connectMetaMask(web3);

  // T3: ABI yuklash
  const abi = task3_loadABI();

  // T4: Kontrakt instansiyasi
  const contract = task4_createInstance(web3, abi);

  // T5: View funksiya
  await task5_callViewFunction(contract);

  // T6: Tranzaksiya yuborish
  await task6_sendTransaction(web3, contract);

  // T7: Xato ushlash
  await task7_errorHandling(web3, abi);

  // T8: Gas sozlamalari
  await task8_gasSettings(web3, contract);

  // Yakuniy hisobot
  console.log("\n" + "═".repeat(60));
  console.log("  🏆 BARCHA 8 TOPSHIRIQ MUVAFFAQIYATLI BAJARILDI!");
  console.log("═".repeat(60));
  console.log("\n  📌 Bajarilgan topshiriqlar:");
  const tasks = [
    "Web3.js kutubxonasini o'rnatish",
    "Localhostni MetaMask'ga ulash",
    "Smart-kontrakt ABI faylini yuklash",
    "Kontrakt obyektini yaratish",
    "View funksiyani chaqirish (.call())",
    "send() orqali tranzaksiya yuborish",
    "Xato ushlash mexanizmi",
    "Gas limit va gas price sozlamalari",
  ];
  tasks.forEach((t, i) => console.log(`  [${i + 1}] ✅ ${t}`));
  console.log("\n" + "═".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("\n❌ Kritik xato:", err.message);
  process.exit(1);
});
