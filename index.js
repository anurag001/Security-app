var express = require("express");
var cookieParser = require('cookie-parser');
var http = require ('http');
var mongoose = require ("mongoose");
var app = express();
var modelObj = require('./models')(mongoose);
var urlModule = require('url');
var speak = require("speakeasy-nlp");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var url = "mongodb://localhost:27017/<dbname>";
mongoose.connect(url);


//Index
app.get('/', function(req, res) {
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		// var uid = req.cookies["uid"];
		// var mobile = req.cookies["mobile"];
		
		// modelObj.Users.find({'_id':uid,'mobile':mobile},'name mobile',function(userErr,userResp){
		// 	if (userErr) throw userErr;

		// 	res.render('home',{user:userResp});

		// });
		res.redirect("/home");

	}
	else
	{
		res.render("index");
	}

});


//HomeFeed
app.get("/home",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		
		modelObj.Users.find({'_id':uid,'mobile':mobile},'name mobile',function(userErr,userResp){
			if (userErr) throw userErr;

			res.render('home',{user:userResp});

		});
			
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});


//Search Contact
app.post("/search",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];

		var keyMobile = req.body.mobile;
		//console.log(keyMobile);
		if(/[0-9]{10}/g.test(keyMobile)==true && keyMobile.length==10)
		{

			modelObj.Users.find({mobile:{'$ne':mobile,'$eq':keyMobile}},'_id name mobile',function(userErr,userResp){
				if (userErr) throw userErr;
				//console.log(userResp);

				if(userResp.length!=0)
				{
					modelObj.Request.find({'fromId':uid,'toId':userResp[0]._id},'status',function(reqErr,reqResp){

						if(reqResp=="" || reqResp=="undefined")
						{
							res.render('search',{user:userResp,status:0});
						}
						else
						{
							res.render('search',{user:userResp,status:reqResp[0].status});
						}

					});
				}

			});

		}
			
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});


//Add Contact
app.post("/add",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];

		var to = req.body.to;
		
		//console.log(to);
		
		var addObj={'fromId':uid,'toId':to,'status':2};

		var addData = new modelObj.Request(addObj);

		addData.save(function(addErr,addRes){
			if(addErr) throw addErr;
			
			res.send("ok");		
		});		
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});


//My Contact List
app.post("/contact",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];


		modelObj.Request.find({'fromId':uid,'status':1},'toId',function(userErr, userId){
			//console.log(reqResp);
			var array = [];

			 // Map the userid into an array of fromIds, we can use _id
		    var ids = userId.map(function(uid) { 
		    	return uid.toId; 
		    });

		    //console.log(ids);

		    modelObj.Users.find({'_id': {$in: ids}}, function(userErr, userResp) {
				if (userErr) throw userErr;
		        // resp contains our answer
				res.render('contact',{user:userResp});

		    });


		});
					
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});

//notify
app.post("/notify",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var name = req.cookies["name"];

		modelObj.Request.find({'fromId':uid,'status':1},'toId',function(err, userId){
			if (err) throw err;

		    // Map the userid into an array of fromIds, we can use _id
		    var ids = userId.map(function(uid) { 
		    	return uid.toId; 
		    });


		    for(var i=0;i<ids.length;i++)
		    {
		    	var addObj={'fromId':uid,'toId':ids[i],'message':'Alert from '+name+': I am in Danger','status':1};
				var addData = new modelObj.Notify(addObj);
				addData.save(function(addErr,addRes){
					if(addErr) throw addErr;
					
				});
		    }	

		   	res.send("Alerted successfully");
		});
	}
});

//Pull Notification
app.post("/pull/notification",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];

		modelObj.Notify.find({'toId':uid,'status':1},function(err, resp){
			if (err) throw err;


		   	res.send(resp);
		});
	}
});

//Mute Notification
app.post("/mute/notification",function(req,res){

	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var nid = req.body.nid;

		modelObj.Notify.findOneAndUpdate({'_id':nid},{'status':2},function(err, resp){
			if (err) throw err;


		   	res.send("ok");
		});
	}

});

