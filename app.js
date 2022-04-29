require("dotenv").config();

const Discord = require("discord.js");
const token = process.env.TOKEN;
const apikey = process.env.APIKEY;
const bot = new Discord.Client();
const axios = require("axios");

const express = require("express");
const app = express();

let intervalIDs = [];
let sendHour = 08;
let sendMinute = "00";
let sendTiming;
let user = "<@!283213199900147713>";

const birthdays = [
  {
    name: "<@!285034326951723009>", //Zhi Qing
    birthday: "08/02",
    pronoun: "her",
    firstName: "zhi",
    lastName: "qing",
  },
  {
    name: "<@!283213199900147713>", //Tian Lang
    birthday: "14/02",
    pronoun: "him",
    firstName: "tian",
    lastName: "lang",
  },
  {
    name: "<@!283072899085238283>", //Zheng Long
    birthday: "16/02",
    pronoun: "him",
    firstName: "zheng",
    lastName: "long",
  },
  {
    name: "<@!283072887538188288>", //Yang Han
    birthday: "18/03",
    pronoun: "him",
    firstName: "yang",
    lastName: "han",
  },
  {
    name: "<@!283076595957104641>", //Kaiwen
    birthday: "19/04",
    pronoun: "him",
    firstName: "kai",
    lastName: "wen",
  },
  // {
  //     name:"<@!194062517020917760>", //Hui Xiang
  //     birthday:"23/04",
  //     pronoun:"him",
  //     firstName: "hui",
  //     lastName: "xiang"
  // },
  {
    name: "<@!285035648568786954>", //Ryan
    birthday: "28/04",
    pronoun: "him",
    firstName: "ryan",
    lastName: "",
  },
  {
    name: "<@!283248292668768256>", //Kevin
    birthday: "12/05",
    pronoun: "him",
    firstName: "kevin",
    lastName: "",
  },
  {
    name: "<@!269504508176891905>", //Ho Chi
    birthday: "23/05",
    pronoun: "him",
    firstName: "ho",
    lastName: "chi",
  },
  {
    name: "<@!283072989728342016>", //Yongxi
    birthday: "01/06",
    pronoun: "him",
    firstName: "yong",
    lastName: "xi",
  },
  {
    name: "<@!283071539539345410>", //Shukai
    birthday: "12/06",
    pronoun: "him",
    firstName: "shu",
    lastName: "kai",
  },
  {
    name: "<@!283122911710019584>", //Sherie
    birthday: "26/07",
    pronoun: "her",
    firstName: "sherie",
    lastName: "",
  },
  {
    name: "<@!264569094294994944>", //Keng Hong
    birthday: "03/08",
    pronoun: "him",
    firstName: "keng",
    lastName: "hong",
  },
  {
    name: "<@!283074031383478273>", //Youjing
    birthday: "30/08",
    pronoun: "her",
    firstName: "you",
    lastName: "jing",
  },
  {
    name: "<@!283072384892665862>", //Ian
    birthday: "20/09",
    pronoun: "him",
    firstName: "ian",
    lastName: "",
  },
  {
    name: "<@!190039418541703168>", //Jingjing
    birthday: "22/09",
    pronoun: "her",
    firstName: "jing",
    lastName: "jing",
  },
  {
    name: "<@!286150477458964481>", //Mingkai
    birthday: "24/09",
    pronoun: "him",
    firstName: "ming",
    lastName: "kai",
  },
  {
    name: "<@!284965559412588555>", //Meijie
    birthday: "06/10",
    pronoun: "her",
    firstName: "mei",
    lastName: "jie",
  },
  {
    name: "<@!225238258152374272>", //Yifan
    birthday: "18/10",
    pronoun: "him",
    firstName: "yi",
    lastName: "fan",
  },
  {
    name: "<@!283193894680657920>", //Xinyi
    birthday: "19/10",
    pronoun: "her",
    firstName: "xin",
    lastName: "yi",
  },
  {
    name: "<@!283100749343490048>", //Esther
    birthday: "08/11",
    pronoun: "her",
    firstName: "esther",
    lastName: "",
  },
  {
    name: "<@!284967696603414530>", //Hexiang
    birthday: "15/11",
    pronoun: "him",
    firstName: "he",
    lastName: "xiang",
  },
  {
    name: "<@!283372253306159104>", //Jiyuan
    birthday: "09/12",
    pronoun: "him",
    firstName: "ji",
    lastName: "yuan",
  },
];

