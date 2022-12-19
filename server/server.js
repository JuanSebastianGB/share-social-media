import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { app } from './app.js';
import dbConnection from './database/mongo.js';
import { items, storage, users } from './routes/index.js';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('storage'));

app.use('/items', items);
app.use('/storage', storage);
app.use('/users', users);
dbConnection();