//Genuine
app.post("/genuine",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var fid  = req.body.fid;
		var flag=0;

		modelObj.Genuine.find({$and:[{'feedId':fid,'seenBy':uid}]},'_id',function(err, resp){
			if (err) throw err;

			if(resp.length==0)
			{
				var addObj={'feedId':fid,'seenBy':uid};
				var addData = new modelObj.Genuine(addObj);
				addData.save(function(addErr,addRes){
					if(addErr) throw addErr;
					flag=1;
				});
			}
			else
			{
				modelObj.Genuine.findOneAndRemove({$and:[{'feedId':fid,'seenBy':uid}]},function(errug){
					if(errug) throw errug;
					flag=2;
				});
			}

			modelObj.Feed.find({'_id':fid},'feedGenuine',function(errg, respg){
				if(errg) throw errg;

				var gc = parseInt(respg[0].feedGenuine);
				//console.log(respg[0].feedGenuine);
				if(flag==1)
				{
					gc = gc+1;
				}
				else if(flag==2)
				{
					gc = gc-1;
				}

				modelObj.Feed.findOneAndUpdate({'_id':fid},{'feedGenuine':gc},function(errc,respc){
					if(errc) throw errc;

					var x = ""+gc;
					res.send(x);

				});

			});

		});
	}
});

//Affected Zone
app.post("/affected/zone",function(req,res){

	if(req.cookies["uid"] && req.cookies["mobile"])
	{

		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		

		modelObj.Location.find({'userId':uid},'location',function(showMapErr,showMapResp){
			if (showMapErr) throw showMapErr;
			
			locArray = [];
			locArray.push(showMapResp[0].location.coordinates[1]);
			locArray.push(showMapResp[0].location.coordinates[0]);


				var distance = 100;
				var location = {
					type:"Point",
					coordinates:locArray
				};


					var point = [locArray,distance/3963.2];

					console.log(point);

					modelObj.Feed.find({location:{ $geoWithin:{ $centerSphere:point } } }).sort({createdOn:-1}).exec(function(feedErr,feedResp) {
						if (feedErr) throw feedErr;
						//console.log(feedResp);
						if(feedResp.length!=0)
						{
							res.send(feedResp);
						}
						else
						{
							res.send("No Affected Zone");
						}
					});


		});
	}

});

//Request List
app.post("/request",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];

		modelObj.Request.find({'toId':uid,'status':2},'fromId', function(err, userId) {
			if (err) throw err;

		    // Map the userid into an array of fromIds, we can use _id
		    var ids = userId.map(function(uid) { 
		    	return uid.fromId; 
		    });

		    // Get the companies whose founders are in that set.
		    modelObj.Users.find({'_id': {$in: ids}}, function(userErr, userResp) {
				if (userErr) throw userErr;
		        // resp contains our answer
				res.render('request',{user:userResp});

		    });
		});


		
		// modelObj.Request.aggregate([
		//     { '$match': { "toId": uid,"status":2 } },
		// 	{
		//         '$lookup': {
		//             "from": "users",
		//             "localField": "fromId",
		//             "foreignField": "_id",
		//             "as": "requestList"
		//         }
		//     }
		// ]).exec(function(err, list){
		//     if(err) throw err;
		//     //res.send(list);   
		//     console.log(list); 
		// });
				
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}

});


//Approve 
app.post("/approve",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		
		var from = req.body.from;
		
		// modelObj.Request.findOne({'fromId':from,'toId':uid},function(Err,resp){
		// 	if (Err) throw Err;
		// 	console.log(resp);

		// 	resp.status = 1;
		// 	resp.save();
		// 	res.send("ok");

		// });
		modelObj.Request.update({$and:[{fromId:from,toId:uid}]},{$set:{status:1}},function(Err,Resp){
			if (Err) throw Err;
			console.log(Resp);
			res.send("ok");

		});

	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}
	
});


//Save Location
app.post("/get/location",function(req,res){

	var longitude = req.body.long;
	var latitude = req.body.lat;
	//console.log(longitude);
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];

		var locationArray = [];
		locationArray.push(longitude);
		locationArray.push(latitude);
		var location = {
			type:"Point",
			coordinates:locationArray
		};


		modelObj.Location.find({'userId':uid},function(userLocErr,userLocResp){
			if (userLocErr) throw userLocErr;

			if(userLocResp.length!=0)
			{
				modelObj.Location.findOneAndUpdate({'userId':uid},{'location':location},function(locErr,locRes){
					if(locErr) throw locErr;
					
					console.log("Location Set-Geo");
				
				});
			}
			else
			{
				var locData = new modelObj.Location({userId:uid,location:location});
				locData.save(function(err){
					if(err) throw err;
					console.log("New Location Saved");
				});
			}

		});
		
	}

});


//Fetch Location
app.post("/fetch/location",function(req,res){

	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];

		modelObj.Location.find({'userId':uid},function(userLocErr,userLocResp){
			if (userLocErr) throw userLocErr;

			if(userLocResp.length!=0)
			{
				res.send(userLocResp);
			}
			else
			{
				res.send("no");
			}

		});
		
	}

});


