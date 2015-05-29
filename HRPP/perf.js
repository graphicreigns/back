var express = require('express');
var router = express.Router();

var async = require('async')
 , mongojs = require('mongojs')
 , ObjectId = mongojs.ObjectId
 , _ = require('underscore')
 , exec = require('child_process').exec;

var db = require("./middleware/mid_db"); 

var COMPTE=db.collection("user");
var SITES=db.collection("sites");
var COMMENT=db.collection("commentaire");
var SC=db.collection("statcommand");

/*
 *  param:
 * 
 *  "compte" - le id de compte
 * */

router.post('/getsiteOptions',function(req,res){
	var compte=ObjectId(req.body.compte);
	var array_options=[];
	
	COMPTE.findOne({_id:compte},{site:1},function(err,docs){
		async.forEach(docs.site,function(eachsite,cb_docs){					
			SITES.findOne({_id:ObjectId(eachsite)},{name:1,color:1},function(err,chaque){
				var chaque_site={};				
				//chaque_site.y=chaque._id.toString();
				chaque_site.y=chaque.name;
				chaque_site.label=chaque.name;
				chaque_site.id=chaque.name; 
				chaque_site.color=chaque.color;
				array_options.push(chaque_site);
				cb_docs(null);				
			});
			
		},function(err){
			res.jsonp(array_options);			
		});
	});
});

/*
 * param:
 * 
 * "compte" - le id de compte
 * "debut" - le milliseconds de debut -- GetTime()
 * "fin"   -  le milliseconds de fin  -- GetTime()
 * */
router.post('/getstat_command',function(req,res){
	var compte=ObjectId(req.body.compte);
	var time_debut=parseInt(req.body.debut);
	var time_fin=parseInt(req.body.fin);
	var date_debut=new Date(time_fin);

	var days=(time_fin - time_debut)/(24*60*60*1000);
	var count=0;
	
	var array_envoyer=[];
	
	async.whilst(
		function () { return count < days; },
		function (callback) {
			var query_debut=new Date(date_debut.getFullYear(),date_debut.getMonth(),date_debut.getDate()-count);
			var query_fin=new Date(date_debut.getFullYear(),date_debut.getMonth(),date_debut.getDate()+1-count);

			COMPTE.findOne({_id:compte},{site:1},function(err,docs){
		
				SC.find({date:{ $gte: query_debut, $lt: query_fin}, id_site: { $in: docs.site } },function(err,result){
		
					if(result.length>0){
						var oneday ={};
						oneday.date=query_debut;
										
						async.forEach(result,function(elem,cb_docs){
							SITES.findOne({_id:ObjectId(elem.id_site)},function(err,site){
								oneday[site.name]=parseInt(elem.nbcommand);
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
