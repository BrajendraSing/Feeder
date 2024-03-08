const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dbConnect = require('./dbConnect');
const mainRouter = require('./routes/index');
const cloudinary = require('cloudinary').v2;
const morgan = require("morgan");
dotenv.config('./.env');

const app = express();
// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(morgan("common"));
app.use(cookieParser());
app.use(
  cors({
      credentials: true,
      origin:'http://localhost:3000'
  })
);

// Routes
app.use('/api', mainRouter);

//cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_SECRET_KEY
});

dbConnect();
const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`Server listening on port :  ${port}`);
})