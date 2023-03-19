const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://CW2User:1HTS9Okx4nzZlgf2@cw2cluster.aywvxgz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
const db = client.db('Schoolclasses');
const collectionSubject = db.collection("subjects");
var data;
const port = 4000;

// logger middleware
app.use(function (req, res, next) {
    console.log(new Date() + " || request method: " + req.method + " || on url: " + req.url);
    next();
})


// static images middleware
app.use(express.static('static'))

app.get("/", (req, res) => {
    res.send("express server main route");
});

app.get("/lessons", (req, res) => {

    MongoClient.connect(uri, function (err, client) {
        if (err) {
            console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
        }
        console.log('Connected...');
        const collectionSubjects = client.db("Schoolclasses").collection("subjects");
        // perform actions on the collection object
        collectionSubjects.find({}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
            client.close();
        });
    });
});

 
app.post("/lessons", (req, res) => {

    client.connect(err => {
        
        // call collection object
        const collectionSubjects = client.db("Schoolclasses").collection("subjects");
        const collectionOrder = client.db("Schoolclasses").collection("order");
        
        /* 1.update the subjects collection and the subtract the lesson that been booked at the checkout */
        let order = [];
        let tempName = "initString";
        let temPhoneNumber = "initString";
        for (let i = 0; i < req.body.length; i++) {
            if(req.body[i].topic != null){
            collectionSubjects.updateOne({ topic: req.body[i].topic}, { $inc: { space:  - 1 } } );
            order.push({topic: req.body[i].topic, space:  1, price: req.body[i].price});
            }
            if(req.body[i].name || req.body[i].phoneNumber){
                tempName = req.body[i].name;
                temPhoneNumber = req.body[i].phoneNumber;
            }
            
        }
        
        /* 2.update the order collection and the add the lesson that been booked at the checkout */
        collectionOrder.insertOne({
            order,
            name: tempName,
            phoneNumber: temPhoneNumber
        });
        
        
    });
    client.close();
});

app.listen(port, () => {
    console.log("server is running on port: " + port);

});
