import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
const app = express();
import mongoose from 'mongoose';
import usersRouter  from './controllers/users.js';

import productsRouter from './controllers/products.js'

import errorHandler from './middleware/errorHandler.js'


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
app.use(cors());
app.use(express.json());

// Routes go here

app.use('/users', usersRouter);
app.use('/products',productsRouter)


// error middeware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log('The express app is ready!');
});