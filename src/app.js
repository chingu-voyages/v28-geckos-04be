require('dotenv').config()
let express = require('express')
let morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
let { NODE_ENV} = require('./config')
const usersRouter = require("./users/users-router")
const authRouter = require("./auth/auth-router")


const app = express()


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

  app.use(morgan(morganOption))
  app.use(helmet())
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api/users", usersRouter);
  app.use("/api/auth/", authRouter);
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });


   app.get('/api', (req, res) => {
    res.send('Hello, world!')
})



app.use((error, req, res, next) {
    let response 
    if(process.env.NODE_ENV === 'production'){
       response = {error: {message: 'server error'}}
    } else {
        logger.error(error.message)
        response = {message: error.message, error}
    }
    res.status(500).json(response)
});

module.exports = app