//Show map positions
app.post("/showmap",function(req,res){
	
	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		
		var id = req.body.id;
		//console.log(id);

		modelObj.Location.find({'userId':id},'location',function(showMapErr,showMapResp){
			if (showMapErr) throw showMapErr;
			//console.log(showMapResp[0].location.coordinates[0]);
			res.send(showMapResp);	

		});
	} 
	else 
	{
		// User is signed out.
		res.redirect("/");
	}
	
});


//Crime Story
app.get('/feed', function(req, res) {
	
	res.render("feed");

});


//Posting a story
app.post('/story/submit', function(req, res) {
	
	
	//console.log(longitude);
	if(req.cookies["uid"] && req.cookies["mobile"])
	{

		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var longitude = req.body.long;
		var latitude = req.body.lat;
		var category = req.body.category;
		var description = req.body.description;
		var status = "text";

		var locationArray = [];
		locationArray.push(longitude);
		locationArray.push(latitude);
		var location = {
			type:"Point",
			coordinates:locationArray
		};

		if(category==undefined)
		{
			category = "others";
		}
		//console.log(locationArray);

		var videoId = "";
		var status="";
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = description.match(regExp);
		if (match && match[2].length == 11)
		{
			videoId =  match[2];
			status="video";
			description = videoId;
		}
		else 
		{
			status="text";
		}


		
		var feedData = new modelObj.Feed({feedBy:uid,feedData:description,feedStatus:status,feedCategory:category,location:location});
		feedData.save(function(err){
			if(err) throw err;
			console.log("Feed Saved");
			res.send("ok");
		});
			
		
	}

});


//Display feed
app.post("/story/view",function(req,res){

	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var longitude = req.body.long;
		var latitude = req.body.lat;


		var distance = 100;
		var locationArray = [];
		locationArray.push(longitude);
		locationArray.push(latitude);
		var location = {
			type:"Point",
			coordinates:locationArray
		};


		//modelObj.Location.find({'userId':uid},'location',function(locErr,locResp){
			//if (locErr) throw locErr;

			//var locationArray = locResp[0].location.coordinates;
			var point = [locationArray,distance/3963.2];

			console.log(point);

			modelObj.Feed.find({location:{ $geoWithin:{ $centerSphere:point } } }).sort({createdOn:-1}).exec(function(feedErr,feedResp) {
				if (feedErr) throw feedErr;

				if(feedResp.length!=0)
				{
					res.render('feed-view',{feed:feedResp});
				}
				else
				{
					console.log("---- Empty | No Feeds ----");
				}
			});

		//});
		
	}


});


//Filter feed search
app.post("/story/search/view",function(req,res){

	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var longitude = req.body.long;
		var latitude = req.body.lat;
		var category = req.body.category;
		var distance = req.body.distance;

		var locationArray = [];
		locationArray.push(longitude);
		locationArray.push(latitude);
		var location = {
			type:"Point",
			coordinates:locationArray
		};


		var point = [locationArray,distance/3963.2];

		modelObj.Feed.find({feedCategory:category,location:{ $geoWithin:{ $centerSphere:point } } }).sort({createdOn:-1}).exec(function(feedErr,feedResp) {
			if (feedErr) throw feedErr;

			if(feedResp.length!=0)
			{
				res.render('feed-view',{feed:feedResp});
			}
			else
			{
				console.log("---- Empty | No Feeds ----");
			}
		});
		
	}


});


//Remove Feed
app.post("/remove/feed",function(req,res){

	if(req.cookies["uid"] && req.cookies["mobile"])
	{
		var uid = req.cookies["uid"];
		var mobile = req.cookies["mobile"];
		var fid = req.body.fid; 


		modelObj.Feed.find({_id:fid,feedBy:uid},function(feedErr,feedResp) {
			if (feedErr) throw feedErr;

			if(feedResp.length!=0)
			{
				modelObj.Feed.findByIdAndRemove(fid,function(err) {
					if(err) throw err;

					res.send("ok");
				});

			}
			else
			{
				console.log("nope");
			}
		});

	}


});


