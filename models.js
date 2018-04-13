var mongoose = require ("mongoose");
var url = "mongodb://localhost:27017/spot";
mongoose.connect(url);
var Schema = mongoose.Schema;

module.exports = function(mongoose) {
	var userSchema = new Schema({
		mobile:{type:Number,required:'Please enter your mobile no',unique:true},
		name:{type:String, required:'Please enter your name'},
		password:{type:String, required:'Please enter a password'},		
  		profilePhoto:{type:String},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		},
		updatedOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		},
		dateOfBirth:{
			type:Date,
			max:Date.now,
		}
	
	});
	
	var locationSchema = new Schema({
		userId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		location: { 
			"type":{
				type: String, 
				enum: ['Point', 'LineString', 'Polygon'], 
				default: "Point", 
				required:true
			}, 
  			coordinates:{
  				type: [Number], 
  				default:[0,0] 
  			} 
  		},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		}
  
	});


	var requestSchema = new Schema({
		fromId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		toId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		status:{type:Number,required:true},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		}
	});
	
	var feedSchema = new Schema({
		feedData:{type:String, required:'Please enter your feed'},
		feedBy:[{type : Schema.Types.ObjectId, ref : 'users'}],
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		},
		feedPhoto:{type:String},
		feedCategory:{type:String,required:true},
		feedGenuine:{type :Number,default:0},
		feedReport:{type :Number,default:0},
		feedStatus:{
			type:[{
				type:String,
				enum:['text','image','video']
			}],
			default:['text'],
			required:true
		},
		location: {
			"type":{
				type: String, 
				enum: ['Point', 'LineString', 'Polygon'], 
				default: "Point", 
				required:true
			}, 
			coordinates:{
				type: [Number], 
				default:[0,0] 
			}
		}  
	});

	var notificationSchema = new Schema({
		fromId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		toId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		message:{type:String,required:true},
		status:{type:Number,default:1,required:true},
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		}
	});

	var genuineSchema = new Schema({
		feedId:[{type : Schema.Types.ObjectId, ref : 'users'}],
		seenBy:[{type : Schema.Types.ObjectId, ref : 'users'}],
		createdOn:{
			type:Date,
			default:Date.now,
			max:Date.now,
			required:true
		}
	});

	var models = {
		Users:mongoose.model('users',userSchema),
		Location:mongoose.model('locations',locationSchema),
		Request:mongoose.model('requests',requestSchema),
		Feed:mongoose.model('feeds',feedSchema),
		Notify:mongoose.model('notifications',notificationSchema),
		Genuine:mongoose.model('genuines',genuineSchema),
	};
	return models;

}
