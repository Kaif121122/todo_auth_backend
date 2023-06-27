const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes/AuthRoute');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}))

// PORT

const PORT = process.env.PORT || 4000;

// MONGODB URI 

const Uri = process.env.MONGODB_URL;

mongoose.connect(Uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('finally connected to the mongoDB')
}).catch((err) => {
    console.log(err)
})

// ROUTES 

app.use(routes)

// LISTEN 

app.listen(PORT, () => {
    console.log(`finally live at ${PORT}`)
})