//NLP 
app.get("/nlp",function(req,res){

	
	// Analyze sentences at a basic level
	// ------------------------------------- //
	res.send(speak.classify("What is your name?") );            //=> { action: "what", owner: "listener", subject: "name" }
	console.log(speak.classify("Do you know what time it is?") );  //=> { action: "what", owner: "it", subject: "time" }

	// Sentiment analysis
	// ------------------------------------- //
	console.log(speak.sentiment.negativity("I hate your guts"));   //=> { score: 1, words: [hate] }
	console.log(speak.sentiment.positivity("I love you"));        //=> { score: 1, words: [love] }

	console.log(speak.sentiment.analyze("I love you, but you smell something aweful") );
	// (Negative scores dictate a stronger influence of negative words)
	//=> { score: -1, positive: { ... }, negative: { ... } }


});

//ACTION
app.post("/action",function(req,res){

	var content = req.body.content;
	// Analyze sentences at a basic level
	// ------------------------------------- //
	console.log(speak.classify(content) );  //" }

	// Sentiment analysis
	// ------------------------------------- //
	console.log(speak.sentiment.negativity(content));   //=> { score: 1, words: [hate] }
	console.log(speak.sentiment.positivity(content));        //=> { score: 1, words: [love] }

	console.log(speak.sentiment.analyze(content) );
	res.send(speak.sentiment.analyze(content));
	// (Negative scores dictate a stronger influence of negative words)
	//=> { score: -1, positive: { ... }, negative: { ... } }


});




//Operation of coordinates
app.get("/loc",function(req,res){

	// var locationArray = [];
	// locationArray.push(50.0379326);
	// locationArray.push(8.5599578);
	// var location = {
	// 	type:"Point",
	// 	coordinates:locationArray
	// };

	// var locData = new modelObj.Location({userId:"5aba49cde1dd620cb68f94f1",location:location});
	// locData.save(function(err){
	// 	if(err) throw err;
	// 	console.log("New Location Saved");
	// });
	// 

});





//Account Register
app.post("/register",function(req,res){
	var mobile = req.body.mobile;
	var name = req.body.name;
	var password = req.body.pass;

	if (/\W/g.test(mobile) || /\W/g.test(password))
	{
		res.send('<span style="color:red;font-weight:bold;">Don\'t provide spaces.Password should be alphanumeric only</span>');
	}
	else
	{
		if(/[0-9]{10}/g.test(mobile)==true && mobile.length==10)
		{
	
			modelObj.Users.find({'mobile':mobile},'mobile', function(mobileErr,mobileResp){
				if(mobileErr) throw mobileErr;
				
				if(mobileResp.length==0)
				{
					var userObj = {name:name,mobile:mobile,password:password};
					var userData = new modelObj.Users(userObj);
					userData.save(function(regErr,regRes){
						if(regErr) throw regErr;

						if(regRes)
						{
							res.send('<span style="font-weight:bold;color:green">User is registered successfully');	
						}
						else
						{
							res.send('<span style="font-weight:bold;color:red">Error in user registeration</span>');
						}
				
					});
				}
				else
				{
					res.send('<span style="font-weight:bold;color:red">Mobile No. already exist</span>');
				}
			});

		}
		else
		{
			res.send('<span style="font-weight:bold;color:red">Mobile No. should be 10 digit number only</span>');
		}

	}

});




//Account Signin
app.post("/signin",function(req,res){
	var mobile = req.body.logmobile;
	var password = req.body.logpass;

	if(/[0-9]{10}/g.test(mobile)==true && mobile.length==10)
	{

		modelObj.Users.find({'mobile':mobile},'_id mobile password name', function(logErr,logResp){
			if (logErr) throw logErr;

			if(logResp.length!=0)
			{

				if(logResp[0].mobile == mobile && logResp[0].password==password)
				{
					res.cookie('mobile',logResp[0].mobile , {expire: 360000 + Date.now()}); 	
					res.cookie('uid', logResp[0]._id , {expire: 360000 + Date.now()}); 	
					res.cookie('name', logResp[0].name , {expire: 360000 + Date.now()}); 	
					res.send("true");
				}
				else
				{
					res.send('<span style="font-weight:bold;color:red">Invalid Credentials</span>');
				}	
			}
			else
			{
				res.send('<span style="font-weight:bold;color:red">You are not registered</span>');
			}			
		});

	}
	else
	{
		res.send('<span style="font-weight:bold;color:red">Mobile No. should be 10 digit number only</span>');
	}


});

//Logout
app.get('/logout',function(req,res){
	res.clearCookie("uid");
	res.clearCookie("mobile");
	res.clearCookie("name");
	res.send("<meta http-equiv=\"refresh\" content=\"0; url=/\">");
});


var server = app.listen(8000,function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("App is running");
});
