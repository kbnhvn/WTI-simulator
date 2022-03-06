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
        let baseInvest = req.body.invest

        //Previous operation
        let prevOperation

        //Previous operation status
        let prevStatus

        //Indicators
        let prevALMA
        let prevEMA100
        let prevEMA200
        let prevPrice
        let priceOpen

        //Get stop-loose and take-profit values
        let stopUp = parseFloat((req.body.stopUp).toString().replace(',', '.'))
        let stopDown = parseFloat((req.body.stopDown).toString().replace(',', '.'))

        //Transaction result
        let result

        //Generate transactions
        for (let i = 0; i < data.length; i += 4) {

            if (i > 0 && isNaN(parseFloat((data[i].plot).toString().replace(',', '.'))) === false && isNaN(parseFloat((data[i].EMA100).toString().replace(',', '.'))) === false && isNaN(parseFloat((data[i].EMA200).toString().replace(',', '.'))) === false) {

                //Initialize new transaction
                let newTransaction = new TransactionData
                newTransaction.time = data[i].time
                newTransaction.stopUp = stopUp
                newTransaction.stopDown = stopDown
                newTransaction.baseInvest = baseInvest

                /* Buy conditions open */
                if (prevALMA >= prevEMA200 && prevEMA200 >= prevEMA100 && prevStatus !== "OPEN") {
                    prevStatus = "OPEN"
                    prevOperation = "BUY"
                    priceOpen = parseFloat((data[i].close).toString().replace(',', '.'))

                    //Store buy open transaction
                    newTransaction.operation = prevOperation
                    newTransaction.price = (parseFloat((data[i].close).toString().replace(',', '.'))).toString()
                    newTransaction.status = prevStatus
                    transactions.push(newTransaction)

                }
                /* Sell conditions open */
                if (prevEMA200 >= prevALMA && prevEMA100 >= prevEMA200 && prevStatus !== "OPEN") {
                    prevStatus = "OPEN"
                    prevOperation = "SELL"
                    priceOpen = parseFloat((data[i].close).toString().replace(',', '.'))

                    //Store sell open transaction
                    newTransaction.operation = prevOperation
                    newTransaction.price = (parseFloat((data[i].close).toString().replace(',', '.'))).toString()
                    newTransaction.status = prevStatus
                    transactions.push(newTransaction)

                }
                /* Buy conditions close */
                if ((prevOperation === "BUY" && (parseFloat((data[i].close).toString().replace(',', '.')) >= (priceOpen + stopUp)) && prevStatus === "OPEN") || (prevOperation === "BUY" && (parseFloat((data[i].close).toString().replace(',', '.')) <= (priceOpen - stopDown)) && prevOperation === "OPEN")) {
                    prevStatus = "CLOSE"
                    if (parseFloat((data[i].close).toString().replace(',', '.')) >= (priceOpen + stopUp)) {
                        result = "GAIN"
                    } else {
                        result = "LOSE"
                    }

                    //Store buy transaction
                    newTransaction.operation = prevOperation
                    newTransaction.price = (parseFloat((data[i].close).toString().replace(',', '.'))).toString()
                    newTransaction.status = prevStatus
                    newTransaction.result = result
                    transactions.push(newTransaction)
                    prevOperation = ""

                }
                /* Sell condition close*/
                if ((prevOperation === "SELL" && (parseFloat((data[i].close).toString().replace(',', '.')) >= (priceOpen + stopDown)) && prevStatus === "OPEN") || (prevOperation === "SELL" && (parseFloat((data[i].close).toString().replace(',', '.')) <= (priceOpen - stopUp)) && prevOperation === "SELL")) {
                    prevStatus = "CLOSE"
                    if (parseFloat((data[i].close).toString().replace(',', '.')) >= (priceOpen + stopDown)) {
                        result = "LOSE"
                    } else {
                        result = "GAIN"
                    }

                    //Store sell transaction
                    newTransaction.operation = prevOperation
                    newTransaction.price = (parseFloat((data[i].close).toString().replace(',', '.'))).toString()
                    newTransaction.status = prevStatus
                    newTransaction.result = result
                    transactions.push(newTransaction)
                    prevOperation = ""

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

        res.render('transactionDatas/transactionDatas', { datas: transactions, baseDatas: data })

    }
    // -------------------------- Download link --------------------------- 

exports.transactionDatasToCsv = (req, res, next) => {
    let dataId = req.params.id
    res.download(`./data/exports/${dataId}.csv`)
}