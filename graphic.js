var express = require('express'); 
var router = express.Router();
var async = require('async')
 , mongojs = require('mongojs')
 , ObjectId = mongojs.ObjectId
 , _ = require('underscore')
 , exec = require('child_process').exec;
var db = require("./DB/db_con");
var SITES=db.collection("sites");
//var ALLDATE= db.collection("alldate");
//var FORMULA= db.collection("formula"); 
var SC = db.collection("statcommand");

router.post('/getsite',function(req,res){
	SITES.find({},function(err,docs){
		res.jsonp(docs);
	});
});

router.post('/putstat_command',function(req,res){
	
	var newCommand = Object.create(null);
	
	var date=new Date();
	var nb=100;
	
	newCommand.date=date;
	newCommand.id_site=ObjectId("5102e6c63a81b414e086564e");
	newCommand.nbcommand=nb;
	
	SC.save(newCommand,function(err,result){
		res.jsonp("ok");
	});
	
});

router.post('/getstat_command',function(req,res){
	
	SC.find({},function(err,result){
		console.log(result);
		res.jsonp("ok_get");
	});
	
});





module.exports = router;
	
	
