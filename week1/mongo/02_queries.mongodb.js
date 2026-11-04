use("velora");

// M1 CREATE: insert one review.
db.reviews.insertOne({productId:2,author:"Demo User",rating:5,comment:"Excellent shirt.",tags:["quality"],createdAt:new Date()});

// M2 READ: 5-star reviews, newest first.
db.reviews.find({rating:5},{_id:0,productId:1,author:1,comment:1}).sort({createdAt:-1});

// M3 READ with operators: low ratings OR comments tagged as fit.
db.reviews.find({$or:[{rating:{$lte:3}},{tags:"fit"}]});

// M4 UPDATE: add a helpful tag and increment helpful counter.
db.reviews.updateOne({author:"Demo User"},{$push:{tags:"recommended"},$inc:{helpful:1}});

// M5 DELETE: remove the demo review from M1.
db.reviews.deleteOne({author:"Demo User"});

// M6 AGGREGATION: average rating per product.
db.reviews.aggregate([
  {$group:{_id:"$productId",avgRating:{$avg:"$rating"},reviewCount:{$sum:1}}},
  {$sort:{avgRating:-1}}
]);

// M7 AGGREGATION: sales funnel (views, add_to_cart, purchases).
db.events.aggregate([{$group:{_id:"$type",count:{$sum:1}}},{$sort:{count:-1}}]);

// M8 AGGREGATION: top five viewed products in last 30 days.
db.events.aggregate([
  {$match:{type:"view",ts:{$gte:new Date(Date.now()-30*24*3600*1000)}}},
  {$group:{_id:"$productId",views:{$sum:1}}},
  {$sort:{views:-1}},{$limit:5}
]);

// M9 AGGREGATION: purchase count by city and device.
db.events.aggregate([
  {$match:{type:"purchase"}},
  {$group:{_id:{city:"$city",device:"$device"},purchases:{$sum:1}}},
  {$sort:{"_id.city":1,purchases:-1}}
]);

// M10 AGGREGATION: daily activity for the last 14 days.
db.events.aggregate([
  {$match:{ts:{$gte:new Date(Date.now()-14*24*3600*1000)}}},
  {$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$ts"}},events:{$sum:1}}},
  {$sort:{_id:1}}
]);

// M11 AGGREGATION: most common review tags ($unwind).
db.reviews.aggregate([
  {$unwind:"$tags"},
  {$group:{_id:"$tags",count:{$sum:1}}},
  {$sort:{count:-1}}
]);

// M12 INDEX EXPERIMENT: compare docs examined before and after compound index.
db.events.dropIndex("city_1_type_1");
db.events.find({city:"Khiva",type:"purchase"}).explain("executionStats");
db.events.createIndex({city:1,type:1});
db.events.find({city:"Khiva",type:"purchase"}).explain("executionStats");
