use("velora");

db.reviews.drop();
db.events.drop();

db.reviews.insertMany([
  { productId: 1, author: "Aziza", rating: 5, comment: "Great cotton and fit.", tags: ["quality","fit"], createdAt: new Date() },
  { productId: 1, author: "Malika", rating: 4, comment: "Nice basic T-shirt.", tags: ["quality"], createdAt: new Date() },
  { productId: 3, author: "Bekzod", rating: 5, comment: "Very warm hoodie.", tags: ["warmth","quality"], createdAt: new Date() },
  { productId: 5, author: "Jasur", rating: 4, comment: "Good denim, size is true.", tags: ["fit","quality"], createdAt: new Date() },
  { productId: 6, author: "Dilnoza", rating: 5, comment: "Elegant coat.", tags: ["style"], photos: ["coat-review.jpg"], createdAt: new Date() },
  { productId: 7, author: "Sevara", rating: 3, comment: "Light fabric, slightly oversized.", tags: ["fabric","fit"], createdAt: new Date() },
  { productId: 9, author: "Otabek", rating: 4, comment: "Useful pockets.", tags: ["design"], createdAt: new Date() },
  { productId: 12, author: "Zarina", rating: 5, comment: "Warm and lightweight.", tags: ["warmth"], createdAt: new Date() }
]);

const types = ["view","view","view","add_to_cart","add_to_cart","purchase"];
const cities = ["Tashkent","Samarkand","Bukhara","Namangan","Andijan","Fergana","Khiva","Nukus"];
const devices = ["android","ios","desktop"];
const pick = a => a[Math.floor(Math.random()*a.length)];

let batch = [];
for (let i=0; i<10000; i++) {
  batch.push({
    type: pick(types),
    productId: 1 + Math.floor(Math.random()*12),
    customerId: 1 + Math.floor(Math.random()*10),
    city: pick(cities),
    device: pick(devices),
    ts: new Date(Date.now()-Math.floor(Math.random()*90*24*3600*1000))
  });
  if (batch.length===1000) { db.events.insertMany(batch); batch=[]; }
}
if (batch.length) db.events.insertMany(batch);

db.reviews.createIndex({productId:1,createdAt:-1});
db.events.createIndex({type:1,ts:-1});
db.events.createIndex({city:1,type:1});
db.events.createIndex({productId:1});

print("reviews:",db.reviews.countDocuments(),"events:",db.events.countDocuments());
