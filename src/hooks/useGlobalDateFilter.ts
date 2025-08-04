import { useState, useCallback } from 'react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export type DateFilterOption = 'hoje' | 'ontem' | 'anteontem' | 'personalizado';

export interface GlobalDateFilter {
  option: DateFilterOption;
  startDate?: string;
  endDate?: string;
  label: string;
}

export function useGlobalDateFilter() {
  const [currentFilter, setCurrentFilter] = useState<GlobalDateFilter>({
    option: 'hoje',
    label: 'Hoje'
  });

  const applyFilter = useCallback((option: DateFilterOption, customStartDate?: string, customEndDate?: string) => {
    const today = new Date();
    let filter: GlobalDateFilter;

    switch (option) {
      case 'hoje':
        filter = {
          option: 'hoje',
          startDate: format(startOfDay(today), 'yyyy-MM-dd'),
          endDate: format(endOfDay(today), 'yyyy-MM-dd'),
          label: 'Hoje'
        };
        break;
      
      case 'ontem':
        const yesterday = subDays(today, 1);
        filter = {
          option: 'ontem',
          startDate: format(startOfDay(yesterday), 'yyyy-MM-dd'),
          endDate: format(endOfDay(yesterday), 'yyyy-MM-dd'),
          label: 'Ontem'
        };
        break;
      
      case 'anteontem':
        const dayBefore = subDays(today, 2);
        filter = {
          option: 'anteontem',
          startDate: format(startOfDay(dayBefore), 'yyyy-MM-dd'),
          endDate: format(endOfDay(dayBefore), 'yyyy-MM-dd'),
          label: 'Anteontem'
        };
        break;
      
      case 'personalizado':
        filter = {
          option: 'personalizado',
          startDate: customStartDate,
          endDate: customEndDate,
          label: customStartDate && customEndDate 
            ? `${customStartDate} - ${customEndDate}` 
            : 'Personalizado'
        };
        break;
      
      default:
        filter = currentFilter;
    }

    setCurrentFilter(filter);
    return filter;
  }, [currentFilter]);

  const getFilterDates = useCallback(() => {
    return {
      startDate: currentFilter.startDate,
      endDate: currentFilter.endDate
    };
  }, [currentFilter.startDate, currentFilter.endDate]);

  const isFilterActive = useCallback((option: DateFilterOption) => {
    return currentFilter.option === option;
  }, [currentFilter]);

  return {
    currentFilter,
    applyFilter,
    getFilterDates,
    isFilterActive
  };
}