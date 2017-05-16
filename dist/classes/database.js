(()=> {
  'use strict';

  const fs    = require('fs');
  const path  = require('path');

  class Database {
    constructor() {
      this.recordDir  = './records';

      if (!fs.existsSync(this.recordDir))
        fs.mkdirSync(this.recordDir);
    }

    listRecords() {
      return fs.readdirSync(this.recordDir);
    }

    createRecord(data) {
      fs.writeFileSync(path.join(this.recordDir,
        `${new Date().toISOString()}.json`), JSON.stringify(data));
    }

    getRecordList() {
      return this.listRecords().map((i)=> this._getRecordFile(i));
    }

    getRecordListReverse() {
      let list  = [];

      this.listRecords().reduceRight((_, i)=>
        list.push(this._getRecordFile(i)), 0);

      return list;
    }

    _getRecordFile(name) {
      return JSON.parse(fs.readFileSync(path.join(this.recordDir, name)));
    }
  }

  module.exports  = Database;
})();
