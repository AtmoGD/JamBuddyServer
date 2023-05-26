// Set up the server
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

// Load the configuration file
const config = require('./config.json');

// Set up the OpenAI API
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up the prompt endpoint
app.get("/", (req, res) => res.type('html').send(html));
app.get("/prompt", (req, res) => RequestConcept(req, res));

// Set up the tags endpoint
app.get("/tags", (req, res) => RequestTags(req, res));

// Send the tags to the client
function RequestTags(req, res) {
  res.header("Access-Control-Allow-Origin", "*");

  tags = config["tags"];

  res.type('application/json').send(tags);
}

// Create a openai request and send the response to the client
async function RequestConcept(req, res) {
  res.header("Access-Control-Allow-Origin", "*");

  tags = req.query.tags;
  theme = req.query.theme;

  const response = await openai.createCompletion({
    model: config["model"],
    prompt: GeneratePrompt(tags, theme),
    temperature: config["temperature"],
    max_tokens: config["max_tokens"],
  });

  res.type('application/json').send(response);
}

// Generate a prompt from the tags and the theme
function GeneratePrompt(tags, theme) {
  prompt = config["prompt"];
  prompt += "Theme: " + theme + "\n";
  prompt += "Tags: " + tags + "\n";
  return prompt;
}

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));


//<--------------------- OLD -------------------------->

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Let\'s Jam Buddy!!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Let\'s Jam Buddy!
    </section>
  </body>
</html>
`
