/*
┏━━━━━━━━━━━━━━━┓
┃     ⛧ＰＲＩΜΞ⛧ kîᄂᄂér ⛧ƘΞИŦ⛧
┣━━━━━━━━━━━━━━━┛
┃whatsapp : +254785016388
┃owner : james
┃base : 𝐚𝐧𝐢𝐦𝐞 𝐦𝐝
┃best friend : 𝐭𝐫𝐚𝐬𝐡𝐜𝐨𝐫𝐞 𝐝𝐞𝐯
┃helper : -
┃maintainer : james
┃deals : t.me/jamespydev2
┃pterodactyl hosting buy from james dev
┗━━━━━━━━━━━━━━━┛
*/
require('dotenv').config();
const { makeWASocket, getContentType, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, DisconnectReason, jidDecode, makeInMemoryStore, generateWAMessageFromContent, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const path = require("path");
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fg = require('api-dylux');
const axios = require('axios');
const NodeCache = require('node-cache');
const pino = require('pino');
const speed = require("performance-now");
const moment = require("moment-timezone");
const createToxxicStore = require('./queen/basestore');

const store = createToxxicStore('./store', {
  logger: pino().child({ level: 'silent', stream: 'store' })
});

const token = process.env.8182043616:AAGSfaFaPVx-LM2-ee8-VBaU5MgE2XsifbA;
let OWNER_ID = process.env.8195349331;

// Required channel and group for pairing
const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL || '@primekillercrasher'; // Channel username
const REQUIRED_GROUP = process.env.REQUIRED_GROUP || '@primekillercrasherv1'; // Group username

if (!token) {
  console.error('Telegram bot token is not set. Please set the TELEGRAM_BOT_TOKEN environment variable.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const pairingCodes = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const requestLimits = new NodeCache({ stdTTL: 120, checkperiod: 60 });
let connectedUsers = {};
const connectedUsersFilePath = path.join(__dirname, 'queen/connectedUsers.json');
const { smsg } = require("./queen/function");

// Load connected users from the JSON file
function loadConnectedUsers() {
  if (fs.existsSync(connectedUsersFilePath)) {
    const data = fs.readFileSync(connectedUsersFilePath);
    connectedUsers = JSON.parse(data);
  }
}

// Save connected users to the JSON file
function saveConnectedUsers() {
  fs.writeFileSync(connectedUsersFilePath, JSON.stringify(connectedUsers, null, 2));
}

// Check if user is member of required channel and group
async function checkMembership(userId) {
  try {
    const channelMember = await bot.getChatMember(REQUIRED_CHANNEL, userId);
    const groupMember = await bot.getChatMember(REQUIRED_GROUP, userId);
    
    const isChannelMember = ['member', 'administrator', 'creator'].includes(channelMember.status);
    const isGroupMember = ['member', 'administrator', 'creator'].includes(groupMember.status);
    
    return { isChannelMember, isGroupMember, bothJoined: isChannelMember && isGroupMember };
  } catch (error) {
    console.error('Error checking membership:', error);
    return { isChannelMember: false, isGroupMember: false, bothJoined: false };
  }
}

let isFirstLog = true;

async function startWhatsAppBot(phoneNumber, telegramChatId = null) {
  const sessionPath = path.join(__dirname, 'trash_baileys', `session_${phoneNumber}`);

  if (!fs.existsSync(sessionPath)) {
    console.log(`Session directory for ${phoneNumber} was not found.`);
    return;
  }

  let { version, isLatest } = await fetchLatestBaileysVersion();
  if (isFirstLog) {
    console.log(`Using Baileys version: ${version} (Latest: ${isLatest})`);
    isFirstLog = false;
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const msgRetryCounterCache = new NodeCache();
  
  const conn = makeWASocket({
    version: [2, 3000, 1027934701],
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.00"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
  });
  
  store.bind(conn.ev);

  if (conn.authState.creds.registered) {
    await saveCreds();
    console.log(`Session credentials reloaded successfully for ${phoneNumber}!`);
  } else {
    if (telegramChatId) {
      setTimeout(async () => {
        let code = await conn.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        pairingCodes.set(code, { count: 0, phoneNumber });
        bot.sendMessage(telegramChatId, `✅ *Tap code to copy*\n\n📱 Number: \`${phoneNumber}\`\n🔐 Code: \`${code}\``, { parse_mode: 'Markdown' });
        console.log(`Your Pairing Code for ${phoneNumber}: ${code}`);
      }, 3000);
    }
  }
  
  conn.public = true;
  
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      await saveCreds();
      console.log(`Credentials saved successfully for ${phoneNumber}!`);

      if (telegramChatId) {
        if (!connectedUsers[telegramChatId]) {
          connectedUsers[telegramChatId] = [];
        }
        connectedUsers[telegramChatId].push({ phoneNumber });
        saveConnectedUsers();
        
        const caption = `
╔══════════════════╗
║  ✅ CONNECTION SUCCESS  ║
╚══════════════════╝

📱 *Phone Number:* \`${phoneNumber}\`
⏰ *Time:* ${moment().format('HH:mm:ss')}
📅 *Date:* ${moment().format('DD/MM/YYYY')}

━━━━━━━━━━━━━━━━━━━
🎉 *Your WhatsApp bot is now connected!*
━━━━━━━━━━━━━━━━━━━

💡 *Need help?* Contact: https://t.me/Handsome_primis_killer_kent
`;

        const opts = {
          caption: caption,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: "📱 List My Connections", callback_data: "list_my_connections" }],
              [{ text: "❌ Disconnect", callback_data: `disconnect_${phoneNumber}` }],
              [{ text: "🏠 Main Menu", callback_data: "main_menu" }]
            ]
          }
        };

        bot.sendPhoto(telegramChatId, 'https://files.catbox.moe/ur4yfb.jpg', opts);
        console.log(`✅ Connection successful for ${phoneNumber}`);
      }
    } else if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        console.log(`Session closed for ${phoneNumber}. Attempting to restart...`);
        startWhatsAppBot(phoneNumber, telegramChatId);
      }
    }
  });

  conn.ev.on('creds.update', saveCreds);
  
  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
    } else return jid;
  };

  conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, {
    text: text,
    ...options
  }, {
    quoted,
    ...options
  });
  
  conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      let mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
      if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
      let m = smsg(conn, mek, store);
      require("./anime.js")(conn, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });
  
  return conn;
}

