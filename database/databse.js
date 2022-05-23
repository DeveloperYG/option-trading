const express = require('express');
var mysql = require('mysql');
var cors = require('cors');
const app = express();
const axios = require('axios');
app.use(cors());
app.use(express.json());
var bcrypt=require('bcryptjs');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nftweb",
    multipleStatements: true,
  });

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
// var sql = "CREATE TABLE users ( id int(11) NOT NULL AUTO_INCREMENT,full_name varchar(255)  NOT NULL,user_name varchar(255)  NOT NULL,email varchar(255)  NOT NULL,password varchar(255)  NOT NULL,confirm_password varchar(255)  NOT NULL,PRIMARY KEY (id),UNIQUE KEY email (email),token varchar(255))";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE stocklist ( id int(11) NOT NULL AUTO_INCREMENT,symbol varchar(255)  NOT NULL,name varchar(255) NOT NULL,sector varchar(255) NOT NULL,industry varchar(255) NOT NULL ,PRIMARY KEY (id))";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE portfolio ( id int(11) NOT NULL AUTO_INCREMENT,ticker varchar(255)  NOT NULL,quantity INT,buy_price FLOAT,buy_cost FLOAT,market_cost FLOAT,broker  varchar(255),commission FLOAT,pl_ytd FLOAT,pl_ytd_pr FLOAT,PRIMARY KEY (id),user_id INT)";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE stock_price ( id int(11) NOT NULL AUTO_INCREMENT,ticker varchar(255)  NOT NULL UNIQUE,description varchar(450),open_price FLOAT,high_price FLOAT,low_price FLOAT,close_price FLOAT,PRIMARY KEY (id))";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE nft_stat5 (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) UNIQUE,logo VARCHAR(255),slug VARCHAR(255) UNIQUE,background_image VARCHAR(255),contract VARCHAR(600),discord_url VARCHAR(600),external_url VARCHAR(600),twitter_username VARCHAR(600),instagram_username VARCHAR(600),one_day_volume FLOAT,one_day_change FLOAT,one_day_sales INT,one_day_average_price FLOAT,seven_day_volume FLOAT,seven_day_change FLOAT,seven_day_sales INT,seven_day_average_price FLOAT,thirty_day_volume FLOAT,thirty_day_change FLOAT,thirty_day_sales INT,thirty_day_average_price DOUBLE,total_volume DOUBLE,total_sales INT,total_supply INT,count INT,num_owners INT,average_price FLOAT,num_reports INT,market_cap DOUBLE,floor_price FLOAT)";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE nft_collections (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) UNIQUE,slug VARCHAR(255) ,link VARCHAR(255),openseaLink VARCHAR(255) UNIQUE,logo VARCHAR(255),blockchain VARCHAR(255),marketCap DOUBLE)";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log(" nft_collection Table created");
//   });

// var sql = `SELECT id FROM nft_collections3 LIMIT 1`;
//       con.query(sql, function (err, result) {
//         if (err) throw err;
//         console.log(result[0].id);
//       });

// var sql = "CREATE TABLE admin ( id int(11) NOT NULL AUTO_INCREMENT,user_name varchar(255)  NOT NULL,email varchar(255)  NOT NULL,password varchar(255)  NOT NULL,PRIMARY KEY (id),UNIQUE KEY email (email),token varchar(255))";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });
// hashed_password=bcrypt.hashSync("admin@op100", 8)
// var sql = `INSERT INTO admin (user_name,email,password) VALUES ("admin","admin123@gmail.com","${hashed_password}")`;
//                         con.query(sql, function (err, data) {
//                           if (err) throw err;

//                         })
// var sql = "ALTER TABLE nft_collections3 RENAME TO nft_collections;";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Changed");
//           });

// var sql = 'SELECT EXISTS(SELECT * FROM stock_price WHERE ticker="AAPL")';
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log(result);
//           });

          // var sql = "CREATE TABLE admin ( id int(11) NOT NULL AUTO_INCREMENT,user_name varchar(255)  NOT NULL,email varchar(255)  NOT NULL,password varchar(255)  NOT NULL,PRIMARY KEY (id),UNIQUE KEY email (email),token varchar(255))";
          //           con.query(sql, function (err, result) {
          //             if (err) throw err;
          //             console.log("Table created");
          //           });

