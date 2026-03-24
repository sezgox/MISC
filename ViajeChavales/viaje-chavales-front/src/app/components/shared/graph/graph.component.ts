import { Component, computed, input, signal } from '@angular/core';
import { Freedays } from '../../../core/interfaces/freedays.interface';
import { Trip } from '../../../core/interfaces/trips.interface';

type AvailabilityView = 'timeline' | 'calendar';

type DateRange = {
  start: Date;
  end: Date;
};

type UserSegment = DateRange & {
  username: string;
  color: string;
};

type TimelineBar = {
  left: number;
  width: number;
  color: string;
  title: string;
  label?: string;
  tone: 'freeday' | 'planning' | 'closed';
};

type TimelineTick = {
  key: string;
  label: string;
  left: number;
  mobileVisible: boolean;
};

type TimelineTripRow = {
  id: number;
  label: string;
  subtitle: string;
  dateHelper: string;
  status: 'Planning' | 'Closed';
  bar: TimelineBar;
};

type TimelineUserRow = {
  username: string;
  color: string;
  segments: TimelineBar[];
};

type CalendarTripChip = {
  id: number;
  fullName: string;
  shortName: string;
  tone: 'planning' | 'closed';
};

type CalendarFreeRibbon = {
  username: string;
  color: string;
  continuesPrev: boolean;
  continuesNext: boolean;
};

type CalendarDay = {
  key: string;
  label: string;
  date: Date;
  isToday: boolean;
  freeRibbons: CalendarFreeRibbon[];
  tripChips: CalendarTripChip[];
};

type CalendarWeekCell = {
  empty: boolean;
  day?: CalendarDay;
};

