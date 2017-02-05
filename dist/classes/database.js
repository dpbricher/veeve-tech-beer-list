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

    getRecordList() {
      return this.listRecords().map((i)=> this._getRecordFile(i));
    }

    _getRecordFile(name) {
      return JSON.parse(fs.readFileSync(path.join(this.recordDir, name)));
    }
  }

  module.exports  = Database;
})();
