var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydatabase";
var session = require('express-session');
var cookie = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "/views/partials")));
app.use(session({
    secret: 'Dont tell anybody',
    rolling: true,
    resave: true,
    saveUninitialized: true

}));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {

    res.render('pages/login', {
        error: '', data1: req.session.data1,
        check: req.session.result
    });
    console.log("done");

});


app.get('/signup.html', function (req, res) {

    res.render('pages/signup', {
        error: ' ',
        data1: req.session.data1,
        check: req.session.result
    });


})

app.post('/myaction', function (req, res) {
    //res.send(req.body.username);
    //console.log(req.body.username);password, result.password)) {password, result.password)) {
    //     req.session.result = result;
    //     req.session.result = result;
    //console.log(req.body);
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydatabase");
        if (!req.body.username || !req.body.password) {
            res.status("400");
            res.send("Invalid details!");
        } else {
            dbo.collection("signupdata").findOne({ username: req.body.username }, function (err, result) {
                console.log(req.body.username);
                console.log(result);
                if (result != null) {
                    if (req.body.username == result.username) {
                        res.render('pages/signup', {
                            error: "User already exists! Login or choose another username", data1: req.session.data1,
                            check: req.session.result
                        });

                    }
                }
                else {
                    var myobj = { username: req.body.username, user_email: req.body.user_email, password: req.body.password };
                    dbo.collection("signupdata").insertOne(myobj, function (err, result) {
                        if (err) throw err;
                        console.log("1 doc inserted");

                        db.close();
                        res.send("enterd in collection(table)");
                    });
                }
            });
        }
    });
});

app.post('/mysearchaction', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydatabase");
        var query = { username: req.body.username };
        dbo.collection("signupdata").find(query).toArray(function (err, result) {
            if (err) throw err;
            console.log(result[0]);
            var data;
            var searchname;
            db.close();
            res.render('pages/found', {
                data: result,

                searchname: req.body.username,
                data1: req.session.data1,
                check: req.session.result

            });
        });
    });

});

app.post('/myloginaction', function (req, res) {

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydatabase");
        dbo.collection('signupdata').findOne({ user_email: req.body.email }, function (err, result) {
            if (!result) res.render('pages/login', {
                error: 'Invalid username and password', data1: req.session.data1,
                check: req.session.result
            });
            else {
                // console.log(req.body.password);
                // console.log(result.password[0]);
                if (req.body.password != result.password[0]) {
                    res.render('pages/login', {
                        error: 'Invalid username and password', data1: req.session.data1,
                        check: req.session.result
                    });
                }
                else
                //res.send("dashboard");
                {
                    var data1;
                    req.session.result = true;
                    req.session.cookie.maxAge = 30000;
                    req.session.data1 = result;

                    if (req.session.result) {
                        res.redirect('/dashboard');

                    }

                }

                // if (bcrypt.compareSync(req.body.password, result.password)) {
                //     req.session.result = result;
                //     if (req.session.prevURL) res.redirect(req.session.prevURL);

            }

        });

    });


});

app.get('/dashboard', function (req, res) {
    if (req.session.result) {
        res.render('pages/dashboard', {
            data1: req.session.data1,
            check: req.session.result

        });
    }
    else {
        res.render('pages/login', {
            error: ' ',
            data1: req.session.data1,
            check: req.session.result

        });
    }

});



app.get('/resume_generator.html', function (req, res) {
    res.render('pages/form', {
        error: ' ',
        data1: req.session.data1,
        check: req.session.result
    });
});


app.post('/resume_generator', function (req, res) {
    formdata = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        email: req.body.user_email,
        phone: req.body.phone,
        job_desig: req.body.job_desig,
        user_obj: req.body.user_obj,
        exp: req.body.exp,
        edu: req.body.edu,
        projects: req.body.projects,
        skills: req.body.skills
    };
    res.render('templates/template1', {

        formdata: formdata
    });
});


app.get('/about', function (req, res) {
    res.render('pages/about', { error: ' ', check: req.session.result });
})

app.get('/logout', function (req, res) {
    req.session.result = false;
    res.redirect('/');
})








app.listen(3000, function (req, res) {
    console.log("server done");
});
