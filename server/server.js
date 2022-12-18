import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { app } from './app.js';
import dbConnection from './database/mongo.js';
import { itemRouter } from './routes/items.js';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/items', itemRouter);
dbConnection();
