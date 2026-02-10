import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMeals, fetchRelatedFoods } from '../services/MealService';
import "./Calendar.css"

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

/**
 * Calendar
 * - browse mode: week/month navigation
 * - add mode: single-day focus
 */

function Calendar({ setEditingMeal, setModalOpen, editDate, refreshTrigger }) {
  const navigate = useNavigate();
  const location = useLocation();
  const calendarRef = useRef(null);


  const mode = location.pathname === '/' ? 'browse' : 'add';

  /* ------------------------------
     Visible date range (source of truth)
  ------------------------------ */
  const [range, setRange] = useState(() => {
    if (mode === 'add' && editDate) {
      return { start: editDate, end: editDate };
    }
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });

  /* ------------------------------
     React Query — SINGLE fetch path
  ------------------------------ */
  const { data: meals = [] } = useQuery({
    queryKey: ['meals', range.start, range.end, refreshTrigger],
    queryFn: async () => {
      const baseMeals = await fetchMeals(range.start, range.end);
      return Promise.all(
        baseMeals.map(async (meal) => ({
          ...meal,
          foods: await fetchRelatedFoods(meal.meal_id),
        }))
      );
    },
    enabled: Boolean(range.start && range.end),
    staleTime: 1000 * 60 * 5,
  });

  /* ------------------------------
     Map meals → FullCalendar events
  ------------------------------ */
  const events = useMemo(() => {
    console.log(meals)
    return meals.map((meal) => ({
      id: `${meal.meal_date}-${meal.meal_type}`,
      title: meal.meal_type.toUpperCase(),
      start: meal.meal_date,
      allDay: true,
      backgroundColor: MEAL_COLORS[meal.meal_type] ?? '#94A3B8',
      borderColor: MEAL_COLORS[meal.meal_type] ?? '#94A3B8',
      extendedProps: {
        date: meal.meal_date,
        mealType: meal.meal_type,
        mealId: meal.meal_id,
        foods: meal.foods.map((f) => ({
          foodId: f.food_id,
          foodName: f.name,
          description: f.description,
          mealFoodId: f.meal_food_id,
        })),
        order: MEAL_ORDER[meal.meal_type],
      },
    }));
  }, [meals]);

  /* ------------------------------
     Event rendering (memoized)
  ------------------------------ */
  const renderMealEvent = useCallback(
    (arg) => {
      const { type } = arg.view;
      const { title, extendedProps } = arg.event;
      console.log(extendedProps.foods)

      if (type === 'dayGridMonth') {
        return <strong>{title}</strong>;
      }

      if (mode === 'add' && type === 'dayGridDay') {
        return (
          <div className="fc-event-main-btn-browse">
            <strong>{title}</strong>
            <ol id={`meal-food-${title.toLowerCase()}-${mode}`} className={`meal-food-${mode}`}>
              {extendedProps.foods.map((food) => (
                <li
                  key={food.foodId}
                //   onClick={(e) => {
                //     e.stopPropagation();
                //     navigate(`/edit-food/${food.foodId}`);
                //   }}
                  style={{ cursor: 'pointer' }}
                >
                  {food.foodName}
                </li>
              ))}
            </ol>
          </div>
        );
      }

      return (
        <>
          <strong>{title}</strong>
          <ol id={`meal-food-${title.toLowerCase()}-${mode}`} className={`meal-food-${mode}`}>
            {extendedProps.foods.map((food) => (
              <li key={food.foodId}>{food.foodName}</li>
            ))}
          </ol>
        </>
      );
    },
    [mode, navigate]
  );

  /* ------------------------------
     Handlers (no fetching here)
  ------------------------------ */
  const handleDatesSet = useCallback((info) => {
    if (mode === 'add') return;

    const start = info.startStr;
    const end = new Date(info.end);
    end.setDate(end.getDate() - 1);

    setRange({
      start,
      end: end.toISOString().slice(0, 10),
    });
  }, [mode]);

  const handleDateClick = useCallback(
    (info) => {
      if (mode === 'browse') {
        navigate(`/add-meal?date=${info.dateStr}`);
      }
    },
    [mode, navigate]
  );

  useEffect(() => {
    if (!calendarRef.current) return;

    const api = calendarRef.current.getApi();

    if (mode === 'browse') {
        api.changeView('dayGridWeek');
        api.gotoDate(new Date()); // current week
    }

    if (mode === 'add' && editDate) {
        api.changeView('dayGridDay');
        api.gotoDate(editDate);
    }
  }, [mode, editDate]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView={mode === 'add' ? 'dayGridDay' : 'dayGridWeek'}
      ref={calendarRef}
      headerToolbar={
        mode === 'add'
          ? { left: '', center: 'title', right: '' }
          : {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay',
            }
      }
      events={events}
      eventContent={renderMealEvent}
      eventOrder="extendedProps.order"
      dateClick={handleDateClick}
      datesSet={handleDatesSet}
      selectable={mode === 'browse'}
      height="auto"
      eventClick={ (info) => {
        if (mode === "browse") {
            // navigate to the add-meal page for that date
            navigate(`/add-meal?date=${info.event.startStr}`);
            return;
        }
        if (mode === "add") {
            const e = info.event.extendedProps;
            setEditingMeal({
            date: e.date,
            mealType: e.mealType,
            mealId: e.mealId,
            foods: e.foods,
            });
            setModalOpen(true);
        }
      }}
    />
  );
}

