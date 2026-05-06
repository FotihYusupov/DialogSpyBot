const { Bot } = require("grammY");
const mongoose = require('mongoose');

// MongoDB ulanishi
mongoose.connect('mongodb://127.0.0.1:27017/tg_business_db')
  .then(() => console.log("MongoDB-ga muvaffaqiyatli ulanildi"))
  .catch(err => console.error("DB ulanishda xato:", err));

// --- MODELLAR ---
const User = mongoose.model('User', new mongoose.Schema({
  chat_id: { type: Number, unique: true, required: true },
  username: String,
  first_name: String,
  business_connection_id: { type: String, index: true }
}));

// Xabar modeliga jo'natuvchi haqidagi to'liq ma'lumotlarni qo'shdik
const BusinessMessage = mongoose.model('BusinessMessage', new mongoose.Schema({
  business_connection_id: String,
  message_id: Number,
  chat_id: Number,
  sender_id: Number,
  sender_first_name: String,
  sender_last_name: String,
  sender_username: String,
  text: String,
  date: { type: Date, default: Date.now }
}));

const bot = new Bot("8023917067:AAGi7w2UyVl3Hq8kZTH62LbmxyeV0r_uShA");

// Matnlardagi HTML belgilarni xavfsiz holatga keltirish funksiyasi (xato bermasligi uchun)
const escapeHTML = (str) => {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
};

// 1. /start komandasi
bot.command("start", async (ctx) => {
  await User.findOneAndUpdate(
    { chat_id: ctx.from.id },
    { username: ctx.from.username, first_name: ctx.from.first_name },
    { upsert: true }
  );
  await ctx.reply("Salom! Botni Telegram Business sozlamalari orqali akkauntingizga ulab qo'ying.");
});

// 2. Business Connection
bot.on("business_connection", async (ctx) => {
  const conn = ctx.businessConnection;
  if (conn.is_enabled) {
    await User.findOneAndUpdate(
      { chat_id: conn.user.id }, // To'g'rilangan joyi
      { business_connection_id: conn.id },
      { upsert: true }
    );
    console.log(`[+] Akkaunt ulandi! ConnID: ${conn.id}`);
  } else {
    await User.findOneAndUpdate(
      { business_connection_id: conn.id },
      { $unset: { business_connection_id: "" } }
    );
    console.log(`[-] Akkaunt uzildi: ${conn.id}`);
  }
});

// 3. Xabarlarni bazaga yozish (To'liq ma'lumotlari bilan)
bot.on("business_message", async (ctx) => {
  const msg = ctx.businessMessage;
  
  await BusinessMessage.create({
    business_connection_id: msg.business_connection_id,
    message_id: msg.message_id,
    chat_id: msg.chat.id,
    sender_id: msg.from.id,
    sender_first_name: msg.from.first_name || "",
    sender_last_name: msg.from.last_name || "",
    sender_username: msg.from.username || "",
    text: msg.text || msg.caption || "[Media/Stiker/Ovozli xabar]"
  });
});

// 4. Xabar o'chirilganda chiroyli formatda yuborish
bot.on("deleted_business_messages", async (ctx) => {
  const deletedData = ctx.deletedBusinessMessages;
  const owner = await User.findOne({ business_connection_id: deletedData.business_connection_id });

  if (!owner) return;

  for (const msgId of deletedData.message_ids) {
    const archived = await BusinessMessage.findOne({
      message_id: msgId,
      business_connection_id: deletedData.business_connection_id
    });

    if (archived) {
      // Ism, familiya va usernameni chiroyli yig'amiz
      let fullName = escapeHTML(archived.sender_first_name);
      if (archived.sender_last_name) fullName += ` ${escapeHTML(archived.sender_last_name)}`;
      let usernameText = archived.sender_username ? ` (@${escapeHTML(archived.sender_username)})` : "";

      const info = 
`🗑 <b>Xabar o'chirildi!</b>

👤 <b>Kimdan:</b> <a href="tg://user?id=${archived.sender_id}">${fullName}</a>${usernameText}
🆔 <b>ID:</b> <code>${archived.sender_id}</code>

💬 <b>O'chirilgan matn:</b>
<i>${escapeHTML(archived.text)}</i>`;

      await bot.api.sendMessage(owner.chat_id, info, { parse_mode: "HTML" });
    }
  }
});

// 5. Xabar tahrirlanganda chiroyli formatda yuborish
bot.on("edited_business_message", async (ctx) => {
  const editedMsg = ctx.editedBusinessMessage;
  const owner = await User.findOne({ business_connection_id: editedMsg.business_connection_id });
  
  if (!owner) return;

  const oldMsg = await BusinessMessage.findOne({
    message_id: editedMsg.message_id,
    business_connection_id: editedMsg.business_connection_id
  });

  if (oldMsg) {
    let fullName = escapeHTML(editedMsg.from.first_name);
    if (editedMsg.from.last_name) fullName += ` ${escapeHTML(editedMsg.from.last_name)}`;
    let usernameText = editedMsg.from.username ? ` (@${escapeHTML(editedMsg.from.username)})` : "";
    let newText = editedMsg.text || editedMsg.caption || "[Media/Stiker]";

    const report = 
`✏️ <b>Xabar tahrirlandi!</b>

👤 <b>Kimdan:</b> <a href="tg://user?id=${editedMsg.from.id}">${fullName}</a>${usernameText}

❌ <b>Eski holati:</b>
<i>${escapeHTML(oldMsg.text)}</i>

✅ <b>Yangi holati:</b>
<i>${escapeHTML(newText)}</i>`;

    await bot.api.sendMessage(owner.chat_id, report, { parse_mode: "HTML" });

    // Bazadagi xabarni yangisiga almashtirib qo'yamiz (yana edit qilsa kerak bo'ladi)
    oldMsg.text = newText;
    await oldMsg.save();
  }
});

bot.start();