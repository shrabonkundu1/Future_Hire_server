const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()


const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json());

// Future_Hire
// FjiQvDvW4AEpbYpG



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jod42.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const jobsCollection = client.db("jobPortal").collection("job")
    const jobApplicationCollection = client.db('jobPortal').collection('job_Applications')


    // -----------All JObs
    // app.get('/jobs', async(req,res)=> {
    //     const cursor = jobsCollection.find();
    //     const result = await cursor.toArray();
    //     res.send(result);
    // })

    // verify email jobs card 
    app.get('/jobs', async(req,res)=> {

      const email = req.query.email;
      let query={};
      if(email){
        query= {hr_email:email}
      }
        const cursor = jobsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    //--------------Single job details
    app.get('/jobs/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })


    // email dia find korlam 
    app.get('/job_applications', async(req,res) => {
      const email = req.query.email;
      const query = {applicant_email: email};
      const result = await jobApplicationCollection.find(query).toArray();

      for(const application of result){
        // console.log(application.job_id)
        const query1 = {_id : new ObjectId(application.job_id)}
        const job = await jobsCollection.findOne(query1)
        if(job){
          application.title = job.title;
          application.company = job.company;
          application.company_logo = job.company_logo;
          application.location = job.location;
          
        }
      }
      res.send(result);
    })

    app.post('/job_applications',async(req,res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);


      // id milaye koto jon job e apply korlo seta kivabe ber korte hoi nomuna: not main code 
      const id = application.job_id;
      const query = {_id : new ObjectId(id)}
      const job  = await jobsCollection.findOne(query)

      let newCount = 0;
      if(job.applicationCount){
        newCount = job.applicationCount + 1;
      }else{
        newCount = 1 ;
      }

      // 
      // now update the jobInfo:
      const filter  = {_id : new ObjectId(id)}
      const updatedDoc = {
        $set:{ 
          applicationCount : newCount
        }
      }

      const updatedResult =  await jobsCollection.updateOne(filter,updatedDoc)
      // end


      res.send(result);
    })

    app.post('/jobs',async(req,res) => {
      const newJob  = req.body ;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result)
    })


    app.get('/job_application/jobs/:job_id' , async(req,res) =>{
      const jobId = req.params.job_id;
      const query = {job_id : jobId};
      const result = await jobApplicationCollection.find(query).toArray();
      res.send(result);
    })

    // my application delete function 
    app.delete('/job_applications/:id',async(req,res)=> {
      const id  = req.params.id;
      const query = {_id: new ObjectId(id) }
      const result = await jobApplicationCollection.deleteOne(query);
      res.send(result);
    })


    // job application status update :
    app.patch('/job_application/:id', async(req,res) =>{

      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const data = req.body;
      const updateDoc ={
        $set:{
          status: data.status
        }
      }
      const result = await jobApplicationCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=> {
    res.send('Job is falling from sky');
})

app.listen(port, ()=> {
    console.log(`port is running successfully : ${port}`)
})