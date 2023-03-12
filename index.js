const fs = require("fs");
const login = require("unofficial-fb-chat-api");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const chatgpt = async (api, event, args) => {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: args,
    temperature: 0.3,
    max_tokens: 3000,
  });
  api.sendMessage(completion.data.choices[0].text, event.threadID, event.messageID)
}

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});

    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);

        api.markAsRead(event.threadID, (err) => {
            if(err) console.error(err);
        });

        switch(event.type) {
            case "message":
                const arg = event.body.trim().split(/ +/).slice(1);
                const args = arg.join(" ");
                if(event.body == `!ai ${args}`) {
                  chatgpt(api, event, args)
                }
                break;
            case "event":
                console.log(event);
                break;
        }
    });
});
