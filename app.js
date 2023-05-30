const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const config = require('./config.json');
const { Configuration, OpenAIApi } = require("openai");

app.get("/", (req, res) => RequestConcept(req, res));
app.get("/tags", (req, res) => RequestTags(req, res));

function RequestTags(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.type('application/json').send(config["tags"]);
}

async function RequestConcept(req, res) {
  res.header("Access-Control-Allow-Origin", "*");

  const openai = GetOpenAIObject();
  const concept = await GenerateConcept(openai, GetParameters(req));
  const imageURLs = await GetImageURLs(openai, concept);

  const response = {
    concept: concept,
    images: imageURLs,
  }

  res.type('application/json').send(response);
}

function GeneratePrompt(tags, theme) {
  prompt = config["prompt"];
  prompt += "Theme: " + theme + "\n";
  prompt += "Tags: " + tags + "\n";
  return prompt;
}

function GetParameters(req) {
  console.log("Tags: " + req.query.tags);
  console.log("Theme: " + req.query.theme);
  return [
    req.query.tags,
    req.query.theme,
  ];
}

function GetOpenAIObject() {
  const key = process.env.OPENAI_API_KEY == undefined ? require('./secret.json')["OPENAI_API_KEY"] : process.env.OPENAI_API_KEY;
  const configuration = new Configuration({
    apiKey: key
  });
  return new OpenAIApi(configuration);
}

async function GenerateConcept(openai, tags, theme) {
  const conceptResponse = await openai.createCompletion({
    model: config["model"],
    prompt: GeneratePrompt(tags, theme),
    temperature: config["temperature"],
    max_tokens: config["max_tokens"],
  });

  return conceptResponse.data.choices[0].text;
}

async function GetImageURLs(openai, concept) {
  const imageResponse = await openai.createImage({
    prompt: concept,
    n: config["numberOfImages"],
    size: config["imageSize"],
  });

  let imageURLs = [];
  for (let i = 0; i < imageResponse.data.data.length; i++) {
    imageURLs.push(imageResponse.data.data[i].url);
  }

  return imageURLs;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));