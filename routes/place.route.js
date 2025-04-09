const express = require('express');
const placeCtrl = require('../controllers/place.controller.js');
const router = express.Router();

// Route definitions
router.post("/", placeCtrl.uploadPlace, placeCtrl.createPlace);
router.put("/:placeId", placeCtrl.uploadPlace, placeCtrl.editPlace);
router.get("/all/:userId", placeCtrl.getAllPlacebyId);  // Ensure `getAllPlace` is a function in the controller
router.get("/one/:placeId", placeCtrl.getPlace);  // Ensure `getPlace` is a function in the controller
router.get("/all", placeCtrl.getAllPlaces); // Ensure `getAllPlace` is a function in the controller
router.delete("/:placeId", placeCtrl.deletePlace); // Ensure `deletePlace` is a function in the controller

module.exports = router;
