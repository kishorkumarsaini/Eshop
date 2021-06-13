const express = require('express');
const app = express();
require('dotenv/config');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const port = 3000 || process.env.PORT;
const api = process.env.API_URL;
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');


app.use(cors());
//options('*', cors());


//connect to database
mongoose.connect(process.env.CONNECTION_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.log(err);
    });

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//product router 
const productRouter = require('./routers/products');
app.use('/api/v1/products', productRouter);

//category routes
const categoryRouter = require('./routers/categories');
app.use('/api/v1/categories', categoryRouter);

//user routes
const userRouter = require('./routers/users');
app.use('/api/v1/users', userRouter);

// order routes
const orderRouter = require('./routers/orders');
app.use('/api/v1/orders', orderRouter);

app.listen(port, () => {
    console.log(api);
    console.log(`Server started on port:${port}`);
});