export default Calendar;


// import FullCalendar from '@fullcalendar/react'
// import dayGridPlugin from '@fullcalendar/daygrid'
// import interactionPlugin from '@fullcalendar/interaction'
// import { useEffect, useState } from "react";
// import { fetchMeals, fetchRelatedFoods } from "../services/MealService"
// import { useNavigate } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';

// function getCurrentWeekRange() {
//     const today = new Date()
//     const day = today.getDay() // 0 = Sunday

//     const start = new Date(today)
//     start.setDate(today.getDate() - day)

//     const end = new Date(start)
//     end.setDate(start.getDate() + 6)

//     return {
//         startDate: start.toISOString().slice(0, 10),
//         endDate: end.toISOString().slice(0, 10)
//     }
// }

// /**
//  * Calendar component
//  *
//  * modes:
//  * - "browse"
//  * - "add"
//  * setEditingMeal, setModalOpen, editDate, refreshTrigger are used only on add mode
//  */

// function Calendar({ setEditingMeal, setModalOpen, editDate, refreshTrigger }) {
    
//     const [events, setEvents] = useState([]);
//     const navigate = useNavigate();
//     const location = useLocation();

//     // derive mode from URL
//     const mode = location.pathname === "/" ? "browse" : "add";


//     // if month view, show meal type only; otherwise, also display foods
//     function renderMealEvent(arg) {
//         const { type } = arg.view
//         const { title, extendedProps } = arg.event;
//         if (type === 'dayGridMonth') return <strong>{title}</strong>; 

//         if (mode === 'browse') return (
//           <div className='fc-event-main-btn-browse'>
//             <strong>{title}</strong>
//             <ol className='meal-food'>
//               {extendedProps.foods.map(food => (
//                 <li key={food.foodId}
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         navigate(`/edit-food/${food.foodId}`)
//                     }}
//                     style={{ cursor: "pointer" }}
//                 >
//                   {food.foodName}
//                 </li>
//               ))}
//             </ol>
//           </div>
//         );
//         if (mode === 'add') {
//             return (<>
//                 <strong>{title}</strong>
//                 <ol className='meal-food'>
//                 {extendedProps.foods.map(food => (
//                     <li key={`${extendedProps.date}-${extendedProps.mealType}-${food.foodId}`} id={`${extendedProps.date}-${extendedProps.mealType}-${food.foodId}`}>
//                     {food.foodName}
//                     </li>
//                 ))}
//                 </ol>
//             </>);
//         }
//     };
//     function mapMealsToEvents(meals) {
//         const events = [];
//         meals.forEach(meal => {
//             const mealId = meal.meal_id
//             const mealType = meal.meal_type;
//             const date = meal.meal_date
//             const foods = meal.foods ?? [];

//             events.push({
//                 id: `${date}-${mealType}`,
//                 title: mealType.toUpperCase(), // show meal type + foods
//                 start: date,
//                 allDay: true,
//                 backgroundColor: MEAL_COLORS[mealType] || "#94A3B8",
//                 borderColor: MEAL_COLORS[mealType] || "#94A3B8",
//                 extendedProps: {
//                     date,
//                     mealType,
//                     mealId,
//                     foods: foods.map(f => ({
//                         foodId: f.food_id,
//                         foodName: f.name,
//                         description: f.description,
//                         mealFoodId: f.meal_food_id
//                     })),
//                     order: MEAL_ORDER[mealType]
//                 }
//             })
//         })
//         return events;
//     };

