const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const categoriesRouter = require('./routes/categories');
const ordersRouter = require('./routes/orders');
const customersRouter = require('./routes/customers');
const paymentsRouter = require('./routes/payments');
const cartsRouter = require('./routes/carts');
const wishlistsRouter = require('./routes/wishlists');
const errorHandler = require('./middleware/errorHandler');

require('./db');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Ecommerce API is running.' });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/wishlists', wishlistsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

app.use(errorHandler);

module.exports = app;
