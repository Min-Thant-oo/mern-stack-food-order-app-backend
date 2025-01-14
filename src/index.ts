import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";

mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => console.log('Connected to MongoDB'))

cloudinary.config({
    cloud_name: process.env.COULDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secrete: process.env.COULDINARY_API_SECRET,
})

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async(req: Request, res: Response) => {
    res.send({ message: "health is OK!" });
})
app.use('/api/my/user', myUserRoute)

app.listen(7000, () => {
    console.log('Server is running on port 7000');
});