// var sql = "CREATE TABLE adminblogs ( id int(11) NOT NULL AUTO_INCREMENT,blog_id varchar(255),blog_title varchar(255),blog_content LONGTEXT,blog_image varchar(255),blog_link varchar(255),PRIMARY KEY (id))";
//           con.query(sql, function (err, result) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE option_strategy ( leg_id int(11) NOT NULL AUTO_INCREMENT,user_id int(11),symbol varchar(255),strategy varchar(255),entry_date date,expiry_date date,trade varchar(255),trade_price float,strike_price float,premium float,quantity int(11),fees float,market_price float,implied_volatility float,delta_dollars float,delta float,gamma float,theta float,vega float,rho float,net_proceeds float,currentpl float,status boolean,close_premium float,close_fee float,overallpl float,security varchar(300),close_date date,month int,trade_duration int,realised_pl float,PRIMARY KEY (leg_id))";
//           con.query(sql, function (err) {
//             if (err) throw err;
//             console.log("Table created");
//           });

// var sql = "CREATE TABLE details ( detail_id int(11) NOT NULL AUTO_INCREMENT,leg_id int(11) ,user_id int(11),days_left int(11),credit_received float,breakeven_price float,return_expired float,return_anum float,maxium_loss float,maximum_profit float,PRIMARY KEY (detail_id))";
//           con.query(sql, function (err) {
//             if (err) throw err;
//             console.log("Table created");
//           });
// var sql = "CREATE TABLE notes ( note_id int(11) NOT NULL AUTO_INCREMENT,leg_id int(11) ,user_id int(11),cover_image varchar(255),notes longtext,PRIMARY KEY (note_id))";
//           con.query(sql, function (err) {
//             if (err) throw err;
//             console.log("Table created");
//           });


    // var sql = "CREATE TABLE cryptoblog (id INT AUTO_INCREMENT PRIMARY KEY, feed_title VARCHAR(255) ,feed_link VARCHAR(255),feed_image_url VARCHAR(255),item_title VARCHAR(255),item_categories VARCHAR(255) ,item_link VARCHAR(255),item_published DATETIME UNIQUE,item_image_url VARCHAR(255))";
    //       con.query(sql, function (err, result) {
    //         if (err) throw err;
    //         console.log("Blog Table created");
    //       });

          //  var sql = "CREATE TABLE cryptorigin (id INT AUTO_INCREMENT PRIMARY KEY, feed_title VARCHAR(255) ,feed_link VARCHAR(255),rss_link VARCHAR(255),feed_description LONGTEXT,feed_image_url VARCHAR(255) )";
          //       con.query(sql, function (err, result) {
          //         if (err) throw err;
          //         console.log(" origin Table created");
          //       });

          //  var sql = "CREATE TABLE assets5 (id INT AUTO_INCREMENT PRIMARY KEY, collection_name LONGTEXT,collection_image LONGTEXT,asset_name LONGTEXT,image_url LONGTEXT,owner LONGTEXT,price FLOAT,trait_type LONGTEXT,trait_value LONGTEXT,trait_count LONGTEXT,rarity_percentage LONGTEXT,rarity_scores LONGTEXT ,rarity FLOAT)";
          //       con.query(sql, function (err, result) {
          //         if (err) throw err;
          //         console.log(" assets Table created");
          //       });

          
        const options1 = {
          method: 'GET',
          url: `https://api.aliens.com/top-nft-collections?since=24h`
        };
        axios.request(options1).then(function (response) {
          
          response.data.top_collections.forEach(a=>{
            // console.log(a.collection.name);
            // console.log(a.collection.slug);
            // console.log(a.collection.image_url);
            // console.log(a.opensea_url);
            // console.log(a.collection.stats.market_cap);
              var url=a.opensea_url;
              var arr= url.split("/");
              var slug1=arr[4];
              
            var sql = `INSERT IGNORE INTO nft_collections (name,slug,link,openseaLink,logo,marketCap) VALUES ("${a.collection.name}","${slug1}","${a.opensea_url}","${a.opensea_url}","${a.collection.image_url}","${a.collection.stats.market_cap}")`;
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(" Data added1.");
            });
            
            
          });
          
        }).catch(function (error) {
          console.error(error);
        });