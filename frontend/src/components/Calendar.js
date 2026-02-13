import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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


function Calendar() {
  const navigate = useNavigate();
  /* ------------------------------
     Visible date range (source of truth)
  ------------------------------ */
  const [range, setRange] = useState(() => {
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
    queryKey: ['meals', range.start, range.end],
    queryFn: async () => {
      const baseMeals = await fetchMeals(range.start, range.end);
      return Promise.all(
        baseMeals.map(async (meal) => ({
          ...meal,
          foods: await fetchRelatedFoods(meal.mealId),
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
    return meals.map((meal) => ({
      id: `${meal.mealDate}-${meal.mealType}`,
      title: meal.mealType.toUpperCase(),
      start: meal.mealDate,
      allDay: true,
      backgroundColor: MEAL_COLORS[meal.mealType] ?? '#94A3B8',
      borderColor: MEAL_COLORS[meal.mealType] ?? '#94A3B8',
      extendedProps: {
        date: meal.mealDate,
        mealType: meal.mealType,
        mealId: meal.mealId,
        foods: meal.foods.map((f) => ({
          foodId: f.foodId,
          foodName: f.foodName,
          description: f.foodDescription,
          mealFoodId: f.mealFoodId,
        })),
        order: MEAL_ORDER[meal.mealType],
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
      if (type === 'dayGridMonth') {
        return <strong>{title}</strong>;
      }
      return (
        <>
          <strong>{title}</strong>
          <ol id={`calendar-meal-food-${title.toLowerCase()}`} className={`calendar-meal-food`}>
            {extendedProps.foods.map((food) => (
              <li key={food.foodId}>{food.foodName}</li>
            ))}
          </ol>
        </>
      );
    },
    []
  );

  /* ------------------------------
     Handlers (no fetching here)
  ------------------------------ */
  const handleDatesSet = useCallback((info) => {

    const start = info.startStr;
    const end = new Date(info.end);
    end.setDate(end.getDate() - 1);

    setRange({
      start,
      end: end.toISOString().slice(0, 10),
    });
  }, []);

  const handleDateClick = useCallback((info) => {
    navigate(`/day-meals?date=${info.dateStr}`)
  },[navigate]
  );

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView={'dayGridWeek'}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay',
      }}
      events={events}
      eventContent={renderMealEvent}
      eventOrder="extendedProps.order"
      dateClick={handleDateClick}
      datesSet={handleDatesSet}
      height="auto"
      eventClick={ (info) =>navigate(`/day-meals?date=${info.event.startStr}`)}
    />
  );
}

export default Calendar;