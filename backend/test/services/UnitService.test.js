const pool = require('../../database/pool');
const { 
    getAllUnits, 
    convertCanonicalUnitToBaseUnit
} = require('../../src/services/UnitService');

describe('Unit get service', () => {
    test('getAllUnits returns a list of all existing unit ids, names, abbreviations, and unit type, ordered by first unit_type and then name', async () => {
        const units = await getAllUnits();
        expect(units).not.toBeNull();
        expect(units.length).toBe(16);
        expect(units[0].name).toBe('piece');
        expect(units[0].id).toBe(6);
        expect(units[0].abbreviation).toBe('pcs');
        expect(units[0].unit_type).toBe('count');
    });

    test('convertCanonicalUnitToBaseUnit returns a quantity of a base unit which equals to the quantity of a canonical_unit', async () => {
        const canonicalUnitId = 9; //tbsp
        const canonicalUnitQuantity = 2;
        const { baseUnitId, baseUnitName, baseUnitQuantity } = await convertCanonicalUnitToBaseUnit(canonicalUnitId, canonicalUnitQuantity); // convert to base unit ml
        expect(baseUnitId).toBe(4);
        expect( baseUnitName ).toBe('ml');
        expect( baseUnitQuantity ).toBeCloseTo(2 * 14.7868); 
    })
});