let userIds = [];
let groups = [];
let users = {};
let groupMembers = {};

// Console logging for commands
bot.on('text', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username;
  const command = text.split(' ')[0].toLowerCase();
  if (command.startsWith('/')) {
    console.log(`\x1b[32m✅ Command: ${command} | User: @${username} | ID: ${chatId}\x1b[0m`);
  }
});

// Track groups
bot.on('message', (msg) => {
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    const groupId = msg.chat.id;
    const groupName = msg.chat.title;
    if (!groups.find(g => g.id === groupId)) {
      groups.push({ id: groupId, name: groupName });
    }
  }
});

// Load bot users
bot.on('message', (msg) => {
  const userId = msg.from.id;
  if (!users[userId]) {
    users[userId] = msg.from;
  }
  if (!userIds.includes(msg.chat.id)) {
    userIds.push(msg.chat.id);
  }
});

// Load group members
bot.on('message', (msg) => {
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    const userId = msg.from.id;
    if (!groupMembers[userId]) {
      groupMembers[userId] = msg.from;
    }
  }
});

// Handle callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;

  if (data === 'main_menu') {
    const menuText = `
╔═══════════════════╗
║    🤖 MAIN MENU    ║
╚═══════════════════╝

*📱 WhatsApp Pairing Bot*
━━━━━━━━━━━━━━━━━━━

🔹 Connect your WhatsApp
🔹 Manage connections
🔹 Get support

━━━━━━━━━━━━━━━━━━━
💡 Select an option below:
`;
    
    const opts = {
      message_id: messageId,
      chat_id: chatId,
      caption: menuText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "📱 Pair WhatsApp", callback_data: "pair_info" }],
          [{ text: "📋 My Connections", callback_data: "list_my_connections" }],
          [{ text: "ℹ️ Bot Info", callback_data: "bot_info" }],
          [{ text: "💬 Support Group", url: "https://t.me/primekillercrasherv1" }],
          [{ text: "📢 Channel", url: "https://t.me/primekillercrasher" }]
        ]
      }
    };
    
    bot.editMessageCaption(menuText, opts);
  } else if (data === 'pair_info') {
    const pairText = `
╔═══════════════════╗
║   📱 HOW TO PAIR   ║
╚═══════════════════╝

*Step-by-step guide:*

1️⃣ Use command: \`/pair <number>\`
2️⃣ Example: \`/pair 2547xxxxxx\`
3️⃣ Get your pairing code
4️⃣ Enter code in WhatsApp

━━━━━━━━━━━━━━━━━━━
⚠️ *Important Notes:*
• Use international format
• No + or 0 prefix needed
• One connection per number

━━━━━━━━━━━━━━━━━━━
`;
    
    bot.editMessageCaption(pairText, {
      message_id: messageId,
      chat_id: chatId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "main_menu" }]
        ]
      }
    });
  } else if (data === 'list_my_connections') {
    const userConnections = connectedUsers[chatId] || [];
    
    if (userConnections.length === 0) {
      bot.answerCallbackQuery(query.id, {
        text: "❌ You don't have any active connections",
        show_alert: true
      });
      return;
    }
    
    let connectionList = `
╔═══════════════════╗
║  📱 MY CONNECTIONS  ║
╚═══════════════════╝

`;
    
    userConnections.forEach((conn, index) => {
      connectionList += `${index + 1}. 📞 \`${conn.phoneNumber}\`\n`;
    });
    
    connectionList += `\n━━━━━━━━━━━━━━━━━━━\n📊 Total: ${userConnections.length} connection(s)`;
    
    const buttons = userConnections.map(conn => [
      { text: `❌ Disconnect ${conn.phoneNumber}`, callback_data: `disconnect_${conn.phoneNumber}` }
    ]);
    buttons.push([{ text: "🔙 Back to Menu", callback_data: "main_menu" }]);
    
    bot.editMessageCaption(connectionList, {
      message_id: messageId,
      chat_id: chatId,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons }
    });
  } else if (data === 'bot_info') {
    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    
    const infoText = `
╔═══════════════════╗
║   ℹ️ BOT INFO      ║
╚═══════════════════╝

⏱ *Uptime:* ${days}d ${hours}h ${minutes}m
👥 *Users:* ${userIds.length}
🔗 *Connections:* ${Object.keys(connectedUsers).length}
📡 *Status:* Online ✅

━━━━━━━━━━━━━━━━━━━
🛠 *Developer:* @P҉r҉i҉m҉e҉ ✞ kîllér ✞ K҉e҉n҉t҉
📦 *Version:* 2.0.0
━━━━━━━━━━━━━━━━━━━
`;
    
    bot.editMessageCaption(infoText, {
      message_id: messageId,
      chat_id: chatId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "main_menu" }]
        ]
      }
    });
  } else if (data.startsWith('disconnect_')) {
    const phoneNumber = data.replace('disconnect_', '');
    const sessionPath = path.join(__dirname, 'trash_baileys', `session_${phoneNumber}`);
    
    try {
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        if (connectedUsers[chatId]) {
          connectedUsers[chatId] = connectedUsers[chatId].filter(user => user.phoneNumber !== phoneNumber);
          saveConnectedUsers();
        }
        bot.answerCallbackQuery(query.id, {
          text: `✅ Disconnected ${phoneNumber} successfully!`,
          show_alert: true
        });
      } else {
        bot.answerCallbackQuery(query.id, {
          text: `❌ Session not found for ${phoneNumber}`,
          show_alert: true
        });
      }
    } catch (error) {
      bot.answerCallbackQuery(query.id, {
        text: "❌ Error disconnecting session",
        show_alert: true
      });
    }
  }
});

