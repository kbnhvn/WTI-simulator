const fs = require('fs');
const moment = require('moment')

const getRawDatasFromFile = (callback) => {
    fs.readFile('./data/datas.json', (err, fileContent) => {
        if (err) {
            return callback([]);
        } else {

            callback(JSON.parse(fileContent));

        }


    });
}

module.exports = class rawData {
    constructor(time, open, high, low, close, plot, EMA100, EMA200) {
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        /* Close is price */
        this.close = close;
        this.plot = plot;
        this.EMA100 = EMA100;
        this.EMA200 = EMA200;
    }

    static fetchAll(callback) {
        getRawDatasFromFile(callback);

    }



}