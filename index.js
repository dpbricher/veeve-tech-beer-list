(()=> {
  'use strict';

  const auth    = require('basic-auth');
  const express = require('express');
  const http    = require('http');
  const pug     = require('pug');
  const stylus  = require('stylus');

  const config  = require('./.config');

  const PORT    = 1337;

  let app       = express();
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
    Promise.all([
      getRecordList(true),
      getUserList()
    ])
    .then(resList => {
      let [recordList, userList]  = resList;

      let totalMap    = {};

      recordList.forEach((i)=> {
        for (let v of i) {
          let personMap       =
          totalMap[v.name]    = totalMap[v.name] || {};

          personMap.bought    = (personMap.bought || 0) + (v.bought || 0);
          personMap.consumed  = (personMap.consumed || 0) + (v.consumed || 0);
        }
      });

      let personList  = userList.map(i => {
        let person  = totalMap[i.name] || {};

        return { bought:person.bought || 0, consumed:person.consumed || 0, name:i.name };
      });

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
    }, err => {
      console.error(err);
      res.send(500, err);
    });
  });

  app.get('/create', (req, res)=> {
    getUserList()
    .then(userList => {
      res.render('create', { nameList:userList.map(i => i.name) });
    }, err => res.status(500).send(err));
  });

  app.get('/create-new', (req, res)=> {
    let query = req.query;
    let fail  = ()=> res.status(400).render('failure');

    if (query.buyer && query.consumerList) {
      let nameList  = query.consumerList.slice();

      if (nameList.indexOf(query.buyer) < 0)
        nameList.push(query.buyer);

      let dataList  = nameList.map((name)=> ({
        bought:query.buyer === name ? query.consumerList.length : 0,
        consumed:query.consumerList.indexOf(name) < 0 ? 0 : 1,
        name:name
      }));

      createRecord(dataList)
      .then(()=> res.render('success'), fail);
    } else {
      fail();
    }
  });

  app.listen(PORT, ()=> console.log(`listening on port ${PORT}`));

  function getRecordList(reverse) {
    return apiRequest('/record-list' + (reverse ? '?reverse=1' : ''));
  }

  function getUserList() {
    return apiRequest('/user-list');
  }

  function createRecord(dataList) {
    return apiRequest('/create', 'POST', dataList);
  }

  function apiRequest(path, method, data) {
    return new Promise((s, f)=> {
      let req   = http.request({
        hostname:config.api.host,
        method:method || 'GET',
        port:config.api.port,
        path:path
      }, res => {
        let content = '';

        res.on('data', d => content += d)
        .on('end', ()=> s(content.length ? JSON.parse(content) : null));
      })
      .on('error', err => f(err));

      if (data) {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(data), 'utf8', ()=> req.end());
      } else
        req.end();
    });
  }
})();