//     // Update events whenever calendar view changes; fetch new meal data
//     const handleDatesSet = async (info) => {
//         const start = info.startStr;
//         const end = new Date(info.end);
//         end.setDate(end.getDate() - 1);
//         const endStr = end.toISOString().slice(0, 10);
//         try {
//             const meals = await fetchMeals(start, endStr);
//             const mealFoods = await Promise.all(meals.map(async meal => {
//                 const relatedFoods = await fetchRelatedFoods(meal.meal_id)
//                 return{
//                     ...meal,
//                     foods: relatedFoods
//                 }
//             }))
//             setEvents(mapMealsToEvents(mealFoods));
//         } catch (err) {
//             console.error("Failed to fetch meals:", err);
//             setEvents([]);
//         }
//     };

    
//     /* --------------------------------------------------
//         Add mode: fetch only one day
//     -------------------------------------------------- */
//     useEffect(() => {
//         if (mode !== "add" || !editDate) return;
//         (async () => {
//             try {
//                 const meals = await fetchMeals(editDate, editDate);
//                 const mealFoods = await Promise.all(meals.map(async meal => {
//                     const relatedFoods = await fetchRelatedFoods(meal.meal_id)
//                     return {
//                         ...meal,
//                         foods: relatedFoods
//                     }
//                 }))
//                 setEvents(mapMealsToEvents(mealFoods));
//             } catch (err) {
//                 console.error("Failed to fetch meals:", err);
//                 setEvents([]);
//             }
//         })();
//     }, [mode, editDate, refreshTrigger]);
//     const handleDateClick = (info) => {
//         // if (mode === "add" && onDateChange) {
//         //     onDateChange(info.dateStr);
//         // }
//         if (mode === "browse") {
//             navigate(`/add-meal?date=${info.dateStr}`)
//         }
//     };

//     const handleSelect = async (selectionInfo) => {
//         const start = selectionInfo.startStr;
//         const endDateObj = new Date(selectionInfo.end);
//         endDateObj.setDate(endDateObj.getDate() - 1); // adjust because FullCalendar end is exclusive
//         const end = endDateObj.toISOString().slice(0, 10);

//         // Fetch meals for the selected range
//         try {
//             const meals = await fetchMeals(start, end);
//             setEvents(mapMealsToEvents(meals));
//         } catch (err) {
//             console.error("Failed to fetch meals:", err);
//             setEvents([]);
//         }

//         // Optionally switch the view to show only selected days
//         const calendarApi = selectionInfo.view.calendar;
//         const dayDiff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
//         if (dayDiff === 1) calendarApi.changeView('dayGridDay', start);
//         else if (dayDiff <= 7) calendarApi.changeView("dayGridWeek", start);
//         else calendarApi.changeView("dayGridMonth", start);
//     };
    
//     return (<>
//         <FullCalendar
//             plugins={[dayGridPlugin, interactionPlugin]}
//             initialView={mode === "add" ? "dayGridDay" : "dayGridWeek"}
//             initialDate={getCurrentWeekRange().startDate} 
//             headerToolbar={mode === "add" ? {
//                 left: '',
//                 center: 'title',
//                 right: ''
//             }:{
//                 left: 'prev,next today',
//                 center: 'title',
//                 right: 'dayGridMonth,dayGridWeek,dayGridDay'
//             }}
//             selectable={mode === "browse"}              // ✅ enable selection
//             selectMirror={mode === "browse"}             // shows the selection visually
//             select={handleSelect}          // handler when user selects
//             datesSet={handleDatesSet}
//             dateClick={handleDateClick}
//             events={events}
//             height="auto"
//             eventContent={renderMealEvent}
//             eventOrder="extendedProps.order"
//             eventClick={(info) => {
//                 const mealEvent = events.find(e => e.id === info.event.id);
//                 if (!mealEvent) return; // safety check
//                 setEditingMeal({
//                     date: mealEvent.extendedProps.date,
//                     mealType: mealEvent.extendedProps.mealType,
//                     mealId: mealEvent.extendedProps.mealId,
//                     foods: mealEvent.extendedProps.foods ?? []
//                 });
//                 setModalOpen(true);
//             }}
//             // dayCellContent={renderDayCell} // <-- add button in each day cell
//         />
//     </>);
// };

// export default Calendar;