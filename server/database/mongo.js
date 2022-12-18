import mongoose from 'mongoose';

const dbConnection = () => {
  const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/social';
  const options = {
    useNewUrlParser: true,
  };
  const callback = (err, res) => {
    if (!err) return console.log('**** Connected to mongoDB successfully ****');
    console.log(`**** Error connecting to mongoDB ****`);
  };
  mongoose.connect(DB_URI, options, callback);
};

export default dbConnection;
