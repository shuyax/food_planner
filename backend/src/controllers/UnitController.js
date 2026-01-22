const UnitService = require("../services/UnitService");

async function getUnits(req, res, next) {
  try {
    const units = await UnitService.getAllUnits();
    res.json(units);
  } catch (err) {
    next(err);
  }
}

module.exports = {
    getUnits
};
