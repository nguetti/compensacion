const express = require('express');
const router = express.Router();
var XLSX = require("xlsx"); 
const fs = require("fs");
const xl = require("excel4node")
const path = require('path');


/**** EXPRESS() */
const app =  express();
app.use(express.urlencoded({ extended : false })) ;

// ************ Route System require and use() ************
const mainRouter = require('./routers/mainrouter')
const publicPath = path.resolve(__dirname, './public');
app.use( express.static(publicPath)) ;

// ************ Template Engine - (don't touch) ************
app.set('views', path.resolve(__dirname, 'views')) ;
app.set('view engine', 'ejs') ; 


const port = process.env.PORT || 3000
app.listen(port, ()=>{console.log("Servidor corriendo en puerto 3000")} )   
app.use('/', mainRouter);


//////////////////////////

// const ExcelAJSON = () =>{
   

   
// }

// ExcelAJSON()