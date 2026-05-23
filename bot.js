const { Bot, InlineKeyboard, InputFile } = require("grammy");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tg_business_db";

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN topilmadi!");
  process.exit(1);
}

// ==========================================
// MONGODB
// ==========================================

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

const UserSchema = new mongoose.Schema({
  chat_id: { type: Number, unique: true, required: true },
  username: String,
  first_name: String,
  business_connection_id: { type: String, index: true },
  business_connection_ids: { type: [String], default: [] },
  notify_edits: { type: Boolean, default: true },
  notify_deletes: { type: Boolean, default: true }
});

const User = mongoose.model("User", UserSchema);

const BusinessMessageSchema = new mongoose.Schema({
  owner_id: { type: Number, index: true },
  business_connection_id: String,

  message_id: Number,

  chat_id: Number,
  chat_title: String,
  chat_type: String,

  sender_id: Number,
  sender_first_name: String,
  sender_last_name: String,
  sender_username: String,

  text: String,

  // MEDIA
  media_type: String,
  media_file_id: String,
  media_file_path: String,

  // STATUS
  is_deleted: {
    type: Boolean,
    default: false
  },

  is_edited: {
    type: Boolean,
    default: false
  },

  edit_history: [
    {
      text: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  date: {
    type: Date,
    default: Date.now
  }
});

const BusinessMessage = mongoose.model(
  "BusinessMessage",
  BusinessMessageSchema
);

// ==========================================
// BOT
// ==========================================

const bot = new Bot(BOT_TOKEN);

// ==========================================
// HELPERS
// ==========================================

const escapeHTML = (str) => {
  if (!str) return "";

  return str.replace(/[&<>'"]/g, (tag) => {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };

    return chars[tag] || tag;
  });
};

// ==========================================
// MEDIA EXTRACT
// ==========================================

const extractMedia = async (msg) => {
  let fileId = null;
  let type = null;

  if (msg.photo) {
    fileId = msg.photo[msg.photo.length - 1].file_id;
    type = "📸 Rasm";
  } else if (msg.video) {
    fileId = msg.video.file_id;
    type = "🎥 Video";
  } else if (msg.voice) {
    fileId = msg.voice.file_id;
    type = "🎤 Voice";
  } else if (msg.document) {
    fileId = msg.document.file_id;
    type = "📁 Document";
  } else if (msg.sticker) {
    fileId = msg.sticker.file_id;
    type = "👾 Sticker";
  } else if (msg.animation) {
    fileId = msg.animation.file_id;
    type = "🎞 GIF";
  } else if (msg.video_note) {
    fileId = msg.video_note.file_id;
    type = "📹 Round Video";
  } else if (msg.audio) {
    fileId = msg.audio.file_id;
    type = "🎵 Audio";
  }

  if (!fileId) {
    return {
      type: null,
      file_id: null,
      file_path: null
    };
  }

  try {
    const file = await bot.api.getFile(fileId);

    return {
      type,
      file_id: fileId,
      file_path: file.file_path
    };
  } catch (err) {
    console.error("❌ File path olishda xato:", err.message);

    return {
      type,
      file_id: fileId,
      file_path: null
    };
  }
};

// ==========================================
// COMMANDS
// ==========================================

bot.command("start", async (ctx) => {
  await User.findOneAndUpdate(
    {
      chat_id: ctx.from.id
    },
    {
      username: ctx.from.username,
      first_name: ctx.from.first_name
    },
    {
      upsert: true
    }
  );

  await ctx.reply(
    "👋 Bot ishlayapti.\n\nTelegram Business orqali ulang.\nBuyruqlarni ko'rish uchun /help ni bosing."
  );
});

bot.command("help", async (ctx) => {
  const text = 
    `📖 <b>Yordam</b>\n\n` +
    `/start - Botni ishga tushirish\n` +
    `/stats - Statistika\n` +
    `/settings - Sozlamalar (Xabarnomalarni o'chirish/yoqish)\n` +
    `/search &lt;so'z&gt; - Xabarlarni izlash\n` +
    `/export - Ma'lumotlarni yuklab olish\n` +
    `/help - Shu xabarni ko'rsatish`;
  
  await ctx.reply(text, { parse_mode: "HTML" });
});

bot.command("settings", async (ctx) => {
  const user = await User.findOne({ chat_id: ctx.from.id });
  if (!user) return ctx.reply("❌ Avval /start tugmasini bosing.");

  const keyboard = new InlineKeyboard()
    .text(user.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", "toggle_deletes").row()
    .text(user.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", "toggle_edits");

  await ctx.reply("⚙️ <b>Sozlamalar</b>\nQaysi xabarnomalarni olmoqchisiz?", {
    parse_mode: "HTML",
    reply_markup: keyboard
  });
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const user = await User.findOne({ chat_id: ctx.from.id });
  
  if (!user) return ctx.answerCallbackQuery("Foydalanuvchi topilmadi.");

  if (data === "toggle_deletes") {
    user.notify_deletes = user.notify_deletes === false ? true : false;
    await user.save();
  } else if (data === "toggle_edits") {
    user.notify_edits = user.notify_edits === false ? true : false;
    await user.save();
  }

  const keyboard = new InlineKeyboard()
    .text(user.notify_deletes !== false ? "✅ O'chirilgan xabarlar" : "❌ O'chirilgan xabarlar", "toggle_deletes").row()
    .text(user.notify_edits !== false ? "✅ Tahrirlangan xabarlar" : "❌ Tahrirlangan xabarlar", "toggle_edits");

  await ctx.editMessageReplyMarkup({ reply_markup: keyboard }).catch(() => {});
  await ctx.answerCallbackQuery("Sozlamalar saqlandi.");
});

bot.command("search", async (ctx) => {
  const user = await User.findOne({ chat_id: ctx.from.id });
  if (!user || !user.business_connection_id) {
    return ctx.reply("❌ Business account ulanmagan.");
  }

  const query = ctx.match;
  if (!query) {
    return ctx.reply("❌ Nimani izlamoqchisiz? Masalan: /search salom");
  }

  const results = await BusinessMessage.find({
    business_connection_id: user.business_connection_id,
    $or: [
      { text: { $regex: query, $options: "i" } },
      { "edit_history.text": { $regex: query, $options: "i" } }
    ]
  }).limit(10);

  if (results.length === 0) {
    return ctx.reply("🔍 Hech narsa topilmadi.");
  }

  let text = `🔍 <b>Natijalar (${results.length} ta ko'rsatilmoqda)</b>\n\n`;
  results.forEach((msg, i) => {
    let status = msg.is_deleted ? "🗑 O'chirilgan" : (msg.is_edited ? "✏️ Tahrirlangan" : "💬 Oddiy");
    text += `${i + 1}. [${status}] ${escapeHTML(msg.sender_first_name)}: <i>${escapeHTML((msg.text || "[Media]").substring(0, 50))}...</i>\n`;
  });

  await ctx.reply(text, { parse_mode: "HTML" });
});

bot.command("export", async (ctx) => {
  const user = await User.findOne({ chat_id: ctx.from.id });
  if (!user || !user.business_connection_id) {
    return ctx.reply("❌ Business account ulanmagan.");
  }

  const messages = await BusinessMessage.find({
    business_connection_id: user.business_connection_id,
    $or: [{ is_deleted: true }, { is_edited: true }]
  }).lean();

  if (messages.length === 0) {
    return ctx.reply("📂 Eksport qilish uchun o'chirilgan yoki tahrirlangan xabarlar yo'q.");
  }

  const filePath = path.join(__dirname, `export_${ctx.from.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

  await ctx.replyWithDocument(new InputFile(filePath), { caption: "📂 O'chirilgan va tahrirlangan xabarlar" });
  fs.unlinkSync(filePath);
});

// ==========================================
// STATS
// ==========================================

bot.command("stats", async (ctx) => {
  const user = await User.findOne({
    chat_id: ctx.from.id
  });

  if (!user || !user.business_connection_id) {
    return ctx.reply("❌ Business account ulanmagan.");
  }

  const total = await BusinessMessage.countDocuments({
    $or: [
      { business_connection_id: user.business_connection_id },
      { business_connection_id: { $in: user.business_connection_ids } },
      { owner_id: user.chat_id }
    ]
  });

  const deleted = await BusinessMessage.countDocuments({
    $or: [
      { business_connection_id: user.business_connection_id },
      { business_connection_id: { $in: user.business_connection_ids } },
      { owner_id: user.chat_id }
    ],
    is_deleted: true
  });

  const edited = await BusinessMessage.countDocuments({
    $or: [
      { business_connection_id: user.business_connection_id },
      { business_connection_id: { $in: user.business_connection_ids } },
      { owner_id: user.chat_id }
    ],
    is_edited: true
  });

  const text =
    `📊 <b>Statistika</b>\n\n` +
    `📥 Jami: <b>${total}</b>\n` +
    `🗑 Deleted: <b>${deleted}</b>\n` +
    `✏️ Edited: <b>${edited}</b>`;

  await ctx.reply(text, {
    parse_mode: "HTML"
  });
});

// ==========================================
// BUSINESS CONNECTION
// ==========================================

bot.on("business_connection", async (ctx) => {
  const conn = ctx.businessConnection;

  if (conn.is_enabled) {
    await User.findOneAndUpdate(
      {
        chat_id: conn.user.id
      },
      {
        business_connection_id: conn.id,
        $addToSet: { business_connection_ids: conn.id }
      },
      {
        upsert: true
      }
    );

    console.log("✅ Business connected:", conn.id);
  } else {
    await User.findOneAndUpdate(
      {
        business_connection_id: conn.id
      },
      {
        $unset: {
          business_connection_id: ""
        }
      }
    );

    console.log("❌ Business disconnected:", conn.id);
  }
});

// ==========================================
// SAVE BUSINESS MESSAGE
// ==========================================

bot.on("business_message", async (ctx) => {
  try {
    const msg = ctx.businessMessage;

    // Robustly fetch owner
    let owner_id = null;
    const user = await User.findOne({
      $or: [
        { business_connection_id: msg.business_connection_id },
        { business_connection_ids: msg.business_connection_id }
      ]
    });

    if (user) {
      owner_id = user.chat_id;
    } else {
      try {
        const conn = await ctx.api.getBusinessConnection(msg.business_connection_id);
        owner_id = conn.user.id;
        await User.findOneAndUpdate(
          { chat_id: owner_id },
          { 
            business_connection_id: conn.id,
            $addToSet: { business_connection_ids: conn.id }
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("Could not fetch connection info", err);
      }
    }

    const mediaInfo = await extractMedia(msg);

    await BusinessMessage.create({
      owner_id: owner_id,
      business_connection_id: msg.business_connection_id,

      message_id: msg.message_id,

      chat_id: msg.chat.id,
      chat_title: msg.chat.title || "Shaxsiy chat",
      chat_type: msg.chat.type,

      sender_id: msg.from.id,
      sender_first_name: msg.from.first_name || "",
      sender_last_name: msg.from.last_name || "",
      sender_username: msg.from.username || "",

      text: msg.text || msg.caption || "",

      media_type: mediaInfo.type,
      media_file_id: mediaInfo.file_id,
      media_file_path: mediaInfo.file_path
    });

    console.log("✅ Message saved");
  } catch (err) {
    console.error("❌ Save error:", err);
  }
});

// ==========================================
// DELETE EVENT
// ==========================================

bot.on("deleted_business_messages", async (ctx) => {
  const deletedData = ctx.deletedBusinessMessages;

  for (const msgId of deletedData.message_ids) {
    const archived = await BusinessMessage.findOneAndUpdate(
      {
        message_id: msgId,
        business_connection_id: deletedData.business_connection_id
      },
      {
        is_deleted: true
      },
      {
        new: true
      }
    );

    if (!archived) continue;

    let owner = null;
    if (archived.owner_id) {
      owner = await User.findOne({ chat_id: archived.owner_id });
    } else {
      owner = await User.findOne({
        $or: [
          { business_connection_id: deletedData.business_connection_id },
          { business_connection_ids: deletedData.business_connection_id }
        ]
      });
    }

    if (!owner || owner.notify_deletes === false) continue;

    let fullName = escapeHTML(
      archived.sender_first_name
    );

    if (archived.sender_last_name) {
      fullName +=
        " " + escapeHTML(archived.sender_last_name);
    }

    const usernameText = archived.sender_username
      ? ` (@${escapeHTML(archived.sender_username)})`
      : "";

    const caption =
      `🗑 <b>Xabar o'chirildi!</b>\n\n` +
      `👤 <b>Kimdan:</b> <a href="tg://user?id=${archived.sender_id}">${fullName}</a>${usernameText}\n` +
      `🏠 <b>Chat:</b> ${escapeHTML(
        archived.chat_title
      )}\n\n` +
      `💬 <b>Matn:</b>\n` +
      `<i>${escapeHTML(
        archived.text || "[Media]"
      )}</i>`;

    try {
      // PHOTO
      if (archived.media_type?.includes("Rasm")) {
        await bot.api.sendPhoto(
          owner.chat_id,
          archived.media_file_id,
          {
            caption,
            parse_mode: "HTML"
          }
        );
      }

      // VIDEO
      else if (
        archived.media_type?.includes("Video")
      ) {
        await bot.api.sendVideo(
          owner.chat_id,
          archived.media_file_id,
          {
            caption,
            parse_mode: "HTML"
          }
        );
      }

      // VOICE
      else if (
        archived.media_type?.includes("Voice")
      ) {
        await bot.api.sendVoice(
          owner.chat_id,
          archived.media_file_id,
          {
            caption,
            parse_mode: "HTML"
          }
        );
      }

      // DOCUMENT
      else if (
        archived.media_type?.includes("Document")
      ) {
        await bot.api.sendDocument(
          owner.chat_id,
          archived.media_file_id,
          {
            caption,
            parse_mode: "HTML"
          }
        );
      }

      // STICKER
      else if (
        archived.media_type?.includes("Sticker")
      ) {
        await bot.api.sendSticker(
          owner.chat_id,
          archived.media_file_id
        );

        await bot.api.sendMessage(
          owner.chat_id,
          caption,
          {
            parse_mode: "HTML"
          }
        );
      }

      // ROUND VIDEO
      else if (
        archived.media_type?.includes("Round Video")
      ) {
        await bot.api.sendVideoNote(
          owner.chat_id,
          archived.media_file_id
        );
        await bot.api.sendMessage(
          owner.chat_id,
          caption,
          {
            parse_mode: "HTML"
          }
        );
      }

      // AUDIO
      else if (
        archived.media_type?.includes("Audio")
      ) {
        await bot.api.sendAudio(
          owner.chat_id,
          archived.media_file_id,
          {
            caption,
            parse_mode: "HTML"
          }
        );
      }

      // TEXT ONLY
      else {
        await bot.api.sendMessage(
          owner.chat_id,
          caption,
          {
            parse_mode: "HTML"
          }
        );
      }
    } catch (err) {
      console.error(
        "❌ Deleted message send error:",
        err.message
      );
    }
  }
});

// ==========================================
// EDIT EVENT
// ==========================================

bot.on("edited_business_message", async (ctx) => {
  try {
    const editedMsg = ctx.editedBusinessMessage;

    const oldMsg = await BusinessMessage.findOne({
      message_id: editedMsg.message_id,
      business_connection_id: editedMsg.business_connection_id
    });

    if (!oldMsg) return;

    let owner = null;
    if (oldMsg.owner_id) {
      owner = await User.findOne({ chat_id: oldMsg.owner_id });
    } else {
      owner = await User.findOne({
        $or: [
          { business_connection_id: editedMsg.business_connection_id },
          { business_connection_ids: editedMsg.business_connection_id }
        ]
      });
    }

    if (!owner || owner.notify_edits === false) return;

    const mediaInfo = await extractMedia(editedMsg);

    let fullName = escapeHTML(
      editedMsg.from.first_name
    );

    if (editedMsg.from.last_name) {
      fullName +=
        " " + escapeHTML(editedMsg.from.last_name);
    }

    let usernameText = editedMsg.from.username
      ? ` (@${escapeHTML(editedMsg.from.username)})`
      : "";

    const newText =
      editedMsg.text || editedMsg.caption || "";

    const report =
      `✏️ <b>Xabar tahrirlandi!</b>\n\n` +
      `👤 <b>Kimdan:</b> <a href="tg://user?id=${editedMsg.from.id}">${fullName}</a>${usernameText}\n\n` +
      `❌ <b>Eski:</b>\n` +
      `<i>${escapeHTML(oldMsg.text)}</i>\n\n` +
      `✅ <b>Yangi:</b>\n` +
      `<i>${escapeHTML(newText)}</i>`;

    await bot.api.sendMessage(owner.chat_id, report, {
      parse_mode: "HTML"
    });

    oldMsg.edit_history.push({
      text: oldMsg.text
    });

    oldMsg.text = newText;

    oldMsg.is_edited = true;

    oldMsg.media_type = mediaInfo.type;
    oldMsg.media_file_id = mediaInfo.file_id;
    oldMsg.media_file_path = mediaInfo.file_path;

    await oldMsg.save();

    console.log("✏️ Message updated");
  } catch (err) {
    console.error("❌ Edit error:", err);
  }
});

// ==========================================
// ERROR HANDLER
// ==========================================

bot.catch((err) => {
  console.error("❌ Bot error:", err);
});

// ==========================================
// SAFE STOP
// ==========================================

process.once("SIGINT", async () => {
  console.log("⛔ Stopping...");

  await mongoose.connection.close();

  bot.stop();
});

process.once("SIGTERM", async () => {
  console.log("⛔ Stopping...");

  await mongoose.connection.close();

  bot.stop();
});

// ==========================================
// START
// ==========================================

bot.start();

console.log("🤖 Bot started");