const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const categoriesRouter = require('./routes/categories');
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

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

app.use(errorHandler);

module.exports = app;
