import { parseISO, isPast, isToday } from 'date-fns';
import { DAYS } from '../../data/tripData.js';
import DayCard from './DayCard.jsx';

export default function ItineraryView() {
  return (
    <div className="pt-4 space-y-3">
      {DAYS.map((day, i) => {
        const date = parseISO(day.date);
        const isPastDay = !isToday(date) && isPast(date);
        // Past days collapsed, current and future open
        const defaultOpen = !isPastDay;
        return (
          <DayCard
            key={day.id}
            day={day}
            dayNumber={i + 1}
            defaultOpen={defaultOpen}
          />
        );
      })}
    </div>
  );
}
