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

  let response = { title: "", genre: "", key_mechanic: "", description: "", visuals: "", special: "", images: [] };

  try {
    const openai = GetOpenAIObject();
    const concept = JSON.parse(await GenerateConcept(openai, GetParameters(req)));
    await ParseConcept(concept, response, openai);
  } catch (error) { console.log(error); }

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

async function ParseConcept(concept, response, openai) {
  response.title = concept["Title"];
  response.genre = concept["Genre"];
  response.key_mechanic = concept["Key Mechanic"];
  response.description = concept["Description"];
  response.visuals = concept["Visuals"];
  response.special = concept["What makes it special"];
  response.images = await GetImageURLs(openai, concept["Dall-E Prompt"]);
}

async function GetImageURLs(openai, concept) {
  const imageResponse = await openai.createImage({
    prompt: JSON.stringify(concept),
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