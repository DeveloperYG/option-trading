const express = require("express");
var mysql = require("mysql");
var cors = require("cors");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const app = express();
const axios = require("axios");
const db = require("../database/db_connection");
const { NULL } = require("mysql/lib/protocol/constants/types");
app.use(cors());
app.use(express.json());

module.exports = {
  signup: async (req, res) => {
    try {
      let token;
      inputData = {
        full_name: req.body.full_name,
        user_name: req.body.user_name,
        email: req.body.email,
        password: req.body.password,
      };
      // check unique email address
      var sql = `SELECT * FROM users WHERE email ="${[inputData.email]}"`;
      db.query(sql, (err, data, fields) => {
        let msg1;
        if (err) {
          console.log(err);
          res.status(400).json({ status: "error" });
        } else {
          if (data.length > 0) {
            msg1 = inputData.email + " was already exist";
            console.log(msg1);
            res.status(400).send(msg1);
          } else if (req.body.confirm_password != req.body.password) {
            msg1 = "Password & Confirm Password is not Matched";
            console.log(msg1);
            res.status(400).send(msg1);
          } else {
            hashed_password = bcrypt.hashSync(req.body.password, 8);
            // hashed_password = utils.hashPassword(req.body.password)
            // save users data into database
            var sql = `INSERT INTO users (full_name,user_name,email,password) VALUES ("${[
              inputData.full_name,
            ]}","${[inputData.user_name]}","${[
              inputData.email,
            ]}","${hashed_password}")`;
            db.query(sql, inputData, function (err, data) {
              if (err) throw err;
              console.log(inputData.email);
              console.log(data.insertId);
              token = jwt.sign(
                { email: inputData.email, id: data.insertId },
                "ijrg][09djhf89f%&v]",
                {
                  expiresIn: "2h", // 24 hours
                }
              );
              msg1 = { msg: "Your are successfully registered", token: token };
              console.log(msg1);
              res.status(200).send(msg1);
            });
          }
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  login: async (req, res) => {
    try {
      let msg;
      let accessToken;
      let token;
      var email = req.body.email;
      var sql = "SELECT * FROM users WHERE email =?";
      db.query(sql, [email], (err, data, fields) => {
        // console.log(data[0].id)
        if (err) throw err;
        if (!data[0]) {
          res.status(400).send({ msg: "email does not exist" });
        }

        //utils.comparePassword(req.body.password, data[0].password)
        else if (!bcrypt.compareSync(req.body.password, data[0].password)) {
          // accessToken= null;
          res.status(400).send({ msg: " Invalid password " });
        } else {
          // console.log(data.id)
          token = jwt.sign(
            { email: data[0].email, id: data[0].id },
            "ijrg][09djhf89f%&v]",
            {
              expiresIn: "2h",
            }
          );
          res.status(200).send({ msg: " LogIn Successfull ", token: token });
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  userdetail: async (req, res) => {
    try {
      var sql = `SELECT full_name,user_name,email FROM users where id=${req.userData.id}`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  // addticker: async (req , res) => {
  //     try {
  //         var ticker=req.body.ticker;
  //         var buy_price=req.body.buy_price;
  //         var commission=req.body.commission;
  //         var quantity=req.body.quantity;
  //         var buy_cost=buy_price*quantity;
  //         var broker=req.body.broker;
  //         var user_id=req.userData.id;

  //         var sql =`INSERT INTO portfolio (ticker,quantity,buy_price,buy_cost,broker,commission,user_id) VALUES ("${ticker}","${quantity}","${buy_price}","${buy_cost}","${broker}","${commission}","${user_id}")`;
  //         db.query(sql, function (err, result) {
  //                   if (err) {
  //                     console.log(err);
  //                     res.status(500).json({ status: "error" });
  //                   }
  //                   else {
  //                     var sql =`SELECT portfolio.ticker,portfolio.quantity,portfolio.buy_price,stock_price.close_price,portfolio.buy_cost,portfolio.market_cost,portfolio.broker,portfolio.commission,portfolio.pl_ytd,portfolio.pl_ytd_pr FROM portfolio INNER JOIN stock_price ON stock_price.ticker = portfolio.ticker WHERE user_id=${req.userData.id}`
  //         db.query(sql, function (err, result) {
  //                   if (err) {
  //                     console.log(err);
  //                     res.status(400).json({ status: "error" });
  //                   }
  //                   else {

  //                     res.status(200).send(result);
  //                   }
  //                 });
  //                     // res.status(200).send("Ticker Added");
  //                   }
  //                 });
  //         var sql =`INSERT INTO stock_price (ticker) VALUES ("${ticker}")`;
  //         db.query(sql, function (err, result) {
  //                   if (err) {
  //                     console.log("Duplicate Entry");

  //                   } else {
  //                     console.log("Added in stock_price");
  //                   }
  //                 });
  //     } catch (error) {
  //         // res.status(400).send(error)
  //     }
  //     var sql =`SELECT * from stock_price`;
  //         db.query(sql, (error, results) => {
  //           if (error) {
  //             console.log(error);
  //           }
  //       else {
  //         console.log(results)
  //       }
  //         })
  // },

  addticker: async (req, res) => {
    try {
      var ticker = req.body.ticker;

      sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
      db.query(sql1, function (err, result) {
        if (
          result[0][
            `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
          ] == 1
        ) {
          var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
          db.query(sql, function (err, result) {
            if (err) {
              console.log(err);
              // res.status(500).json({ status: "error" });
            } else {
              close_price = result[0].close_price;
              var buy_price = req.body.buy_price;
              var commission = req.body.commission;
              var quantity = req.body.quantity;
              var buy_cost = buy_price * quantity;
              var broker = req.body.broker;
              var user_id = req.userData.id;
              var market_cost = close_price * quantity;
              var pl = market_cost - buy_cost;
              var plp = (pl / buy_cost) * 100;
              var sql = `INSERT INTO portfolio (ticker,quantity,buy_price,buy_cost,market_cost,broker,commission,pl_ytd,pl_ytd_pr,user_id) VALUES ("${ticker}","${quantity}","${buy_price}","${buy_cost}","${market_cost}","${broker}","${commission}","${pl.toFixed(
                2
              )}","${plp.toFixed(2)}","${user_id}")`;
              db.query(sql, function (err, result) {
                if (err) {
                  console.log(err);
                  res.status(500).json({ status: "error" });
                } else {
                  var sql = `SELECT portfolio.ticker,portfolio.quantity,portfolio.buy_price,stock_price.close_price,portfolio.buy_cost,portfolio.market_cost,portfolio.broker,portfolio.commission,portfolio.pl_ytd,portfolio.pl_ytd_pr FROM portfolio INNER JOIN stock_price ON stock_price.ticker = portfolio.ticker WHERE user_id=${req.userData.id} ORDER BY portfolio.id DESC`;
                  db.query(sql, function (err, result) {
                    if (err) {
                      console.log(err);
                      res.status(400).json({ status: "error" });
                    } else {
                      res.status(200).send(result);
                    }
                  });
                  // res.status(200).send("Ticker Added");
                }
              });
            }
          });
          // var buy_price=req.body.buy_price;
          // var commission=req.body.commission;
          // var quantity=req.body.quantity;
          // var buy_cost=buy_price*quantity;
          // var broker=req.body.broker;
          // var user_id=req.userData.id;
          // var sql =`INSERT INTO portfolio (ticker,quantity,buy_price,buy_cost,broker,commission,user_id) VALUES ("${ticker}","${quantity}","${buy_price}","${buy_cost}","${broker}","${commission}","${user_id}")`;
          // db.query(sql, function (err, result) {
          //           if (err) {
          //             console.log(err);
          //             res.status(500).json({ status: "error" });
          //           }
          //           else {
          //             var sql =`SELECT portfolio.ticker,portfolio.quantity,portfolio.buy_price,stock_price.close_price,portfolio.buy_cost,portfolio.market_cost,portfolio.broker,portfolio.commission,portfolio.pl_ytd,portfolio.pl_ytd_pr FROM portfolio INNER JOIN stock_price ON stock_price.ticker = portfolio.ticker WHERE user_id=${req.userData.id}`
          // db.query(sql, function (err, result) {
          //           if (err) {
          //             console.log(err);
          //             res.status(400).json({ status: "error" });
          //           }
          //           else {
          //             console.log
          //             res.status(200).send(result);
          //           }
          //         });
          //             // res.status(200).send("Ticker Added");
          //           }
          //         });
        } else {
          try {
            const options = {
              method: "GET",
              url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
              headers: { Accept: "application/json" },
            };
            axios.request(options).then(function (response) {
              close_price = response["data"][`${ticker}`]["closePrice"];

              var sql = `INSERT INTO stock_price (ticker,close_price) VALUES ("${ticker}","${close_price}")`;
              db.query(sql, function (err, result) {
                if (err) {
                  console.log("Duplicate Entry");
                } else {
                  console.log("Added in stock_price");
                }
              });

              var buy_price = req.body.buy_price;
              var commission = req.body.commission;
              var quantity = req.body.quantity;
              var buy_cost = buy_price * quantity;
              var broker = req.body.broker;
              var user_id = req.userData.id;
              var market_cost = close_price * quantity;
              var pl = market_cost - buy_cost;
              var plp = (pl / buy_cost) * 100;
              var sql = `INSERT INTO portfolio (ticker,quantity,buy_price,buy_cost,market_cost,broker,commission,pl_ytd,pl_ytd_pr,user_id) VALUES ("${ticker}","${quantity}","${buy_price}","${buy_cost}","${market_cost}","${broker}","${commission}","${pl.toFixed(
                2
              )}","${plp.toFixed(2)}","${user_id}")`;
              db.query(sql, function (err, result) {
                if (err) {
                  console.log(err);
                  res.status(500).json({ status: "error" });
                } else {
                  var sql = `SELECT portfolio.ticker,portfolio.quantity,portfolio.buy_price,stock_price.close_price,portfolio.buy_cost,portfolio.market_cost,portfolio.broker,portfolio.commission,portfolio.pl_ytd,portfolio.pl_ytd_pr FROM portfolio INNER JOIN stock_price ON stock_price.ticker = portfolio.ticker WHERE user_id=${req.userData.id} ORDER BY portfolio.id DESC`;
                  db.query(sql, function (err, result) {
                    if (err) {
                      console.log(err);
                      res.status(400).json({ status: "error" });
                    } else {
                      res.status(200).send(result);
                    }
                  });
                  // res.status(200).send("Ticker Added");
                }
              });
            });
          } catch (error) {
            console.log(error);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  },

  stocks: async (req, res) => {
    try {
      var sql = `SELECT * from portfolio WHERE user_id=${req.userData.id}`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
        } else {
          results.forEach(async (a) => {
            var sql = `SELECT * from stock_price WHERE ticker="${a.ticker}"`;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
              } else {
                results.forEach(async (b) => {
                  console.log(b.close_price);
                  market_cost = b.close_price * a.quantity;
                  pl = market_cost - a.buy_cost;
                  plp = (pl / a.buy_cost) * 100;
                  console.log(pl.toFixed(2), plp.toFixed(2), a.ticker);
                  var sql = `UPDATE portfolio SET market_cost = ${market_cost},pl_ytd=${pl.toFixed(
                    2
                  )},pl_ytd_pr=${plp.toFixed(2)} WHERE id = ${a.id}`;
                  db.query(sql, (error, results) => {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log("updated");
                    }
                  });
                });
              }
            });
          });
        }
      });
      var sql = `SELECT portfolio.ticker,portfolio.quantity,portfolio.buy_price,stock_price.close_price,portfolio.buy_cost,portfolio.market_cost,portfolio.broker,portfolio.commission,portfolio.pl_ytd,portfolio.pl_ytd_pr FROM portfolio INNER JOIN stock_price ON stock_price.ticker = portfolio.ticker WHERE user_id=${req.userData.id} ORDER BY portfolio.id DESC`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: "error" });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  // addstrategy: async (req, res) => {
  //   try {
  //     var ticker = req.body.symbol;
  //     var entry_date = req.body.entry_date;
  //     var expiry_date = req.body.expiry_date;
  //     var trade = req.body.trade;
  //     var quantity = req.body.quantity;
  //     var strike_price = req.body.strike_price;
  //     var premium = req.body.premium;
  //     var fees = req.body.fees;
  //     var strategy = req.body.strategy;
  //     if (
  //       ticker &&
  //       entry_date &&
  //       expiry_date &&
  //       trade &&
  //       quantity &&
  //       strike_price &&
  //       premium &&
  //       fees &&
  //       strategy
  //     ) {
  //       sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
  //       db.query(sql1, function (err, result) {
  //         if (
  //           result[0][
  //             `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
  //           ] == 1
  //         ) {
  //           var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
  //           db.query(sql, function (err, result) {
  //             if (err) {
  //               console.log(err);
  //             } else {
  //               console.log();
  //               close_price = result[0].close_price;
  //               var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${req.body.delta}","${req.body.gamma}","${req.body.theta}","${req.body.vega}","${req.body.rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
  //               db.query(sql, (error, results) => {
  //                 if (error) {
  //                   console.log(error);
  //                   res.status(400).json({ status: error });
  //                 } else {
  //                   var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
  //                   db.query(sql, (error, results) => {
  //                     if (error) {
  //                       console.log(error);
  //                       res.status(400).json({ status: error });
  //                     } else {
  //                       var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                       db.query(sql, (error, results) => {
  //                         if (error) {
  //                           console.log(error);
  //                           res.status(400).json({ status: error });
  //                         } else {
  //                           var CoveredCall = {};
  //                           results[0].forEach((y) => {
  //                             CoveredCall[y.symbol] = [];
  //                           });
  //                           results[0].forEach((y) => {
  //                             CoveredCall[y.symbol].push(y);
  //                             console.log(CoveredCall);
  //                           });

  //                           var CashSecuredPut = {};
  //                           results[1].forEach((y) => {
  //                             CashSecuredPut[y.symbol] = [];
  //                           });
  //                           results[1].forEach((y) => {
  //                             CashSecuredPut[y.symbol].push(y);
  //                             console.log(CashSecuredPut);
  //                           });

  //                           var BearCallSpread = {};
  //                           results[2].forEach((y) => {
  //                             BearCallSpread[y.symbol] = [];
  //                           });
  //                           results[2].forEach((y) => {
  //                             BearCallSpread[y.symbol].push(y);
  //                             console.log(BearCallSpread);
  //                           });

  //                           var BullPutSpread = {};
  //                           results[3].forEach((y) => {
  //                             BullPutSpread[y.symbol] = [];
  //                           });
  //                           results[3].forEach((y) => {
  //                             BullPutSpread[y.symbol].push(y);
  //                             console.log(BullPutSpread);
  //                           });

  //                           var IronCondor = {};
  //                           results[4].forEach((y) => {
  //                             IronCondor[y.symbol] = [];
  //                           });
  //                           results[4].forEach((y) => {
  //                             IronCondor[y.symbol].push(y);
  //                             console.log(IronCondor);
  //                           });
  //                           res
  //                             .status(200)
  //                             .send({
  //                               CoveredCall: CoveredCall,
  //                             CashSecuredPut: CashSecuredPut,
  //                             BearCallSpread: BearCallSpread,
  //                             BullPutSpread: BullPutSpread,
  //                             IronCondor: IronCondor,
  //                             msg: "You have successfully added the trade"});
  //                         }
  //                       });
  //                     }
  //                   });
  //                 }
  //               });
  //             }
  //           });
  //         } else {
  //           const options = {
  //             method: "GET",
  //             url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
  //             headers: { Accept: "application/json" },
  //           };
  //           axios.request(options).then(function (response) {
  //             close_price = response["data"][`${ticker}`]["closePrice"];
  //             var sql = `INSERT INTO stock_price (ticker,close_price) VALUES ("${ticker}","${close_price}")`;
  //             db.query(sql, function (err, result) {
  //               if (err) {
  //                 console.log("Duplicate Entry");
  //               } else {
  //                 console.log("Added in stock_price");
  //               }
  //             });

  //             var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${req.body.delta}","${req.body.gamma}","${req.body.theta}","${req.body.vega}","${req.body.rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
  //             db.query(sql, (error, results) => {
  //               if (error) {
  //                 console.log(error);
  //                 res.status(400).json({ status: error });
  //               } else {
  //                 var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
  //                 db.query(sql, (error, results) => {
  //                   if (error) {
  //                     console.log(error);
  //                     res.status(400).json({ status: error });
  //                   } else {
  //                     var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                     db.query(sql, (error, results) => {
  //                       if (error) {
  //                         console.log(error);
  //                         res.status(400).json({ status: error });
  //                       } else {
  //                         var CoveredCall = {};
  //                         results[0].forEach((y) => {
  //                           CoveredCall[y.symbol] = [];
  //                         });
  //                         results[0].forEach((y) => {
  //                           CoveredCall[y.symbol].push(y);
  //                           console.log(CoveredCall);
  //                         });

  //                         var CashSecuredPut = {};
  //                         results[1].forEach((y) => {
  //                           CashSecuredPut[y.symbol] = [];
  //                         });
  //                         results[1].forEach((y) => {
  //                           CashSecuredPut[y.symbol].push(y);
  //                           console.log(CashSecuredPut);
  //                         });

  //                         var BearCallSpread = {};
  //                         results[2].forEach((y) => {
  //                           BearCallSpread[y.symbol] = [];
  //                         });
  //                         results[2].forEach((y) => {
  //                           BearCallSpread[y.symbol].push(y);
  //                           console.log(BearCallSpread);
  //                         });

  //                         var BullPutSpread = {};
  //                         results[3].forEach((y) => {
  //                           BullPutSpread[y.symbol] = [];
  //                         });
  //                         results[3].forEach((y) => {
  //                           BullPutSpread[y.symbol].push(y);
  //                           console.log(BullPutSpread);
  //                         });

  //                         var IronCondor = {};
  //                         results[4].forEach((y) => {
  //                           IronCondor[y.symbol] = [];
  //                         });
  //                         results[4].forEach((y) => {
  //                           IronCondor[y.symbol].push(y);
  //                           console.log(IronCondor);
  //                         });
  //                         res
  //                           .status(200)
  //                           .send({
  //                             CoveredCall: CoveredCall,
  //                             CashSecuredPut: CashSecuredPut,
  //                             BearCallSpread: BearCallSpread,
  //                             BullPutSpread: BullPutSpread,
  //                             IronCondor: IronCondor,
  //                             msg: "You have successfully added the trade"
  //                           });
  //                       }
  //                     });
  //                   }
  //                 });
  //               }
  //             });
  //           });
  //         }
  //       });
  //     } else {
  //       res.status(400).json({ msg: "please enter all fields" });
  //     }
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },

//<================================================ol=====================================>

  // addstrategy: async (req, res) => {
  //   try {
  //     var ticker = req.body.symbol;
  //     var entry_date = req.body.entry_date;
  //     var expiry_date = req.body.expiry_date;
  //     var trade = req.body.trade;
  //     var quantity = req.body.quantity;
  //     var strike_price = req.body.strike_price;
  //     var premium = req.body.premium;
  //     var fees = req.body.fees;
  //     var strategy = req.body.strategy;
  //     if (
  //       ticker &&
  //       entry_date &&
  //       expiry_date &&
  //       trade &&
  //       quantity &&
  //       strike_price &&
  //       premium &&
  //       fees &&
  //       strategy
  //     ) {
  //       const options = {
  //         method: "GET",
  //         url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
  //       };
  //       axios.request(options).then(function (response) {
  //         if (response.data.status == "SUCCESS")
          
  //         {
  //           sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
  //           db.query(sql1, function (err, result) {
  //             if (
  //               result[0][
  //                 `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
  //               ] == 1
  //             ) {
  //               var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
  //               db.query(sql, function (err, result) {
  //                 if (err) {
  //                   console.log(err);
  //                 } else {
  //                   try {
  //                     const options = {
  //                       method: "GET",
  //                       url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
  //                     };
  //                     try {
  //                       axios.request(options).then(function (response) {
  //                         console.log(
  //                           "URL : ",
  //                           `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${entry_date}`
  //                         );
  //                         console.log(response.data);
  //                         var a = response.data.callExpDateMap;
  //                         console.log("a..a", a);
  //                         var b = Object.keys(a);
  //                         console.log("b..b", b);
  //                         console.log("d", `"${strike_price}.0"`);
  //                         console.log(
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["delta"]
  //                         );
  //                         // console.log("y",a[b[0]][strike_price][0]["delta"])
  //                         console.log(
  //                           "Actually",
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["delta"]
  //                         );
  //                         delta = `${
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["delta"]
  //                         }`;
  //                         gamma = `${
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["gamma"]
  //                         }`;
  //                         theta = `${
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["theta"]
  //                         }`;
  //                         vega = `${
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["vega"]
  //                         }`;
  //                         rho = `${
  //                           a[b[b.length - 1]][`${strike_price}.0`][0]["rho"]
  //                         }`;

  //                         close_price = result[0].close_price;
  //                         var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${delta}","${gamma}","${theta}","${vega}","${rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
  //                         db.query(sql, (error, results) => {
  //                           if (error) {
  //                             console.log(error);
  //                             res.status(400).json({ status: error });
  //                           } else {
  //                             var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
  //                             db.query(sql, (error, results) => {
  //                               if (error) {
  //                                 console.log(error);
  //                                 res.status(400).json({ status: error });
  //                               } 
  //                               else {
  //                                 // var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                                 // db.query(sql, (error, results) => {
  //                                 //   if (error) {
  //                                 //     console.log(error);
  //                                 //     res.status(400).json({ status: error });
  //                                 //   } else {
  //                                 //     var CoveredCall = {};
  //                                 //     results[0].forEach((y) => {
  //                                 //       CoveredCall[y.symbol] = [];
  //                                 //     });
  //                                 //     results[0].forEach((y) => {
  //                                 //       CoveredCall[y.symbol].push(y);
  //                                 //       console.log(CoveredCall);
  //                                 //     });
  //                                 //     var CashSecuredPut = {};
  //                                 //     results[1].forEach((y) => {
  //                                 //       CashSecuredPut[y.symbol] = [];
  //                                 //     });
  //                                 //     results[1].forEach((y) => {
  //                                 //       CashSecuredPut[y.symbol].push(y);
  //                                 //       console.log(CashSecuredPut);
  //                                 //     });
  //                                 //     var BearCallSpread = {};
  //                                 //     results[2].forEach((y) => {
  //                                 //       BearCallSpread[y.symbol] = [];
  //                                 //     });
  //                                 //     results[2].forEach((y) => {
  //                                 //       BearCallSpread[y.symbol].push(y);
  //                                 //       console.log(BearCallSpread);
  //                                 //     });
  //                                 //     var BullPutSpread = {};
  //                                 //     results[3].forEach((y) => {
  //                                 //       BullPutSpread[y.symbol] = [];
  //                                 //     });
  //                                 //     results[3].forEach((y) => {
  //                                 //       BullPutSpread[y.symbol].push(y);
  //                                 //       console.log(BullPutSpread);
  //                                 //     });
  //                                 //     var IronCondor = {};
  //                                 //     results[4].forEach((y) => {
  //                                 //       IronCondor[y.symbol] = [];
  //                                 //     });
  //                                 //     results[4].forEach((y) => {
  //                                 //       IronCondor[y.symbol].push(y);
  //                                 //       console.log(IronCondor);
  //                                 //     });
  //                                 //     res
  //                                 //       .status(200)
  //                                 //       .send({
  //                                 //         CoveredCall: CoveredCall,
  //                                 //       CashSecuredPut: CashSecuredPut,
  //                                 //       BearCallSpread: BearCallSpread,
  //                                 //       BullPutSpread: BullPutSpread,
  //                                 //       IronCondor: IronCondor,
  //                                 //       msg: "You have successfully added the trade"});
  //                                 //   }
  //                                 // });
  //                               }
  //                             });
  //                           }
  //                         });
  //                       });
  //                     } catch (err) {
  //                       console.log(err);
  //                     }
  //                   } catch (err) {
  //                     console.log(err);
  //                   }
  //                 }
  //               });
  //             } else {
  //               const options = {
  //                 method: "GET",
  //                 url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
  //                 headers: { Accept: "application/json" },
  //               };
  //               axios.request(options).then(function (response1) {
  //                 try {
  //                   const options = {
  //                     method: "GET",
  //                     url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
  //                   };
  //                   try {
  //                     axios.request(options).then(function (response) {
  //                       console.log(response);
  //                       var a = response.data.callExpDateMap;

  //                       var b = Object.keys(a);

  //                       delta = `${
  //                         a[b[b.length - 1]][`${strike_price}.0`][0]["delta"]
  //                       }`;
  //                       gamma = `${
  //                         a[b[b.length - 1]][`${strike_price}.0`][0]["gamma"]
  //                       }`;
  //                       theta = `${
  //                         a[b[b.length - 1]][`${strike_price}.0`][0]["theta"]
  //                       }`;
  //                       vega = `${
  //                         a[b[b.length - 1]][`${strike_price}.0`][0]["vega"]
  //                       }`;
  //                       rho = `${
  //                         a[b[b.length - 1]][`${strike_price}.0`][0]["rho"]
  //                       }`;
  //                       close_price =
  //                         response1["data"][`${ticker}`]["closePrice"];
  //                       var sql = `INSERT INTO stock_price (ticker,close_price) VALUES ("${ticker}","${close_price}")`;
  //                       db.query(sql, function (err, result) {
  //                         if (err) {
  //                           console.log("Duplicate Entry");
  //                         } else {
  //                           console.log("Added in stock_price");
  //                         }
  //                       });

  //                       var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${delta}","${gamma}","${theta}","${vega}","${rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
  //                       db.query(sql, (error, results) => {
  //                         if (error) {
  //                           console.log(error);
  //                           res.status(400).json({ status: error });
  //                         } else {
  //                           var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
  //                           db.query(sql, (error, results) => {
  //                             if (error) {
  //                               console.log(error);
  //                               res.status(400).json({ status: error });
  //                             } else {
  //                               var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                               db.query(sql, (error, results) => {
  //                                 if (error) {
  //                                   console.log(error);
  //                                   res.status(400).json({ status: error });
  //                                 } else {
  //                                   var CoveredCall = {};
  //                                   results[0].forEach((y) => {
  //                                     CoveredCall[y.symbol] = [];
  //                                   });
  //                                   results[0].forEach((y) => {
  //                                     CoveredCall[y.symbol].push(y);
  //                                     // console.log(CoveredCall);
  //                                   });

  //                                   var CashSecuredPut = {};
  //                                   results[1].forEach((y) => {
  //                                     CashSecuredPut[y.symbol] = [];
  //                                   });
  //                                   results[1].forEach((y) => {
  //                                     CashSecuredPut[y.symbol].push(y);
  //                                     // console.log(CashSecuredPut);
  //                                   });

  //                                   var BearCallSpread = {};
  //                                   results[2].forEach((y) => {
  //                                     BearCallSpread[y.symbol] = [];
  //                                   });
  //                                   results[2].forEach((y) => {
  //                                     BearCallSpread[y.symbol].push(y);
  //                                     // console.log(BearCallSpread);
  //                                   });

  //                                   var BullPutSpread = {};
  //                                   results[3].forEach((y) => {
  //                                     BullPutSpread[y.symbol] = [];
  //                                   });
  //                                   results[3].forEach((y) => {
  //                                     BullPutSpread[y.symbol].push(y);
  //                                     // console.log(BullPutSpread);
  //                                   });

  //                                   var IronCondor = {};
  //                                   results[4].forEach((y) => {
  //                                     IronCondor[y.symbol] = [];
  //                                   });
  //                                   results[4].forEach((y) => {
  //                                     IronCondor[y.symbol].push(y);
  //                                     // console.log(IronCondor);
  //                                   });
  //                                   res.status(200).send({
  //                                     CoveredCall: CoveredCall,
  //                                     CashSecuredPut: CashSecuredPut,
  //                                     BearCallSpread: BearCallSpread,
  //                                     BullPutSpread: BullPutSpread,
  //                                     IronCondor: IronCondor,
  //                                     msg: "You have successfully added the trade",
  //                                   });
  //                                 }
  //                               });
  //                             }
  //                           });
  //                         }
  //                       });
  //                     });
  //                   } catch (e) {
  //                     console.log(e);
  //                   }
  //                 } catch (err) {
  //                   console.log(err);
  //                 }
  //               });
  //             }
  //           });
  //         } else {
  //           res
  //             .status(400)
  //             .json({ msg: "You have Entered an invalid Strike Price" });
  //         }
  //       });
  //     } else {
  //       res.status(400).json({ msg: "please enter all fields" });
  //     }
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },



  addstrategy: async (req, res) => {
    try {
      var ticker = req.body.symbol;
      var entry_date = req.body.entry_date;
      var expiry_date = req.body.expiry_date;
      var trade = req.body.trade;
      var quantity = req.body.quantity;
      var strike_price = req.body.strike_price;
      var sp=parseInt(strike_price).toFixed(1)
      console.log(sp)
      var premium = req.body.premium;
      var fees = req.body.fees;
      var strategy = req.body.strategy;
      if (
        ticker &&
        entry_date &&
        expiry_date &&
        trade &&
        quantity &&
        strike_price &&
        premium &&
        fees &&
        strategy
      )

      {
        const options = {
          method: "GET",
          url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
        };
        axios.request(options).then(function (response) {
          if (response.data.status == "SUCCESS"){
            
            sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
            db.query(sql1, function (err, result) {
              if (
                result[0][
                  `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
                ] == 1
              ) {
                var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
                db.query(sql, function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    try{
                      const options = {
                        method: "GET",
                        url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
                      };
                      try{
                        axios.request(options).then(function (response) {
                          console.log("URL : ",`https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${entry_date}`)
                          // console.log(response.data)
                          var a= response.data.callExpDateMap
                          // console.log("a..a",a)
                          var b=Object.keys(a)
                        //  console.log("b..b",b)
                        //   console.log("d",`"${strike_price}.0"`)
                          // console.log(a[b[b.length-1]][`${strike_price}.0`][0]["delta"])
                          // console.log("y",a[b[0]][strike_price][0]["delta"])
                          console.log("Actually",a[b[b.length-1]][`${sp}`][0]["delta"])
                            delta=`${a[b[b.length-1]][`${sp}`][0]["delta"]}`;
                            gamma=`${a[b[b.length-1]][`${sp}`][0]["gamma"]}`;
                            theta=`${a[b[b.length-1]][`${sp}`][0]["theta"]}`;
                            vega=`${a[b[b.length-1]][`${sp}`][0]["vega"]}`;
                            rho=`${a[b[b.length-1]][`${sp}`][0]["rho"]}`;
    
                            close_price = result[0].close_price;
                            var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${delta}","${gamma}","${theta}","${vega}","${rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
                            db.query(sql, (error, results) => {
                              if (error) {
                                console.log(error);
                                res.status(400).json({ status: error });
                              } else {
                                var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
                                db.query(sql, (error, results) => {
                                  if (error) {
                                    console.log(error);
                                    res.status(400).json({ status: error });
                                  } else {
                                    
    
                                    var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
                                    
                              
                                      db.query(sql, (error, results) => {
                                      if (error) {
                                        console.log(error);
                                        res.status(400).json({ status: error });
                                      } else {
                                        var cc = [];
                                        var CoveredCall = {};
                                        results[0].forEach((y) => {
                                          CoveredCall[y.symbol] = [];
                                        });
                                        // console.log("1", CoveredCall);
                                        results[0].forEach((y) => {
                                          CoveredCall[y.symbol].push(y);
                                          // console.log(CoveredCall);
                                        });
                                        // console.log("2", CoveredCall);
                                        var s = Object.keys(CoveredCall);
                                        var ob = { symbol: "", data: [] };
                                        s.forEach((z) => {
                                          // console.log(CoveredCall[`${z}`].length);
                                          // console.log("Z", z);
                                          if (CoveredCall[`${z}`].length == 1) {
                                            CoveredCall[`${z}`][0]["content"] = null;
                                            cc.push(CoveredCall[`${z}`][0]);
                                          } else {
                                            // console.log("dk",CoveredCall[`${z}`])
                                            ob.symbol = z;
                                            ob.data = CoveredCall[`${z}`];
                                            // console.log("ob",ob)
                              
                                            cc.push({ content: ob });
                                            ob = { symbol: "", data: [] };
                                          }
                                        });
                              
                                        // console.log("cc ot", cc);
                                        //<------------------------------------------------------------------------------------------------------------>
                                        var cc1 = [];
                                        var CashSecuredPut = {};
                                        results[1].forEach((y) => {
                                          // console.log("CSP", y.symbol);
                                          CashSecuredPut[y.symbol] = [];
                                        });
                                        results[1].forEach((y) => {
                                          CashSecuredPut[y.symbol].push(y);
                                        });
                                        // console.log("CSP1", CashSecuredPut);
                                        var s1 = Object.keys(CashSecuredPut);
                                        // console.log("s1", s1);
                                        var ob1 = { symbol: "", data: [] };
                                        s1.forEach((z) => {
                                          console.log(CashSecuredPut[`${z}`].length);
                                          if (CashSecuredPut[`${z}`].length == 1) {
                                            CashSecuredPut[`${z}`][0]["content"] = null;
                                            cc1.push(CashSecuredPut[`${z}`][0]);
                                            // console.log("cc1", CashSecuredPut[`${z}`][0]);
                                          } else {
                                            // console.log("dk",CashSecuredPut[`${z}`])
                                            ob1.symbol = z;
                                            ob1.data = CashSecuredPut[`${z}`];
                                            // console.log("ob", ob1);
                              
                                            cc1.push({ content: ob1 });
                                            ob1 = { symbol: "", data: [] };
                                          }
                                        });
                                        // console.log("OT OB1",ob1)
                                        // console.log("OT  CC1",cc1)
                                        //<------------------------------------------------------------------------------------------------------------>
                                        var cc2 = [];
                                        var BearCallSpread = {};
                                        results[2].forEach((y) => {
                                          BearCallSpread[y.symbol] = [];
                                        });
                                        results[2].forEach((y) => {
                                          BearCallSpread[y.symbol].push(y);
                                          // console.log(CoveredCall);
                                        });
                                        var s2 = Object.keys(BearCallSpread);
                                        var ob2 = { symbol: "", data: [] };
                                        s2.forEach((z) => {
                                          console.log(BearCallSpread[`${z}`].length);
                                          if (BearCallSpread[`${z}`].length == 1) {
                                            BearCallSpread[`${z}`][0]["content"] = null;
                                            cc2.push(BearCallSpread[`${z}`][0]);
                                          } else {
                                            // console.log("dk",CoveredCall[`${z}`])
                                            ob2.symbol = z;
                                            ob2.data = BearCallSpread[`${z}`];
                                            // console.log("ob",ob)
                              
                                            cc2.push({ content: ob2 });
                                            ob2 = { symbol: "", data: [] };
                                          }
                                        });
                                        //<------------------------------------------------------------------------------------------------------------>
                                        var cc3 = [];
                                        var BullPutSpread = {};
                                        results[3].forEach((y) => {
                                          BullPutSpread[y.symbol] = [];
                                        });
                                        results[3].forEach((y) => {
                                          BullPutSpread[y.symbol].push(y);
                                          // console.log(CoveredCall);
                                        });
                                        var s3 = Object.keys(BullPutSpread);
                                        var ob3 = { symbol: "", data: [] };
                                        s3.forEach((z) => {
                                          console.log(BullPutSpread[`${z}`].length);
                                          if (BullPutSpread[`${z}`].length == 1) {
                                            BullPutSpread[`${z}`][0]["content"] = null;
                                            cc3.push(BullPutSpread[`${z}`][0]);
                                          } else {
                                            // console.log("dk",CoveredCall[`${z}`])
                                            ob3.symbol = z;
                                            ob3.data = BullPutSpread[`${z}`];
                                            // console.log("ob",ob)
                              
                                            cc3.push({ content: ob3 });
                                            ob3 = { symbol: "", data: [] };
                                          }
                                        });
                                        //<------------------------------------------------------------------------------------------------------------>
                                        var cc4 = [];
                                        var IronCondor = {};
                                        results[4].forEach((y) => {
                                          IronCondor[y.symbol] = [];
                                        });
                                        results[4].forEach((y) => {
                                          IronCondor[y.symbol].push(y);
                                          // console.log(CoveredCall);
                                        });
                                        var s4 = Object.keys(IronCondor);
                                        var ob4 = { symbol: "", data: [] };
                                        s4.forEach((z) => {
                                          console.log(IronCondor[`${z}`].length);
                                          if (IronCondor[`${z}`].length == 1) {
                                            IronCondor[`${z}`][0]["content"] = null;
                                            cc4.push(IronCondor[`${z}`][0]);
                                          } else {
                                            // console.log("dk",CoveredCall[`${z}`])
                                            ob4.symbol = z;
                                            ob4.data = IronCondor[`${z}`];
                                            // console.log("ob",ob)
                              
                                            cc4.push({ content: ob4 });
                                            ob4 = { symbol: "", data: [] };
                                          }
                                        });
                              
                                        // console.log("cc",cc)
                              
                                        // var BearCallSpread = {};
                                        // results[2].forEach((y) => {
                                        //   BearCallSpread[y.symbol] = [];
                                        // });
                                        // results[2].forEach((y) => {
                                        //   BearCallSpread[y.symbol].push(y);
                                        //   console.log(BearCallSpread);
                                        // });
                              
                                        // var BullPutSpread = {};
                                        // results[3].forEach((y) => {
                                        //   BullPutSpread[y.symbol] = [];
                                        // });
                                        // results[3].forEach((y) => {
                                        //   BullPutSpread[y.symbol].push(y);
                                        //   console.log(BullPutSpread);
                                        // });
                              
                                        // var IronCondor = {};
                                        // results[4].forEach((y) => {
                                        //   IronCondor[y.symbol] = [];
                                        // });
                                        // results[4].forEach((y) => {
                                        //   IronCondor[y.symbol].push(y);
                                        //   console.log(IronCondor);
                                        // });
                              
                                        res
                                          .status(200)
                                          .send({
                                            CoveredCall: cc,
                                            CashSecuredPut: cc1,
                                            BearCallSpread: cc2,
                                            BullPutSpread: cc3,
                                            IronCondor: cc4,
                                            msg: "You have successfully added the trade"
                                          });
                                      }
                                    });
    
    
    
                                  }
                                });
                              }
                            });
    
                          })
                      }catch(err){console.log(err)}
                    }catch(err){console.log(err)}
    
                  }
                });
              } else {
                const options = {
                  method: "GET",
                  url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
                  headers: { Accept: "application/json" },
                };
                axios.request(options).then(function (response1) {
    
                  try{
                    const options = {
                      method: "GET",
                      url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
                    };
                    try{
                      axios.request(options).then(function (response) {
                        console.log(response)
                        var a= response.data.callExpDateMap
    
                        var b=Object.keys(a)
    
                        delta=`${a[b[b.length-1]][`${sp}`][0]["delta"]}`;
                        gamma=`${a[b[b.length-1]][`${sp}`][0]["gamma"]}`;
                        theta=`${a[b[b.length-1]][`${sp}`][0]["theta"]}`;
                        vega=`${a[b[b.length-1]][`${sp}`][0]["vega"]}`;
                        rho=`${a[b[b.length-1]][`${sp}`][0]["rho"]}`;
                          close_price = response1["data"][`${ticker}`]["closePrice"];
                  var sql = `INSERT INTO stock_price (ticker,close_price) VALUES ("${ticker}","${close_price}")`;
                  db.query(sql, function (err, result) {
                    if (err) {
                      console.log("Duplicate Entry");
                    } else {
                      console.log("Added in stock_price");
                    }
                  });
    
                  var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${delta}","${gamma}","${theta}","${vega}","${rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
                  db.query(sql, (error, results) => {
                    if (error) {
                      console.log(error);
                      res.status(400).json({ status: error });
                    } else {
                      var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
                      db.query(sql, (error, results) => {
                        if (error) {
                          console.log(error);
                          res.status(400).json({ status: error });
                        } else {
                          
                          // var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
                          // db.query(sql, (error, results) => {
                          //   if (error) {
                          //     console.log(error);
                          //     res.status(400).json({ status: error });
                          //   } else {
                          //     var CoveredCall = {};
                          //     results[0].forEach((y) => {
                          //       CoveredCall[y.symbol] = [];
                          //     });
                          //     results[0].forEach((y) => {
                          //       CoveredCall[y.symbol].push(y);
                          //       console.log(CoveredCall);
                          //     });
    
                          //     var CashSecuredPut = {};
                          //     results[1].forEach((y) => {
                          //       CashSecuredPut[y.symbol] = [];
                          //     });
                          //     results[1].forEach((y) => {
                          //       CashSecuredPut[y.symbol].push(y);
                          //       console.log(CashSecuredPut);
                          //     });
    
                          //     var BearCallSpread = {};
                          //     results[2].forEach((y) => {
                          //       BearCallSpread[y.symbol] = [];
                          //     });
                          //     results[2].forEach((y) => {
                          //       BearCallSpread[y.symbol].push(y);
                          //       console.log(BearCallSpread);
                          //     });
    
                          //     var BullPutSpread = {};
                          //     results[3].forEach((y) => {
                          //       BullPutSpread[y.symbol] = [];
                          //     });
                          //     results[3].forEach((y) => {
                          //       BullPutSpread[y.symbol].push(y);
                          //       console.log(BullPutSpread);
                          //     });
    
                          //     var IronCondor = {};
                          //     results[4].forEach((y) => {
                          //       IronCondor[y.symbol] = [];
                          //     });
                          //     results[4].forEach((y) => {
                          //       IronCondor[y.symbol].push(y);
                          //       console.log(IronCondor);
                          //     });
                          //     res
                          //       .status(200)
                          //       .send({
                          //         CoveredCall: CoveredCall,
                          //         CashSecuredPut: CashSecuredPut,
                          //         BearCallSpread: BearCallSpread,
                          //         BullPutSpread: BullPutSpread,
                          //         IronCondor: IronCondor,
                          //         msg: "You have successfully added the trade"
                          //       });
                          //   }
                          // });
                          var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
                          // SELECT option_strategy.entry_date,option_strategy.symbol,option_strategy.trade,option_strategy.quantity,option_strategy.expiry_date,option_strategy.strike_price,option_strategy.trade_price,details.market_price,details.implied_volatility,details.delta_dollars,details.delta,details.gamma,details.theta,details.vega,option_strategy.fees,details.net_proceeds,details.currentpl FROM option_strategy INNER JOIN details ON details.strategy_id = option_strategy.strategy_id  WHERE option_strategy.user_id=${req.userData.id} AND option_strategy.strategy="Cash Secured Put";
                    
                          db.query(sql, (error, results) => {
                            if (error) {
                              console.log(error);
                              res.status(400).json({ status: error });
                            } else {
                              var cc = [];
                              var CoveredCall = {};
                              results[0].forEach((y) => {
                                CoveredCall[y.symbol] = [];
                              });
                              // console.log("1", CoveredCall);
                              results[0].forEach((y) => {
                                CoveredCall[y.symbol].push(y);
                                // console.log(CoveredCall);
                              });
                              // console.log("2", CoveredCall);
                              var s = Object.keys(CoveredCall);
                              var ob = { symbol: "", data: [] };
                              s.forEach((z) => {
                                // console.log(CoveredCall[`${z}`].length);
                                // console.log("Z", z);
                                if (CoveredCall[`${z}`].length == 1) {
                                  CoveredCall[`${z}`][0]["content"] = null;
                                  cc.push(CoveredCall[`${z}`][0]);
                                } else {
                                  // console.log("dk",CoveredCall[`${z}`])
                                  ob.symbol = z;
                                  ob.data = CoveredCall[`${z}`];
                                  // console.log("ob",ob)
                    
                                  cc.push({ content: ob });
                                  ob = { symbol: "", data: [] };
                                }
                              });
                    
                              console.log("cc ot", cc);
                              //<------------------------------------------------------------------------------------------------------------>
                              var cc1 = [];
                              var CashSecuredPut = {};
                              results[1].forEach((y) => {
                                // console.log("CSP", y.symbol);
                                CashSecuredPut[y.symbol] = [];
                              });
                              results[1].forEach((y) => {
                                CashSecuredPut[y.symbol].push(y);
                              });
                              // console.log("CSP1", CashSecuredPut);
                              var s1 = Object.keys(CashSecuredPut);
                              // console.log("s1", s1);
                              var ob1 = { symbol: "", data: [] };
                              s1.forEach((z) => {
                                console.log(CashSecuredPut[`${z}`].length);
                                if (CashSecuredPut[`${z}`].length == 1) {
                                  CashSecuredPut[`${z}`][0]["content"] = null;
                                  cc1.push(CashSecuredPut[`${z}`][0]);
                                  // console.log("cc1", CashSecuredPut[`${z}`][0]);
                                } else {
                                  // console.log("dk",CashSecuredPut[`${z}`])
                                  ob1.symbol = z;
                                  ob1.data = CashSecuredPut[`${z}`];
                                  // console.log("ob", ob1);
                    
                                  cc1.push({ content: ob1 });
                                  ob1 = { symbol: "", data: [] };
                                }
                              });
                              // console.log("OT OB1",ob1)
                              // console.log("OT  CC1",cc1)
                              //<------------------------------------------------------------------------------------------------------------>
                              var cc2 = [];
                              var BearCallSpread = {};
                              results[2].forEach((y) => {
                                BearCallSpread[y.symbol] = [];
                              });
                              results[2].forEach((y) => {
                                BearCallSpread[y.symbol].push(y);
                                // console.log(CoveredCall);
                              });
                              var s2 = Object.keys(BearCallSpread);
                              var ob2 = { symbol: "", data: [] };
                              s2.forEach((z) => {
                                console.log(BearCallSpread[`${z}`].length);
                                if (BearCallSpread[`${z}`].length == 1) {
                                  BearCallSpread[`${z}`][0]["content"] = null;
                                  cc2.push(BearCallSpread[`${z}`][0]);
                                } else {
                                  // console.log("dk",CoveredCall[`${z}`])
                                  ob2.symbol = z;
                                  ob2.data = BearCallSpread[`${z}`];
                                  // console.log("ob",ob)
                    
                                  cc2.push({ content: ob2 });
                                  ob2 = { symbol: "", data: [] };
                                }
                              });
                              //<------------------------------------------------------------------------------------------------------------>
                              var cc3 = [];
                              var BullPutSpread = {};
                              results[3].forEach((y) => {
                                BullPutSpread[y.symbol] = [];
                              });
                              results[3].forEach((y) => {
                                BullPutSpread[y.symbol].push(y);
                                // console.log(CoveredCall);
                              });
                              var s3 = Object.keys(BullPutSpread);
                              var ob3 = { symbol: "", data: [] };
                              s3.forEach((z) => {
                                console.log(BullPutSpread[`${z}`].length);
                                if (BullPutSpread[`${z}`].length == 1) {
                                  BullPutSpread[`${z}`][0]["content"] = null;
                                  cc3.push(BullPutSpread[`${z}`][0]);
                                } else {
                                  // console.log("dk",CoveredCall[`${z}`])
                                  ob3.symbol = z;
                                  ob3.data = BullPutSpread[`${z}`];
                                  // console.log("ob",ob)
                    
                                  cc3.push({ content: ob3 });
                                  ob3 = { symbol: "", data: [] };
                                }
                              });
                              //<------------------------------------------------------------------------------------------------------------>
                              var cc4 = [];
                              var IronCondor = {};
                              results[4].forEach((y) => {
                                IronCondor[y.symbol] = [];
                              });
                              results[4].forEach((y) => {
                                IronCondor[y.symbol].push(y);
                                // console.log(CoveredCall);
                              });
                              var s4 = Object.keys(IronCondor);
                              var ob4 = { symbol: "", data: [] };
                              s4.forEach((z) => {
                                console.log(IronCondor[`${z}`].length);
                                if (IronCondor[`${z}`].length == 1) {
                                  IronCondor[`${z}`][0]["content"] = null;
                                  cc4.push(IronCondor[`${z}`][0]);
                                } else {
                                  // console.log("dk",CoveredCall[`${z}`])
                                  ob4.symbol = z;
                                  ob4.data = IronCondor[`${z}`];
                                  // console.log("ob",ob)
                    
                                  cc4.push({ content: ob4 });
                                  ob4 = { symbol: "", data: [] };
                                }
                              });
                    
                              // console.log("cc",cc)
                    
                              // var BearCallSpread = {};
                              // results[2].forEach((y) => {
                              //   BearCallSpread[y.symbol] = [];
                              // });
                              // results[2].forEach((y) => {
                              //   BearCallSpread[y.symbol].push(y);
                              //   console.log(BearCallSpread);
                              // });
                    
                              // var BullPutSpread = {};
                              // results[3].forEach((y) => {
                              //   BullPutSpread[y.symbol] = [];
                              // });
                              // results[3].forEach((y) => {
                              //   BullPutSpread[y.symbol].push(y);
                              //   console.log(BullPutSpread);
                              // });
                    
                              // var IronCondor = {};
                              // results[4].forEach((y) => {
                              //   IronCondor[y.symbol] = [];
                              // });
                              // results[4].forEach((y) => {
                              //   IronCondor[y.symbol].push(y);
                              //   console.log(IronCondor);
                              // });
                    
                              res
                                .status(200)
                                .send({
                                  CoveredCall: cc,
                                  CashSecuredPut: cc1,
                                  BearCallSpread: cc2,
                                  BullPutSpread: cc3,
                                  IronCondor: cc4,
                                  msg: "You have successfully added the trade"
                                });
                            }
                          });
                        }
                      });
                    }
                  });
    
                        })
                    }catch(e){console.log(e)}
                  }catch(err){console.log(err)}
    
                });
              }
            });
           
          }else{ res
            .status(400)
            .json({ msg: "You have Entered an invalid Strike Price" });}
        });

      
      } else {
        res.status(400).json({ msg: "please enter all fields" });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  },




  addnotes: async (req, res) => {
    try {
      var image;

      if (req.files.image_name == undefined) {
        image = "";
      } else {
        image = req.files.image_name[0].filename;
      }

      if (req.body.notes) {
        var sql = `INSERT INTO notes (leg_id,user_id,cover_image,notes) VALUES ("${req.body.leg_id}","${req.userData.id}","${image}","${req.body.notes}")`;
        db.query(sql, (error, results) => {
          if (error) {
            console.log(error);
            res.status(400).json({ status: error });
          } else {
            res.status(200).send("Notes Added");
          }
        });
      } else {
        res.status(400).json({ msg: "please enter all fields" });
      }
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  },

  getnotes: async (req, res) => {
    try {
      var sql = `SELECT * FROM notes where leg_id=${req.params.leg_id}`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  // getopenpositions: async (req , res) => {
  //   try {
  //     var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 GROUP BY option_strategy.symbol ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //     // SELECT option_strategy.entry_date,option_strategy.symbol,option_strategy.trade,option_strategy.quantity,option_strategy.expiry_date,option_strategy.strike_price,option_strategy.trade_price,details.market_price,details.implied_volatility,details.delta_dollars,details.delta,details.gamma,details.theta,details.vega,option_strategy.fees,details.net_proceeds,details.currentpl FROM option_strategy INNER JOIN details ON details.strategy_id = option_strategy.strategy_id  WHERE option_strategy.user_id=${req.userData.id} AND option_strategy.strategy="Cash Secured Put";

  //     db.query(sql, (error, results) => {
  //       if (error) {
  //         console.log(error);
  //         res.status(400).json({ status:error });
  //       } else {
  //         console.log(results[0])
  //         res.status(200).send({"CoveredCall":results[0],"CashSecuredPut":results[1],"BearCallSpread":results[2],"BullPutSpread":results[3],"IronCondor":results[4]});
  //       }
  //     });
  //         } catch (error) {
  //             res.status(400).send(error)
  //         }
  // },

  //<---------------------------Original--------------------------------------->

  // getopenpositions: async (req, res) => {
  //   try {
  //     var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //     // SELECT option_strategy.entry_date,option_strategy.symbol,option_strategy.trade,option_strategy.quantity,option_strategy.expiry_date,option_strategy.strike_price,option_strategy.trade_price,details.market_price,details.implied_volatility,details.delta_dollars,details.delta,details.gamma,details.theta,details.vega,option_strategy.fees,details.net_proceeds,details.currentpl FROM option_strategy INNER JOIN details ON details.strategy_id = option_strategy.strategy_id  WHERE option_strategy.user_id=${req.userData.id} AND option_strategy.strategy="Cash Secured Put";

  //     db.query(sql, (error, results) => {
  //       if (error) {
  //         console.log(error);
  //         res.status(400).json({ status: error });
  //       } else {
  //         var CoveredCall = {};
  //         results[0].forEach((y) => {
  //           CoveredCall[y.symbol] = [];
  //         });
  //         results[0].forEach((y) => {
  //           CoveredCall[y.symbol].push(y);
  //           console.log(CoveredCall);
  //         });

  //         var CashSecuredPut = {};
  //         results[1].forEach((y) => {
  //           CashSecuredPut[y.symbol] = [];
  //         });
  //         results[1].forEach((y) => {
  //           CashSecuredPut[y.symbol].push(y);
  //           console.log(CashSecuredPut);
  //         });

  //         var BearCallSpread = {};
  //         results[2].forEach((y) => {
  //           BearCallSpread[y.symbol] = [];
  //         });
  //         results[2].forEach((y) => {
  //           BearCallSpread[y.symbol].push(y);
  //           console.log(BearCallSpread);
  //         });

  //         var BullPutSpread = {};
  //         results[3].forEach((y) => {
  //           BullPutSpread[y.symbol] = [];
  //         });
  //         results[3].forEach((y) => {
  //           BullPutSpread[y.symbol].push(y);
  //           console.log(BullPutSpread);
  //         });

  //         var IronCondor = {};
  //         results[4].forEach((y) => {
  //           IronCondor[y.symbol] = [];
  //         });
  //         results[4].forEach((y) => {
  //           IronCondor[y.symbol].push(y);
  //           console.log(IronCondor);
  //         });
  //         res
  //           .status(200)
  //           .send({
  //             CoveredCall: CoveredCall,
  //             CashSecuredPut: CashSecuredPut,
  //             BearCallSpread: BearCallSpread,
  //             BullPutSpread: BullPutSpread,
  //             IronCondor: IronCondor,
  //           });
  //       }
  //     });
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },

  getopenpositions: async (req, res) => {
    try {
      var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
      // SELECT option_strategy.entry_date,option_strategy.symbol,option_strategy.trade,option_strategy.quantity,option_strategy.expiry_date,option_strategy.strike_price,option_strategy.trade_price,details.market_price,details.implied_volatility,details.delta_dollars,details.delta,details.gamma,details.theta,details.vega,option_strategy.fees,details.net_proceeds,details.currentpl FROM option_strategy INNER JOIN details ON details.strategy_id = option_strategy.strategy_id  WHERE option_strategy.user_id=${req.userData.id} AND option_strategy.strategy="Cash Secured Put";

      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          var cc = [];
          var CoveredCall = {};
          results[0].forEach((y) => {
            CoveredCall[y.symbol] = [];
          });
          console.log("1", CoveredCall);
          results[0].forEach((y) => {
            CoveredCall[y.symbol].push(y);
            // console.log(CoveredCall);
          });
          console.log("2", CoveredCall);
          var s = Object.keys(CoveredCall);
          var ob = { symbol: "", data: [] };
          s.forEach((z) => {
            console.log(CoveredCall[`${z}`].length);
            console.log("Z", z);
            if (CoveredCall[`${z}`].length == 1) {
              CoveredCall[`${z}`][0]["content"] = null;
              cc.push(CoveredCall[`${z}`][0]);
            } else {
              // console.log("dk",CoveredCall[`${z}`])
              ob.symbol = z;
              ob.data = CoveredCall[`${z}`];
              // console.log("ob",ob)

              cc.push({ content: ob });
              ob = { symbol: "", data: [] };
            }
          });

          console.log("cc ot", cc);
          //<------------------------------------------------------------------------------------------------------------>
          var cc1 = [];
          var CashSecuredPut = {};
          results[1].forEach((y) => {
            console.log("CSP", y.symbol);
            CashSecuredPut[y.symbol] = [];
          });
          results[1].forEach((y) => {
            CashSecuredPut[y.symbol].push(y);
          });
          console.log("CSP1", CashSecuredPut);
          var s1 = Object.keys(CashSecuredPut);
          console.log("s1", s1);
          var ob1 = { symbol: "", data: [] };
          s1.forEach((z) => {
            console.log(CashSecuredPut[`${z}`].length);
            if (CashSecuredPut[`${z}`].length == 1) {
              CashSecuredPut[`${z}`][0]["content"] = null;
              cc1.push(CashSecuredPut[`${z}`][0]);
              console.log("cc1", CashSecuredPut[`${z}`][0]);
            } else {
              // console.log("dk",CashSecuredPut[`${z}`])
              ob1.symbol = z;
              ob1.data = CashSecuredPut[`${z}`];
              console.log("ob", ob1);

              cc1.push({ content: ob1 });
              ob1 = { symbol: "", data: [] };
            }
          });
          // console.log("OT OB1",ob1)
          // console.log("OT  CC1",cc1)
          //<------------------------------------------------------------------------------------------------------------>
          var cc2 = [];
          var BearCallSpread = {};
          results[2].forEach((y) => {
            BearCallSpread[y.symbol] = [];
          });
          results[2].forEach((y) => {
            BearCallSpread[y.symbol].push(y);
            // console.log(CoveredCall);
          });
          var s2 = Object.keys(BearCallSpread);
          var ob2 = { symbol: "", data: [] };
          s2.forEach((z) => {
            console.log(BearCallSpread[`${z}`].length);
            if (BearCallSpread[`${z}`].length == 1) {
              BearCallSpread[`${z}`][0]["content"] = null;
              cc2.push(BearCallSpread[`${z}`][0]);
            } else {
              // console.log("dk",CoveredCall[`${z}`])
              ob2.symbol = z;
              ob2.data = BearCallSpread[`${z}`];
              // console.log("ob",ob)

              cc2.push({ content: ob2 });
              ob2 = { symbol: "", data: [] };
            }
          });
          //<------------------------------------------------------------------------------------------------------------>
          var cc3 = [];
          var BullPutSpread = {};
          results[3].forEach((y) => {
            BullPutSpread[y.symbol] = [];
          });
          results[3].forEach((y) => {
            BullPutSpread[y.symbol].push(y);
            // console.log(CoveredCall);
          });
          var s3 = Object.keys(BullPutSpread);
          var ob3 = { symbol: "", data: [] };
          s3.forEach((z) => {
            console.log(BullPutSpread[`${z}`].length);
            if (BullPutSpread[`${z}`].length == 1) {
              BullPutSpread[`${z}`][0]["content"] = null;
              cc3.push(BullPutSpread[`${z}`][0]);
            } else {
              // console.log("dk",CoveredCall[`${z}`])
              ob3.symbol = z;
              ob3.data = BullPutSpread[`${z}`];
              // console.log("ob",ob)

              cc3.push({ content: ob3 });
              ob3 = { symbol: "", data: [] };
            }
          });
          //<------------------------------------------------------------------------------------------------------------>
          var cc4 = [];
          var IronCondor = {};
          results[4].forEach((y) => {
            IronCondor[y.symbol] = [];
          });
          results[4].forEach((y) => {
            IronCondor[y.symbol].push(y);
            // console.log(CoveredCall);
          });
          var s4 = Object.keys(IronCondor);
          var ob4 = { symbol: "", data: [] };
          s4.forEach((z) => {
            console.log(IronCondor[`${z}`].length);
            if (IronCondor[`${z}`].length == 1) {
              IronCondor[`${z}`][0]["content"] = null;
              cc4.push(IronCondor[`${z}`][0]);
            } else {
              // console.log("dk",CoveredCall[`${z}`])
              ob4.symbol = z;
              ob4.data = IronCondor[`${z}`];
              // console.log("ob",ob)

              cc4.push({ content: ob4 });
              ob4 = { symbol: "", data: [] };
            }
          });

          // console.log("cc",cc)

          // var BearCallSpread = {};
          // results[2].forEach((y) => {
          //   BearCallSpread[y.symbol] = [];
          // });
          // results[2].forEach((y) => {
          //   BearCallSpread[y.symbol].push(y);
          //   console.log(BearCallSpread);
          // });

          // var BullPutSpread = {};
          // results[3].forEach((y) => {
          //   BullPutSpread[y.symbol] = [];
          // });
          // results[3].forEach((y) => {
          //   BullPutSpread[y.symbol].push(y);
          //   console.log(BullPutSpread);
          // });

          // var IronCondor = {};
          // results[4].forEach((y) => {
          //   IronCondor[y.symbol] = [];
          // });
          // results[4].forEach((y) => {
          //   IronCondor[y.symbol].push(y);
          //   console.log(IronCondor);
          // });

          res
            .status(200)
            .send({
              CoveredCall: cc,
              CashSecuredPut: cc1,
              BearCallSpread: cc2,
              BullPutSpread: cc3,
              IronCondor: cc4,
            });
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  closeposition: async (req, res) => {
    try {
      var sql = `SELECT entry_date FROM option_strategy WHERE strategy="${req.body.strategy}" AND symbol="${req.body.symbol}" AND leg_id="${req.body.leg_id}"`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          console.log("Y", results);
          let date = new Date();
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let fullDate = `${year}-${month}-${day}`;
          const d = new Date(fullDate) - new Date(`${results[0].entry_date}`);
          const D = d / (1000 * 3600 * 24);
          var sql = `UPDATE option_strategy SET close_premium="${req.body.close_premium}",close_fee="${req.body.close_fee}",overallpl="${req.body.overallpl}",close_date="${fullDate}",month=${month},realised_pl="${req.body.realised_pl}",trade_duration="${D}",status =1 WHERE strategy="${req.body.strategy}" AND symbol="${req.body.symbol}" AND leg_id="${req.body.leg_id}"`;
          db.query(sql, (error, results) => {
            if (error) {
              console.log(error);
              res.status(400).json({ status: error });
            } else {
              var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
              db.query(sql, (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(400).json({ status: error });
                } else {
                  var CoveredCall = {};
                  results[0].forEach((y) => {
                    CoveredCall[y.symbol] = [];
                  });
                  results[0].forEach((y) => {
                    CoveredCall[y.symbol].push(y);
                    console.log(CoveredCall);
                  });

                  var CashSecuredPut = {};
                  results[1].forEach((y) => {
                    CashSecuredPut[y.symbol] = [];
                  });
                  results[1].forEach((y) => {
                    CashSecuredPut[y.symbol].push(y);
                    console.log(CashSecuredPut);
                  });

                  var BearCallSpread = {};
                  results[2].forEach((y) => {
                    BearCallSpread[y.symbol] = [];
                  });
                  results[2].forEach((y) => {
                    BearCallSpread[y.symbol].push(y);
                    console.log(BearCallSpread);
                  });

                  var BullPutSpread = {};
                  results[3].forEach((y) => {
                    BullPutSpread[y.symbol] = [];
                  });
                  results[3].forEach((y) => {
                    BullPutSpread[y.symbol].push(y);
                    console.log(BullPutSpread);
                  });

                  var IronCondor = {};
                  results[4].forEach((y) => {
                    IronCondor[y.symbol] = [];
                  });
                  results[4].forEach((y) => {
                    IronCondor[y.symbol].push(y);
                    console.log(IronCondor);
                  });
                  res.status(200).send({
                    msg: "You have successfully closed the trade",
                    data: {
                      CoveredCall: CoveredCall,
                      CashSecuredPut: CashSecuredPut,
                      BearCallSpread: BearCallSpread,
                      BullPutSpread: BullPutSpread,
                      IronCondor: IronCondor,
                    },
                  });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getclosepositions: async (req, res) => {
    try {
      var sql = `SELECT entry_date,symbol,trade,strategy,expiry_date,quantity,strike_price,premium,trade_duration,overallpl as realised_pl,(SUM(overallpl) OVER (ORDER BY close_date)) as totalpl,close_date FROM option_strategy WHERE user_id=${req.userData.id} AND  status=1 ORDER BY close_date DESC`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  // getrecenttrades: async (req, res) => {
  //   try {
  //     var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND status=0 ORDER BY leg_id DESC LIMIT 3`;
  //     db.query(sql, (error, results) => {
  //       if (error) {
  //         console.log(error);
  //         res.status(400).json({ status: error });
  //       } else {
  //         var RecentTrades = {};
  //         results.forEach((y) => {
  //           RecentTrades[y.symbol] = [];
  //         });
  //         results.forEach((y) => {
  //           RecentTrades[y.symbol].push(y);

  //         });
  //         console.log("RecentTrades",RecentTrades);
  //         res.status(200).send(RecentTrades);
  //       }
  //     });
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },

  getrecenttrades: async (req, res) => {
    try {
      var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND status=0 ORDER BY leg_id DESC LIMIT 3`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          var RecentTrades = [];
          var rt = { strategy: "", symbol: "", data: [] };
          results.forEach((y) => {
            rt.strategy = y.strategy;
            rt.symbol = y.symbol;
            console.log("RecentTrades", RecentTrades);
            for (i = 0; i < RecentTrades.length; i++) {
              console.log("strategy", rt.strategy == RecentTrades[i].strategy);
              console.log("symbol", rt.symbol == RecentTrades[i].symbol);
              if (
                rt.strategy == RecentTrades[i].strategy &&
                rt.symbol == RecentTrades[i].symbol
              ) {
                RecentTrades[i].data.push(y);
              }
            }
            rt.data.push(y); //right

            RecentTrades.push(rt); //right

            rt = { strategy: "", symbol: "", data: [] };
          });
          // for(i=0;i<RecentTrades.length-1;i++){
          //  console.log("index",i)
          //   console.log("symbol",RecentTrades[i].symbol)
          //   if(i!=RecentTrades.length-1){
          //     // console.log("hkjhk",RecentTrades[1].symbol==RecentTrades[2].symbol)
          //     if((RecentTrades[i].symbol==RecentTrades[i+1].symbol)&&RecentTrades[i].strategy==RecentTrades[i+1].strategy){
          //       // console.log("ar",i+1)
          //       RecentTrades.splice(i+1,1)
          //       if((RecentTrades[i].symbol==RecentTrades[i+2].symbol)&&RecentTrades[i].strategy==RecentTrades[i+2].strategy){
          //         RecentTrades.splice(i+2,1)
          //       }
          //     }

          //   }else{ console.log(i,"NC")}

          // }
          if (
            RecentTrades[0].symbol == RecentTrades[2].symbol &&
            RecentTrades[0].strategy == RecentTrades[2].strategy
          ) {
            RecentTrades.splice(2, 1);
          }
          for (i = 1; i < RecentTrades.length; i++) {
            console.log(i);
            console.log(RecentTrades[i].symbol);
            // console.log(i+1,RecentTrades[i].symbol==RecentTrades[i+1].symbol)
            if (
              RecentTrades[i].symbol == RecentTrades[i - 1].symbol &&
              RecentTrades[i].strategy == RecentTrades[i - 1].strategy
            ) {
              console.log("remove", i);
              RecentTrades.splice(i, 1);
              console.log("lt", RecentTrades.length);
              if (RecentTrades.length != 1) {
                console.log("removee", RecentTrades);
                if (RecentTrades.length != 2) {
                  if (
                    RecentTrades[i].symbol == RecentTrades[i - 1].symbol &&
                    RecentTrades[i].strategy == RecentTrades[i - 1].strategy
                  ) {
                    RecentTrades.splice(i, 1);
                  }
                }
              }

              console.log("RecentTradesss", RecentTrades);
            }
          }

          console.log("RecentTrades", RecentTrades);
          res.status(200).send(RecentTrades);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getusedstrategy: async (req, res) => {
    try {
      var sql = `SELECT strategy,COUNT(strategy) FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY strategy  `;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  changepassword: async (req, res) => {
    try {
      password = req.body.password;
      new_password = req.body.new_password;
      user = req.userData.id;

      var sql = `SELECT * FROM users WHERE id=${user}`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          if (!bcrypt.compareSync(req.body.password, results[0].password)) {
            res.status(400).json({ msg: "You have entered Wrong Password" });
          } else {
            var upd_password = bcrypt.hashSync(new_password, 8);
            let sql2 = `UPDATE users SET password="${upd_password}" WHERE id =${user}`;
            db.query(sql2, function (err, result2) {
              if (err) throw err;
              if (result2) {
                console.log("Password Changed!");
                res.send({ sucess: true, message: "Password Changed!" });
              }
            });
          }
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getsectors: async (req, res) => {
    try {
      var sql = `SELECT COUNT(symbol) FROM option_strategy WHERE user_id=${req.userData.id} and status=1`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          var count = results[0]["COUNT(symbol)"];
          console.log("a", count);
          var sql = `SELECT stocklist.sector,CAST((COUNT(option_strategy.symbol)/${count})*100 as decimal(10,2))  AS count FROM stocklist INNER JOIN option_strategy ON stocklist.symbol = option_strategy.symbol WHERE user_id=${req.userData.id} AND status=1 GROUP BY sector `;

          db.query(sql, (error, result) => {
            if (error) {
              console.log(error);
              res.status(400).json({ status: error });
            } else {
              //  var jsonresult={
              //    "Total Stock":count,
              //    "Result":result
              //  }

              res.status(200).send(result);
            }
          });
        }
      });
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  },

  // getmonthlyplbystrat: async (req, res) => {
  //   try {
  //     data = {
  //       1: [],
  //       2: [],
  //       3: [],
  //       4: [],
  //       5: [],
  //       6: [],
  //       7: [],
  //       8: [],
  //       9: [],
  //       10: [],
  //       11: [],
  //       12: [],
  //     };
  //     var sql = `SELECT strategy,EXTRACT(MONTH FROM close_date) as month,SUM(overallpl) as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY strategy,EXTRACT(MONTH FROM close_date);`;
  //     db.query(sql, (error, results) => {
  //       if (error) {
  //         console.log(error);
  //         res.status(400).json({ status: error });
  //       } else {
  //         //  res.status(200).send(results);
  //         console.log(results[0]);
  //         results.forEach((item) => {
  //           console.log("a", item);
  //           data[item.month].push(item);
  //         });
  //         console.log(data);
  //         res.status(200).send(data);
  //       }
  //     });
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },

  // getmonthlyplbystrat: async (req, res) => {
  //   try {
  //     data = {
  //       1: 0,
  //       2: 0,
  //       3: 0,
  //       4: 0,
  //       5: 0,
  //       6: 0,
  //       7: 0,
  //       8: 0,
  //       9: 0,
  //       10:0,
  //       11:0,
  //       12:0,
  //     };

  //     var obj={
  //     };
  //     var sql = `SELECT strategy,EXTRACT(MONTH FROM close_date) as month,SUM(overallpl) as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY strategy,EXTRACT(MONTH FROM close_date);`;
  //     db.query(sql, (error, results) => {
  //       if (error) {
  //         console.log(error);
  //         res.status(400).json({ status: error });
  //       } else {
  //         //  res.status(200).send(results);

  //        console.log(results.length)
  //         results.forEach((item) => {

  //           obj[`${item.strategy}`]=data
  //           data = {
  //             1: 0,
  //             2: 0,
  //             3: 0,
  //             4: 0,
  //             5: 0,
  //             6: 0,
  //             7: 0,
  //             8: 0,
  //             9: 0,
  //             10:0,
  //             11:0,
  //             12:0,
  //           };
  //         });

  //         results.forEach((item) => {

  //           obj[`${item.strategy}`][item.month]=item.pl
  //           data = {
  //             1: 0,
  //             2: 0,
  //             3: 0,
  //             4: 0,
  //             5: 0,
  //             6: 0,
  //             7: 0,
  //             8: 0,
  //             9: 0,
  //             10:0,
  //             11:0,
  //             12:0,
  //           };
  //         });
  //      var b=[]
  //      var c={name:'',data:[]}
  //         Object.keys(obj).forEach((item) => {
  //              c.name=item
  //              c.data=Object.values(obj[`${item}`])
  //              b.push(c)
  //              c={name:'',data:[]}
  //         })
  //         res.status(200).send(b);
  //         console.log(b)
  //       //   console.log(Object.keys(obj))
  //       //  console.log(Object.values(obj["Covered Call"]))
  //       obj={}

  //       }
  //     });
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },

  getmonthlyplbystrat: async (req, res) => {
    try {
      data = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
      };

      var obj = {};
      var sql = `SELECT DISTINCT EXTRACT(MONTH FROM close_date) as month FROM option_strategy WHERE user_id=24 AND status=1 GROUP BY strategy,EXTRACT(MONTH FROM close_date);`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          if (results.length == 1) {
            var sql = `SELECT strategy,close_date as date,SUM(overallpl) as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY strategy,EXTRACT(DAY FROM close_date);`;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: error });
              } else {
                res.status(200).send(results);
                //     const mySet1 = new Set()
                //    console.log(results.length)
                //     results.forEach((item) => {
                //       mySet1.add(item.month)

                //       obj[`${item.strategy}`]=data
                //       data = {
                //         1: 0,
                //         2: 0,
                //         3: 0,
                //         4: 0,
                //         5: 0,
                //         6: 0,
                //         7: 0,
                //         8: 0,
                //         9: 0,
                //         10:0,
                //         11:0,
                //         12:0,
                //       };
                //     });

                //     results.forEach((item) => {

                //       obj[`${item.strategy}`][item.month]=item.pl
                //       data = {
                //         1: 0,
                //         2: 0,
                //         3: 0,
                //         4: 0,
                //         5: 0,
                //         6: 0,
                //         7: 0,
                //         8: 0,
                //         9: 0,
                //         10:0,
                //         11:0,
                //         12:0,
                //       };
                //     });
                //  var b=[]
                //  var c={name:'',data:[]}
                //     Object.keys(obj).forEach((item) => {
                //          c.name=item
                //          c.data=Object.values(obj[`${item}`])
                //          b.push(c)
                //          c={name:'',data:[]}
                //     })
                //     if(mySet1.size==1){

                //     }
                //     res.status(200).send(b);

                //     console.log(b)
                //   //   console.log(Object.keys(obj))
                //   //  console.log(Object.values(obj["Covered Call"]))
                //   obj={}
              }
            });
          } else {
            var sql = `SELECT strategy,EXTRACT(MONTH FROM close_date) as month,SUM(overallpl) as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY strategy,EXTRACT(MONTH FROM close_date);`;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: error });
              } else {
                //  res.status(200).send(results);
                const mySet1 = new Set();
                console.log(results.length);
                results.forEach((item) => {
                  mySet1.add(item.month);

                  obj[`${item.strategy}`] = data;
                  data = {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                    6: 0,
                    7: 0,
                    8: 0,
                    9: 0,
                    10: 0,
                    11: 0,
                    12: 0,
                  };
                });

                results.forEach((item) => {
                  obj[`${item.strategy}`][item.month] = item.pl;
                  data = {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                    6: 0,
                    7: 0,
                    8: 0,
                    9: 0,
                    10: 0,
                    11: 0,
                    12: 0,
                  };
                });
                var b = [];
                var c = { name: "", data: [] };
                Object.keys(obj).forEach((item) => {
                  c.name = item;
                  c.data = Object.values(obj[`${item}`]);
                  b.push(c);
                  c = { name: "", data: [] };
                });
                if (mySet1.size == 1) {
                }
                res.status(200).send(b);

                console.log(b);
                //   console.log(Object.keys(obj))
                //  console.log(Object.values(obj["Covered Call"]))
                obj = {};
              }
            });
          }
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getmonthlyplstrat: async (req, res) => {
    try {
      var sql = `SELECT EXTRACT(MONTH FROM close_date) as month,SUM(overallpl) as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY EXTRACT(MONTH FROM close_date);`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          console.log(results.length);
          if (results.length == 1) {
            var sql = `SELECT close_date as date,overallpl as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 `;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: error });
              } else {
                res.status(200).send(results);
              }
            });
          } else {
            res.status(200).send(results);
          }
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getprofitablestrategy: async (req, res) => {
    try {
      var sql = `SELECT strategy,SUM(overallpl) FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 GROUP BY strategy `;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  gettopsymbol: async (req, res) => {
    try {
      var sql = `SELECT symbol,overallpl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl >0 ORDER BY overallpl DESC LIMIT 3;SELECT symbol,overallpl FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl<0 ORDER BY overallpl ASC LIMIT 3`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          var jsonresult = {
            topgainers: results[0],
            toplosers: results[1],
          };
          res.status(200).send(jsonresult);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  gettradesummary: async (req, res) => {
    try {
      var sql = `SELECT count(*) FROM option_strategy WHERE user_id=${req.userData.id} AND status=1;SELECT count(overallpl) as win FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl > 0;SELECT count(overallpl) as loss FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl < 0;`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          var jsonresult = {
            Trades: results[0][0]["count(*)"],
            Win: results[1][0]["win"],
            Loss: results[2][0]["loss"],
          };
          res.status(200).send(jsonresult);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getcurrentprice: async (req, res) => {
    try {
      var ticker = req.body.symbol;

      sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
      db.query(sql1, function (err, result) {
        if (
          result[0][
            `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
          ] == 1
        ) {
          var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
          db.query(sql, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              close_price = result[0].close_price;
              res.send({ closeprice: close_price, a: ticker.length == 0 });
            }
          });
        } else {
          const options = {
            method: "GET",
            url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
            headers: { Accept: "application/json" },
          };
          axios.request(options).then(function (response) {
            close_price = response["data"][`${ticker}`]["closePrice"];
            res.send({ closeprice: close_price });
          });
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getploverview: async (req, res) => {
    try {
      var sql = `SELECT count(*) FROM option_strategy WHERE user_id=${req.userData.id} AND status=1;SELECT sum(overallpl)/count(overallpl) as avgwin FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl > 0;SELECT sum(overallpl)/count(overallpl) as avgloss FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl < 0;SELECT count(*) as win FROM option_strategy WHERE user_id=${req.userData.id} AND status=1 AND overallpl > 0;`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          var jsonresult = {
            winrate: (
              (results[3][0]["win"] / results[0][0]["count(*)"]) *
              100
            ).toFixed(2),
            avgwin: results[1][0]["avgwin"],
            avgloss: results[2][0]["avgloss"],
          };
          res.status(200).send(jsonresult);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getdetails: async (req, res) => {
    try {
      var sql = `SELECT * FROM option_strategy WHERE user_id=${req.userData.id} AND leg_id=${req.params.leg_id}`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          if (results[0].status == 0) {
            console.log("trade is open");
            var options;
            var options1;
            var a = [];
            let op = [];
            var strategy = results[0].strategy;
            var ticker_symbol = results[0].symbol;
            var trade_date = results[0].entry_date.toISOString().split("T")[0];
            greek = {};
            var expiry_date = results[0].expiry_date
              .toISOString()
              .split("T")[0];
            var quantity = results[0].quantity;
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var fullDate = `${year}-${month}-${day}`;
            var d = new Date(`${results[0].expiry_date}`) - new Date(fullDate);
            var D = d / (1000 * 3600 * 24);
            var daystoexpiry = D;
            var stock_price = 1000; // currently static
            var trade_price = results[0].premium;
            var market_price = results[0].market_price;
            var strike_price = results[0].strike_price;
            var breakeven_price = 56; //currently static
            var trade_fee = results[0].fees;
            var deltaDollars;
            f = new Date(trade_date);
            var monthh = f.getMonth() + 1;
            var dayy = f.getDate();
            var yearr = f.getFullYear();
            console.log("f", f);
            console.log("mt", monthh);
            console.log("dt", dayy);
            console.log("yr", yearr);
            console.log("Today", date);
            console.log("Start", trade_date);
            // console.log("diff",month-monthh)
            diff = month - monthh;
            console.log("diff", diff);

            if (diff < 3) {
              try{
                try{
                  options = {
                    method: "GET",
                    url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker_symbol}&strike=${strike_price}&fromDate=${trade_date}&toDate=${expiry_date}`,
                  };
                                // console.log(
              //   `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker_symbol}&strike=${strike_price}&fromDate=${trade_date}&toDate=${expiry_date}`
              // );
              var fun = axios.request(options).then(function (response) {
                var underlying_price = response.data.underlyingPrice;
                var a = response.data.callExpDateMap;
                var c = response.data.putExpDateMap;
                var b = Object.keys(a);
                var d = Object.keys(c);
                try{
                  
                  delta = a[b[b.length - 1]][`${strike_price}.0`][0]["delta"];
                  gamma = a[b[b.length - 1]][`${strike_price}.0`][0]["gamma"];
                  theta = a[b[b.length - 1]][`${strike_price}.0`][0]["theta"];
                  vega = a[b[b.length - 1]][`${strike_price}.0`][0]["vega"];
                  rho = a[b[b.length - 1]][`${strike_price}.0`][0]["rho"];
                  callVolume =
                    a[b[b.length - 1]][`${strike_price}.0`][0]["totalVolume"];
                  callOpenInterest =
                    a[b[b.length - 1]][`${strike_price}.0`][0]["openInterest"];
                  timeValue =
                    a[b[b.length - 1]][`${strike_price}.0`][0]["timeValue"];
                  putVolume =
                    c[d[d.length - 1]][`${strike_price}.0`][0]["totalVolume"];
                  putOpenInterest =
                    c[d[d.length - 1]][`${strike_price}.0`][0]["openInterest"];
                  intrinsicValue =
                    c[d[d.length - 1]][`${strike_price}.0`][0]["intrinsicValue"];
                  deltaDollars = delta * underlying_price;
                  greek["delta"] = delta;
                  greek["gamma"] = gamma;
                  greek["theta"] = theta;
                  greek["vega"] = vega;
                  greek["rho"] = rho;
                  greek["callVolume"] = callVolume;
                  greek["callOpenInterest"] = callOpenInterest;
                  greek["timeValue"] = timeValue;
                  greek["putVolume"] = putVolume;
                  greek["putOpenInterest"] = putOpenInterest;
                  greek["intrinsicValue"] = intrinsicValue;
                  greek["deltaDollars"] = deltaDollars;
                  console.log(greek);
                  return greek;

                }catch(e){
                  res.status(400).send("Invalid Strike Price")
                }
               
              });

              var d = new Date(yearr, monthh - 1, dayy);
              start = d.getTime();
              // console.log("start",start)

              var d1 = new Date(year, month - 1, day);
              end = d1.getTime();

              // console.log("end",end)

              v = { date: "", price: 0 };
              options1 = {
                method: "GET",
                url: `https://api.tdameritrade.com/v1/marketdata/${ticker_symbol}/pricehistory?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&periodType=month&frequencyType=weekly&frequency=1&endDate=${end}&startDate=${start}`,
              };
              var gt = axios.request(options1).then(function (response) {
                response.data.candles.forEach((p) => {
                  // console.log("datetime",p.datetime)
                  // console.log("close",p.close)
                  v.date = p.datetime;
                  v.price = p.close;
                  a.push(v);
                  v = { date: "", price: 0 };
                  console.log(a);
                });
                return a;
              });

              gt.then((k) => {
                op.push(k);
                console.log("op", op);
              });

              fun.then((val) => {
                gt.then((k) => {
                  op.push(k);
                  console.log("op", op);
try{
  var sql = `SELECT * FROM notes where leg_id=${req.params.leg_id}`;
  db.query(sql, (error, results1) => {
    if (error) {
      console.log(error);
      res.status(400).json({ status: error });
    } else {
      console.log(results1)
      res
                    .status(200)
                    .send({
                      strategy: strategy,
                      tickerSymbol: ticker_symbol,
                      stockPrice: 0,
                      tradeDate: trade_date,
                      expiryDate: expiry_date,
                      daysToExpiry: daystoexpiry,
                      quantity: quantity,
                      tradePrice: trade_price,
                      marketPrice: market_price,
                      strikePrice: strike_price,
                      callVolume: val.callVolume,
                      callOpenInterest: val.callOpenInterest,
                      timeValue: val.timeValue,
                      putVolume: val.putVolume,
                      putOpenInterest: val.putOpenInterest,
                      intrinsicValue: val.intrinsicValue,
                      deltaDollars: val.deltaDollars,
                      tradeFee: trade_fee,
                      delta: val.delta,
                      gamma: val.gamma,
                      theta: val.theta,
                      vega: val.vega,
                      rho: val.rho,
                      priceAction: k,
                      notes:{"coverImage":results1[0].cover_image,"notes":results1[0].notes}
                    });
    }
  });
  

}catch(e){}
                
                });
                // res.status(200).send(val)
              });

              // console.log("op",op)

                }catch(e){                res.status(400).send("Invalid Strike Price")}
              }catch(e){                res.status(400).send("Invalid Strike Price")}
             
   
            } else {
              try{
                try{
                  try{
                    options = {
                      method: "GET",
                      url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker_symbol}&strike=${strike_price}&fromDate=${trade_date}&toDate=${expiry_date}`,
                    };
                    var fun = axios.request(options).then(function (response) {
                      var underlying_price = response.data.underlyingPrice;
                      var a = response.data.callExpDateMap;
                      var c = response.data.putExpDateMap;
                      var b = Object.keys(a);
                      var d = Object.keys(c);
                      console.log(response.data);
                      try{
                        delta = a[b[b.length - 1]][`${strike_price}.0`][0]["delta"];
                        gamma = a[b[b.length - 1]][`${strike_price}.0`][0]["gamma"];
                        theta = a[b[b.length - 1]][`${strike_price}.0`][0]["theta"];
                        vega = a[b[b.length - 1]][`${strike_price}.0`][0]["vega"];
                        rho = a[b[b.length - 1]][`${strike_price}.0`][0]["rho"];
                        callVolume =
                          a[b[b.length - 1]][`${strike_price}.0`][0]["totalVolume"];
                        callOpenInterest =
                          a[b[b.length - 1]][`${strike_price}.0`][0]["openInterest"];
                        timeValue =
                          a[b[b.length - 1]][`${strike_price}.0`][0]["timeValue"];
                        putVolume =
                          c[d[d.length - 1]][`${strike_price}.0`][0]["totalVolume"];
                        putOpenInterest =
                          c[d[d.length - 1]][`${strike_price}.0`][0]["openInterest"];
                        intrinsicValue =
                          c[d[d.length - 1]][`${strike_price}.0`][0]["intrinsicValue"];
                        deltaDollars = delta * underlying_price;
                          greek["delta"] = delta;
                      greek["gamma"] = gamma;
                      greek["theta"] = theta;
                      greek["vega"] = vega;
                      greek["rho"] = rho;
                      greek["callVolume"] = callVolume;
                      greek["callOpenInterest"] = callOpenInterest;
                      greek["timeValue"] = timeValue;
                      greek["putVolume"] = putVolume;
                      greek["putOpenInterest"] = putOpenInterest;
                      greek["intrinsicValue"] = intrinsicValue;
                      greek["deltaDollars"] = deltaDollars;
                      console.log(greek);
                      return greek;
                      }catch(e){res.status(400).send("Invalid Strike Price")}
                     
                    
                    });
      
                    var d = new Date(yearr, monthh - 1, dayy);
                    start = d.getTime();
                    // console.log("start",start)
      
                    var d1 = new Date(year, month - 1, day);
                    end = d1.getTime();
      
                    // console.log("end",end)
      
                    v = { date: "", price: 0 };
                    options1 = {
                      method: "GET",
                      url: `https://api.tdameritrade.com/v1/marketdata/${ticker_symbol}/pricehistory?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&periodType=year&frequencyType=monthly&frequency=1&endDate=${end}&startDate=${start}`,
                    };
      
                    var gt = axios.request(options1).then(function (response) {
                      response.data.candles.forEach((p) => {
                        // console.log("datetime",p.datetime)
                        // console.log("close",p.close)
                        v.date = p.datetime;
                        v.price = p.close;
                        a.push(v);
                        v = { date: "", price: 0 };
                        // console.log(a)
                      });
                      return a;
                    });
      
                    gt.then((k) => {
                      op.push(k);
                      // console.log("op",op)
                    });
      
                    fun.then((val) => {
                      gt.then((k) => {
                        op.push(k);
                        // console.log("op",op)
      try{
        var sql = `SELECT * FROM notes where leg_id=${req.params.leg_id}`;
        db.query(sql, (error, results1) => {
          if (error) {
            console.log(error);
            res.status(400).json({ status: error });
          } else {
        res
        .status(200)
        .send({
          strategy: strategy,
          tickerSymbol: ticker_symbol,
          stockPrice: 0,
          tradeDate: trade_date,
          expiryDate: expiry_date,
          daysToExpiry: daystoexpiry,
          quantity: quantity,
          tradePrice: trade_price,
          marketPrice: market_price,
          strikePrice: strike_price,
          callVolume: val.callVolume,
          callOpenInterest: val.callOpenInterest,
          timeValue: val.timeValue,
          putVolume: val.putVolume,
          putOpenInterest: val.putOpenInterest,
          intrinsicValue: val.intrinsicValue,
          deltaDollars: val.deltaDollars,
          tradeFee: trade_fee,
          delta: val.delta,
          gamma: val.gamma,
          theta: val.theta,
          vega: val.vega,
          rho: val.rho,
          priceAction: k,
          notes:{"coverImage":results1[0].cover_image,"notes":results1[0].notes}
        });
      }
    })
      }catch(e){
        
      }
                      
                      });
                      // res.status(200).send(val)
                    });
      
                  }catch(e){                res.status(400).send("Invalid Strike Price")}
                }catch(e){                res.status(400).send("Invalid Strike Price")}
              }catch(e){
                res.status(400).send("Invalid Strike Price")
              }
              // console.log("bhai kya kar raha hai tu");
              // console.log(ticker_symbol);
          
              // console.log(
              //   `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker_symbol}&strike=${strike_price}&fromDate=${trade_date}&toDate=${expiry_date}`
              // );
             
              // res.status(200).send({"strategy":strategy,"tickerSymbol":ticker_symbol,"stockPrice":0,"tradeDate":trade_date,"expiryDate":expiry_date,"daysToExpiry":daystoexpiry,"quantity":quantity,"tradePrice":trade_price,"marketPrice":market_price,"strikePrice":strike_price})
            }
          } else {

            console.log("Trade is close");
            var options;
            var options1;
            var a = [];
            let op = [];
            var strategy = results[0].strategy;
            var ticker_symbol = results[0].symbol;
            var trade_date = results[0].entry_date.toISOString().split("T")[0];
            greek = {};
            var expiry_date = results[0].expiry_date
              .toISOString()
              .split("T")[0];
            var quantity = results[0].quantity;
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var fullDate = `${year}-${month}-${day}`;
            var d = new Date(`${results[0].expiry_date}`) - new Date(fullDate);
            var D = d / (1000 * 3600 * 24);
            var daystoexpiry = D;
            var stock_price = 1000; // currently static
            var trade_price = results[0].premium;
            var market_price = results[0].market_price;
            var strike_price = results[0].strike_price;
            var breakeven_price = 56; //currently static
            var trade_fee = results[0].fees;
          
            f = new Date(trade_date);
            var monthh = f.getMonth() + 1;
            var dayy = f.getDate();
            var yearr = f.getFullYear();
            console.log("f", f);
            console.log("mt", monthh);
            console.log("dt", dayy);
            console.log("yr", yearr);
            console.log("Today", date);
            console.log("Start", trade_date);
            // console.log("diff",month-monthh)
            diff = month - monthh;
            console.log("diff", diff);
            var sql = `SELECT * FROM notes where leg_id=${req.params.leg_id}`;
  db.query(sql, (error, results1) => {
    if (error) {
      console.log(error);
      res.status(400).json({ status: error });
    } else {
      res
      .status(200)
      .send({
        strategy: strategy,
        tickerSymbol: ticker_symbol,
        stockPrice: 0,
        tradeDate: trade_date,
        expiryDate: expiry_date,
        daysToExpiry: daystoexpiry,
        quantity: quantity,
        tradePrice: trade_price,
        marketPrice: market_price,
        strikePrice: strike_price,
        tradeFee: trade_fee+results[0].close_fee,
        notes:{"coverImage":results1[0].cover_image,"notes":results1[0].notes}
      });

    }
  });
            
          }
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getrealizedpl: async (req, res) => {
    try {
      date = new Date();
      day = date.getDate();
      month = date.getMonth() + 1;
      year = date.getFullYear();
      console.log(month);
      var sql = ` select SUM(overallpl) as month from option_strategy where month(close_date)=${month} and year(close_date)=${year} and user_id=${req.userData.id} and status=1 ;select SUM(overallpl) as ytd from option_strategy where  year(close_date)=${year} and user_id=${req.userData.id} and status=1 ;`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res
            .status(200)
            .send({ ytd: results[1][0].ytd, month: results[0][0].month });
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  expiresinsevend: async (req, res) => {
    try {
      var sql = `SELECT * FROM option_strategy WHERE user_id=${req.userData.id} and status=0 and expiry_date<=curdate()+7 order by expiry_date desc;`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          res.status(200).send(results);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  //TESTING ..............
  addstrategyy: async (req, res) => {
    try {
      var ticker = req.body.symbol;

      sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
      db.query(sql1, function (err, result) {
        if (
          result[0][
            `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
          ] == 1
        ) {
          var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
          db.query(sql, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log();
              close_price = result[0].close_price;
              var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${req.body.delta}","${req.body.gamma}","${req.body.theta}","${req.body.vega}","${req.body.rho}","${req.body.net_proceeds}","${req.body.currentpl}",1)`;
              db.query(sql, (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(400).json({ status: error });
                } else {
                  var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
                  db.query(sql, (error, results) => {
                    if (error) {
                      console.log(error);
                      res.status(400).json({ status: error });
                    } else {
                      var sql = `SELECT * FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=1;SELECT * FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=1;SELECT * FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=1;SELECT * FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=1;SELECT * FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=1`;
                      db.query(sql, (error, results) => {
                        if (error) {
                          console.log(error);
                          res.status(400).json({ status: error });
                        } else {
                          res.status(200).send({
                            "Covered Call": results[0],
                            "Cash Secured Put": results[1],
                            "Bear Call Spread": results[2],
                            "Bull Put Spread": results[3],
                            "Iron Condor": results[4],
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        } else {
          const options = {
            method: "GET",
            url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
            headers: { Accept: "application/json" },
          };
          axios.request(options).then(function (response) {
            close_price = response["data"][`${ticker}`]["closePrice"];
            var sql = `INSERT INTO stock_price (ticker,close_price) VALUES ("${ticker}","${close_price}")`;
            db.query(sql, function (err, result) {
              if (err) {
                console.log("Duplicate Entry");
              } else {
                console.log("Added in stock_price");
              }
            });

            var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${req.body.delta}","${req.body.gamma}","${req.body.theta}","${req.body.vega}","${req.body.rho}","${req.body.net_proceeds}","${req.body.currentpl}",1)`;
            db.query(sql, (error, results) => {
              if (error) {
                console.log(error);
                res.status(400).json({ status: error });
              } else {
                var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
                db.query(sql, (error, results) => {
                  if (error) {
                    console.log(error);
                    res.status(400).json({ status: error });
                  } else {
                    var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=1;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=1;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=1;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=1;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=1`;
                    db.query(sql, (error, results) => {
                      if (error) {
                        console.log(error);
                        res.status(400).json({ status: error });
                      } else {
                        res.status(200).send({
                          "Covered Call": results[0],
                          "Cash Secured Put": results[1],
                          "Bear Call Spread": results[2],
                          "Bull Put Spread": results[3],
                          "Iron Condor": results[4],
                        });
                      }
                    });
                  }
                });
              }
            });
          });
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  // addstrategy: async (req, res) => {
  //   try {
  //     var ticker = req.body.symbol;
  //     var entry_date = req.body.entry_date;
  //     var expiry_date = req.body.expiry_date;
  //     var trade = req.body.trade;
  //     var quantity = req.body.quantity;
  //     var strike_price = req.body.strike_price;
  //     var premium = req.body.premium;
  //     var fees = req.body.fees;
  //     var strategy = req.body.strategy;
  //     if (
  //       ticker &&
  //       entry_date &&
  //       expiry_date &&
  //       trade &&
  //       quantity &&
  //       strike_price &&
  //       premium &&
  //       fees &&
  //       strategy
  //     )

  //     {

  //       sql1 = `SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`;
  //       db.query(sql1, function (err, result) {
  //         if (
  //           result[0][
  //             `EXISTS(SELECT * FROM stock_price WHERE ticker="${ticker}")`
  //           ] == 1
  //         ) {
  //           var sql = `SELECT close_price FROM stock_price WHERE ticker="${ticker}"`;
  //           db.query(sql, function (err, result) {
  //             if (err) {
  //               console.log(err);
  //             } else {
  //               try{
  //                 const options = {
  //                   method: "GET",
  //                   url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
  //                 };
  //                 try{
  //                   axios.request(options).then(function (response) {
  //                     console.log("URL : ",`https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${entry_date}`)
  //                     console.log(response.data)
  //                     var a= response.data.callExpDateMap
  //                     console.log("a..a",a)
  //                     var b=Object.keys(a)
  //                    console.log("b..b",b)
  //                     console.log("d",`"${strike_price}.0"`)
  //                     console.log(a[b[b.length-1]][`${strike_price}.0`][0]["delta"])
  //                     // console.log("y",a[b[0]][strike_price][0]["delta"])
  //                     console.log("Actually",a[b[b.length-1]][`${strike_price}.0`][0]["delta"])
  //                       delta=`${a[b[b.length-1]][`${strike_price}.0`][0]["delta"]}`;
  //                       gamma=`${a[b[b.length-1]][`${strike_price}.0`][0]["gamma"]}`;
  //                       theta=`${a[b[b.length-1]][`${strike_price}.0`][0]["theta"]}`;
  //                       vega=`${a[b[b.length-1]][`${strike_price}.0`][0]["vega"]}`;
  //                       rho=`${a[b[b.length-1]][`${strike_price}.0`][0]["rho"]}`;

  //                       close_price = result[0].close_price;
  //                       var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${delta}","${gamma}","${theta}","${vega}","${rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
  //                       db.query(sql, (error, results) => {
  //                         if (error) {
  //                           console.log(error);
  //                           res.status(400).json({ status: error });
  //                         } else {
  //                           var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
  //                           db.query(sql, (error, results) => {
  //                             if (error) {
  //                               console.log(error);
  //                               res.status(400).json({ status: error });
  //                             } else {
  //                               // var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;

  //                               // db.query(sql, (error, results) => {
  //                               //   if (error) {
  //                               //     console.log(error);
  //                               //     res.status(400).json({ status: error });
  //                               //   } else {
  //                               //     var CoveredCall = {};
  //                               //     results[0].forEach((y) => {
  //                               //       CoveredCall[y.symbol] = [];
  //                               //     });
  //                               //     results[0].forEach((y) => {
  //                               //       CoveredCall[y.symbol].push(y);
  //                               //       console.log(CoveredCall);
  //                               //     });

  //                               //     var CashSecuredPut = {};
  //                               //     results[1].forEach((y) => {
  //                               //       CashSecuredPut[y.symbol] = [];
  //                               //     });
  //                               //     results[1].forEach((y) => {
  //                               //       CashSecuredPut[y.symbol].push(y);
  //                               //       console.log(CashSecuredPut);
  //                               //     });

  //                               //     var BearCallSpread = {};
  //                               //     results[2].forEach((y) => {
  //                               //       BearCallSpread[y.symbol] = [];
  //                               //     });
  //                               //     results[2].forEach((y) => {
  //                               //       BearCallSpread[y.symbol].push(y);
  //                               //       console.log(BearCallSpread);
  //                               //     });

  //                               //     var BullPutSpread = {};
  //                               //     results[3].forEach((y) => {
  //                               //       BullPutSpread[y.symbol] = [];
  //                               //     });
  //                               //     results[3].forEach((y) => {
  //                               //       BullPutSpread[y.symbol].push(y);
  //                               //       console.log(BullPutSpread);
  //                               //     });

  //                               //     var IronCondor = {};
  //                               //     results[4].forEach((y) => {
  //                               //       IronCondor[y.symbol] = [];
  //                               //     });
  //                               //     results[4].forEach((y) => {
  //                               //       IronCondor[y.symbol].push(y);
  //                               //       console.log(IronCondor);
  //                               //     });
  //                               //     res
  //                               //       .status(200)
  //                               //       .send({
  //                               //         CoveredCall: CoveredCall,
  //                               //       CashSecuredPut: CashSecuredPut,
  //                               //       BearCallSpread: BearCallSpread,
  //                               //       BullPutSpread: BullPutSpread,
  //                               //       IronCondor: IronCondor,
  //                               //       msg: "You have successfully added the trade"});
  //                               //   }
  //                               // });


  //                               var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                               // SELECT option_strategy.entry_date,option_strategy.symbol,option_strategy.trade,option_strategy.quantity,option_strategy.expiry_date,option_strategy.strike_price,option_strategy.trade_price,details.market_price,details.implied_volatility,details.delta_dollars,details.delta,details.gamma,details.theta,details.vega,option_strategy.fees,details.net_proceeds,details.currentpl FROM option_strategy INNER JOIN details ON details.strategy_id = option_strategy.strategy_id  WHERE option_strategy.user_id=${req.userData.id} AND option_strategy.strategy="Cash Secured Put";
                          
  //                                 db.query(sql, (error, results) => {
  //                                 if (error) {
  //                                   console.log(error);
  //                                   res.status(400).json({ status: error });
  //                                 } else {
  //                                   var cc = [];
  //                                   var CoveredCall = {};
  //                                   results[0].forEach((y) => {
  //                                     CoveredCall[y.symbol] = [];
  //                                   });
  //                                   console.log("1", CoveredCall);
  //                                   results[0].forEach((y) => {
  //                                     CoveredCall[y.symbol].push(y);
  //                                     // console.log(CoveredCall);
  //                                   });
  //                                   console.log("2", CoveredCall);
  //                                   var s = Object.keys(CoveredCall);
  //                                   var ob = { symbol: "", data: [] };
  //                                   s.forEach((z) => {
  //                                     console.log(CoveredCall[`${z}`].length);
  //                                     console.log("Z", z);
  //                                     if (CoveredCall[`${z}`].length == 1) {
  //                                       CoveredCall[`${z}`][0]["content"] = null;
  //                                       cc.push(CoveredCall[`${z}`][0]);
  //                                     } else {
  //                                       // console.log("dk",CoveredCall[`${z}`])
  //                                       ob.symbol = z;
  //                                       ob.data = CoveredCall[`${z}`];
  //                                       // console.log("ob",ob)
                          
  //                                       cc.push({ content: ob });
  //                                       ob = { symbol: "", data: [] };
  //                                     }
  //                                   });
                          
  //                                   console.log("cc ot", cc);
  //                                   //<------------------------------------------------------------------------------------------------------------>
  //                                   var cc1 = [];
  //                                   var CashSecuredPut = {};
  //                                   results[1].forEach((y) => {
  //                                     console.log("CSP", y.symbol);
  //                                     CashSecuredPut[y.symbol] = [];
  //                                   });
  //                                   results[1].forEach((y) => {
  //                                     CashSecuredPut[y.symbol].push(y);
  //                                   });
  //                                   console.log("CSP1", CashSecuredPut);
  //                                   var s1 = Object.keys(CashSecuredPut);
  //                                   console.log("s1", s1);
  //                                   var ob1 = { symbol: "", data: [] };
  //                                   s1.forEach((z) => {
  //                                     console.log(CashSecuredPut[`${z}`].length);
  //                                     if (CashSecuredPut[`${z}`].length == 1) {
  //                                       CashSecuredPut[`${z}`][0]["content"] = null;
  //                                       cc1.push(CashSecuredPut[`${z}`][0]);
  //                                       console.log("cc1", CashSecuredPut[`${z}`][0]);
  //                                     } else {
  //                                       // console.log("dk",CashSecuredPut[`${z}`])
  //                                       ob1.symbol = z;
  //                                       ob1.data = CashSecuredPut[`${z}`];
  //                                       console.log("ob", ob1);
                          
  //                                       cc1.push({ content: ob1 });
  //                                       ob1 = { symbol: "", data: [] };
  //                                     }
  //                                   });
  //                                   // console.log("OT OB1",ob1)
  //                                   // console.log("OT  CC1",cc1)
  //                                   //<------------------------------------------------------------------------------------------------------------>
  //                                   var cc2 = [];
  //                                   var BearCallSpread = {};
  //                                   results[2].forEach((y) => {
  //                                     BearCallSpread[y.symbol] = [];
  //                                   });
  //                                   results[2].forEach((y) => {
  //                                     BearCallSpread[y.symbol].push(y);
  //                                     // console.log(CoveredCall);
  //                                   });
  //                                   var s2 = Object.keys(BearCallSpread);
  //                                   var ob2 = { symbol: "", data: [] };
  //                                   s2.forEach((z) => {
  //                                     console.log(BearCallSpread[`${z}`].length);
  //                                     if (BearCallSpread[`${z}`].length == 1) {
  //                                       BearCallSpread[`${z}`][0]["content"] = null;
  //                                       cc2.push(BearCallSpread[`${z}`][0]);
  //                                     } else {
  //                                       // console.log("dk",CoveredCall[`${z}`])
  //                                       ob2.symbol = z;
  //                                       ob2.data = BearCallSpread[`${z}`];
  //                                       // console.log("ob",ob)
                          
  //                                       cc2.push({ content: ob2 });
  //                                       ob2 = { symbol: "", data: [] };
  //                                     }
  //                                   });
  //                                   //<------------------------------------------------------------------------------------------------------------>
  //                                   var cc3 = [];
  //                                   var BullPutSpread = {};
  //                                   results[3].forEach((y) => {
  //                                     BullPutSpread[y.symbol] = [];
  //                                   });
  //                                   results[3].forEach((y) => {
  //                                     BullPutSpread[y.symbol].push(y);
  //                                     // console.log(CoveredCall);
  //                                   });
  //                                   var s3 = Object.keys(BullPutSpread);
  //                                   var ob3 = { symbol: "", data: [] };
  //                                   s3.forEach((z) => {
  //                                     console.log(BullPutSpread[`${z}`].length);
  //                                     if (BullPutSpread[`${z}`].length == 1) {
  //                                       BullPutSpread[`${z}`][0]["content"] = null;
  //                                       cc3.push(BullPutSpread[`${z}`][0]);
  //                                     } else {
  //                                       // console.log("dk",CoveredCall[`${z}`])
  //                                       ob3.symbol = z;
  //                                       ob3.data = BullPutSpread[`${z}`];
  //                                       // console.log("ob",ob)
                          
  //                                       cc3.push({ content: ob3 });
  //                                       ob3 = { symbol: "", data: [] };
  //                                     }
  //                                   });
  //                                   //<------------------------------------------------------------------------------------------------------------>
  //                                   var cc4 = [];
  //                                   var IronCondor = {};
  //                                   results[4].forEach((y) => {
  //                                     IronCondor[y.symbol] = [];
  //                                   });
  //                                   results[4].forEach((y) => {
  //                                     IronCondor[y.symbol].push(y);
  //                                     // console.log(CoveredCall);
  //                                   });
  //                                   var s4 = Object.keys(IronCondor);
  //                                   var ob4 = { symbol: "", data: [] };
  //                                   s4.forEach((z) => {
  //                                     console.log(IronCondor[`${z}`].length);
  //                                     if (IronCondor[`${z}`].length == 1) {
  //                                       IronCondor[`${z}`][0]["content"] = null;
  //                                       cc4.push(IronCondor[`${z}`][0]);
  //                                     } else {
  //                                       // console.log("dk",CoveredCall[`${z}`])
  //                                       ob4.symbol = z;
  //                                       ob4.data = IronCondor[`${z}`];
  //                                       // console.log("ob",ob)
                          
  //                                       cc4.push({ content: ob4 });
  //                                       ob4 = { symbol: "", data: [] };
  //                                     }
  //                                   });
                          
  //                                   // console.log("cc",cc)
                          
  //                                   // var BearCallSpread = {};
  //                                   // results[2].forEach((y) => {
  //                                   //   BearCallSpread[y.symbol] = [];
  //                                   // });
  //                                   // results[2].forEach((y) => {
  //                                   //   BearCallSpread[y.symbol].push(y);
  //                                   //   console.log(BearCallSpread);
  //                                   // });
                          
  //                                   // var BullPutSpread = {};
  //                                   // results[3].forEach((y) => {
  //                                   //   BullPutSpread[y.symbol] = [];
  //                                   // });
  //                                   // results[3].forEach((y) => {
  //                                   //   BullPutSpread[y.symbol].push(y);
  //                                   //   console.log(BullPutSpread);
  //                                   // });
                          
  //                                   // var IronCondor = {};
  //                                   // results[4].forEach((y) => {
  //                                   //   IronCondor[y.symbol] = [];
  //                                   // });
  //                                   // results[4].forEach((y) => {
  //                                   //   IronCondor[y.symbol].push(y);
  //                                   //   console.log(IronCondor);
  //                                   // });
                          
  //                                   res
  //                                     .status(200)
  //                                     .send({
  //                                       CoveredCall: cc,
  //                                       CashSecuredPut: cc1,
  //                                       BearCallSpread: cc2,
  //                                       BullPutSpread: cc3,
  //                                       IronCondor: cc4,
  //                                       msg: "You have successfully added the trade"
  //                                     });
  //                                 }
  //                               });



  //                             }
  //                           });
  //                         }
  //                       });

  //                     })
  //                 }catch(err){console.log(err)}
  //               }catch(err){console.log(err)}

  //             }
  //           });
  //         } else {
  //           const options = {
  //             method: "GET",
  //             url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}`,
  //             headers: { Accept: "application/json" },
  //           };
  //           axios.request(options).then(function (response1) {

  //             try{
  //               const options = {
  //                 method: "GET",
  //                 url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${ticker}&strike=${strike_price}&fromDate=${entry_date}&toDate=${expiry_date}`,
  //               };
  //               try{
  //                 axios.request(options).then(function (response) {
  //                   console.log(response)
  //                   var a= response.data.callExpDateMap

  //                   var b=Object.keys(a)

  //                   delta=`${a[b[b.length-1]][`${strike_price}.0`][0]["delta"]}`;
  //                   gamma=`${a[b[b.length-1]][`${strike_price}.0`][0]["gamma"]}`;
  //                   theta=`${a[b[b.length-1]][`${strike_price}.0`][0]["theta"]}`;
  //                   vega=`${a[b[b.length-1]][`${strike_price}.0`][0]["vega"]}`;
  //                   rho=`${a[b[b.length-1]][`${strike_price}.0`][0]["rho"]}`;
  //                     close_price = response1["data"][`${ticker}`]["closePrice"];
  //             var sql = `INSERT INTO stock_price (ticker,close_price) VALUES ("${ticker}","${close_price}")`;
  //             db.query(sql, function (err, result) {
  //               if (err) {
  //                 console.log("Duplicate Entry");
  //               } else {
  //                 console.log("Added in stock_price");
  //               }
  //             });

  //             var sql = `INSERT INTO option_strategy (user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,status) VALUES ("${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}","${close_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${delta}","${gamma}","${theta}","${vega}","${rho}","${req.body.net_proceeds}","${req.body.currentpl}",0)`;
  //             db.query(sql, (error, results) => {
  //               if (error) {
  //                 console.log(error);
  //                 res.status(400).json({ status: error });
  //               } else {
  //                 var sql = `INSERT INTO details (leg_id,user_id,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${results.insertId}","${req.userData.id}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}")`;
  //                 db.query(sql, (error, results) => {
  //                   if (error) {
  //                     console.log(error);
  //                     res.status(400).json({ status: error });
  //                   } else {
                      
  //                     // var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                     // db.query(sql, (error, results) => {
  //                     //   if (error) {
  //                     //     console.log(error);
  //                     //     res.status(400).json({ status: error });
  //                     //   } else {
  //                     //     var CoveredCall = {};
  //                     //     results[0].forEach((y) => {
  //                     //       CoveredCall[y.symbol] = [];
  //                     //     });
  //                     //     results[0].forEach((y) => {
  //                     //       CoveredCall[y.symbol].push(y);
  //                     //       console.log(CoveredCall);
  //                     //     });

  //                     //     var CashSecuredPut = {};
  //                     //     results[1].forEach((y) => {
  //                     //       CashSecuredPut[y.symbol] = [];
  //                     //     });
  //                     //     results[1].forEach((y) => {
  //                     //       CashSecuredPut[y.symbol].push(y);
  //                     //       console.log(CashSecuredPut);
  //                     //     });

  //                     //     var BearCallSpread = {};
  //                     //     results[2].forEach((y) => {
  //                     //       BearCallSpread[y.symbol] = [];
  //                     //     });
  //                     //     results[2].forEach((y) => {
  //                     //       BearCallSpread[y.symbol].push(y);
  //                     //       console.log(BearCallSpread);
  //                     //     });

  //                     //     var BullPutSpread = {};
  //                     //     results[3].forEach((y) => {
  //                     //       BullPutSpread[y.symbol] = [];
  //                     //     });
  //                     //     results[3].forEach((y) => {
  //                     //       BullPutSpread[y.symbol].push(y);
  //                     //       console.log(BullPutSpread);
  //                     //     });

  //                     //     var IronCondor = {};
  //                     //     results[4].forEach((y) => {
  //                     //       IronCondor[y.symbol] = [];
  //                     //     });
  //                     //     results[4].forEach((y) => {
  //                     //       IronCondor[y.symbol].push(y);
  //                     //       console.log(IronCondor);
  //                     //     });
  //                     //     res
  //                     //       .status(200)
  //                     //       .send({
  //                     //         CoveredCall: CoveredCall,
  //                     //         CashSecuredPut: CashSecuredPut,
  //                     //         BearCallSpread: BearCallSpread,
  //                     //         BullPutSpread: BullPutSpread,
  //                     //         IronCondor: IronCondor,
  //                     //         msg: "You have successfully added the trade"
  //                     //       });
  //                     //   }
  //                     // });
  //                     var sql = `SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Covered Call"  AND status=0 ORDER BY entry_date DESC ;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Cash Secured Put" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bear Call Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy  INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Bull Put Spread" AND status=0 ORDER BY entry_date DESC;SELECT option_strategy.*, stock_price.close_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=${req.userData.id} AND strategy="Iron Condor" AND status=0 ORDER BY entry_date DESC`;
  //                     // SELECT option_strategy.entry_date,option_strategy.symbol,option_strategy.trade,option_strategy.quantity,option_strategy.expiry_date,option_strategy.strike_price,option_strategy.trade_price,details.market_price,details.implied_volatility,details.delta_dollars,details.delta,details.gamma,details.theta,details.vega,option_strategy.fees,details.net_proceeds,details.currentpl FROM option_strategy INNER JOIN details ON details.strategy_id = option_strategy.strategy_id  WHERE option_strategy.user_id=${req.userData.id} AND option_strategy.strategy="Cash Secured Put";
                
  //                     db.query(sql, (error, results) => {
  //                       if (error) {
  //                         console.log(error);
  //                         res.status(400).json({ status: error });
  //                       } else {
  //                         var cc = [];
  //                         var CoveredCall = {};
  //                         results[0].forEach((y) => {
  //                           CoveredCall[y.symbol] = [];
  //                         });
  //                         console.log("1", CoveredCall);
  //                         results[0].forEach((y) => {
  //                           CoveredCall[y.symbol].push(y);
  //                           // console.log(CoveredCall);
  //                         });
  //                         console.log("2", CoveredCall);
  //                         var s = Object.keys(CoveredCall);
  //                         var ob = { symbol: "", data: [] };
  //                         s.forEach((z) => {
  //                           console.log(CoveredCall[`${z}`].length);
  //                           console.log("Z", z);
  //                           if (CoveredCall[`${z}`].length == 1) {
  //                             CoveredCall[`${z}`][0]["content"] = null;
  //                             cc.push(CoveredCall[`${z}`][0]);
  //                           } else {
  //                             // console.log("dk",CoveredCall[`${z}`])
  //                             ob.symbol = z;
  //                             ob.data = CoveredCall[`${z}`];
  //                             // console.log("ob",ob)
                
  //                             cc.push({ content: ob });
  //                             ob = { symbol: "", data: [] };
  //                           }
  //                         });
                
  //                         console.log("cc ot", cc);
  //                         //<------------------------------------------------------------------------------------------------------------>
  //                         var cc1 = [];
  //                         var CashSecuredPut = {};
  //                         results[1].forEach((y) => {
  //                           console.log("CSP", y.symbol);
  //                           CashSecuredPut[y.symbol] = [];
  //                         });
  //                         results[1].forEach((y) => {
  //                           CashSecuredPut[y.symbol].push(y);
  //                         });
  //                         console.log("CSP1", CashSecuredPut);
  //                         var s1 = Object.keys(CashSecuredPut);
  //                         console.log("s1", s1);
  //                         var ob1 = { symbol: "", data: [] };
  //                         s1.forEach((z) => {
  //                           console.log(CashSecuredPut[`${z}`].length);
  //                           if (CashSecuredPut[`${z}`].length == 1) {
  //                             CashSecuredPut[`${z}`][0]["content"] = null;
  //                             cc1.push(CashSecuredPut[`${z}`][0]);
  //                             console.log("cc1", CashSecuredPut[`${z}`][0]);
  //                           } else {
  //                             // console.log("dk",CashSecuredPut[`${z}`])
  //                             ob1.symbol = z;
  //                             ob1.data = CashSecuredPut[`${z}`];
  //                             console.log("ob", ob1);
                
  //                             cc1.push({ content: ob1 });
  //                             ob1 = { symbol: "", data: [] };
  //                           }
  //                         });
  //                         // console.log("OT OB1",ob1)
  //                         // console.log("OT  CC1",cc1)
  //                         //<------------------------------------------------------------------------------------------------------------>
  //                         var cc2 = [];
  //                         var BearCallSpread = {};
  //                         results[2].forEach((y) => {
  //                           BearCallSpread[y.symbol] = [];
  //                         });
  //                         results[2].forEach((y) => {
  //                           BearCallSpread[y.symbol].push(y);
  //                           // console.log(CoveredCall);
  //                         });
  //                         var s2 = Object.keys(BearCallSpread);
  //                         var ob2 = { symbol: "", data: [] };
  //                         s2.forEach((z) => {
  //                           console.log(BearCallSpread[`${z}`].length);
  //                           if (BearCallSpread[`${z}`].length == 1) {
  //                             BearCallSpread[`${z}`][0]["content"] = null;
  //                             cc2.push(BearCallSpread[`${z}`][0]);
  //                           } else {
  //                             // console.log("dk",CoveredCall[`${z}`])
  //                             ob2.symbol = z;
  //                             ob2.data = BearCallSpread[`${z}`];
  //                             // console.log("ob",ob)
                
  //                             cc2.push({ content: ob2 });
  //                             ob2 = { symbol: "", data: [] };
  //                           }
  //                         });
  //                         //<------------------------------------------------------------------------------------------------------------>
  //                         var cc3 = [];
  //                         var BullPutSpread = {};
  //                         results[3].forEach((y) => {
  //                           BullPutSpread[y.symbol] = [];
  //                         });
  //                         results[3].forEach((y) => {
  //                           BullPutSpread[y.symbol].push(y);
  //                           // console.log(CoveredCall);
  //                         });
  //                         var s3 = Object.keys(BullPutSpread);
  //                         var ob3 = { symbol: "", data: [] };
  //                         s3.forEach((z) => {
  //                           console.log(BullPutSpread[`${z}`].length);
  //                           if (BullPutSpread[`${z}`].length == 1) {
  //                             BullPutSpread[`${z}`][0]["content"] = null;
  //                             cc3.push(BullPutSpread[`${z}`][0]);
  //                           } else {
  //                             // console.log("dk",CoveredCall[`${z}`])
  //                             ob3.symbol = z;
  //                             ob3.data = BullPutSpread[`${z}`];
  //                             // console.log("ob",ob)
                
  //                             cc3.push({ content: ob3 });
  //                             ob3 = { symbol: "", data: [] };
  //                           }
  //                         });
  //                         //<------------------------------------------------------------------------------------------------------------>
  //                         var cc4 = [];
  //                         var IronCondor = {};
  //                         results[4].forEach((y) => {
  //                           IronCondor[y.symbol] = [];
  //                         });
  //                         results[4].forEach((y) => {
  //                           IronCondor[y.symbol].push(y);
  //                           // console.log(CoveredCall);
  //                         });
  //                         var s4 = Object.keys(IronCondor);
  //                         var ob4 = { symbol: "", data: [] };
  //                         s4.forEach((z) => {
  //                           console.log(IronCondor[`${z}`].length);
  //                           if (IronCondor[`${z}`].length == 1) {
  //                             IronCondor[`${z}`][0]["content"] = null;
  //                             cc4.push(IronCondor[`${z}`][0]);
  //                           } else {
  //                             // console.log("dk",CoveredCall[`${z}`])
  //                             ob4.symbol = z;
  //                             ob4.data = IronCondor[`${z}`];
  //                             // console.log("ob",ob)
                
  //                             cc4.push({ content: ob4 });
  //                             ob4 = { symbol: "", data: [] };
  //                           }
  //                         });
                
  //                         // console.log("cc",cc)
                
  //                         // var BearCallSpread = {};
  //                         // results[2].forEach((y) => {
  //                         //   BearCallSpread[y.symbol] = [];
  //                         // });
  //                         // results[2].forEach((y) => {
  //                         //   BearCallSpread[y.symbol].push(y);
  //                         //   console.log(BearCallSpread);
  //                         // });
                
  //                         // var BullPutSpread = {};
  //                         // results[3].forEach((y) => {
  //                         //   BullPutSpread[y.symbol] = [];
  //                         // });
  //                         // results[3].forEach((y) => {
  //                         //   BullPutSpread[y.symbol].push(y);
  //                         //   console.log(BullPutSpread);
  //                         // });
                
  //                         // var IronCondor = {};
  //                         // results[4].forEach((y) => {
  //                         //   IronCondor[y.symbol] = [];
  //                         // });
  //                         // results[4].forEach((y) => {
  //                         //   IronCondor[y.symbol].push(y);
  //                         //   console.log(IronCondor);
  //                         // });
                
  //                         res
  //                           .status(200)
  //                           .send({
  //                             CoveredCall: cc,
  //                             CashSecuredPut: cc1,
  //                             BearCallSpread: cc2,
  //                             BullPutSpread: cc3,
  //                             IronCondor: cc4,
  //                             msg: "You have successfully added the trade"
  //                           });
  //                       }
  //                     });
  //                   }
  //                 });
  //               }
  //             });

  //                   })
  //               }catch(e){console.log(e)}
  //             }catch(err){console.log(err)}

  //           });
  //         }
  //       });
  //     } else {
  //       res.status(400).json({ msg: "please enter all fields" });
  //     }
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // },

  test: async (req, res) => {
    try {
      data = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [],
      };
      var sql = `SELECT strategy,EXTRACT(MONTH FROM close_date) as month,SUM(overallpl) as pl FROM option_strategy WHERE user_id=${req.userData.id} AND status=0 GROUP BY strategy,EXTRACT(MONTH FROM close_date);`;
      db.query(sql, (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).json({ status: error });
        } else {
          //  res.status(200).send(results);
          console.log(results[0]);
          results.forEach((item) => {
            console.log("a", item);
            data[item.month].push(item);
          });
          console.log(data);
          res.status(200).send(data);
        }
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
};

//

// SELECT option_strategy.trade,stock_price.market_price FROM option_strategy INNER JOIN stock_price ON stock_price.ticker = option_strategy.symbol WHERE user_id=6 AND strategy="Cash Secured Put"  AND status=1;

//   addstrategy: async (req , res) => {
//     try {
// let strategy_id = uuid();
// let detail_id = uuid();
// var sql = `INSERT INTO option_strategy (strategy_id,user_id,symbol,strategy,entry_date,expiry_date,trade,trade_price,strike_price,premium,quantity,fees,status) VALUES ("${strategy_id}","${req.userData.id}","${req.body.symbol}","${req.body.strategy}","${req.body.entry_date}","${req.body.expiry_date}","${req.body.trade}","${req.body.trade_price}","${req.body.strike_price}","${req.body.premium}","${req.body.quantity}","${req.body.fees}",1);INSERT INTO details (detail_id,strategy_id,user_id,market_price,implied_volatility,delta_dollars,delta,gamma,theta,vega,rho,net_proceeds,currentpl,days_left,credit_received,breakeven_price,return_expired,return_anum,maxium_loss,maximum_profit) VALUES ("${detail_id}","${strategy_id}","${req.userData.id}","${req.body.market_price}","${req.body.implied_volatility}","${req.body.delta_dollars}","${req.body.delta}","${req.body.gamma}","${req.body.theta}","${req.body.vega}","${req.body.rho}","${req.body.net_proceeds}","${req.body.currentpl}","${req.body.days_left}","${req.body.credit_received}","${req.body.breakeven_price}","${req.body.return_expired}","${req.body.return_anum}","${req.body.maxium_loss}","${req.body.maximum_profit}") `;
// db.query(sql, (error, results) => {
//   if (error) {
//     console.log(error);
//     res.status(400).json({ status:error });
//   } else {
//     res.status(200).send("Strategy Added");
//   }
// });
//     } catch (error) {
//         res.status(400).send(error)
//     }
// },





