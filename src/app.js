require('dotenv').config()
let express = require('express')
let morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
let { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const usersRouter = require("./users/users-router")
const authRouter = require("./auth/auth-router")

const PORT = process.env.PORT || '8000'

//app.set("port", PORT)

const app = express()


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

  app.use(morgan(morganOption))
  app.use(helmet())
  app.use(
      cors({
        origin: process.env.CLIENT_ORIGIN
       })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api/users", usersRouter);
   app.use("/api/auth/", authRouter);

   app.get('/api', (req, res) => {
    res.send('Hello, world!')
})



app.use(function errorHandler(error, req, res, next) {
    let response 
    if(NODE_ENV === 'production'){
       response = {error: {message: 'server error'}}
    } else {
        console.error(error)
        response = {message: error.message, error}
    }
    res.status(500).json(response)
});

module.exports = app
