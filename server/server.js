import cors from 'cors';
import morgan from 'morgan';
import { app } from './app.js';

app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => res.json({ response: 'Hello World!' }));
