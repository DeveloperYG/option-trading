const express = require("express");
const axios = require("axios");
var mysql = require("mysql");
const app = express();
app.use(express.json());
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "option_trading",
  multipleStatements: true,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
app.get("/Quotes", (req, res) => {
  const symbol = req.body.symbol;

  const options = {
    method: "GET",
    url: `        https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=CRSP`,
    headers: { Accept: "application/json" },
  };
  //https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=MRNA
  axios
    .request(options)
    .then(function (response) {
      res.send(response.data.putExpDateMap);
    })
    .catch(function (error) {
      console.error(error);
    });
});
app.post("/history", (req, res) => {
  const symbol = req.body.symbol;

  const options = {
    method: "GET",
    url: `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&periodType=day&period=1&frequencyType=minute&frequency=1`,

    headers: { Accept: "application/json" },
  };

  axios
    .request(options)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});
app.post("/movers", (req, res) => {
  const symbol = req.body.symbol;

  const options = {
    method: "GET",
    url: `https://api.tdameritrade.com/v1/marketdata/$SPX.X/movers?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&direction=up&change=value`,

    headers: { Accept: "application/json" },
  };

  axios
    .request(options)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.post("/chart", (req, res) => {
  var options = {
    method: "GET",
    url: "https://yh-finance.p.rapidapi.com/market/get-charts",
    params: { symbol: "TSLA", interval: "5m", range: "1d", region: "US" },
    headers: {
      "x-rapidapi-host": "yh-finance.p.rapidapi.com",
      "x-rapidapi-key": "53713bb332msh27263e20f8e8fb9p1537b6jsn6b97f025ad1f",
    },
  };

  axios
    .request(options)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});
app.post("/addticker", (req, res) => {
  var ticker = req.body.ticker;
  var buy_price = req.body.buy_price;
  var quantity = req.body.quantity;
  var buy_cost = buy_price * quantity;
  var broker = req.body.broker;
  var user_id = req.body.user_id;

  var sql = `INSERT INTO portfolio (ticker,quantity,buy_price,buy_cost,broker,user_id) VALUES ("${ticker}","${quantity}","${buy_price}","${buy_cost}","${broker}","${user_id}")`;
  con.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).json({ status: "error" });
    } else {
      res.status(200).send("Ticker Added");
    }
  });
  var sql = `INSERT INTO stock_price (ticker) VALUES ("${ticker}")`;
  con.query(sql, function (err, result) {
    if (err) {
      console.log("Duplicate Entry");
    } else {
      console.log("Added in stock_price");
    }
  });
});

// setInterval(()=>{
//   var sql = `SELECT * FROM stock_price `;
//   con.query(sql, (error, results) => {

//     if (error) {

//       console.log(error);
//       res.status(500).json({ status: "error" });
//     }
//     else {
//       results.forEach(async (a)=>{
//         const options = {
//           method: 'GET',
//           url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${a.ticker}`,
//           headers: {Accept: 'application/json'}
//         };
//         axios.request(options).then(function (response) {
//           description= response['data'][`${a.ticker}`]['description'];
//           close_price= response['data'][`${a.ticker}`]['closePrice'];
//           open_price= response['data'][`${a.ticker}`]['openPrice'];
//           high_price= response['data'][`${a.ticker}`]['highPrice'];
//           low_price= response['data'][`${a.ticker}`]['lowPrice'];
//           var sql = `UPDATE stock_price SET description = "${description}",open_price =${open_price},high_price =${high_price},low_price=${low_price}, close_price = ${close_price}  WHERE ticker = "${a.ticker}"`;
//            con.query(sql, function (err, result) {
//             if (err) {
//               console.log(err);
//               res.status(500).json({ status: "error" });
//             }
//             else {
//               console.log("Updated")
//             }
//     });
//         });
//       });
//     }
//   });

// },60000)
app.get("/hi", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api.opensea.io/api/v1/collection/azuki",
  };

  axios
    .request(options)
    .then(function (response) {
      res
        .status(200)
        .send(
          `${response.data["collection"]["primary_asset_contracts"][0]["address"]}`
        );
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.get("/world", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=IBM&strike=180&fromDate=2022-04-23&toDate=2022-05-21",
  };

  axios.request(options).then(function (response) {
    var a= response.data.callExpDateMap
    // console.log("l",a.length)
    // var b=[]
    var b=Object.keys(a)
    console.log(b)
    console.log(Object.keys(a))
    var jresult={
      delta:`${a[b[b.length-1]]["180.0"][0]["delta"]}`,
      gamma:`${a[b[b.length-1]]["180.0"][0]["gamma"]}`,
      theta:`${a[b[b.length-1]]["180.0"][0]["theta"]}`,
      vega:`${a[b[b.length-1]]["180.0"][0]["vega"]}`,
      rho:`${a[b[b.length-1]]["180.0"][0]["rho"]}`

    }
    res.send(jresult)
  //  a.forEach((e) => 
  //   {
      
  //     res.status(200).send(e);
  //   })
    //  res.send([response.data.callExpDateMap])
    
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.get("/details",(req, res)=>{
  strike_price=17
  
  try{
    options = {
      method: "GET",
      url: `https://api.tdameritrade.com/v1/marketdata/chains?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=AAPL&strike=${strike_price}&fromDate=2022-05-01&toDate=2022-05-28`,
  };
  }catch(error){
    res.status(500).json({ status: "error" })
  }
try{
  axios.request(options).then(function (response) {

  var underlying_price = response.data.underlyingPrice
  var a= response.data.callExpDateMap
  var c= response.data.putExpDateMap
  var b=Object.keys(a)
  var d=Object.keys(c)
  
  try{delta=a[b[b.length-1]][`${strike_price}.0`][0]["delta"];
  res.send(`${delta}`)}catch(error){res.status(500).json({ status: "error" })}
  
}
)}catch(error){res.status(500).json({ status: "error" })}



})

app.listen(5000, () => {
  console.log("Server is running on 5000");
});

// app.get('/stocks',verify,(req,res)=>{
//   let market_price;
//   let jsonResult;
//   let objectArray = []
//   var sql = `SELECT * FROM portfolio WHERE user_id=${req.userData.id}`;

//   con.query(sql, (error, results) => {

//     if (error) {

//       console.log(error);
//       res.status(500).json({ status: "error" });
//     }
//     else {
//       results.forEach(async (a)=>{
//         // console.log(a.ticker)
//         const options = {
//             method: 'GET',
//             url: `https://api.tdameritrade.com/v1/marketdata/quotes?apikey=M9JTBN833NULJJPNJIWAU2TLC5K0GC9Z&symbol=${a.ticker}`,

//             headers: {Accept: 'application/json'}
//           };
//           axios.request(options).then(function (response) {
//             market_price= response['data'][`${a.ticker}`]['closePrice'];
//             market_cost=market_price*a.quantity;
//             var sql = `UPDATE portfolio SET market_price = ${market_price}, market_cost = ${market_cost } WHERE id = ${a.id}`;
//            con.query(sql, function (err, result) {
//            if (err) throw err;
//       console.log(" updated.");
//     });

//           }).catch(function (error) {
//             console.error(error);
//           });
//      })

//     }
//   });
//   var sql = `SELECT * FROM portfolio WHERE user_id=${req.userData.id}`;
//   con.query(sql, (err, results) => {
//     if (err) throw err;
//     res.send(results);
//   });
// })
// SELECT Orders.OrderID, Customers.CustomerName
// FROM Orders
// INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID;
