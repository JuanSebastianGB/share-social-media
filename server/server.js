import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { app } from './app.js';
import dbConnection from './database/mongo.js';
import { checkValidJwt } from './middlewares/session.js';
import { auth, items, storage, users } from './routes/index.js';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('storage'));

app.use('/items', items);
app.use('/storage', checkValidJwt, storage);
app.use('/users', checkValidJwt, users);
app.use('/auth', auth);
dbConnection();
