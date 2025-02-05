import { Request, RequestHandler, Response } from "express";
import User from "../models/user";

const createCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { auth0Id } = req.body;
        const existingUser = await User.findOne({ auth0Id });

        if(existingUser) {
            res.status(200).send();
            return;
        };

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser.toObject());
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating user" });
    }
};

const updateCurrentUser: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { name, addressLine1, country, city } = req.body;

        // jwtParse added userId to the req body
        const user = await User.findById(req.userId);

        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.name = name;
        user.addressLine1 = addressLine1;
        user.city = city;
        user.country = country;

        await user.save();

        res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" });
    }
};

const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // looking for a document where the _id field matches req.userId
        // same as "await User.findById(req.userId)"
        const currentUser = await User.findOne({ _id: req.userId })
        if(!currentUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json(currentUser);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong!" });
        return;
    }
}

export default {
    createCurrentUser,
    updateCurrentUser,
    getCurrentUser,
};