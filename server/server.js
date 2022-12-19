import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { app } from './app.js';
import dbConnection from './database/mongo.js';
import { itemRouter } from './routes/items.js';
import { storageRouter } from './routes/storage.js';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('storage'));

app.use('/items', itemRouter);
app.use('/storage', storageRouter);
dbConnection();
