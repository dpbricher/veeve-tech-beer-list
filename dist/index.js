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
    let personList  = [];

    recordList.forEach((i)=> {
      for (let v of i) {
        let personMap       =
        totalMap[v.name]    = totalMap[v.name] || {};

        personMap.bought    = (personMap.bought || 0) + (v.bought || 0);
        personMap.consumed  = (personMap.consumed || 0) + (v.consumed || 0);
      }
    });

    // convert from map to array
    for (let name in totalMap) {
      let personMap = totalMap[name];

      personMap.name  = name;
      personList.push(personMap);
    }

    // calculate ratios
    personList.forEach((personMap)=> {
      personMap.ratio = personMap.consumed > 0 ?
        personMap.bought / personMap.consumed : 0;
    });

    // determine who should be next to buy
    let lowestRatio = personList.reduce((lowest, personMap)=>
      Math.min(personMap.ratio, lowest)
    , Infinity);

    let nextList    = personList.filter((personMap)=>
      personMap.ratio == lowestRatio
    );

    res.render('main', { nextBuyersList:nextList, personList:personList,
      recordList:recordList });
  });

  app.get('/create', (req, res)=> res.render('create'));

  app.get('/create-new', (req, res)=> {
    let makeEntryObj  = (name, bought, consumed)=> {
      return {name:name, bought:parseInt(bought), consumed:parseInt(consumed) };
    };

    let query = req.query;
    let data  = [
      makeEntryObj('Dean', query.deanBought, query.deanConsumed),
      makeEntryObj('Oli', query.oliBought, query.oliConsumed),
      makeEntryObj('Giannis', query.giannisBought, query.giannisConsumed),
      makeEntryObj('Symon', query.symonBought, query.symonConsumed),
      makeEntryObj('Stuart', query.stuartBought, query.stuartConsumed)
    ];

    db.createRecord(data);

    res.render('create-success');
  });

  app.listen(PORT, ()=> console.log(`listening on port ${PORT}`));
})();
