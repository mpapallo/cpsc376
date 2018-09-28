const url = require('url');
const URL = url.URL;
require('cross-fetch/polyfill');

const passport = require('passport');
const passport_setup = require('./passport-setup');
const keys = require('./keys');

const express = require('express');
const app = express();
app.use(express.static('./')); //so that root displays index.html
app.use(express.json());

const base_url = "https://api.harvardartmuseums.org/";
let logged_in = false;

/* build out the new url to fetch */
function get_url(type, queries){
  const new_url = new URL(type, base_url);
  new_url.searchParams.append('apikey', keys.api.key);
  new_url.searchParams.append('size', 100);
  Object.keys(queries).forEach(key => {
    new_url.searchParams.append(key, queries[key]);
  });
  return new_url;
}

app.get('/', (request, response) => {
  //displays index.html
});

app.get('/auth/google', passport.authenticate('google',
  { scope: ['profile'] }
));

app.get('/auth/google/callback', (request, response) => {
  console.log('authenticated');
  logged_in = true;
  response.redirect('/');
});

app.get('/gallery?', async (request, response) => {
  if (!logged_in) {
    response.send({});
  } else {
    const json = await getData('/gallery?', request.query);
    //console.log(json);
    response.send(json);
  }
});

app.get('/object?', async (request, response) => {
  if (!logged_in) {
    response.send({});
  } else {
    const json = await getData('/object?', request.query);
    //console.log(json);
    response.send(json);
  }
});

app.get('/person?', async (request, response) => {
  if (!logged_in) {
    response.send({});
  } else {
    const json = await getData('/person?', request.query);
    //console.log(json);
    response.send(json);
  }
})

app.get('/exhibition?', async (request, response) => {
  if (!logged_in) {
    response.send({});
  } else {
    const json = await getData('/exhibition?', request.query);
    response.send(json);
  }
});

app.get('/publication?', async (request, response) => {
  if (!logged_in) {
    response.send({});
  } else {
    const json = await getData('/publication?', request.query);
    response.send(json);
  }
});

async function getData(type, query){
  //console.log(request);
  const new_url = get_url(type, query);
  const res = await fetch(new_url);
  const json = await res.json();
  //console.log(json.info);
  if (json.info.prev) {json.info.prev = null;} //client doesn't use this
  if (json.info.next){
    //console.log(json.info.next);
    //just going to return the next page number in 'next'
    const new_url = url.parse(json.info.next);
    const qstring = new_url.query;
    const queries = qstring.split('&');
    let pairs = [];
    queries.forEach((q) => {
      let p = q.split('=');
      pairs.push(p[0]); pairs.push(p[1]);
    })
    let i = pairs.indexOf('page');
    json.info.next = pairs[i+1];
    json.info.prev = json.info.next - 2;
    //console.log(json.info.next);
  }
  return json;
}

app.listen(3000, () => {
  console.log('Express running');
});
