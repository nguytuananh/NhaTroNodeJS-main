var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const DatabaseConnection = require('../database/database');
const { ObjectId } = require('mongodb');

const secretKey = 'your-secret-key';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

function isAuthenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.render('post', { isLoggedIn: false });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.render('post', { isLoggedIn: false });
    }
}

router.get("/", isAuthenticated, (req, res) => {
    res.render("post", { isLoggedIn: true });
});

router.post("/", isAuthenticated, upload.array('images', 5), async (req, res) => {
    const { title, location, price, area, description, amenities, latitude, longitude } = req.body;
    const files = req.files || [];

    const imagePaths = files.map(file => `/images/${file.filename}`);

    const post = {
        title,
        location,
        price: parseFloat(price),
        area: parseInt(area),
        description,
        amenities: Array.isArray(amenities) ? amenities : [amenities],
        images: imagePaths.length > 0 ? imagePaths : [],
        coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        },
        userId: req.user.id,
        createdAt: new Date()
    };

    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const collection = db.collection('posts');
        const result = await collection.insertOne(post);
        res.redirect('http://localhost:3000');
    } catch (err) {
        res.render('post', { isLoggedIn: true, error: 'Lỗi khi đăng tin: ' + err.message });
    } finally {
        await client.close();
    }
});

router.get("/:id", async (req, res) => {
    const postId = req.params.id;
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const collection = db.collection('posts');
        const usersCollection = db.collection('users');
        const post = await collection.findOne({ _id: new ObjectId(postId) });

        if (!post) {
            return res.status(404).send("Bài đăng không tồn tại");
        }

        const user = await usersCollection.findOne({ _id: new ObjectId(post.userId) });
        if (user) {
            post.username = user.username; 
            post.email = user.email;
        } else {
            post.username = 'Không xác định'; 
            post.email = 'Không có thông tin';
        }

        res.render("detail", { post: post });
    } catch (err) {
        res.status(500).send("Lỗi server");
    } finally {
        await client.close();
    }
});

module.exports = router;