require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const bodyParser = require('body-parser');
const { count } = require('node:console');
const { dirname } = require('node:path');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Body parser como middleware
app.use(bodyParser.urlencoded({extended: true}));


app.use('/public', express.static(process.cwd() + "/public"));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// Short URL e memória config
let counter = 0;
const memoria = [];

// Encurtador
app.get("/api/shorturl/:shorturl", (req, res) => {
  console.log(memoria)
  let foundUrl = memoria.find(item => item.short_url == parseInt(req.params.shorturl, 10));

  console.log(req.params.shorturl)
  console.log(foundUrl)

  if (foundUrl) {
    return res.redirect('http://localhost:3000/?v=1774720172480');
  } else {
    return res.json({error: "No short url found"});
  }
})

app.post("/api/shorturl", (req, res) => {

  try {
    let url = new URL(req.body.url).hostname; // Tira o https://

    dns.lookup(url, (err) => { 
      if (err) return res.json({error: "invalid url"}); // Valida a url

      let jaExiste = memoria.find(item => item.original_url === req.body.url); // Procurar se a URL já existe na memória

      if (jaExiste){
        return res.json(jaExiste);          
      };

      counter++;

      let newUrl = {original_url: req.body.url, short_url: counter};
      memoria.push(newUrl);

      return res.json(newUrl);

    });

  } catch (error) {
    console.error(error)
    res.json({error: "invalid url"});
  }

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
