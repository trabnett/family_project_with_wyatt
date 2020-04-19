const express = require('express')
const app = express()
const port = 3000
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var env_vars = require('./env_vars.js');

var mysql=require('mysql');
var connection=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:env_vars['db_password'],
  database:'family'
});
connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connected!:)');
  }
});

app.get('/', (req, res) => {
  connection.query("SELECT * FROM family", function (err, result, fields){
    if (err) throw err;
    let templateVars = {
      'family': result
    }
    res.render ( "home.ejs", templateVars );
  });
})

app.post('/', (req, res) => {
  const queryString = "delete from family where id = ?"
  const value = [req.body['family_member_id']]
  connection.query(queryString, value, function (err, result, fields){
    if (err) throw err;
    connection.query("SELECT * FROM family", function (err, result, fields){
      if (err) throw err;
      let templateVars = {
        'family': result
      }
      res.render ( "home.ejs", templateVars );
    });
  });
})

app.get('/new', (req, res) => {
  res.render("new_family_member.ejs")
})

app.post('/new', (req,res) => {
  const queryString = "insert into family (Name, Age, Gender, Food, Adult, Grandparent, species) values (?,?,?,?,?,?,?)";
  const values = [];
  for (i in req.body) {
    values.push(req.body[i])
  }
  connection.query(queryString, values, function (err, result, fields){
    if (err) throw err;
    connection.query("SELECT * FROM family", function (err, result, fields){
      if (err) throw err;
      let templateVars = {
        'family': result
      }
      res.render ( "home.ejs", templateVars );
    });
  });
})

// // example to use params
// app.get('/update/:input', function (req,res) {
//   console.log('---------', req.params.input)
//   let queryString = "insert into family (name, age, gender, food, adult, grandparent, species) values (?,?,?,?,?,?,?)"
//   let values = [req.params.input, 55, 'female', 'salad', true, false, 'human']
//   connection.query(queryString, values, function (err, result, fields){
//     if (err) throw err;
//     res.send('Hello World!')
//   });
// });

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
