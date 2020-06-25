const express = require('express')
const app = express()
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const { Client } = require('pg');
const connection = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
connection.connect();

function boolize(string){
  if (string == '1'){
    return true;
  } else {
    return false;
  };
};
app.get('/', (req, res) => {
  connection.query("SELECT * FROM family", function (err, result, fields){
    if (err) throw err;
    let templateVars = {
      'family': result.rows
    }
    console.log('-------->', result.rows)
    res.render ( "home.ejs", templateVars );
  });
})

app.post('/', (req, res) => {
  const queryString = `delete from family where id = ${req.body['family_member_id']}`
  connection.query(queryString, function (err, result, fields){
    if (err) throw err;
    connection.query("SELECT * FROM family", function (err, result, fields){
      if (err) throw err;
      let templateVars = {
        'family': result.rows
      }
      res.render ( "home.ejs", templateVars );
    });
  });
})

app.get('/new', (req, res) => {
  res.render("new_family_member.ejs")
})

app.post('/new', (req,res) => {
  let inputs = [req.body['Name'], req.body['Age'], req.body['Gender'], req.body['Food'], boolize(req.body['Adult']), boolize(req.body['Grandparent']), req.body['species'],]
  const queryString = `insert into family (name, age, gender, food, adult, grandparent, species) values ('${inputs[0]}',${inputs[1]},'${inputs[2]}','${inputs[3]}',${inputs[4]},${inputs[5]},'${inputs[6]}')`;
  connection.query(queryString, function (err, result, fields){
    console.log('>>>', queryString, err, result, fields)
    if (err) throw err;
    connection.query("SELECT * FROM family", function (err, result, fields){
      if (err) throw err;
      let templateVars = {
        'family': result.rows
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
