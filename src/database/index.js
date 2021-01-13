const mongoose = require('mongoose')

require('dotenv/config')

mongoose.connect(`mongodb+srv://admin:${process.env.PASSWORD}@cluster1.rtiae.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
mongoose.Promise = global.Promise;

module.exports = mongoose;