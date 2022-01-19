// load the things we need
const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

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







// ------------------------------------------------------------------------------ //
// ------------------------------------------------------------------------------ //

app.listen(8000);
//app.listen(8000);
console.log('app sur le port 8000');