const express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bcrypt=require('bcryptjs');
var jwt = require("jsonwebtoken");
const app = express();
const axios = require("axios");
const db = require('../database/db_connection')
app.use(cors());
app.use(express.json());
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "option_trading",
//     multipleStatements: true,
//   });

//   con.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected!");
//   });
 

  module.exports = {
    login: async (req , res) => {
        try {
            let msg;
            let accessToken;
            let token;
            var email = req.body.email;
            var sql='SELECT * FROM admin WHERE email =?';
            db.query(sql, [email], (err, data, fields)=> {
                // console.log(data[0].id)
                if(err) throw err
                if (!data[0]){
                 
                    res.status(400).send({msg: "email does not exist"})
                } 
                
                  //utils.comparePassword(req.body.password, data[0].password)
                else if (!bcrypt.compareSync(req.body.password,data[0].password)){
                   
                    res.status(400).send({msg:" Invalid password "})
                }   
                else{
                   
                    // console.log(data.id)
                    token = jwt.sign({ email: data[0].email,id:data[0].id }, 'ijrg][09djhf89f%&v]', {
                        expiresIn: '2h' 
                      });
                      res.status(200).send({msg:"LogIn Successfull",accessToken: token})
                }
                    
            })
        } catch (error) {
            res.status(400).send(error)
        }
    },  


    getuser: async (req , res) => {
        try {
    var sql = `SELECT full_name,user_name,email FROM users where id=${req.params.id}`;
    db.query(sql, (error, results) => {
      if (error) {
        console.log(error);
        res.status(400).json({ status: "error" });
      } else {
        res.status(200).send(results);
      }
    });
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    deleteuser: async (req , res) => {
        try {
            let user =req.body.user;
            var sql = `DELETE FROM users WHERE id=${req.params.id};DELETE FROM portfolio WHERE user_id=${req.params.id}`;
              db.query(sql, (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(400).json({ status: "error" });
                } else {
                  res.status(200).send("Deleted");
                }
              });
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    getusers: async (req , res) => {
        try {
            var sql = "SELECT full_name,user_name,email FROM users";
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: "error" });
              } else {
                res.status(200).send(results);
              }
            });
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    allstocks: async (req , res) => {
        try {
            var sql = "SELECT * FROM stock_price";
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: "error" });
              } else {
                res.status(200).send(results);
              }
            });
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    userstocks: async (req , res) => {
        try {
            var sql = `SELECT COUNT(ticker),user_id FROM portfolio GROUP BY user_id`;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: "error" });
              } else {
                res.status(200).send(results);
              }
            });
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    userportfolio: async (req , res) => {
        try {
            var sql = `SELECT portfolio.ticker,portfolio.quantity,portfolio.buy_price,stock_price.close_price,portfolio.buy_cost,portfolio.market_cost,portfolio.broker,portfolio.commission,portfolio.pl_ytd,portfolio.pl_ytd_pr FROM portfolio INNER JOIN stock_price ON stock_price.ticker = portfolio.ticker WHERE user_id=${req.params.id}`;
            db.query(sql, (error, results) => {
              if (error) {
                      console.log(error);
                      res.status(400).json({ status: "error" });
                    } 
              else {
                
               
                res.send(results);
            }
          });
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    addstock: async (req , res) => {
        try {
            var sql = `INSERT INTO stocklist (symbol,name) VALUES ("${req.body.symbol}","${req.body.name}")`;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: "error" });
              } else {
                res.status(200).send("Stock Added");
              }
            }); 
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    Quotes: async (req , res) => {
        try {
            const symbol=req.params.symbol;
  
            const options = {
                method: 'GET',
                url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${symbol}`,
                
                headers: {Accept: 'application/json'}
              };
              axios.request(options).then(function (response) {
                res.send(response.data);
              }).catch(function (error) {
                console.error(error);
              });
          
        } catch (error) {
            res.status(400).send(error)
        }
    },    


    getstocks: async (req , res) => {
        try {
    var sql = `SELECT * FROM stocklist`;
    db.query(sql, (error, results) => {
      if (error) {
        console.log(error);
        res.status(400).json({ status: "error" });
      } else {
        res.status(200).send(results);
      }
    });
        } catch (error) {
            res.status(400).send(error)
        }
    },    
    


  }