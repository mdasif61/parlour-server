const express=require('express')
const app=express();
const port=process.env.PORT || 5000;
const cors=require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Woman Parlour Running')
})
// parlour
// qX82SUYDvg6zmAtI


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://parlour:qX82SUYDvg6zmAtI@cluster0.kuomool.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    const serviceCollection=client.db('woman_parlour').collection('services');

    // service api
    app.get('/services',async(req,res)=>{
        const limit=parseInt(req.query?.limit) || 3
        const result=await serviceCollection.find().limit(limit).toArray()
        res.send(result)
    })

    // total services count
    app.get('/total-services',async(req,res)=>{
        const result=await serviceCollection.estimatedDocumentCount();
        res.send({total:result})
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('women parlour server running port : ',port)
})