async function callUrbanApi(nameString) {
  const options = {
    method: "GET",
    url: "https://mashape-community-urban-dictionary.p.rapidapi.com/define",
    params: { term: nameString },
    headers: {
      "X-RapidAPI-Host": "mashape-community-urban-dictionary.p.rapidapi.com",
      "X-RapidAPI-Key": apikey,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.list;
  } catch (error) {
    return [];
  }
}

async function urbanDictionary(firstName, lastName) {
  let count = 0;
  let payload;
  let noResult = false;
  let data = [];
  while (data.length == 0 && !noResult) {
    switch (count) {
      case 0:
        payload = firstName + lastName;
        break;
      case 1:
        payload = firstName;
        break;
      case 2:
        payload = lastName;
        break;
      default:
        payload = "";
        noResult = true;
        break;
    }
    if (payload != "") {
      data = await callUrbanApi(payload);
    }
    count++;
  }
  if (data.length == 0) {
    return { success: false, payload: firstName + lastName };
  }
  const randomIndex = Math.floor(Math.random() * data.length);
  const randomDefinition = data[randomIndex];
  return {
    success: true,
    payload: firstName + lastName,
    definition: randomDefinition.definition,
    permalink: randomDefinition.permalink,
    word: randomDefinition.word,
    example: randomDefinition.example,
    author: randomDefinition.author,
    written_on: new Date(randomDefinition.written_on),
  };
}

bot.login(token);
bot.on("ready", () => {
  bot.user.setPresence({ activity: { name: ";help", type: 2 } });
  const channel = bot.channels.cache.get("283072604917727232");

  function getCurrentDate() {
    let [fullDate, time] = new Date()
      .toLocaleString("en-GB", { timeZone: "Asia/Singapore" })
      .split(", ");
    date = fullDate.slice(0, 5);
    if (time == "00:00:00") {
      birthdays.forEach((classmate) => {
        if (classmate.birthday == date) {
          channel.send(
            `It's ${classmate.name}'s birthday today! Show ${classmate.pronoun} some love!`
          );
          urbanDictionary(classmate.firstName, classmate.lastName).then(
            (result) => {
              if (result.success){
                channel.send(
                  `Urban Dictionary: **${result.payload}**\n>>> **${
                    result.word
                  }**\n${result.definition}\n*${result.example}*\nby **${
                    result.author
                  }** ${result.written_on.toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}\n<${result.permalink}>`
                );
              } else {
                channel.send(
                  `Urban Dictionary: **${result.payload}**\n>>> Aww. No results obtained.`
                );
              }
            }
          );
        }
      });
    }
  }
  setInterval(getCurrentDate, 1000);
});

bot.on("message", (msg) => {
  if (msg.content.startsWith(";start")) {
    if (intervalIDs.some((e) => e.channelID == msg.channel.id)) {
      msg.channel.send(`I can't take more care of ${user}!`);
    } else {
      msg.channel.send(`I will now take care of ${user}!`);
      function getCurrentTime() {
        let [hour, minute, second] = new Date()
          .toLocaleTimeString("en-GB", { timeZone: "Asia/Singapore" })
          .split(":");
        if (hour == sendHour && minute == sendMinute && second == 00) {
          msg.channel.send(`How are you ${user}?`);
        }
      }
      getintervalID = setInterval(getCurrentTime, 1000);
      intervalIDs.push({
        channelID: msg.channel.id,
        intervalID: getintervalID,
      });
    }
  } else if (msg.content.startsWith(";stop")) {
    msg.channel.send(`I will now stop taking care of ${user}.`);
    clearInterval(
      intervalIDs.find((e) => e.channelID == msg.channel.id).intervalID
    );
    intervalIDs = intervalIDs.filter((e) => e.channelID != msg.channel.id);
  } else if (msg.content.startsWith(";time")) {
    if (msg.content.split(" ")[1] < 2400 && msg.content.split(" ")[1] >= 0) {
      sendTiming = msg.content.split(" ")[1];
      if (
        sendTiming.substring(sendTiming.length - 4, sendTiming.length - 2)
          .length == 2 &&
        sendTiming.substring(sendTiming.length - 2, sendTiming.length) < 60
      ) {
        sendHour = sendTiming.substring(
          sendTiming.length - 4,
          sendTiming.length - 2
        );
        sendMinute = sendTiming.substring(
          sendTiming.length - 2,
          sendTiming.length
        );
        msg.channel.send(
          `I will check on ${user} everyday at ${sendHour}${sendMinute}.`
        );
      } else {
        msg.channel.send(
          "Invalid response, ;time <time in 24hr clock>, eg. ;time 1600"
        );
      }
    } else if (msg.content.split(" ")[1] == undefined) {
      msg.channel.send(
        `I will check on ${user} everyday at ${sendHour}${sendMinute}.`
      );
    } else {
      msg.channel.send(
        "Invalid response, -time <time in 24hr clock>, eg. -time 1600"
      );
    }
  } else if (msg.content.startsWith(";user")) {
    if (msg.content.split(" ")[1].startsWith("<@!")) {
      user = msg.content.split(" ")[1];
      msg.channel.send(`I will now care for ${user}!`);
      // const userTag = bot.users.cache.get(user.split("<@!")[1].split(">")[0]).tag;
      // const username = userTag.substring(0,userTag.length-5);
      // bot.user.setPresence({activity:{name:`${username}`,type:1}});
    } else {
      msg.channel.send(`Invalid user.`);
    }
  } else if (msg.content.startsWith(";help")) {
    msg.channel.send(
      `**__Commands List:__**\n;start - start caring for ${user} \n;user <tag> - start caring for somebody else \n;time <time in 24hr clock> - change time to show care \n;stop - stop caring for ${user}`
    );
  } else if (msg.content.startsWith(";testingfeature")) {
    urbanDictionary('kevin','').then(
      (result) => {
        if (result.success){
          msg.channel.send(
            `Urban Dictionary: **${result.payload}**\n>>> **${
              result.word
            }**\n${result.definition}\n*${result.example}*\nby **${
              result.author
            }** ${result.written_on.toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}\n<${result.permalink}>`
          );
        } else {
          msg.channel.send(
            `Urban Dictionary: **${result.payload}**\n>>> Aww. No results obtained.`
          );
        }
      }
    );
  }
});

port = process.env.PORT;
if (port == "" || port == null) {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port", port);
});
