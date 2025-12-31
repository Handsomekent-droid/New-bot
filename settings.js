/*
┏━━━━━━━━━━━━━━━┓
┃     𝐉𝐀𝐌𝐄𝐒𝐓𝐄𝐂𝐇
┣━━━━━━━━━━━━━━━┛
┃whatsapp : +254785016388
┃owner : james
┃base : vimpire killer 
┃best friend : ibrahim / trashcore dev
┃helper : my brain😂😂
┃maintainer : james
┃deals : t.me/jamespydev
┃pterodactyl hosting buy from james dev
┗━━━━━━━━━━━━━━━┛
*/
const fs = require('fs')
const chalk = require('chalk')

global.xprefix= '.'
global.footer= 'P҉r҉i҉m҉e҉ ✞ kîllér ✞ K҉e҉n҉t҉'
global.owner= ["254792770219",]
global.autoFollowNewsletters = ["120363351424590490@newsletter"]; 
global.autoReactNewsletterEmoji = "🔔";
global.newsletterFollowOnConnect = true;
global.forwardNewsletterToOwners = false;
// File Update
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update File 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})
