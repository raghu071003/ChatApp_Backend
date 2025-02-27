import mongoose from "mongoose";

const DB_NAME = "ChatterBox"
const connectDb = async()=>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("Connected to database!")
    } catch (error) {
        console.log(error);
    }
}

export default connectDb;