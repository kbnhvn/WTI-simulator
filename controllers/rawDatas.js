const RawData = require('../models/rawData')
const fileUpload = require('express-fileupload');
let converter = require('json-2-csv');
let parser = require('csv-parse')
const fs = require('fs');

// Add group
exports.getAddData = (req, res, next) => {
    res.render('./rawDatas/add-data');
};

// --------------------- Import raw data --------------------- 

// File upload system
exports.uploadData = (req, res, next) => {


    let dataTab = []
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


    if (req.files) {

        const file = req.files.filename;
        console.log(file)
        for (let i = 0; i < file.length; i++) {

            //Move file to imports folder and rename

            file[i].mv('./data/imports/' + file[i].name, function(err) {

                if (err) {
                    throw err;
                }
            })

            //convert file to JSON

            converter.csv2json(`./data/imports/${file[i].name}.csv`, (err, rawData) => {
                if (err) {
                    throw err;
                }

                // Store data to array
                dataTab.push(rawData)


                // write JSON to a file
                fs.writeFileSync(`./data/imports/${file[i].name}.JSON`, JSON.stringify(rawData));


            }, options)

        }

        // Sort rawData array by date and remove duplicates

        // Sort By Date.
        const sortDate = array => array.sort((A, B) => new Date(A.date) * 1 - new Date(B.date) * 1)

        // Filter Duplicates.
        const filter = array => [...new Map(array.map(x => [x.date, x])).values()]

        // Output.
        const dataSorted = sortDate(filter(sortDate(dataTab)))

        // Write to data file in ./data
        fs.writeFileSync(`./data/${moment().format('DD-MM-YYYY')}.JSON`, JSON.stringify(dataSorted));

        res.render('rawDatas/rawData', { data: dataSorted })

    }






}


// --------------- Sort data and delete duplicates --------------- 



// --------------- Convert raw data from xls to csv/JSON --------------- 
// TODO


// --------------- Convert raw data from csv to JSON --------------- 
/*
exports.convertRawData = (req, res, next) => {
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

    converter.csv2json(`./data/${moment().format('DD-MM-YYYY')}.csv`, (err, rawData) => {
        if (err) {
            throw err;
        }

        // write JSON to a file
        fs.writeFileSync(`./data/${moment().format('DD-MM-YYYY')}.JSON`, JSON.stringify(rawData));

    }, options)
    res.render('rawData/rawData', { data: rawData })
};
*/

// -------------------------- Get raw data --------------------------- 

exports.getRawData = (req, res, next) => {
    RawData.fetchAll((rawData) => {
        res.render('rawDatas/rawData', { data: rawData })
    });
};



//