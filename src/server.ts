import App from './app'

import * as bodyParser from 'body-parser'

import HomeController from './controllers/home.controller'
import AuthController from './controllers/auth.controller'

const app = new App({
    port: 5000,
    controllers: [
        new HomeController(),
        new AuthController()
    ],
    middleWares: [
      // parse application/json
      // parse application/x-www-form-urlencoded
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
    ]
})

app.listen()