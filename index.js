var Botkit = require('botkit')
var math = require('mathjs')

var redisConfig = {
    url: process.env.REDISCLOUD_URL
}
var redisStorage = require('botkit-storage-redis')(redisConfig)

console.log("Booting flumber bot")

var controller = Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage
});

controller.setupWebserver(process.env.PORT, function(err,webserver) {
    controller.createWebhookEndpoints(controller.webserver);
    controller.createOauthEndpoints(controller.webserver);
});

var parser = math.parser()

controller.hears('.*', 'direct_mention,direct_message', (bot, message) => {
  new Promise((resolve, reject) => {
    console.log("Evaluating Message:")
    console.log(message)

    var reply = ""

    try {
      var expression = message.text
      var result = parser.eval(expression)
      reply = "anser :) --> " + result
    }
    catch (error) {
      console.log("ERROR:\n"+error)
      reply = "i dunt unerstand :(\n\n"+error
    }

    resolve(reply)
  })
  .then((res) => {
    return bot.replyInThread(message, res);
  })
  .error((error) => {
    return bot.replyInThread(message, error);
  })
});