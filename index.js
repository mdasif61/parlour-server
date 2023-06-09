const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const stripe=require('stripe')(process.env.PAYMENT_KEY)
const jwt = require('jsonwebtoken')
require("dotenv").config();

app.use(cors({
  origin:'*',
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Woman Parlour Running");
});
// parlour
// qX82SUYDvg6zmAtI

const verifyJWT=(req,res,next)=>{
  const authorization=req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error:true, message:'unauthorized'})
  }
  const token=authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (error,decoded)=>{
    if(error){
      return res.status(401).send({error:true, message:'unauthorized'})
    }
    req.decoded=decoded;
    next()
  })
}

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://parlour:qX82SUYDvg6zmAtI@cluster0.kuomool.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const userCollection = client.db("woman_parlour").collection("users");
    const serviceCollection = client.db("woman_parlour").collection("services");
    const bookedCollection = client.db("woman_parlour").collection("booked");

    app.post('/jwt',(req,res)=>{
      const loggedUser=req.body;
      const token=jwt.sign(loggedUser,process.env.ACCESS_TOKEN, {expiresIn:'1h'});
      res.send({token})
    })

    // total services count
    app.get("/total-services", async (req, res) => {
      const result = await serviceCollection.estimatedDocumentCount();
      res.send({ total: result });
    });

    // service api
    app.get("/services", async (req, res) => {
      const limit = parseInt(req.query?.limit) || 3;
      const result = await serviceCollection.find().limit(limit).toArray();
      res.send(result);
    });

    // unique bookings api
    app.get('/bookings/:id',verifyJWT,async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await serviceCollection.findOne(query);
      res.send(result)
    })
    // get users
    app.get('/users',async(req,res)=>{
      const result=await userCollection.find().toArray()
      res.send(result)
    })

    // user post api
    app.post('/users',async(req,res)=>{
      const user=req.body;
      const result=await userCollection.insertOne(user)
      res.send(result)
    })

    // booked service post
    app.post('/booked',verifyJWT,async(req,res)=>{
      const bookService=req.body;
      const result=await bookedCollection.insertOne(bookService);
      res.send(result)
    })

    // booked service get
    app.get('/booked',verifyJWT,async(req,res)=>{
      let query={}
      if(req.query?.email){
        query={email:req.query.email}
      }
      const result=await bookedCollection.find(query).toArray()
      res.send(result)
    })
    
    app.delete('/booked/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await bookedCollection.deleteOne(query);
      res.send(result)
    })

    // delete service
    app.delete('/booked/:id',async(req,res)=>{
      const id = req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await bookedCollection.deleteOne(query)
      res.send(result)
    })

    // payment intent
    // app.post('/payment-intent',async(req,res)=>{
    //   const {price}=req.body;
    //   const amount=parseInt(price*100);
    //   const paymentIntent=await stripe.paymentIntents.create({
    //     amount:amount,
    //     currency:'usd',
    //     payment_method_types:['card']
    //   })
    //   res.send({clientSecret:paymentIntent.secret})
    // })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("women parlour server running port : ", port);
});
