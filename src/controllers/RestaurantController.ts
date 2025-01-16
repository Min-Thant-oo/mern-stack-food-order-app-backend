import { Request, Response } from 'express';
import Restaurant from '../models/restaurant';

const searchRestaurant = async (req: Request, res: Response) => {
    try {   
        const city = req.params.city;

        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = (req.query.selectedCuisines as string) || "";
        const sortOption = (req.query.sortOption as string) || "lastUpdated";
        const page = parseInt(req.query.page as string) || 1;

        let query: any = {};
        // RegExp i -> London = london = LONDON
        query["city"] = new RegExp(city, "i");
        const cityCheck = await Restaurant.countDocuments(query);
        if (cityCheck === 0) {
            res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1,
                },
            });
            return;
        }

        if (selectedCuisines) {
            // URL = selectedCuisines = itealian, burgers, chinese
            // [italian, burgers, chinese]
            const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"));
      
            query["cuisines"] = { $all: cuisinesArray };
        }

        if (searchQuery) {
            // searchQuery = Pasta
            
            // restaurantName = Pizza Palace
            // cuisines of this restaurant = [Pizza, pasta, italian]
            const searchRegex = new RegExp(searchQuery, "i");
            query["$or"] = [
              { restaurantName: searchRegex },
              { cuisines: { $in: [searchRegex] } },
            ];
        }

        // pageSize = perPage
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        // sortOption = "lastUpdated"
        // 1 = ascending order
        // -1 = descending order
        const restaurants = await Restaurant.find(query)
            .sort({ [sortOption]: 1 })
            .skip(skip)
            .limit(pageSize)
            .lean() // strip out mongo db id & all meta data and return plain js object

        const total = await Restaurant.countDocuments(query);

        const response = {
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / pageSize), //50 total results, pageSize = 10 >>> pages = 5 
            },
        };
    
        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

export default {
    searchRestaurant,
};