import CalendarHeader from './CalendarHeader';
import CalendarViewWithTrail from './CalendarViewWithTrail';
import DynamicIsland from './DynamicIsland';
import WeekdayBar from './WeekdayBar';

const Calendar = () => {
  return (
    <div className="flex h-full w-full flex-col border-zinc-800 bg-zinc-900 p-6">
      <CalendarHeader />
      <WeekdayBar />
      <CalendarViewWithTrail />
      <DynamicIsland />
    </div>
  );
};

export default Calendar;