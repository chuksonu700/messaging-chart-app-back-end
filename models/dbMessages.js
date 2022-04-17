import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    name:String,
    message:String,
    timestamp:String,
    recieved:Boolean
})

export default mongoose.model('messagingmessages', messageSchema);
