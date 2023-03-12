const Bot = require("node-telegram-bot-api");
const axios = require("axios");

let bot;
let currentTranslation;
const token = process.env.TOKEN;
const chatGPTFakeAcc = "https://chatgpt-api.shn.hk/v1/";

if (process.env.NODE_ENV === "production") {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

console.log("Bot server started in the " + process.env.NODE_ENV + " mode");

bot.on("polling_error", (error) => {
  console.log(error); // => 'EFATAL'
});

function sendMessage(msg, text) {
  bot.sendMessage(msg.chat.id, text);
}

async function getTranslation(msg) {
  axios
    .post(chatGPTFakeAcc, {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Давай переведем несколько фраз с вьетнамского языка на русский. Вот нужный текст: ${msg.text}`,
        },
      ],
    })
    .then(function (response) {
      currentTranslation = response.data.choices[0].message.content;
      sendMessage(msg, currentTranslation);
    })
    .catch(function (error) {
      return error;
    });
}

bot.on("text", async (msg) => {
  const name = msg.from.first_name;

  // HELP command
  if (msg.text.includes("/help")) {
    //TODO: add common description;
    bot.sendMessage(
      msg.chat.id,
      `Hello ${name}! This is a list of all possible commands: 
        
          /getkdr - Get your kill damage ratio and total average accuracy.
          /getbest - Get best weapon in each category, depends on kill.
          /last - get stats of your last match result. 
          /stattrak - get all kill stats.
          /reset - Drop off all search data.
        `
    );
    return;
  } else {
    await getTranslation(msg);
  }
});

module.exports = bot;
