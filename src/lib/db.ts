import mongoose from "mongoose";
const mongodbUri = process.env.MONGODB_URI

if (!mongodbUri) {
  throw new Error("MONGODB_URI is not defined in the environment variables.");
}

let cached = global.mongooseConn;

if(!cached) {
   cached = global.mongooseConn = {
    conn: null,
    promise: null
  }
}

const connectDb = async()=>{
  if(cached.conn){
    return cached.conn;
  }

  if(!cached.promise) {
    cached.promise = mongoose.connect(mongodbUri).then(c=> c.connection);
  }
  try{
    const conn = await cached.promise
    return conn
  } catch(error){
    console.log("Error connecting to MongoDB:", error);
  }
}

export default connectDb;