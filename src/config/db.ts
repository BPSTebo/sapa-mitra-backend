import * as mongoose from "mongoose";

const connectDB = async (): Promise<typeof mongoose> => {
  console.log("Connecting Database....");
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw "Please set mongo URI";
    }

    console.log("URI Database:", uri);

    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
