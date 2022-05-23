const express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bcrypt=require('bcryptjs');
var jwt = require("jsonwebtoken");
const app = express();
const multer = require("multer");
const axios = require("axios");
app.use(cors());
const isAuthenticated = require('./services/isAuthenticated')
app.use(express.json());
const db = require('./database/db_connection')
app.use(cors());
app.use(express.json());
app.use(express.static('upload'));
const bp = require('body-parser')

// Admin Routes :

const appAdminRouter = require('./routes/adminRoute');
app.use('/admin', appAdminRouter);

// User Routes :

const appUserRouter = require('./routes/userRoute');
app.use('/user', appUserRouter);



// Updating Stock Prices After Every One Minute:


// try{
//   setInterval(()=>{
//     var sql = `SELECT * FROM stock_price `;
//     db.query(sql, (error, results) => {
      
//       if (error) {
  
//         console.log(error);
//         res.status(500).json({ status: "error" });
//       } 
//       else {
//         results.forEach(async (a)=>{
//           const options = {
//             method: 'GET',
//             url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${a.ticker}`,
//             headers: {Accept: 'application/json'}
//           };     
//           axios.request(options).then(function (response) {
//             description= response['data'][`${a.ticker}`]['description'];
//             close_price= response['data'][`${a.ticker}`]['closePrice'];
//             open_price= response['data'][`${a.ticker}`]['openPrice'];
//             high_price= response['data'][`${a.ticker}`]['highPrice'];
//             low_price= response['data'][`${a.ticker}`]['lowPrice'];
//             var sql = `UPDATE stock_price SET description = "${description}",open_price =${open_price},high_price =${high_price},low_price=${low_price}, close_price = ${close_price}  WHERE ticker = "${a.ticker}"`;
//             db.query(sql, function (err, result) {
//               if (err) {
//                 console.log(err);
//                 res.status(500).json({ status: "error" });
//               } 
//               else {
//                 console.log("Updated")
//               }
//       });
//           });
//         });
//       }
//     });
    
//   },60000)
// }catch(err){
//   console.log(err)
// }

try{
  setInterval(()=>{   
    var sql = `SELECT * FROM stock_price `;
    db.query(sql, (error, results) => {
      
      if (error) {
  
        console.log(error);
        res.status(500).json({ status: "error" });
      } 
      else {
        results.forEach(async (a)=>{
          const options = {
            method: 'GET',
            url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${a.ticker}`,
            headers: {Accept: 'application/json'}
          };     
          axios.request(options).then(function (response) {
            description= response['data'][`${a.ticker}`]['description'];
            close_price= response['data'][`${a.ticker}`]['closePrice'];
            open_price= response['data'][`${a.ticker}`]['openPrice'];
            high_price= response['data'][`${a.ticker}`]['highPrice'];
            low_price= response['data'][`${a.ticker}`]['lowPrice'];
            var sql = `UPDATE stock_price SET description = "${description}",open_price =${open_price},high_price =${high_price},low_price=${low_price}, close_price = ${close_price}  WHERE ticker = "${a.ticker}"`;
            db.query(sql, function (err, result) {
              if (err) {
                console.log(err);
                res.status(500).json({ status: "error" });
              } 
              else {
                console.log("Updated")
              }
      });
          });
        });
      }
    });    
  },60000)
  setInterval(()=>{   
    var sql = `SELECT leg_id,delta,gamma,theta,vega,rho,entry_date,expiry_date,symbol,strike_price  FROM option_strategy ORDER by leg_id desc limit 5`;
    db.query(sql, (error, results) => {
    results.forEach(async (a)=>{
      greek = {};
      var entry_date = a.entry_date.toISOString().split("T")[0];
      var expiry_date = a.expiry_date.toISOString().split("T")[0];
      // console.log("entry_date",entry_date)
      // console.log("expiry_date",expiry_date)
      // console.log("symbol",a.symbol)
      // console.log("strike_price",a.strike_price)
      options = {
        method: "GET",
        url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${a.symbol}&strike=${a.strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
      };
      console.log(`https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${a.symbol}&strike=${a.strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`)
     var fun= axios.request(options).then(function (response) {
        
        var a = response.data.callExpDateMap;
        var c = response.data.putExpDateMap;
        var b = Object.keys(a);
        console.log("b",b)
        var d = Object.keys(c);
        try{
          
          delta = a[b[b.length - 1]][`${a.strike_price}.0`][0]["delta"];
          gamma = a[b[b.length - 1]][`${a.strike_price}.0`][0]["gamma"];
          theta = a[b[b.length - 1]][`${a.strike_price}.0`][0]["theta"];
          vega = a[b[b.length - 1]][`${a.strike_price}.0`][0]["vega"];
          rho = a[b[b.length - 1]][`${a.strike_price}.0`][0]["rho"];
          greek["delta"] = delta;
          greek["gamma"] = gamma;
          greek["theta"] = theta;
          greek["vega"] = vega;
          greek["rho"] = rho;
        
          return greek;

        }catch(e){
          console.log(e)
        }
       console.log(greek)
      });
      fun.then((val) => {
        let sql2 = `UPDATE option_strategy SET delta=${val.delta},gamma=${val.gamma},theta=${val.theta},vega=${val.vega},rho=${val.rho} WHERE leg_id =${a.leg_id}`;
        db.query(sql2, function (err, result2) {
          if (error) {
            
            console.log(err);
            
          } 
          else {
            console.log("Greek Updated");
          }
        });
      })
      
    })

    });
},60000)
}catch(err){
  console.log(err)
}

app.listen(5000,()=>{
    console.log("Server running on port 5000")
})