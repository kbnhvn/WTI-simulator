const RawData = require('../models/rawData')
let converter = require('json-2-csv');
let parser = require('csv-parse')
const fs = require('fs');


// --------------- Convert raw datas from xls to csv/JSON --------------- 
// TODO


// --------------- Convert raw datas from csv to JSON --------------- 
/*
//Parse data from csv file


let options = {
    delimiter: {
        wrap: '"', // Double Quote (") character
        field: ';', // semicolon field delimiter
        eol: '\n' // Newline delimiter
    },
    trimHeaderFields: true,
    trimFieldValues: true,
    keys: ['time', 'open', 'high', 'close', 'plot', 'EMA100', 'EMA200']
};

converter.csv2json('./data/')
*/

// -------------------------- Get raw datas --------------------------- 
exports.getRawDatas = (req, res, next) => {
    RawData.fetchAll((rawDatas) => {
        res.render('rawDatas/rawDatas', { datas: rawDatas })
    });
};

//