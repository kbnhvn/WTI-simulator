// load the things we need
const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());


// ------------------------------------------------------------------------------ //
// --------------------- set the view engine to ejs ------------------------------//

app.set('view engine', 'ejs');

// ------------------------------------------------------------------------------ //
// ------------------------- import routes ---------------------------------------//

const transactionDatasRoutes = require('./routes/transactionDatas')
const rawDatasRoutes = require('./routes/rawDatas')

app.use('/rawDatas', rawDatasRoutes)
app.use('/transactionDatas', transactionDatasRoutes)

// --------------------------- CSS folder ------------------------------------ //

app.use(express.static(path.join(__dirname, 'public')));


// --------------------------- Home page ------------------------------------ //

app.get('/', function(req, res) {
    res.render('./home');
});

// ------------------------------------------------------------------------------ //
// --------------------------- download page ------------------------------------ //

app.get('/download', function(req, res) {

    /*
    let files = fs.readdirSync('./data/quizz')
    let csvFiles = files.filter(el => path.extname(el) === '.csv')
    let fileList = []
    let testIdList = []
    let matriculeList = []
    let dateList = []
    csvFiles.forEach(file => {
        console.log(path.parse(file).name)

        fileList.push(path.parse(file).name)

        //Store testIds, dates and matricules ino arrays
        testIdList.push(((path.parse(file).name).split('_', 3))[1])
        matriculeList.push((((path.parse(file).name).split('_', 3))[0].split('-', 1))[0])
        dateList.push(((path.parse(file).name).split('_', 3))[2])
    })

    //Only keep unique values from arrays
    testIdList = [...new Set(testIdList)];
    matriculeList = [...new Set(matriculeList)];
    dateList = [...new Set(dateList)];
    */



    res.render('./downloads' /*,{ files: fileList, testsId: testIdList, matricules: matriculeList, dates: dateList }*/ );
});
app.post('/download', function(req, res) {
    let filename = req.body.filename


    res.download(`./data/exports/${filename}.csv`, `${filename}.csv`)
});


// ------------------------------------------------------------------------------ //
// ------------------------------------------------------------------------------ //


app.listen(8000);
//app.listen(8000);
console.log('app sur le port 8000');