// Command handlers
bot.onText(/\/(\w+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const command = match[1];

  switch (command) {
    case "menu":
    case "start":
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📱 Pair WhatsApp", callback_data: "pair_info" }],
            [{ text: "📋 My Connections", callback_data: "list_my_connections" }],
            [{ text: "ℹ️ Bot Info", callback_data: "bot_info" }],
            [
              { text: "💬 Group", url: "https://t.me/primekillercrasherv1" },
              { text: "📢 Channel", url: "https://t.me/primekillercrasher" }
            ]
          ]
        }
      };
      
      const welcomeText = `
╔═══════════════════╗
║  🤖 WELCOME TO BOT  ║
╚═══════════════════╝

*📱 WhatsApp Pairing Bot*
━━━━━━━━━━━━━━━━━━━

✨ *Available Commands:*

📱 /pair - Connect WhatsApp
🗑 /delpair - Disconnect session
📋 /listpaired - View connections
⏱ /uptime - Check bot uptime
🆔 /getmyid - Get your ID
📊 /botinfo - Bot statistics
🏓 /ping - Check bot speed

━━━━━━━━━━━━━━━━━━━
💡 Developed by ⛧ＰＲＩΜΞ⛧ kîᄂᄂér ⛧ƘΞИŦ⛧
`;
      
      bot.sendPhoto(chatId, 'https://i.postimg.cc/L6CPdTdG/file-000000005f2c722f8ccf3dfe281cf45b.png', {
        caption: welcomeText,
        parse_mode: "Markdown",
        ...opts
      });
      break;

    case "uptime":
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((uptime % (60 * 60)) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeMessage = `
╔═══════════════════╗
║   ⏱ BOT UPTIME    ║
╚═══════════════════╝

📆 *Days:* ${days}
🕐 *Hours:* ${hours}
⏰ *Minutes:* ${minutes}
⏱ *Seconds:* ${seconds}

━━━━━━━━━━━━━━━━━━━
✅ *Status:* Running Smoothly
`;
      
      bot.sendMessage(chatId, uptimeMessage, { parse_mode: 'Markdown' });
      break;

    case "getmyid":
      const username = msg.from.username ? `@${msg.from.username}` : 'No username';
      const idMessage = `
╔═══════════════════╗
║   👤 YOUR INFO     ║
╚═══════════════════╝

🆔 *ID:* \`${userId}\`
📝 *Username:* ${username}
👤 *Name:* ${msg.from.first_name || 'N/A'}

━━━━━━━━━━━━━━━━━━━
`;
      
      bot.sendMessage(chatId, idMessage, { parse_mode: 'Markdown' });
      break;

    case "ping":
      const start = speed();
      const sent = await bot.sendMessage(chatId, '🏓 *Pinging...*', { parse_mode: 'Markdown' });
      const end = speed();
      const responseTime = (end - start).toFixed(2);
      
      bot.editMessageText(
        `🏓 *Pong!*\n\n⚡ *Speed:* ${responseTime}ms`,
        {
          chat_id: chatId,
          message_id: sent.message_id,
          parse_mode: 'Markdown'
        }
      );
      break;

    case 'pair': {
      // Check membership first
      const membership = await checkMembership(userId);
      
      if (!membership.bothJoined) {
        const missingText = `
╔═══════════════════╗
║  ⚠️ ACCESS DENIED   ║
╚═══════════════════╝

❌ *You must join both:*

${!membership.isChannelMember ? '📢 Channel: Required' : '✅ Channel: Joined'}
${!membership.isGroupMember ? '💬 Group: Required' : '✅ Group: Joined'}

━━━━━━━━━━━━━━━━━━━
*Please join both to continue!*
`;
        
        const joinOpts = {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: "📢 Join Channel", url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}` }],
              [{ text: "💬 Join Group", url: `https://t.me/${REQUIRED_GROUP.replace('@', '')}` }],
              [{ text: "✅ I Joined, Try Again", callback_data: "verify_membership" }]
            ]
          }
        };
        
        bot.sendMessage(chatId, missingText, joinOpts);
        break;
      }

      const phoneNumber = msg.text.split(' ')[1];
      if (!phoneNumber) {
        bot.sendMessage(chatId, `
╔═══════════════════╗
║  ❌ INVALID FORMAT  ║
╚═══════════════════╝

*Please provide a phone number:*

✅ *Correct:* \`/pair 2547xxxxx\`
❌ *Wrong:* \`/pair +2547xxxx\`
❌ *Wrong:* \`/pair 07xxxx\`

━━━━━━━━━━━━━━━━━━━
⚠️ *No + or 0 prefix needed!*
`, { parse_mode: 'Markdown' });
        break;
      }

      // Check for + or 0 prefix
      if (phoneNumber.startsWith('+') || phoneNumber.startsWith('0')) {
        bot.sendMessage(chatId, `
╔═══════════════════╗
║  ❌ INVALID PREFIX  ║
╚═══════════════════╝

❌ *Error:* Number cannot start with + or 0

*Example:*
✅ Correct: \`254712345678\`
❌ Wrong: \`+254712345678\`
❌ Wrong: \`0712345678\`

━━━━━━━━━━━━━━━━━━━
`, { parse_mode: 'Markdown' });
        break;
      }

      const sessionPath = path.join(__dirname, 'trash_baileys', `session_${phoneNumber}`);
      
      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
        
        bot.sendMessage(chatId, `
╔═══════════════════╗
║  🔄 GENERATING...  ║
╚═══════════════════╝

📱 *Number:* \`${phoneNumber}\`
⏳ *Status:* Generating pairing code...

━━━━━━━━━━━━━━━━━━━
*Please wait...*
`, { parse_mode: 'Markdown' });
        
        startWhatsAppBot(phoneNumber, chatId).catch(err => {
          console.log('Error:', err);
          bot.sendMessage(chatId, '❌ An error occurred while connecting.');
        });
      } else {
        const isAlreadyConnected = connectedUsers[chatId] && connectedUsers[chatId].some(user => user.phoneNumber === phoneNumber);
        
        if (isAlreadyConnected) {
          bot.sendMessage(chatId, `
╔═══════════════════╗
║  ⚠️ ALREADY PAIRED  ║
╚═══════════════════╝

📱 *Number:* \`${phoneNumber}\`
✅ *Status:* Already connected

━━━━━━━━━━━━━━━━━━━
*Use /delpair to remove first*
`, { parse_mode: 'Markdown' });
          break;
        }
        
        bot.sendMessage(chatId, `
╔═══════════════════╗
║  ℹ️ SESSION EXISTS  ║
╚═══════════════════╝

📱 *Number:* \`${phoneNumber}\`

*Options:*
• Use /delpair to remove
• Then pair again

━━━━━━━━━━━━━━━━━━━
`, { parse_mode: 'Markdown' });
      }
      break;
    }

    case "delpair": {
      const phoneNumber = msg.text.split(' ')[1];
      
      if (!phoneNumber) {
        bot.sendMessage(chatId, `
╔═══════════════════╗
║  ❌ INVALID FORMAT  ║
╚═══════════════════╝

*Please provide a phone number:*

✅ *Example:* \`/delpair 2547xxxxx\`

━━━━━━━━━━━━━━━━━━━
`, { parse_mode: 'Markdown' });
        break;
      }

      const sessionPath = path.join(__dirname, 'trash_baileys', `session_${phoneNumber}`);
      
      try {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          
          if (connectedUsers[chatId]) {
            connectedUsers[chatId] = connectedUsers[chatId].filter(user => user.phoneNumber !== phoneNumber);
            saveConnectedUsers();
          }
          
          bot.sendMessage(chatId, `
╔═══════════════════╗
║  ✅ DISCONNECTED   ║
╚═══════════════════╝

📱 *Number:* \`${phoneNumber}\`
✅ *Status:* Successfully removed

━━━━━━━━━━━━━━━━━━━
*You can now pair again!*
`, { parse_mode: 'Markdown' });
        } else {
          bot.sendMessage(chatId, `
╔═══════════════════╗
║  ❌ NOT FOUND      ║
╚═══════════════════╝

📱 *Number:* \`${phoneNumber}\`
❌ *Status:* No session found

━━━━━━━━━━━━━━━━━━━
`, { parse_mode: 'Markdown' });
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        bot.sendMessage(chatId, '❌ Failed to delete session. Please try again later.');
      }
      break;
    }

    case "listpaired": {
      const userConnections = connectedUsers[chatId] || [];
      
      if (userConnections.length === 0) {
        bot.sendMessage(chatId, `
╔═══════════════════╗
║  📱 NO CONNECTIONS  ║
╚═══════════════════╝

❌ *You don't have any active connections*

━━━━━━━━━━━━━━━━━━━
*Use /pair to connect WhatsApp*
`, { parse_mode: 'Markdown' });
        break;
      }

      let connectionList = `
╔═══════════════════╗
║  📱 MY CONNECTIONS  ║
╚═══════════════════╝

`;
      
      userConnections.forEach((conn, index) => {
        connectionList += `${index + 1}. 📞 \`${conn.phoneNumber}\`\n`;
      });
      
      connectionList += `\n━━━━━━━━━━━━━━━━━━━\n📊 *Total:* ${userConnections.length} connection(s)`;
      
      bot.sendMessage(chatId, connectionList, { parse_mode: 'Markdown' });
      break;
    }

    case "botinfo": {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((uptime % (60 * 60)) / 60);
      
      const totalConnections = Object.values(connectedUsers).reduce((acc, curr) => acc + curr.length, 0);
      
      const infoText = `
╔═══════════════════╗
║   📊 BOT INFO      ║
╚═══════════════════╝

⏱ *Uptime:* ${days}d ${hours}h ${minutes}m
👥 *Total Users:* ${userIds.length}
🔗 *Active Connections:* ${totalConnections}
📡 *Status:* Online ✅

━━━━━━━━━━━━━━━━━━━
🛠 *Developer:* ⛧ＰＲＩΜΞ⛧ kîᄂᄂér ⛧ƘΞИŦ⛧
📦 *Version:* 2.0.0
🌐 *Platform:* Node.js
━━━━━━━━━━━━━━━━━━━
`;
      
      bot.sendMessage(chatId, infoText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "💬 Support", url: "https://t.me/Handsome_primis_killer_kent" },
              { text: "📢 Updates", url: "https://t.me/primekillercrasher" }
            ]
          ]
        }
      });
      break;
    }

    default:
      bot.sendMessage(chatId, `
╔═══════════════════╗
║  ❌ UNKNOWN COMMAND  ║
╚═══════════════════╝

*Command not recognized!*

━━━━━━━━━━━━━━━━━━━
*Type /start for help*
`, { parse_mode: 'Markdown' });
  }
});

