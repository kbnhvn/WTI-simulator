const RawData = require('../models/rawData')
const TransactionData = require('../models/transactionData')
let converter = require('json-2-csv');
const path = require('path')
const fs = require('fs');
const moment = require('moment')

// -------------------------- Select transaction datas --------------------------- 
exports.getSelectTransactionDatas = (req, res, next) => {
    // Read files from Export folder and only keep json files
    let files = fs.readdirSync('./data/exports')
    let sortedFiles = files.filter(el => path.extname(el) === '.json')
    let fileList = []
    sortedFiles.forEach(file => {
        fileList.push(file)
    })


    res.render('transactionDatas/selectTransactionDatas', { redirect: redirect, files: fileList })

};

// -------------------------- Get transaction datas --------------------------- 
exports.getTransactionDatas = (req, res, next) => {
    let dataId = req.params.id
    let transactions = JSON.parse(fs.readFileSync(`./data/exports/${dataId}`, 'utf8'))
    res.render('transactionDatas/transactionDatas', { datas: transactions })

};

// -------------------------- Generate transaction datas --------------------------- 

exports.generateTransactionDatas = (req, res, next) => {
        //Get raw datas
        let data = JSON.parse(fs.readFileSync('./data/datas.json', 'utf8'))


        // ------- Generate transaction - Algo -------

        //Array used to store transaction datas
        let transactions = []

        //Somme investie
        let invest = req.body.invest
        let baseInvest = req.body.invest

        //Quantité achetée
        let amount = 0;

        //Previous operation
        let prevOperation = "SELL"

        //Indicators
        let prevALMA
        let prevEMA100
        let prevEMA200
        let prevPrice

        //Get stop-loose and take-profit values
        let stopUp = req.body.stopUp
        let stopDown = req.body.stopDown

        //Generate transactions
        for (let i = 0; i < data.length; i += 4) {

            if (i > 0 && isNaN(parseFloat((data[i].plot).toString().replace(',', '.'))) === false && isNaN(parseFloat((data[i].EMA100).toString().replace(',', '.'))) === false && isNaN(parseFloat((data[i].EMA200).toString().replace(',', '.'))) === false) {

                //Initialize new transaction
                let newTransaction = new TransactionData
                newTransaction.time = data[i].time
                newTransaction.price = data[i].close
                newTransaction.stopUp = stopUp
                newTransaction.stopDown = stopDown
                newTransaction.baseInvest = baseInvest

                /* Buy conditions */
                if (prevALMA >= prevEMA200 && prevEMA200 >= prevEMA100 && amount == 0 && prevOperation === "SELL") {
                    amount = invest / parseFloat((data[i].close).toString().replace(',', '.'))
                    invest = 0
                    prevOperation = "BUY"


                    //Store buy transaction
                    newTransaction.amount = amount.toString()
                    newTransaction.invest = invest.toString()
                    newTransaction.operation = prevOperation
                    newTransaction.value = (amount * parseFloat((data[i].close).toString().replace(',', '.'))).toString()
                    transactions.push(newTransaction)

                }
                /* Sell conditions */
                if ((prevEMA200 >= prevALMA && prevEMA100 >= prevEMA200 && invest == 0 && prevOperation === "BUY") || (parseFloat((data[i].close).toString().replace(',', '.')) >= prevPrice + stopUp && prevOperation === "BUY") || (parseFloat((data[i].close).toString().replace(',', '.')) <= prevPrice - stopDown && prevOperation === "BUY")) {
                    invest = amount * parseFloat((data[i].close).toString().replace(',', '.'))
                    amount = 0
                    prevOperation = "SELL"

                    //Store sell transaction
                    newTransaction.amount = amount.toString()
                    newTransaction.invest = invest.toString()
                    newTransaction.operation = prevOperation
                    newTransaction.value = invest.toString()
                    transactions.push(newTransaction)
                }
            }
            prevALMA = parseFloat((data[i].plot).toString().replace(',', '.'))
            prevEMA100 = parseFloat((data[i].EMA100).toString().replace(',', '.'))
            prevEMA200 = parseFloat((data[i].EMA200).toString().replace(',', '.'))
            prevPrice = parseFloat((data[i].close).toString().replace(',', '.'))
        }

        //Write to JSON
        fs.writeFileSync(`./data/exports/${transactions[transactions.length - 1].time}_UP:${transactions[transactions.length - 1].stopUp}_DOWN:-${transactions[transactions.length - 1].stopDown}_transactions.json`, JSON.stringify(transactions))

        // convert JSON array to CSV string
        converter.json2csv(transactions, (err, csv) => {
            if (err) {
                throw err;
            }

            // write CSV to a file
            fs.writeFileSync(`./data/exports/${transactions[transactions.length - 1].time}_UP:${transactions[transactions.length - 1].stopUp}_DOWN:-${transactions[transactions.length - 1].stopDown}_transactions.csv`, csv);

            //Options: remove 'undefined' if value is empty, use '~' as delimiter
        }, { excelBOM: true, emptyFieldValue: '', delimiter: { field: ';' } });

        res.render('transactionDatas/transactionDatas', { datas: transactions })

    }
    // -------------------------- Download link --------------------------- 

exports.transactionDatasToCsv = (req, res, next) => {
    let dataId = req.params.id
    res.download(`./data/exports/${dataId}.csv`)
}