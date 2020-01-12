/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const axios = require('axios');
const mongoose = require('mongoose');

const stockLikesSchema = new mongoose.Schema({
  ticker: String,
  likes: { type: Number, default: 0 },
  ip: { type: [String], default: [] }
});

const StockLikes = mongoose.model('Stock Likes', stockLikesSchema);

const getStock = async (req, ticker) => {
  ticker = ticker.toUpperCase();

  const myIp = req.ip;
  const stock = await axios.get(
    `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${process.env.STOCK_API}`
  );
  const recentPrice = Object.values(stock.data['Time Series (5min)']);
  const recentPrices = Object.values(recentPrice[0]);
  const recentPricesToNum = recentPrices.map(price => parseFloat(price));
  const recentPricesAverage =
    (recentPricesToNum.reduce((acc, cur) => acc + cur) - recentPricesToNum[4]) /
    4;

  let myStock = await StockLikes.find({ ticker });

  myStock.length < 1
    ? (myStock = new StockLikes({ ticker }))
    : (myStock = myStock[0]);

  if (req.query.like && myStock.ip.filter(item => item === myIp).length < 1) {
    myStock.likes++;
    myStock.ip.push(myIp);
  }

  myStock.save();

  return {
    stock: ticker.toUpperCase(),
    price: recentPricesAverage.toFixed(2),
    likes: myStock.likes
  };
};

module.exports = app => {
  app.route('/api/stock-prices').get(async (req, res) => {
    const ticker = req.query.stock;

    try {
      if (typeof ticker === 'string') {
        const stock = await getStock(req, ticker);

        res.status(200).json({ stockData: stock });
      } else {
        const stock1 = await getStock(req, ticker[0]);
        const stock2 = await getStock(req, ticker[1]);

        if (req.query.likes) {
          stock1.rel_likes = stock1.likes - stock2.likes;
          stock2.rel_likes = stock2.likes - stock1.likes;

          delete stock1.likes;
          delete stock2.likes;
        }

        const result = { stockData: [stock1, stock2] };

        console.log('2 stocks requested!');
        res.status(200).json(result);
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json('too much requests');
    }
  });
};