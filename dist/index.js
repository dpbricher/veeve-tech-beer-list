(()=> {
  'use strict';

  const auth    = require('basic-auth');
  const express = require('express');
  const pug     = require('pug');
  const stylus  = require('stylus');

  const config  = require('./.config');

  const Database  = require('./classes/database');

  const PORT    = 1337;

  let app       = express();
  let db        = new Database();
  let styleDir  = __dirname + '/style';

  app.set('view engine', 'pug');
  app.set('views', './views');

  app.use(stylus.middleware(styleDir));
  app.use('/style', express.static(styleDir));

  app.all('*', function(req, res, next) {
    let loginMap    = auth(req);
    let correctMap  = config.login;

    if (!loginMap || !correctMap || loginMap.name !== correctMap.name ||
      loginMap.pass !== correctMap.pass) {

      res.header('WWW-Authenticate', 'Basic realm="Veeve Tech Beer List"')
      .status(401)
      .send('Denied');
    } else {
      next();
    }
  });

  app.get('/', (req, res)=> {
    let recordList  = db.getRecordListReverse();
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

  app.get('/create', (req, res)=> {
    let nameMap   = {};

    db.getRecordList().forEach((record)=>
      record.forEach((entry)=> nameMap[entry.name] = 0)
    );

    res.render('create', { nameList:Object.keys(nameMap) });
  });

  app.get('/create-new', (req, res)=> {
    let query     = req.query;
    let nameList  = query.consumerList.slice();

    if (nameList.indexOf(query.buyer) < 0)
      nameList.push(query.buyer);

    let dataList  = nameList.map((name)=> ({
      bought:query.buyer === name ? query.consumerList.length : 0,
      consumed:query.consumerList.indexOf(name) < 0 ? 0 : 1,
      name:name
    }));

    db.createRecord(dataList);

    res.render('create-success');
  });

  app.listen(PORT, ()=> console.log(`listening on port ${PORT}`));
})();
