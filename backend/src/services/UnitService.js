// table: units

const pool = require('../../database/pool');

async function getAllUnits() {
    const { rows: unitRows } = await pool.query(
        `SELECT id, name, abbreviation, unit_type
        FROM units
        ORDER BY unit_type::text, name ASC`
    );
    return unitRows;
};

async function convertCanonicalUnitToBaseUnit(canonical_unit_id, canonical_unit_quantity) {
    const { rows: unitRows } = await pool.query(
        `SELECT base_unit, conversion_factor
        FROM units
        WHERE id=$1`,
        [canonical_unit_id]
    );
    const { rows: idRows } = await pool.query(
        `SELECT id FROM units
        WHERE abbreviation=$1`,
        [unitRows[0].base_unit]
    )
    return {
        baseUnitId: idRows[0].id,
        baseUnitName: unitRows[0].base_unit,
        baseUnitQuantity: Number(unitRows[0].conversion_factor) * canonical_unit_quantity
    };
}

module.exports = {
    getAllUnits,
    convertCanonicalUnitToBaseUnit
}