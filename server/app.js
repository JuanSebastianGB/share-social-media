import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSetup from './docs/swagger.js';
import { checkValidJwt } from './middlewares/session.js';
import { auth, items, storage, users } from './routes/index.js';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('storage'));

app.get('/', (req, res) => res.json({ a: 1 }));
app.use('/items', items);
app.use('/storage', checkValidJwt, storage);
app.use('/users', checkValidJwt, users);
app.use('/auth', auth);

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSetup));

export { app };
