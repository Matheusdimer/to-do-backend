const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const corsMiddleware = require('./src/app/middlewares/cors')

require('dotenv/config')

const app = express();

app.use(cors())
app.use(corsMiddleware)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


require('./src/app/controller/authController')(app);
require('./src/app/controller/taskController')(app);

app.listen(process.env.PORT || 4000);