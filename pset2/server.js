const URL = require('url').URL;
require('cross-fetch/polyfill');

const passport = require('passport');
const passport_setup = require('./passport-setup');

const express = require('express');
const app = express();
app.use(express.static('./'));
app.use(express.json());

const base_url = "https://api.harvardartmuseums.org/";
const logged_in = false;
//

function get_url(type, queries){
  const new_url = new URL(type, base_url);
  new_url.searchParams.append('apikey', '47f218b0-b5d5-11e8-8c0c-03e1b17d6f1e');
  new_url.searchParams.append('size', 100);
  Object.keys(queries).forEach(key => {
    new_url.searchParams.append(key, queries[key]);
  });
  return new_url;
}

//response.sendFile(__dirname + '/index.html');
app.get('/', (request, response) => {

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
  //console.log(request);
  console.log('fetching galleries');
  const new_url = get_url("/gallery?", request.query);
  const res = await fetch(new_url.href);
  const json = await res.json();
  response.send(json);
});

app.get('/object?', async (request, response) => {
  //console.log(request);
  console.log('fetching objects');
  const new_url = get_url("/object?", request.query);
  const res = await fetch(new_url.href);
  const json = await res.json();
  if (json.info.next) {
    json.info.next = true;
  }
  console.log(json.info);
  response.send(json);
});

app.listen(3000, () => {
  console.log('Express running');
});