// Load plugins
const pluginsPath = path.join(__dirname, "plugins");
if (fs.existsSync(pluginsPath)) {
  fs.readdirSync(pluginsPath).forEach((file) => {
    if (file.endsWith(".js")) {
      try {
        const plugin = require(path.join(pluginsPath, file));
        if (typeof plugin === "function") {
          plugin(bot);
          console.log(`✅ Plugin loaded: ${file}`);
        }
      } catch (err) {
        console.log(`❌ Error loading plugin ${file}:`, err);
      }
    }
  });
}

// Watch for file changes
fs.watchFile('index.js', (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log('🔄 Changes detected, restarting...');
    process.exit(0);
  }
});

// Load all sessions on startup
async function loadAllSessions() {
  const sessionsDir = path.join(__dirname, 'trash_baileys');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  const sessionFiles = fs.readdirSync(sessionsDir);
  for (const file of sessionFiles) {
    if (file.startsWith('session_')) {
      const phoneNumber = file.replace('session_', '');
      await startWhatsAppBot(phoneNumber);
    }
  }
}

// Initialize
loadConnectedUsers();
loadAllSessions().catch(err => {
  console.log('❌ Error loading sessions:', err);
});

console.log(`
╔════════════════════════════╗
║  ✅ BOT STARTED SUCCESSFULLY  ║
╚════════════════════════════╝

📱 Telegram Bot: Active
🔗 WhatsApp Bridge: Ready
⏰ Time: ${moment().format('HH:mm:ss')}
📅 Date: ${moment().format('DD/MM/YYYY')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠 Developer: ⛧ＰＲＩΜΞ⛧ kîᄂᄂér ⛧ƘΞИŦ⛧
━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
