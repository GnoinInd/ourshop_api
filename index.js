const express = require('express');
const cors = require('cors');
require('./db/config');
const User = require("./db/User");
const Shopsadd = require("./db/Shopsadd")
const multer = require('multer')
const app = express();
const cloudinary = require('cloudinary');
const fileUpload = require('express-fileupload')
app.use(express.json());
const Shop = require("./db/Shop");
// const path = require('path');
// app.use(express.static('images'));
app.use(fileUpload())

cloudinary.config({
    cloud_name: 'deftpdfga',
    api_key: '675153757725399',
    api_secret: '3hzrtQXgbAA9g5sn712VefDEU_c'
});
// const images=require("../backend/image")

const allowedaorgins = ['http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedaorgins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('not allow by cors plicy'))
        }
    },
    methods: "GET, HEAD, PUT,PATCH, POST, DELETE",
    Credentials: true
}
app.use(cors(corsOptions));

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, '../backend/image');
//     },
//     filename: (req, file, callback) => {
//         callback(null, path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });


app.post("/signup", async (req, res) => {
    let user = new User(req.body)
    let result = await user.save();
    res.send(result);
})
app.post("/login", async (req, res) => {
    console.log(req.body)
    if (req.body.password && req.body.email) {
        //const email = req.body.email
        // let user = new User(req.body)
        let result = await User.findOne(req.body)
        console.log(result);
        if (result) {
            res.send(result);
        } else {
            res.send({ result: 'No User Found' });
        }
    } else {
        res.send({ result: 'Please try again latter' })
    }


})
app.post("/createshops", async (req, res) => {
    const { Name, location, city } = req.body;
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
        folder: 'image'
    })
    if (!Name || Name.trim() === '') {
        return res.status(400).json({ message: "Name is required", success: false });
    }
    console.log(req.body)
    const newImage = new Shopsadd({
        Name,
        location,
        city,
        image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    });
    console.log(newImage)
    await newImage.save();
    res.status(201).json({ message: "upload success", success: true });
});

app.get('/shops', async (req, res) => {
    try {
        const shops = await Shopsadd.find()
        // res.send(shops);
        // console.log(shops)
        res.status(200).json({ message: "success", success: true, shops });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(5000, () => {
    console.log('app is running on port 5000')
});
