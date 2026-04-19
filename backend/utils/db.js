import mongoose from "mongoose";


export const connectDB= async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            connectTimeoutMS:10000,
            socketTimeoutMS:45000,
        })
        console.log(`MongoDB connected 👍`)   

    }catch(err)
    {
        console.error("Error from db.js:", err);
        process.exit(1);
    }
}