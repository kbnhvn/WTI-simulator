const fs = require('fs');
const moment = require('moment')

const getTransactionDatasFromFile = (callback) => {
    fs.readFile('./data/transactionDatas.json', (err, fileContent) => {
        if (err) {
            return callback([]);
        } else {

            callback(JSON.parse(fileContent));

        }


    });
}

module.exports = class transactionData {
    constructor(time, operation, price, amount, invest, value) {
        this.time = time;
        this.operation = operation;
        this.price = price;
        this.amount = amount;
        this.invest = invest;
        this.value = value;
    }

    save() {
        getTransactionDatasFromFile(transactions => {

            transactions.push(this);
            fs.writeFile('./data/transactionDatas.json', JSON.stringify(transactions), (err) => {
                console.log(err);
            });
        });
    }

    static fetchAll(callback) {
        getTransactionDatasFromFile(callback);

    }



}