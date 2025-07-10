import { useEffect, useState } from 'react';
import { WeekDay } from '@/types/logging';
import api from '@/api/api';

export const useWeekLog = () => {
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeWeekView();
  }, []);

  const initializeWeekView = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());

    const days: WeekDay[] = [];
    let todayIndex = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === today.toISOString().split('T')[0];

      if (isToday) todayIndex = i;

      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        isPast: date < today && !isToday,
        isFuture: date > today,
        workoutLog: undefined,
      });
    }

    setWeekDays(days);
    setSelectedDayIndex(todayIndex);
    loadWeekLog();
  };

  const loadWeekLog = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/workout/log/week/');
      const log = response.data;

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const days: WeekDay[] = [...Array(7)].map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];

        const matchedLog = log.days.find((d: any) => d.order === i);

        return {
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday,
          isPast: date < today && !isToday,
          isFuture: date > today,
          workoutLog: matchedLog ?? undefined,
        };
      });

      setWeekDays(days);
      setSelectedDayIndex(days.findIndex((d) => d.isToday));
    } catch (err) {
      console.error('Failed to load week log:', err);
      setError('Could not load weekly workout log.');
    } finally {
      setLoading(false);
    }
  };

  return {
    weekDays,
    selectedDayIndex,
    setSelectedDayIndex,
    loading,
    error,
    reload: initializeWeekView,
  };
};
