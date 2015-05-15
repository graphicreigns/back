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
var COMMENT = db.collection("commentaire");

router.post('/getsite',function(req,res){
	SITES.find({},function(err,docs){
		res.jsonp(docs);
	});
});

router.post('/getsiteOptions',function(req,res){
	var array_options=[];
	SITES.find({},{name:1,color:1},function(err,docs){
		async.forEach(docs,function(chaque,cb_docs){
			var chaque_site={};
			chaque_site.y=chaque._id.toString();
			chaque_site.label=chaque.name;
			chaque_site.color=chaque.color;
			array_options.push(chaque_site);
			cb_docs(null);
		},function(err){
			res.jsonp(array_options);
		});
	});
});

/*
 * param:
 * 
 * "date" - le milliseconds de date -- GetTime()
 * "nb"   -  nb commande
 * "id_site" -  le id du site
 * */

router.post('/putstat_command',function(req,res){
	
	var newCommand = Object.create(null);
	
	var date=new Date(parseInt(req.body.date));
	var nb=req.body.nb;
	
	newCommand.date=date;
	//newCommand.id_site=ObjectId("5102e6c63a81b414e086564e");
	newCommand.id_site=ObjectId(req.body.id_site);
	newCommand.nbcommand=nb;
	
	SC.save(newCommand,function(err,result){
		res.jsonp("ok");
	});
	
});


/*
 * param:
 * 
 * "debut" - le milliseconds de debut -- GetTime()
 * "fin"   -  le milliseconds de fin  -- GetTime()
 * */
router.post('/getstat_command',function(req,res){
	
	var time_debut=parseInt(req.body.debut);
	var time_fin=parseInt(req.body.fin);
	var date_debut=new Date(time_fin);
	//var date_fin= new Date();
	
	//var query_debut=new Date(date_debut.getFullYear(),date_debut.getMonth(),date_debut.getDate()-3);
	//var query_fin=new Date(date_fin.getFullYear(),date_fin.getMonth(),date_fin.getDate());
	
	//console.log(query_debut);
	//console.log(query_fin);
	
	var days=(time_fin - time_debut)/(24*60*60*1000);
	//var days=5;
	var count=0;
	
	var array_envoyer=[];
	
	async.whilst(
		function () { return count < days; },
		function (callback) {
			var query_debut=new Date(date_debut.getFullYear(),date_debut.getMonth(),date_debut.getDate()-count);
			var query_fin=new Date(date_debut.getFullYear(),date_debut.getMonth(),date_debut.getDate()+1-count);

			SC.find({date:{ $gte: query_debut, $lt: query_fin}},function(err,result){
				//console.log(count,result);
	
				if(result.length>0){
					var oneday ={};
					oneday.date=query_debut;
									
					async.forEach(result,function(elem,cb_docs){
						SITES.findOne({_id:ObjectId(elem.id_site)},function(err,site){
							oneday[site.name]=elem.nbcommand;
							cb_docs(null);
						});


					},function(err){
						array_envoyer.push(oneday);
						count++;
						callback(null,null);						
					});
				}
				else{
					count++;
					callback(null,null);
				}
			});

		},
		function (err) {
			res.jsonp(array_envoyer);
		}
	);
	
});


/*
 *  param:
 * 
 *  "debut" - le milliseconds de debut -- GetTime()
 *  "fin"   - le milliseconds de fin  -- GetTime()
 *  "contenu" -  le contenue de commentaire
 *  "compte"  - le id de compte
 * */
router.post('/putcommentaire',function(req,res){
	
	var newCommentaire= Object.create(null);
	
	newCommentaire.date_debut=new Date(parseInt(req.body.debut));
	newCommentaire.date_fin=new Date(parseInt(req.body.fin));	
	newCommentaire.id_user=ObjectId(req.body.compte);
	newCommentaire.contenu=req.body.contenu;
	
	COMMENT.save(newCommentaire,function(err,result){
		res.jsonp("ok");
	});
	
});
/*
 *  param:
 * 
 *  "date" - le milliseconds le date -- GetTime()
 *  "compte" - le id de compte
 * */
router.post('/getcommentaire',function(req,res){
	
	var date=new Date(parseInt(req.body.date));
	var compte=ObjectId(req.body.compte);
	
	COMMENT.find({id_user:compte, date_debut:{$lte:date}, date_fin:{$gte:date}},function(err,result){
		res.jsonp(result);
	});
	
});


module.exports = router;
	
	
