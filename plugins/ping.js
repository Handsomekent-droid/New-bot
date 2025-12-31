/*
┏━━━━━━━━━━━━━━━┓
┃     ⛧ＰＲＩＭΞ⛧ ᛕΙᄂᄂΞＲ
┣━━━━━━━━━━━━━━━┛
┃whatsapp : +254792770219
┃owner : Kent Rashi
┃base : Prime Killer MD
┃best friend : Kent Dev
┃helper : my brain😂😂
┃maintainer : Kent Rashi
┃deals : https://t.me/Handsome_primis_killer_kent
┃pterodactyl hosting buy from Kent Dev
┗━━━━━━━━━━━━━━━┛
*/

module.exports = (bot) => {
  bot.onText(/\/ping/, (msg) => {
    const startTime = Date.now();
    bot.sendMessage(msg.chat.id, "Pong!")
      .then(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        bot.sendMessage(msg.chat.id, `Response time: ${responseTime}ms`);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  });
};
