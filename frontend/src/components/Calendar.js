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

function Calendar({ setEditingMeal, setModalOpen, editDate }) {
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
    queryKey: ['meals', range.start, range.end],
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
    // console.log(meals)
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
    //   console.log(extendedProps.foods)

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
                //   style={{ cursor: 'pointer' }}
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
      key={mode}
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