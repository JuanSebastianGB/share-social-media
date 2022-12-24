import { app } from './app.js';
import dbConnection from './database/mongo.js';

dbConnection();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
