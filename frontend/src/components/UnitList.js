import { fetchUnits } from "../services/UnitService"
import { useQuery } from "@tanstack/react-query";

function UnitList({ selectedUnit, setSelectedUnit }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["units"],
        queryFn: fetchUnits
    })
    if (isLoading) return <p>Loading units...</p>;
    if (error) return <p>Error loading units: {error.message}</p>;

    function handleOnChange(e) {
        const flattened = Object.values(data).flat();
        const selected = flattened.find(
            i => i.name === e.target.value
        );
        if (!selected) return;
        setSelectedUnit(selected)
    }

    return (<>
        <label htmlFor="canonical-unit">Ingredient Unit: </label>
        <select name="canonical-unit" 
            id="canonical-unit" 
            value={selectedUnit.name} 
            onChange={(e) => handleOnChange(e)}
        >
            <option value="">-- Select a unit --</option>
            {Object.keys(data).map(unitType => (
                <optgroup key={unitType} label={unitType}>
                    {data[unitType].map(unit => (
                        <option key={unit.id} value={unit.name}>{unit.name} ({unit.abbreviation})</option>
                    ))}
                </optgroup>
            ))}
        </select>
    </>)
}

export default UnitList