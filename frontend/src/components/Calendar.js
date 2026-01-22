import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from "react";
import { fetchMeals } from "../services/MealService"

/**
 * Calendar component
 *
 * modes:
 * - "browse": Home page
 * - "add": Add meal page (single-day view)
 */


function Calendar({
    mode, // "browse" | "add"
    selectedDate, // YYYY-MM-DD (required in add mode)
    onAddMeal, // (date) => void (browse mode)
    onDateChange, // (date) => void (add mode)
    refreshTrigger 
}) {
    // const [dateRange, setDateRange] = useState(getCurrentWeekRange());
    const [events, setEvents] = useState([]);

    function getCurrentWeekRange() {
        const today = new Date()
        const day = today.getDay() // 0 = Sunday

        const start = new Date(today)
        start.setDate(today.getDate() - day)

        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        return {
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10)
        }
    }

    const MEAL_COLORS = {
        breakfast: '#FACC15', // yellow
        lunch: '#4ADE80',     // green
        dinner: '#60A5FA',    // blue
        snack: '#FB7185',     // pink/red
        drink: '#A78BFA'      // purple
    };
    const MEAL_ORDER = {
        breakfast: 1,
        lunch: 2,
        dinner: 3,
        snack: 4,
        drink: 5
    };
    
    // if month view, show meal type only; otherwise, also display foods
    function renderMealEvent(arg) {
        const { type } = arg.view
        const { title, extendedProps } = arg.event;
        if (type === 'dayGridMonth') return <strong>{title}</strong>; 
        return (
          <>
            <strong>{title}</strong>
            <ul className='meal-food'>
              {extendedProps.foods.map(food => (
                <li key={food.foodId}>
                  {food.foodName}
                </li>
              ))}
            </ul>
          </>
        );
    };

    function mapMealsToEvents(meals) {

        const events = [];
        Object.entries(meals).forEach(([date, mealsByType]) => {
            Object.entries(mealsByType).forEach(([mealType, foods]) => {
            // Combine all food names into one string
            events.push({
                id: `${date}-${mealType}`,
                title: mealType.toUpperCase(), // show meal type + foods
                start: date,
                allDay: true,
                backgroundColor: MEAL_COLORS[mealType] || "#94A3B8",
                borderColor: MEAL_COLORS[mealType] || "#94A3B8",
                extendedProps: {
                    foods: foods.map(f => ({
                        foodId: f.food_id,
                        foodName: f.food_name,
                        description: f.food_description
                    }
                )),
                order: MEAL_ORDER[mealType]
                }
            });
            });
        });
        console.log(events)
        return events;
    };

    // Update events whenever calendar view changes; fetch new meal data
    const handleDatesSet = async (info) => {
        const start = info.startStr;
        const end = new Date(info.end);
        end.setDate(end.getDate() - 1);
        const endStr = end.toISOString().slice(0, 10);
        try {
            const meals = await fetchMeals(start, endStr);
            setEvents(mapMealsToEvents(meals));
        } catch (err) {
            console.error("Failed to fetch meals:", err);
            setEvents([]);
        }
    };

    
    /* --------------------------------------------------
        Add mode: fetch only one day
    -------------------------------------------------- */
    useEffect(() => {
        if (mode !== "add" || !selectedDate) return;
        (async () => {
            try {
                const meals = await fetchMeals(selectedDate, selectedDate);
                setEvents(mapMealsToEvents(meals));
            } catch (err) {
                console.error("Failed to fetch meals:", err);
                setEvents([]);
            }
        })();
    }, [mode, selectedDate, refreshTrigger]);
    /* --------------------------------------------------
     Handlers
    -------------------------------------------------- */

    const handleDateClick = (info) => {
        if (mode === "add" && onDateChange) {
            onDateChange(info.dateStr);
        }
    };

    const handleSelect = async (selectionInfo) => {
        const start = selectionInfo.startStr;
        const endDateObj = new Date(selectionInfo.end);
        endDateObj.setDate(endDateObj.getDate() - 1); // adjust because FullCalendar end is exclusive
        const end = endDateObj.toISOString().slice(0, 10);

        // Fetch meals for the selected range
        try {
            const meals = await fetchMeals(start, end);
            setEvents(mapMealsToEvents(meals));
        } catch (err) {
            console.error("Failed to fetch meals:", err);
            setEvents([]);
        }

        // Optionally switch the view to show only selected days
        const calendarApi = selectionInfo.view.calendar;
        const dayDiff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
        if (dayDiff === 1) calendarApi.changeView('dayGridDay', start);
        else if (dayDiff <= 7) calendarApi.changeView("dayGridWeek", start);
        else calendarApi.changeView("dayGridMonth", start);
    };

    // Custom content for day cells
    const renderDayCell = (info) => {
        const dateStr = info.date.toISOString().split("T")[0];
        return (<>
            <div>{info.dayNumberText}</div>
            {mode === 'browse' && (
                <button
                    className='add-meal-btn'
                    style={{ marginTop: "4px", fontSize: "10px" }}
                    onClick={() => onAddMeal(dateStr)}
                >
                + Add Meal
                </button>
            )}
        </>);
    };

    
    return (<FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={mode === "add" ? "dayGridDay" : "dayGridWeek"}
        initialDate={mode === "add" ? selectedDate : getCurrentWeekRange.startDate} 
        headerToolbar={mode === "add" ? {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridDay'
        }:{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
        selectable={mode === "browse"}              // ✅ enable selection
        selectMirror={mode === "browse"}             // shows the selection visually
        select={handleSelect}          // handler when user selects
        datesSet={handleDatesSet}
        dateClick={handleDateClick}
        events={events}
        height="auto"
        eventContent={renderMealEvent}
        eventOrder="extendedProps.order"
        dayCellContent={renderDayCell} // <-- add button in each day cell
    />);
};

export default Calendar;