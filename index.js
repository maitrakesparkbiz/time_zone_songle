const express = require("express");
const path = require("path");
const mysql = require('mysql2');
var url = require('url');
const port = process.env.PORT || 8082;
require("dotenv").config();
const userData = require("./data/userData.json");
const { type } = require("express/lib/response");
const { time, log } = require("console");
var app = express();
//design and develop BY Maitrak Nirmal
//url encoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set path for public dir
app.use(express.static(path.join(__dirname, "/public")));

//set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

//set mysql connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'Student'
});

// jobApp page render
app.get("/jobApp", (req, res) => {
  res.render("jobApp");
});


app.get("/timezone", (req, res) => {
  timezone_select=req.query.timezone_select;
  time_check=req.query.time;
  add_time=time_check.split(":");
  add_select=timezone_select.split(":");
  hours_text1=add_time[0]
  hours_text2=add_time[1]

  hours_select1=add_select[0]
  hours_select2=add_select[1]
  check=hours_select1.split("+")

 
  /* hours=parseInt(hours_text1)+parseInt(hours_select1)
  minutes=parseInt(hours_text2)+parseInt(hours_select2) */

  hours=eval(hours_text1+hours_select1)
  minutes=eval(hours_text2+hours_select2)
  
  if(parseInt(hours)>=24)
  {
    console.log(hours=hours-24); 
  }
  if(parseInt(minutes)>59)
  {
    minutes= minutes-60
  }
if(typeof(timezone_select)=="undefined"  ||  typeof(time_check)=="undefined"  )
{
  console.log(":)");
  output_time="Please Enter Time";
}
else
{
  console.log(hours,":",minutes);
  output_time=hours+":"+minutes;
}
  res.render("timezone",{output_time,output_time});
});



//mysql fuction 

app.get("/getData", (req, res) => {
  try{
    let id = req.query.id;
  let total_page = req.query.total;
  let order_by=req.query.order_by;
  let search=req.query.search;
  let total;
  console.log(search);

  
  if (typeof(id) == 'undefined')
  {
    id=0;
  }
  if (typeof(order_by) == 'undefined')
  {
    order_by="id";
  }
  connection.query('SELECT CEIL(COUNT(*)/10) as total FROM `std_exam_result_master`',
  function(err,results)
  {
    total=results[0].total;

  }
  );
  if(typeof(search) != 'undefined')
  {
    let number=id*10;
    let sql= 'SELECT `id`,CONCAT(fname," ",lname) as full_name, `roll`, `subject`, `marks`, `perc`, `created_at` FROM `std_exam_result_master` WHERE fname LIKE "%'+search+'%" or id LIKE "%'+search+'%" or lname LIKE "%'+search+'%"or subject LIKE "%'+search+'%" or marks LIKE "%'+search+'%" or perc LIKE "%'+search+'%" LIMIT '+number+',10;';
    console.log(sql);
    connection.query(sql,
    function(err,results)
    {
      res.render("view_mysql_data", {results: results,total,id,total_page,order_by,search}) 
      //res.send(results)
    }
    );
  }
  else
  {
  let number=id*10;
let sql='SELECT `id`,CONCAT(fname," ",lname) as full_name, `roll`, `subject`, `marks`, `perc`, `created_at` FROM `std_exam_result_master` ORDER BY '+order_by+' LIMIT '+number+',10;';
  connection.query(
    sql,
    //'SELECT `id`,CONCAT(fname," ",lname) as full_name, `roll`, `subject`, `marks`, `perc`, `created_at` FROM `std_exam_result_master` ORDER BY ? LIMIT ?,10; ',[order_by || number],
    function(err, results) {
      console.log(order_by,number)
      res.render("view_mysql_data", {results: results,total,id,total_page,order_by,search}) 
    }
  );
  }
  }catch (err) {
    console.log(err.message);
  }

});

// mysql update with get
app.post("/updateData", (req, res) => {
  try {
    
      let id=req.body.id;
      let name=req.body.name;
      let roll=req.body.roll;
      let subject=req.body.subject;
      let marks=req.body.marks;
      let perc= marks*100/70;
      perc= perc.toFixed(2);
      console.log(id,name)
      sql='UPDATE `std_exam_result_master` SET `id`='+id+',`roll`='+roll+',`subject`="'+subject+'",`marks`='+marks+',`perc`= '+perc+' WHERE id='+id;
      console.log(sql);
      connection.query(sql,
      function(err,results)
      {
        res.redirect("/getData")
      }
      );

  } catch (err) {
    console.log(err.message);
  }
});

app.post("/deldata", (req, res) => {
  try {
    
      let id=req.body.id;
     
      sql='DELETE FROM `std_exam_result_master` WHERE id='+id;
      console.log(sql);
      connection.query(sql,
      function(err,results)
      {
        res.redirect("/getData")
      }
      );

  } catch (err) {
    console.log(err.message);
  }
});



//pagination
app.get("/pagination", (req, res) => {

  let id = req.query.id;
  let total_page = req.query.total;
  
  if (typeof(id) == 'undefined')
  {
    id=0;
    
  }
  
  
  
  
  connection.query('SELECT CEIL(COUNT(*)/10) as total FROM `std_exam_result_master`',
  function(err,results)
  {
    
    let total=results[0].total;
   
    res.render("pagination_view",{total,id,total_page});
  }
  );
  
});

//for the post jobApp form
app.post("/jobAppAction", (req, res) => {
  try {
    res.send(
      req.body,
    );
  } catch (err) {
    console.log(err.message);
  }
});

// const userRoutes = require("./src/routes/user/userRoutes");
// const authRoutes = require("./src/routes/auth/authRoutes");

//set routes
// app.use(userRoutes);
// app.use(authRoutes);

//home page
app.use("/", (req, res) => {
  res.render("index", { userData });
});

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
