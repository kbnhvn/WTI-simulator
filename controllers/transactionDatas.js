const RawData = require('../models/rawData')
const TransactionData = require('../models/transactionData')
let converter = require('json-2-csv');
const fs = require('fs');
const moment = require('moment')

// -------------------------- Get transaction datas --------------------------- 
exports.getTransactionDatas = (req, res, next) => {
    TransactionData.fetchAll((transactionDatas) => {
        res.render('transactionDatas/transactionDatas', { datas: transactionDatas })
    });
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

        //Quantité achetée
        let amount = 0;

        //Get stop-loose and take-profit values
        let stopUp = req.body.stopUp
        let stopDown = req.body.stopDown

        //Generate transactions
        for (let i = 0; i < data.length; i++) {
            if (i > 0 && isNaN(parseFloat(data[i].plot)) === false && isNaN(parseFloat(data[i].EMA100)) === false && isNaN(parseFloat(data[i].EMA200)) === false) {

                //Initialize new transaction
                let newTransaction = new TransactionData(time, operation, price, amount, invest, value)
                newTransaction.time = data[i].time
                newTransaction.price = data[i].close

                /* Buy conditions */
                if (prevALMA > prevEMA200 && prevEMA200 > prevEMA100 && amount == 0) {
                    amount = invest / parseFloat(data[i].close)
                    invest = 0

                    //Store buy transaction
                    newTransaction.amount = amount.toString()
                    newTransaction.invest = invest.toString()
                    newTransaction.operation = "BUY"
                    newTransaction.value = (amount * parseFloat(data[i].close)).toString()
                    transactions.push(newTransaction)

                }
                /* Sell conditions */
                if ((prevEMA200 > prevALMA && prevEMA100 > prevEMA200 && invest == 0) || (parseFloat(data[i].close) >= prevPrice + stopUp) || (parseFloat(data[i].close) <= prevPrice - stopDown)) {
                    invest = amount * parseFloat(data[i].close)
                    amount = 0

                    //Store sell transaction
                    newTransaction.amount = amount.toString()
                    newTransaction.invest = invest.toString()
                    newTransaction.operation = "SELL"
                    newTransaction.value = invest.toString()
                    transactions.push(newTransaction)
                }
            }
            let prevALMA = parseFloat(data[i].plot)
            let prevEMA100 = parseFloat(data[i].EMA100)
            let prevEMA200 = parseFloat(data[i].EMA200)
            let prevPrice = parseFloat(data[i].close)
        }

        //Write to JSON
        fs.writeFileSync(`./data/exports/${moment().format('DD-MM-YYYY')}-transactions.json`, JSON.stringify(transactions))

        // convert JSON array to CSV string
        converter.json2csv(transactions, (err, csv) => {
            if (err) {
                throw err;
            }

            // write CSV to a file
            fs.writeFileSync(`./data/exports/${moment().format('DD-MM-YYYY')}-transactions.csv`, csv);

            //Options: remove 'undefined' if value is empty, use '~' as delimiter
        }, { excelBOM: true, emptyFieldValue: '', delimiter: { field: ';' } });


        res.render('transactionDatas/transactionDatas', { datas: transactions })

    }
    // -------------------------- Download link --------------------------- 

exports.transactionDatasToCsv = (req, res, next) => {
    let date = req.params.date
    res.download(`./data/exports/${date}-transactions.csv`)
}