type CalendarMonth = {
  key: string;
  label: string;
  weeks: CalendarWeekCell[][];
};

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  freedays = input<Freedays[]>([]);
  members = input<string[]>([]);
  trips = input<Trip[]>([]);
  showTrips = input<boolean>(false);
  selectedYear = input<number>(new Date().getFullYear());
  selectedMonth = input<number>(new Date().getMonth());
  selectedMonthSpan = input<number>(1);

  readonly activeView = signal<AvailabilityView>('timeline');

  private readonly userPalette = [
    '#D95F4A',
    '#287271',
    '#7C6A0A',
    '#345995',
    '#A23E48',
    '#4A7C59',
    '#9C6644',
    '#5D4E9D',
  ];

  readonly monthRange = computed(() =>
    this.getVisibleRange(this.selectedYear(), this.selectedMonth(), this.selectedMonthSpan()),
  );
  readonly monthDays = computed(() => this.enumerateDays(this.monthRange()));
  readonly monthLabel = computed(() => this.formatRangeLabel(this.monthRange()));
  readonly uniqueFreedays = computed(() => this.dedupeFreedays(this.freedays()));

  readonly userColorMap = computed(() => {
    const usernames = Array.from(
      new Set([
        ...this.members(),
        ...this.uniqueFreedays().map((item) => item.username),
        ...this.visibleTrips().flatMap((trip) => trip.participants.map((participant) => participant.userId)),
      ]),
    ).sort();
    return new Map(
      usernames.map((username, index) => [
        username,
        this.userPalette[index % this.userPalette.length],
      ]),
    );
  });

  readonly closedTrips = computed(() =>
    this.trips()
      .filter((trip) => trip.status === 'Closed')
      .filter((trip) => this.rangesOverlap(this.toTripRange(trip), this.monthRange())),
  );

  readonly visibleTrips = computed(() => {
    const closed = this.closedTrips();
    const planning = this.trips()
      .filter((trip) => trip.status === 'Planning')
      .filter((trip) => this.rangesOverlap(this.toTripRange(trip), this.monthRange()));

    return [...closed, ...(this.showTrips() ? planning : [])].sort(
      (left, right) =>
        this.startOfDay(left.startDate).getTime() - this.startOfDay(right.startDate).getTime(),
    );
  });

  readonly adjustedFreedaySegments = computed(() => this.buildAdjustedFreedaySegments());

  readonly timelineTrips = computed<TimelineTripRow[]>(() =>
    this.visibleTrips()
      .map((trip) => {
        const range = this.intersectRange(this.toTripRange(trip), this.monthRange());
        if (!range) {
          return null;
        }

        return {
          id: trip.id,
          label: trip.name,
          subtitle: `${trip.destination} - ${trip.status}`,
          dateHelper: this.formatRange(range.start, range.end),
          status: trip.status,
          bar: this.rangeToBar(
            range,
            trip.status === 'Closed' ? '#D95F4A' : '#355C7D',
            `${trip.name} - ${trip.destination} (${this.formatRange(range.start, range.end)})`,
            trip.status === 'Closed' ? 'closed' : 'planning',
            this.getTripChipLabel(trip.name),
          ),
        };
      })
      .filter((row): row is TimelineTripRow => row !== null),
  );

  readonly timelineUsers = computed<TimelineUserRow[]>(() => {
    const rows = new Map<string, TimelineUserRow>(
      Array.from(this.userColorMap().entries()).map(([username, color]) => [
        username,
        {
          username,
          color,
          segments: [],
        },
      ]),
    );

    for (const segment of this.adjustedFreedaySegments()) {
      const currentRow =
        rows.get(segment.username) ??
        {
          username: segment.username,
          color: segment.color,
          segments: [],
        };

      currentRow.segments.push(
        this.rangeToBar(
          segment,
          segment.color,
          `${segment.username}: ${this.formatRange(segment.start, segment.end)}`,
          'freeday',
        ),
      );

      rows.set(segment.username, currentRow);
    }

    return Array.from(rows.values()).sort((left, right) => left.username.localeCompare(right.username));
  });

  readonly timelineDayLabels = computed(() =>
    this.monthDays().map((day) => ({
      key: this.toDayKey(day),
      weekend: day.getDay() === 0 || day.getDay() === 6,
    })),
  );

  readonly timelineTicks = computed<TimelineTick[]>(() => {
    const days = this.monthDays();
    const totalDays = days.length || 1;
    const lastDay = days.at(-1)?.getDate() ?? 0;

    return days.map((day, index) => ({
      key: this.toDayKey(day),
      label: day.toLocaleDateString('es-ES', { day: '2-digit' }),
      left: ((index + 0.5) / totalDays) * 100,
      mobileVisible: this.isMobileGuideTick(day, this.selectedMonthSpan(), lastDay),
    }));
  });

  readonly calendarMonths = computed(() => this.buildCalendarMonths());
  readonly dayGridTemplate = computed(
    () => `repeat(${this.timelineDayLabels().length || 1}, minmax(0, 1fr))`,
  );

  setView(view: AvailabilityView) {
    this.activeView.set(view);
  }

  private getVisibleRange(year: number, month: number, span: number): DateRange {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + span, 0),
    };
  }

  private buildAdjustedFreedaySegments(): UserSegment[] {
    const visibleRange = this.monthRange();
    const userColorMap = this.userColorMap();
    const closedTripExclusions = new Map<string, DateRange[]>();

    for (const trip of this.closedTrips()) {
      const tripRange = this.intersectRange(this.toTripRange(trip), visibleRange);
      if (!tripRange) {
        continue;
      }

      for (const participant of trip.participants) {
        const exclusions = closedTripExclusions.get(participant.userId) ?? [];
        exclusions.push(tripRange);
        closedTripExclusions.set(participant.userId, exclusions);
      }
    }

    return this.uniqueFreedays()
      .flatMap((freeday) => {
        const visibleFreeday = this.intersectRange(this.toFreedayRange(freeday), visibleRange);
        if (!visibleFreeday) {
          return [];
        }

        const exclusions = closedTripExclusions.get(freeday.username) ?? [];
        const segments = this.subtractRanges(visibleFreeday, exclusions);

        return segments.map((segment) => ({
          username: freeday.username,
          color: userColorMap.get(freeday.username) ?? this.userPalette[0],
          ...segment,
        }));
      })
      .sort((left, right) => {
        if (left.username !== right.username) {
          return left.username.localeCompare(right.username);
        }

        return left.start.getTime() - right.start.getTime();
      });
  }

  private dedupeFreedays(freedays: Freedays[]) {
    const unique = new Map<string, Freedays>();

    for (const freeday of freedays) {
      const hasValidId = Number.isFinite(freeday.id);
      const fallbackKey = `${freeday.username}:${this.toDayKey(freeday.startDate)}:${this.toDayKey(freeday.endDate)}`;
      const key = hasValidId ? `id:${freeday.id}` : `range:${fallbackKey}`;

      if (!unique.has(key)) {
        unique.set(key, freeday);
      }
    }

    return Array.from(unique.values());
  }

  private buildCalendarMonths(): CalendarMonth[] {
    const visibleRange = this.monthRange();
    const months: CalendarMonth[] = [];

    for (let offset = 0; offset < this.selectedMonthSpan(); offset += 1) {
      const monthRange = {
        start: new Date(this.selectedYear(), this.selectedMonth() + offset, 1),
        end: new Date(this.selectedYear(), this.selectedMonth() + offset + 1, 0),
      };
      months.push(this.buildCalendarMonth(monthRange, visibleRange));
    }

    return months;
  }

  private buildCalendarMonth(monthRange: DateRange, visibleRange: DateRange): CalendarMonth {
    const freeLookup = new Map<string, { username: string; color: string }[]>();
    const tripLookup = new Map<string, CalendarTripChip[]>();

    for (const segment of this.adjustedFreedaySegments()) {
      for (const day of this.enumerateDays(segment)) {
        const key = this.toDayKey(day);
        const values = freeLookup.get(key) ?? [];
        values.push({ username: segment.username, color: segment.color });
        freeLookup.set(key, values);
      }
    }

    for (const trip of this.visibleTrips()) {
      const range = this.intersectRange(this.toTripRange(trip), visibleRange);
      if (!range) {
        continue;
      }

      const chip: CalendarTripChip = {
        id: trip.id,
        fullName: trip.name,
        shortName: this.getTripChipLabel(trip.name),
        tone: trip.status === 'Closed' ? 'closed' : 'planning',
      };

      for (const day of this.enumerateDays(range)) {
        const key = this.toDayKey(day);
        const values = tripLookup.get(key) ?? [];
        values.push(chip);
        tripLookup.set(key, values);
      }
    }

    const monthStart = monthRange.start;
    const days = this.enumerateDays(monthRange);
    const offset = (monthStart.getDay() + 6) % 7;
    const cells: CalendarWeekCell[] = Array.from({ length: offset }, () => ({ empty: true }));

    for (const day of days) {
      const dayKey = this.toDayKey(day);
      const freeEntries = (freeLookup.get(dayKey) ?? []).sort((left, right) =>
        left.username.localeCompare(right.username),
      );

      cells.push({
        empty: false,
        day: {
          key: dayKey,
          label: day.toLocaleDateString('es-ES', { day: 'numeric' }),
          date: day,
          isToday: dayKey === this.toDayKey(new Date()),
          freeRibbons: freeEntries.map((entry) => ({
            username: entry.username,
            color: entry.color,
            continuesPrev: false,
            continuesNext: false,
          })),
          tripChips: (tripLookup.get(dayKey) ?? []).sort((left, right) =>
            left.tone === right.tone
              ? left.fullName.localeCompare(right.fullName)
              : left.tone === 'closed'
                ? -1
                : 1,
          ),
        },
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ empty: true });
    }

    const weeks: CalendarWeekCell[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7));
    }

    for (const week of weeks) {
      for (let dayIndex = 0; dayIndex < week.length; dayIndex += 1) {
        const currentDay = week[dayIndex].day;
        if (!currentDay) {
          continue;
        }

        const previousDay = dayIndex > 0 ? week[dayIndex - 1].day : undefined;
        const nextDay = dayIndex < week.length - 1 ? week[dayIndex + 1].day : undefined;

        currentDay.freeRibbons = currentDay.freeRibbons.map((ribbon) => ({
          ...ribbon,
          continuesPrev:
            !!previousDay?.freeRibbons.some((previousRibbon) => previousRibbon.username === ribbon.username),
          continuesNext:
            !!nextDay?.freeRibbons.some((nextRibbon) => nextRibbon.username === ribbon.username),
        }));
      }
    }

    return {
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      label: new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(monthStart),
      weeks,
    };
  }

  private rangeToBar(
    range: DateRange,
    color: string,
    title: string,
    tone: TimelineBar['tone'],
    label?: string,
  ): TimelineBar {
    const visibleRange = this.monthRange();
    const totalDays = this.daysBetween(visibleRange.start, visibleRange.end) + 1;
    const startOffset = this.daysBetween(visibleRange.start, range.start);
    const span = this.daysBetween(range.start, range.end) + 1;

    return {
      left: (startOffset / totalDays) * 100,
      width: (span / totalDays) * 100,
      color,
      title,
      tone,
      label,
    };
  }

  private toFreedayRange(freeday: Freedays): DateRange {
    return {
      start: this.startOfDay(freeday.startDate),
      end: this.startOfDay(freeday.endDate),
    };
  }

  private toTripRange(trip: Trip): DateRange {
    return {
      start: this.startOfDay(trip.startDate),
      end: this.startOfDay(trip.endDate),
    };
  }

  private startOfDay(value: Date | string) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private toDayKey(value: Date | string) {
    return this.startOfDay(value).toISOString().slice(0, 10);
  }

  private enumerateDays(range: DateRange): Date[] {
    const days: Date[] = [];
    const cursor = this.startOfDay(range.start);
    const end = this.startOfDay(range.end);

    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }

  private rangesOverlap(left: DateRange, right: DateRange) {
    return left.start <= right.end && left.end >= right.start;
  }

  private intersectRange(left: DateRange, right: DateRange): DateRange | null {
    if (!this.rangesOverlap(left, right)) {
      return null;
    }

    return {
      start: left.start > right.start ? left.start : right.start,
      end: left.end < right.end ? left.end : right.end,
    };
  }

  private subtractRanges(base: DateRange, exclusions: DateRange[]) {
    if (exclusions.length === 0) {
      return [base];
    }

    const sortedExclusions = exclusions
      .map((range) => this.intersectRange(base, range))
      .filter((range): range is DateRange => range !== null)
      .sort((left, right) => left.start.getTime() - right.start.getTime());

    if (sortedExclusions.length === 0) {
      return [base];
    }

    const segments: DateRange[] = [];
    let cursor = new Date(base.start);

    for (const exclusion of sortedExclusions) {
      if (cursor < exclusion.start) {
        segments.push({
          start: new Date(cursor),
          end: this.addDays(exclusion.start, -1),
        });
      }

      const nextCursor = this.addDays(exclusion.end, 1);
      if (nextCursor > cursor) {
        cursor = nextCursor;
      }
    }

    if (cursor <= base.end) {
      segments.push({
        start: new Date(cursor),
        end: new Date(base.end),
      });
    }

    return segments.filter((segment) => segment.start <= segment.end);
  }

  private addDays(date: Date, amount: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  private daysBetween(start: Date, end: Date) {
    const startTime = this.startOfDay(start).getTime();
    const endTime = this.startOfDay(end).getTime();
    return Math.round((endTime - startTime) / 86400000);
  }

  private formatRange(start: Date, end: Date) {
    return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
  }

  private formatRangeLabel(range: DateRange) {
    const sameMonth =
      range.start.getFullYear() === range.end.getFullYear() &&
      range.start.getMonth() === range.end.getMonth();

    if (sameMonth) {
      return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(range.start);
    }

    const sameYear = range.start.getFullYear() === range.end.getFullYear();
    const startLabel = range.start.toLocaleDateString('es-ES', {
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
    const endLabel = range.end.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return `${this.capitalize(startLabel)} - ${this.capitalize(endLabel)}`;
  }

  private isMobileGuideTick(day: Date, visibleMonthSpan: number, lastVisibleDay: number) {
    if (visibleMonthSpan === 1) {
      return new Set([1, 8, 15, 23, lastVisibleDay]).has(day.getDate());
    }

    const startMonth = this.monthRange().start.getMonth();
    const endMonth = this.monthRange().end.getMonth();
    const dayOfMonth = day.getDate();
    const isGuide = dayOfMonth === 1 || dayOfMonth === 15;
    const isLastDayOfSecondMonth = day.getMonth() === endMonth && dayOfMonth === lastVisibleDay;
    const isInVisibleMonths = day.getMonth() === startMonth || day.getMonth() === endMonth;

    return (isGuide && isInVisibleMonths) || isLastDayOfSecondMonth;
  }

  getTripChipLabel(name: string) {
    return name.length <= 6 ? name : `${name.slice(0, 5)}...`;
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
