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

  let response = { concept: { title: "", genre: "", key_mechanic: "", description: "", visuals: "", special: "" }, images: [] };

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
  const conceptResponse = await openai.createChatCompletion({
    model: config["model"],
    messages: [{ role: "system", content: GeneratePrompt(tags, theme) }],
    max_tokens: config["max_tokens"],
    temperature: config["temperature"],
    stop: null,
    n: 1,
  });

  return conceptResponse.data.choices[0].message.content;
}

async function ParseConcept(concept, response, openai) {
  response.concept.title = concept["Title"];
  response.concept.genre = concept["Genre"];
  response.concept.key_mechanic = concept["Key Mechanic"];
  response.concept.description = concept["Description"];
  response.concept.visuals = concept["Visuals"];
  response.concept.special = concept["What makes it special"];
  response.images = await GetImageURLs(openai, concept["Dall-E Prompt"]);
}

async function GetImageURLs(openai, concept) {
  const imageResponse = await openai.createImage({
    prompt: JSON.stringify(concept),
    n: config["numberOfImages"],
    size: config["imageSize"],
    response_format: "b64_json",
  });

  console.log(imageResponse);


  return imageResponse;

  let imageURLs = [];
  for (let i = 0; i < imageResponse.data.data.length; i++)
    imageURLs.push(imageResponse.data.data[i].url);

  return imageURLs;
}

app.listen(port, () => console.log(`Jam buddy listening on port ${port}!`));