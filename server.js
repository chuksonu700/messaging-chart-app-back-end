import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cors from 'cors';
import Messages from './models/dbMessages.js';
import Pusher  from "pusher";


//initial setup
const app = express();
const PORT = process.env.PORT || 9000;
dotenv.config();

//Middleware
app.use(express.json());

app.use(Cors());
//DB Config
const connection_url = process.env.MONGO_URL;
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//pUsher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true
});


// pusher.trigger("my-channel", "my-event", {
//   message: "hello world"
// });



//API Endpoints
const db = mongoose.connection;
db.once("open",()=>{
    console.log("connected")
    const msgCollection = db.collection("messagingmessages"); 
    const changeStream = msgCollection.watch();
    changeStream.on("change", change =>{
        console.log(change)
        if (change.operationType==="insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                recieved: messageDetails.recieved
            })
        } else {
            console.log('Error trigerring Pusher')
        }
    })
})

app.get('/', (req, res) => {
    res.status(200).send("Welcome to the ")
})


//saving a 
app.post('/messages/new',(req,res)=>{
    const newMessage = req.body;
    Messages.create(newMessage,(err,data)=>{
        if (err){
            res.status(501).send(err)
        } else{
            res.status(201).send(data)
        }
    })
})
// getting
app.get('/messages/sync',(req,res)=>{
    
    Messages.find((err,data)=>{
        if (err){
            res.status(501).send(err)
        } else{
            res.status(201).send(data)
        }
    })
})

//LIstener
app.listen(PORT, () => {
    console.log(`server up and running on port${PORT}`)
})