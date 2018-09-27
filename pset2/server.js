const URL = require('url').URL;
require('cross-fetch/polyfill');
const express = require('express');
const app = express();
app.use(express.static('./'));
app.use(express.json());

const base_url = "https://api.harvardartmuseums.org/";

function get_url(type, queries){
  const new_url = new URL(type, base_url);
  new_url.searchParams.append('apikey', '47f218b0-b5d5-11e8-8c0c-03e1b17d6f1e');
  new_url.searchParams.append('size', 100);
  Object.keys(queries).forEach(key => {
    new_url.searchParams.append(key, queries[key]);
  });
  return new_url;
}

app.get('/', (request, response) => {
  //
});

app.get('/gallery?', async (request, response) => {
  //console.log(request);
  const new_url = get_url("/gallery?", request.query);
  const res = await fetch(new_url.href);
  const json = await res.json();
  //console.log(json);
  response.send(json);
});

app.get('/object?', async (request, response) => {
  //console.log(request);
  const new_url = get_url("/object?", request.query);
  const res = await fetch(new_url.href);
  const json = await res.json();
  //console.log(json);
  response.send(json);
});

app.get('/json', (request, response) => {
  response.status(200).json({"content" : "yup"});
});

app.listen(3000, () => {
  console.log('Express running');
});
