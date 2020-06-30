var http = require("http")
var express = require("express")
var app = express()
const PORT = 3000;
var hbs = require('express-handlebars')
var path = require("path")
var basicAuth = require('basic-auth')
var Datastore = require('nedb')
const bodyParser = require("body-parser");
var url = require('url');
var formidable = require('formidable');

session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var sklep = new Datastore({
    filename: 'baza.db',
    autoload: true
});

wsk = true;
app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.get("/", function (req, res) {
    res.render('index2.hbs');

});

app.get("/item/:tagId", function (req, res) {
    id = req.params.tagId;
    sklep.find({ _id: id }, function (err, docs) {
        res.render('index3.hbs', {
            dane: docs,
            stat: req.session.admin,
        });
    });
});

app.get("/handleform", function (req, res) {
    nazwa = req.query.txt;
    stat = req.session.admin
    sklep.find({
        $or: [{ Nazwa: nazwa }, { Marka: nazwa }]
    }).skip(parseInt(req.query.ilosc) * (parseInt(req.query.strona) - 1) || 0).limit(parseInt(req.query.ilosc) || 5).exec(function (err, docs) {
        res.render('index.hbs', {
            stat: req.session.admin,
            dane: docs,
            ilosc: req.query.ilosc || 5,
            strona: req.query.strona || 1
        });
    });

});
app.get("/handleselect", function (req, res) {
    var rodzaj = req.query.rodzaj;
    if (rodzaj == "opcja1") {
        sklep.find({ $or: [{ Nazwa: nazwa }, { Marka: nazwa }] }).skip(parseInt(req.query.ilosc) * (parseInt(req.query.strona) - 1) || 0).sort({ Cena: 1 }).limit(parseInt(req.query.ilosc) || 5).exec(function (err, docs) {
            console.log(JSON.stringify({ "dane": docs }, null, 5))
            console.log(wsk);
            res.render('index.hbs',{
                wsk: true,
                stat: req.session.admin,
                dane: docs,
                ilosc: req.query.ilosc || 5,
                strona: req.query.strona || 1
            });
        });
        
    } else {
        sklep.find({ $or: [{ Nazwa: nazwa }, { Marka: nazwa }] }).skip(parseInt(req.query.ilosc) * (parseInt(req.query.strona) - 1) || 0).sort({ Cena: -1 }).limit(parseInt(req.query.ilosc) || 5).exec(function (err, docs) {
            console.log(JSON.stringify({ "dane": docs }, null, 5))
            console.log(wsk);
            res.render('index.hbs', {
                wsk: false,
                stat: req.session.admin,
                dane: docs,
                ilosc: req.query.ilosc || 5,
                strona: req.query.strona || 1
            });
        });
    }
});
app.get("/login", function (req, res) {
    if (!req.query.username || !req.query.password) {
        res.send('login failed');
    } else if (req.query.username === "admin" || req.query.password === "admin") {
        req.session.user = "admin";
        req.session.admin = true;
        res.render('index2.hbs', { stat: req.session.admin });
    }
});
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('index2.hbs', { stat: false });
});


app.get('/additem', function (req, res) {
    if(req.session.admin === true)
    res.render('additem.hbs');

});

app.get('/logowanie', function (req, res) {
    res.render('logowanie.hbs');
});
app.post('/addeditem', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/gfx/img';

    form.parse(req, function (err, fields, files) {
        console.log(files.imagetoupload.path)
        console.log(fields)
        var nowy = {
            Nazwa: 'telewizor',
            Marka: fields.Marka,
            Model: fields.Model,
            Przekatna: fields.Przekatna,
            Matryca: fields.Matryca,
            Cena: fields.Cena,
            WiFi: fields.WiFi,
            URL: "/gfx/img/" + files.imagetoupload.name,
        }
        console.log(nowy)
    sklep.insert(nowy, function (err, doc) {
        res.render('index2.hbs',{stat: req.session.admin})
    });   
});

});
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
}));
app.listen(PORT, function () {

    console.log("start serwera na porcie " + PORT)
})