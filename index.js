require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const urlModel = require('./src/urlModel')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Conexão com Banco de dados 

mongoose.connect(process.env.MONGO_URI);


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

// Encurtador
app.get("/api/shorturl/:shorturl", (req, res) => {
  // Procurar o short_url no banco de dados
  urlModel.findOne({short_url: req.params.shorturl})
    .then(data => {
      if (!data){ 
        // Se não encontrar, mostra um json de erro
        return res.json({error: "invalid url"});
      } else {  
        // Se encontrar, redireciona para a original_url
       return res.redirect(data.original_url);
      }
    })
    .catch(err => res.redirect("/"));
})

app.post("/api/shorturl", (req, res) => {
  originalUrl = req.body.url; 

  if (!URL.canParse(originalUrl)) {
    console.log("Error: Não é uma URL");
    return res.json({error: "invalid url"});
  };

  let urlHostname = new URL(originalUrl).hostname || null; // Tira o https://

  if (urlHostname == null) {
    console.log("Error: Hostname vazio");
    return res.json({error: "invalid url"});
  }

  dns.lookup(urlHostname, (err) => { 
    if (err) {
      console.log("URL não acessível no dns: ", err);
      return res.json({error: "invalid url"}); // Valida a url
    }
    // Verificar se URL já existe no banco de dados
    urlModel.findOne({original_url: originalUrl})
    .then(data => {
        
      if (data) {
        // Se já existe, responde com a url encontrada
        return res.json({original_url: data.original_url, short_url: data.short_url});
        
      } else {
        // Se não existe, adiciona no banco de dados
        let shorturl = Math.floor(Math.random() * 100000);

        let newUrl = new urlModel({
          original_url: originalUrl,
          short_url: shorturl
        });
        
        newUrl.save()
        .then(data => res.json({original_url: data.original_url, short_url: data.short_url}))

        .catch(err => res.json({error: "invalid error"})); // Fim do save

      }
    })
    .catch(err => console.log(err));
  });
});
  

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
