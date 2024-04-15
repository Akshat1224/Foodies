require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const ejs = require('ejs')
const expresslayouts = require('express-ejs-layouts')
const PORT = process.env.PORT || 3300
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')


//Database connection
process.env.MONGO_CONNECTION_URL
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

// Connect to MongoDB
// Connect to MongoDB
const connectDB = require('./app/config/db');
const uri = process.env.MONGO_CONNECTION_URL 
connectDB(uri);


//session store

let mongoStore = new MongoDbStore({
  mongooseConnection: mongoose.connection,
  collection: 'sessions'
})
//Session config
// Session config
// Session config
// Session config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } //24hrs
}))


// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())


//Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.use(express.json())

//global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})

app.use(expresslayouts)
app.set('views', path.join(__dirname, 'resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)



const server = app.listen(PORT, () => {
  console.log(`listening `)
})


// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})