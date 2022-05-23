const express = require('express')
const adminRouter = express.Router();
var jwt = require("jsonwebtoken");
const adminController = require('../controller/adminController')
const isAuthenticated = require('../services/isAuthenticated')

adminRouter.post('/getuser/:id', isAuthenticated, adminController.getuser);
adminRouter.delete('/deleteuser/:id', isAuthenticated, adminController.deleteuser);
adminRouter.get('/getusers', isAuthenticated, adminController.getusers);
adminRouter.get('/allstocks', isAuthenticated, adminController.allstocks);
adminRouter.get('/userstocks', isAuthenticated, adminController.userstocks);
adminRouter.post('/userportfolio/:id', isAuthenticated, adminController.userportfolio);
adminRouter.post('/addstock', isAuthenticated, adminController.addstock);
adminRouter.post('/quotes/:symbol', isAuthenticated, adminController.Quotes);
adminRouter.get('/getstocks', isAuthenticated, adminController.getstocks);
adminRouter.post('/login',adminController.login);


module.exports = adminRouter