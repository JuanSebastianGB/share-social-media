import cors from 'cors';
import morgan from 'morgan';
import { app } from './app.js';
import { itemRouter } from './routes/item.js';

app.use(morgan('dev'));
app.use(cors());

app.use('/item', itemRouter);
