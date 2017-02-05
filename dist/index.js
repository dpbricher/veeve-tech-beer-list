(()=> {
  'use strict';

  const express = require('express');
  const pug     = require('pug');

  const PORT    = 1337;

  let app = express();

  app.set('view engine', 'pug');
  app.set('views', './views');

  app.get('/', (req, res)=> res.render('test', { person:'World?' }));

  app.listen(PORT, ()=> console.log(`listening on port ${PORT}`));
})();
