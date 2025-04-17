import mongoose from "mongoose";

const connectionToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        console.log("MongoDB Connected");
    }catch(err) {
        console.log(err);
    }
}
export default  connectionToDatabase;