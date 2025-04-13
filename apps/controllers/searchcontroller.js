const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const DatabaseConnection = require('../database/database');

router.get('/', async (req, res) => {
    const client = DatabaseConnection.getMongoClient();
    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const collection = db.collection('posts');

        const posts = await collection.find({}).toArray();
        res.render('search', { posts, searchText: '' }); 
    } catch (err) {
        res.render('search', { posts: [], searchText: '', error: 'Lỗi khi tải dữ liệu' });
    } finally {
        await client.close();
    }
});

router.post('/', async (req, res) => {
    const { location, priceFrom, priceTo, areaFrom, areaTo, amenities, searchText } = req.body;
    const client = DatabaseConnection.getMongoClient();

    try {
        await client.connect();
        const db = client.db('nhatro_db');
        const collection = db.collection('posts');

        let query = {};

        if (location) query.location = { $regex: location, $options: 'i' };
        if (searchText) query.title = { $regex: searchText, $options: 'i' };

        if (priceFrom || priceTo) {
            query.price = {};
            if (priceFrom) query.price.$gte = parseFloat(priceFrom);
            if (priceTo) query.price.$lte = parseFloat(priceTo);
        }

        if (areaFrom || areaTo) {
            query.area = {};
            if (areaFrom) query.area.$gte = parseInt(areaFrom);
            if (areaTo) query.area.$lte = parseInt(areaTo);
        }

        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            query.amenities = { $all: amenitiesArray };
        }

        const posts = await collection.find(query).toArray();
        res.render('search', { posts, searchText: searchText || '' }); 
    } catch (err) {
        res.render('search', { posts: [], searchText: searchText || '', error: 'Lỗi khi tìm kiếm' });
    } finally {
        await client.close();
    }
});

module.exports = router;