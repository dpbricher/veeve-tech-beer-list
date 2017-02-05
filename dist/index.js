(()=> {
  'use strict';

  const express = require('express');
  const pug     = require('pug');

  const Database  = require('./classes/database');

  const PORT    = 1337;

  let app = express();
  let db  = new Database();

  app.set('view engine', 'pug');
  app.set('views', './views');

  app.get('/', (req, res)=> {
    let recordList  = db.getRecordList();
    let totalMap    = {};

    recordList.forEach((i)=> {
      for (let v of i) {
        totalMap[v.name]  = totalMap[v.name] || {};
        totalMap[v.name].bought   = (totalMap[v.name].bought || 0) + (v.bought || 0);
        totalMap[v.name].consumed = (totalMap[v.name].consumed || 0) + (v.consumed || 0);
      }
    });

    res.render('main', { totalMap:totalMap, recordList:recordList });
  });

  app.listen(PORT, ()=> console.log(`listening on port ${PORT}`));
})();
