import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary  from 'cloudinary';
import mongoose from "mongoose";

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        // Check if this user already has a restaurant
        const existingRestaurant = await Restaurant.findOne({ user: req.userId });

        if(existingRestaurant) {
            res.status(409).json({ message: "User's restaurant already exists" });
            return;
        }

        const image = req.file as Express.Multer.File;
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = uploadResponse.url;
        // link current logged in user to this restaurant
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdated = new Date();
        await restaurant.save();

        res.status(201).send(restaurant);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            res.status(404).json({ message: "restaurant not found" });
        }
        res.json(restaurant);
        return;
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error fetching restaurant" });
    }
};

export default {
    createMyRestaurant,
    getMyRestaurant,
}