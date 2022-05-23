const express = require('express')
const userRouter = express.Router();
var cors = require('cors');
var jwt = require("jsonwebtoken");
const app = express();
const path = require("path");
const userController = require('../controller/userController')
const isAuthenticated = require('../services/isAuthenticated')
const multer = require("multer");
app.use(cors());
app.use(express.json());
app.use(express.static('./upload'));
const bp = require('body-parser')
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
// Uploading Files
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        console.log(file.originalname)
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
  })
  
  const upload = multer({
  storage: storage,
  limits: {
      fileSize: 1000000000000
  }
  })

userRouter.post('/signup', userController.signup);
userRouter.post('/login',  userController.login);
userRouter.post('/changepassword', isAuthenticated, userController.changepassword);
userRouter.post('/addticker', isAuthenticated, userController.addticker);
userRouter.get('/stocks', isAuthenticated, userController.stocks);
userRouter.get('/userdetail', isAuthenticated, userController.userdetail);
userRouter.post('/addstrategy',upload.none(),isAuthenticated, userController.addstrategy);
userRouter.get('/getopenpositions', isAuthenticated, userController.getopenpositions);
userRouter.post('/closeposition', isAuthenticated, userController.closeposition);
userRouter.get('/getclosepositions', isAuthenticated, userController.getclosepositions);
userRouter.post('/addnotes',upload.fields([{name:"image_name",maxCount
:1}]), isAuthenticated, userController.addnotes);
userRouter.get('/getnotes/:leg_id', isAuthenticated, userController.getnotes);
userRouter.get('/getrecenttrades', isAuthenticated, userController.getrecenttrades);
userRouter.get('/getusedstrategy', isAuthenticated, userController.getusedstrategy);
userRouter.get('/getsectors', isAuthenticated, userController.getsectors);
userRouter.get('/getmonthlyplbystrat', isAuthenticated, userController.getmonthlyplbystrat);
userRouter.get('/getmonthlyplstrat', isAuthenticated, userController.getmonthlyplstrat);
userRouter.get('/gettopsymbol', isAuthenticated, userController.gettopsymbol);
userRouter.get('/getprofitablestrategy', isAuthenticated, userController.getprofitablestrategy);
userRouter.get('/gettradesummary', isAuthenticated, userController.gettradesummary);
userRouter.get('/getcurrentprice', isAuthenticated, userController.getcurrentprice);
userRouter.get('/getploverview', isAuthenticated, userController.getploverview);
userRouter.get('/getdetails/:leg_id', isAuthenticated, userController.getdetails);
userRouter.get('/getrealizedpl', isAuthenticated, userController.getrealizedpl);
userRouter.get('/expiresinsevend', isAuthenticated, userController.expiresinsevend);
//TESTTING .........
userRouter.post('/addstrategyy', isAuthenticated, userController.addstrategyy);

userRouter.get('/test', isAuthenticated, userController.test);
module.exports = userRouter