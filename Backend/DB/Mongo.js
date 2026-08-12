import mongoose from "mongoose";

const DBUri = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    console.log("Trying to connect DB");

    const connection = await mongoose.connect(DBUri);

    console.log("Mongo DB connected");

  } catch (err) {
    console.log("Mongo DB connection", err.message);
  }
};

export default connectDB;