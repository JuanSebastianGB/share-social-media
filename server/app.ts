import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import YAML from 'js-yaml';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createDefault } from './controllers/storage.js';
import { checkValidJwt } from './middlewares/session.js';
import {
  auth,
  comments,
  items,
  posts,
  storage,
  users,
} from './routes/index.js';

dotenv.config();

/**
 * Load the OpenAPI contract of record from `docs/api-spec.yml`.
 * The legacy `server/docs/swagger.ts` was stale (1 schema, 3 of ~25 paths).
 * Tests inject OPENAPI_SPEC_PATH because ts-jest's virtual module path breaks
 * the relative resolution; production keeps the relative default.
 */
const openApiSpec = YAML.load(
  readFileSync(
    process.env.OPENAPI_SPEC_PATH ??
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        '../../docs/api-spec.yml',
      ),
    'utf8',
  ),
) as object;

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.static('storage'));

app.get('/', (_req, res) => res.json({ a: 1 }));
app.use('/items', items);
app.use('/storage', checkValidJwt, storage);
app.use('/defaulstorage', createDefault);
app.use('/users', users);
app.use('/auth', auth);
app.use('/posts', posts);
app.use('/comments', comments);

app.use('/checktoken', checkValidJwt, (_req, res) => res.send('ok'));

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/documentation.json', (_req, res) => res.json(openApiSpec));

export { app };
