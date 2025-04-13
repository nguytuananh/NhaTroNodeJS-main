var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var Room = require("./../model/room"); 
var RoomService = require("./../services/roomService"); 

router.get("/", function (req, res) {
    res.render("post.ejs");
});

router.get("/room-list", async function (req, res) {
    var roomService = new RoomService();
    var rooms = await roomService.getRoomList();
    res.json(rooms);
});

router.get("/get-room", async function (req, res) {
    var roomService = new RoomService();
    var room = await roomService.getRoom(req.query.id);
    res.json(room);
});

router.post("/insert-room", async function (req, res) {
    var roomService = new RoomService();
    var room = new Room();
    room.title = req.body.title;
    room.location = req.body.location;
    room.price = req.body.price;
    room.area = req.body.area;
    room.description = req.body.description;
    room.amenities = req.body.amenities; 
    room.images = req.body.images; 
    room.owner = req.body.owner || "user-id"; 
    var result = await roomService.insertRoom(room);
    res.json({ status: true, message: "Đăng tin thành công" });
});

router.post("/update-room", async function (req, res) {
    var roomService = new RoomService();
    var room = new Room();
    room._id = new ObjectId(req.body.id); 
    room.title = req.body.title;
    room.location = req.body.location;
    room.price = req.body.price;
    room.area = req.body.area;
    room.description = req.body.description;
    room.amenities = req.body.amenities;
    room.images = req.body.images;
    room.owner = req.body.owner || "user-id";

    await roomService.updateRoom(room);
    res.json({ status: true, message: "Cập nhật thành công" });
});

router.delete("/delete-room", async function (req, res) {
    var roomService = new RoomService();
    await roomService.deleteRoom(req.query.id);
    res.json({ status: true, message: "Xóa thành công" });
});

module.exports = router;