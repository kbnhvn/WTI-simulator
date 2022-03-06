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
    constructor(time, operation, price, result, stopUp, stopDown, baseInvest, status) {
        this.time = time;
        this.operation = operation;
        this.price = price;
        this.result = result;
        this.stopUp = stopUp;
        this.stopDown = stopDown;
        this.baseInvest = baseInvest;
        this.status = status;

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