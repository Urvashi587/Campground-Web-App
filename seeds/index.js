const mongoose=require('mongoose')
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')
const Campground=require('../models/campground')
mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("connection done")
});
const sample=(array)=>{
    return array[Math.floor(Math.random()*array.length)]
}
const seedDb=async ()=>{
    await Campground.deleteMany({})
    for (let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'67e302721e5bbd86de024941',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe, reiciendis sequi omnis nulla pariatur quae excepturi doloribus iusto enim optio, distinctio autem inventore officia ipsam dolore esse facilis dolorum velit?',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dmw7lpgqv/image/upload/v1741757149/YelpCamp/rk7sau2atcr0cjbxndsk.jpg',
                  filename: 'YelpCamp/rk7sau2atcr0cjbxndsk',
                },
                {
                    url:'https://res.cloudinary.com/dmw7lpgqv/image/upload/v1741757149/YelpCamp/dip4gwe1chbhoggxpvnk',
                    filename:'YelpCamp/dip4gwe1chbhoggxpvnk',
                }

            ],
            geometry:{
                type:"Point",
                coordinates:[cities[random1000].longitude,cities[random1000].latitude],
                
            }
            
        })
        await camp.save();
    }
}
seedDb().then(()=>{
    mongoose.connection.close();
})