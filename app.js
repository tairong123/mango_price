var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sqlite3 = require('sqlite3').verbose();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 打開 SQLite 資料庫
var db = new sqlite3.Database(path.join(__dirname, 'db', 'sqlite.db'), (err) => {
    if (err) {
        console.error('資料庫連接失敗:', err.message);
    } else {
        console.log('已成功連接到 SQLite3 資料庫。');
    }
});

// 定義查詢路由
app.get('/api/query', function(req, res, next) {
    var year = parseInt(req.query.year, 10);
    var month = parseInt(req.query.month, 10);

    if (isNaN(year) || isNaN(month)) {
        return res.json({ error: '請輸入有效的年份和月份。' });
    }

    db.get('SELECT price, quantity FROM mangodata WHERE year = ? AND month = ?', [year, month], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.json({ error: '未找到該日期的數據。' });
        }
        res.json(row);
    });
});

module.exports = app;
