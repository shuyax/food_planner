const express = require("express");
const router = express.Router();
const UnitController = require("../controllers/UnitController");

router.get("/", UnitController.getUnits);

module.exports = router;