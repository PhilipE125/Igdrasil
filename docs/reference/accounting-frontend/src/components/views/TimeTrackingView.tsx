import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Pencil,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/contexts/TimerContext";
import { useCompany } from "@/contexts/CompanyContext";
import {
  type NLParseResult,
  type TimeEntry,
  type TimeEntryUpdate,
  createTimeEntry,
  deleteTimeEntry,
  formatDuration,
  listTimeEntries,
  parseNaturalLanguage,
  updateTimeEntry,
} from "@/lib/timeTrackingApi";
import { cn } from "@/lib/utils";

function secondsToHm(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return { h, m };
}

const ENTRY_COLORS = ["#F0A500", "#7C3AED", "#0EA5E9", "#10B981", "#F43F5E", "#F97316"];
const NO_CLIENT_VALUE = "__no_client__";

function clientColor(name: string | null): string {
  if (!name) return "#878787";
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return ENTRY_COLORS[hash % ENTRY_COLORS.length];
}

function normalizeText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildIsoDateTime(dateValue: string, timeValue: string) {
  return `${dateValue}T${timeValue}:00`;
}

function buildIsoDateTimeFromMinutes(dateValue: string, minutes: number) {
  const clamped = Math.max(0, Math.min(24 * 60, minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return buildIsoDateTime(dateValue, `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
}

function toMinutes(value: string | null | undefined) {
  if (!value) return null;
  const date = parseISO(value);
  return date.getHours() * 60 + date.getMinutes();
}

function entryStartMinutes(entry: TimeEntry) {
  return toMinutes(entry.start_time) ?? 0;
}

function entryEndMinutes(entry: TimeEntry) {
  const explicit = toMinutes(entry.stop_time);
  if (explicit != null) return explicit;
  const start = entryStartMinutes(entry);
  const elapsed = Math.max(entry.elapsed_seconds ?? 0, 30 * 60);
  return Math.min(24 * 60, start + Math.ceil(elapsed / 60));
}

function snapMinutes(value: number, step = 15) {
  return Math.round(value / step) * step;
}

function formatRange(entry: TimeEntry) {
  const start = format(parseISO(entry.start_time), "HH:mm");
  const stop = entry.stop_time ? format(parseISO(entry.stop_time), "HH:mm") : "Running";
  return `${start} - ${stop}`;
}

function describeEntry(entry: TimeEntry) {
  return entry.description || "No description";
}

function secondaryEntryLabel(entry: TimeEntry) {
  return entry.client_name ?? "";
}

function minutesToTimeStr(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  entries: TimeEntry[];
  isSelected: boolean;
  onSelect: () => void;
  draggingEntryId: string | null;
  onBeginDragEntry: (entry: TimeEntry) => void;
  onEndDragEntry: () => void;
  onMoveEntryToDate: (entryId: string, targetDate: string) => void;
}

function CalendarDay({
  date,
  isCurrentMonth,
  entries,
  isSelected,
  onSelect,
  draggingEntryId,
  onBeginDragEntry,
  onEndDragEntry,
  onMoveEntryToDate,
}: CalendarDayProps) {
  const today = isToday(date);
  const totalSec = entries.reduce((s, e) => s + (e.duration ?? e.elapsed_seconds ?? 0), 0);
  const { h, m } = secondsToHm(totalSec);
  const dateKey = format(date, "yyyy-MM-dd");
  const [isDropTarget, setIsDropTarget] = useState(false);

  return (
    <div
      onClick={onSelect}
      onDragOver={(event) => {
        if (!draggingEntryId) return;
        event.preventDefault();
        setIsDropTarget(true);
      }}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={(event) => {
        event.preventDefault();
        const entryId = event.dataTransfer.getData("text/time-entry-id") || draggingEntryId;
        if (entryId) {
          onMoveEntryToDate(entryId, dateKey);
        }
        setIsDropTarget(false);
      }}
      className={cn(
        "relative flex h-[108px] flex-col bg-background p-3 text-left transition-colors",
        isSelected && "bg-[#F2F1EF] dark:bg-[#0f0f0f]",
        !isSelected && "hover:bg-[#F2F1EF]/60 dark:hover:bg-[#0f0f0f]/60",
        !isCurrentMonth && "opacity-30",
        isDropTarget && "ring-2 ring-inset ring-foreground/20",
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span
          className={cn(
            "text-[11px] font-medium leading-none tabular-nums",
            today
              ? "flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background"
              : "text-[#878787]",
          )}
        >
          {format(date, "d")}
        </span>
        {totalSec > 0 && (
          <span className="text-[10px] tabular-nums text-[#878787]">
            {h > 0 ? `${h}h` : ""}
            {m > 0 ? `${m}m` : ""}
          </span>
        )}
      </div>

      {/* Entries are absolutely positioned by start time so they roughly
           line up with the hour of day (00:00 at the top, 24:00 at the
           bottom of the entries lane). */}
      <div className="relative mt-1 w-full flex-1 overflow-hidden">
        {[...entries]
          .sort((a, b) => entryStartMinutes(a) - entryStartMinutes(b))
          .slice(0, 3)
          .map((entry) => {
            const topPct = (entryStartMinutes(entry) / (24 * 60)) * 100;
            return (
              <div
                key={entry.id}
                style={{ top: `${topPct}%` }}
                className={cn(
                  "absolute inset-x-0 flex items-center gap-1 rounded-sm px-0.5",
                  draggingEntryId === entry.id && "opacity-50",
                )}
                draggable={Boolean(entry.stop_time)}
                onDragStart={(event) => {
                  if (!entry.stop_time) return;
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/time-entry-id", entry.id);
                  onBeginDragEntry(entry);
                }}
                onDragEnd={() => {
                  setIsDropTarget(false);
                  onEndDragEntry();
                }}
              >
                <div className="h-1 w-1 shrink-0 rounded-full" style={{ background: clientColor(entry.client_name) }} />
                <span className="truncate text-[9px] leading-none text-[#878787]">
                  {describeEntry(entry)}
                </span>
              </div>
            );
          })}
        {entries.length > 3 && (
          <span className="absolute bottom-0 right-0 text-[9px] text-[#878787]">
            +{entries.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TrackerCalendarProps {
  currentDate: Date;
  entries: TimeEntry[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  draggingEntryId: string | null;
  onBeginDragEntry: (entry: TimeEntry) => void;
  onEndDragEntry: () => void;
  onMoveEntryToDate: (entryId: string, targetDate: string) => void;
  view?: "week" | "month";
}

function TrackerCalendar({
  currentDate,
  entries,
  selectedDate,
  onSelectDate,
  draggingEntryId,
  onBeginDragEntry,
  onEndDragEntry,
  onMoveEntryToDate,
  view = "month",
}: TrackerCalendarProps) {
  const days = useMemo(() => {
    if (view === "week") {
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      });
    }
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [view, currentDate]);

  const byDate = useMemo(() => {
    const map: Record<string, TimeEntry[]> = {};
    for (const e of entries) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [entries]);

  return (
    <div className="grid grid-cols-7 gap-px border border-border bg-border">
      {WEEK_DAYS.map((day) => (
        <div key={day} className="bg-background px-3 py-3 text-[11px] font-medium tracking-wide text-[#878787]">
          {day.toUpperCase()}
        </div>
      ))}

      {days.map((date) => {
        const key = format(date, "yyyy-MM-dd");
        const inRange = view === "week" ? true : isSameMonth(date, currentDate);
        return (
          <CalendarDay
            key={key}
            date={date}
            isCurrentMonth={inRange}
            entries={byDate[key] ?? []}
            isSelected={selectedDate === key}
            onSelect={() => onSelectDate(selectedDate === key ? null : key)}
            draggingEntryId={draggingEntryId}
            onBeginDragEntry={onBeginDragEntry}
            onEndDragEntry={onEndDragEntry}
            onMoveEntryToDate={onMoveEntryToDate}
          />
        );
      })}
    </div>
  );
}

// ── Year Calendar (12 mini-month heatmap) ────────────────────────────────────

function YearCalendar({
  currentDate,
  entries,
  onSelectDate,
  onSelectMonth,
}: {
  currentDate: Date;
  entries: TimeEntry[];
  onSelectDate: (date: string) => void;
  onSelectMonth?: (monthDate: Date) => void;
}) {
  const months = useMemo(
    () =>
      eachMonthOfInterval({
        start: startOfYear(currentDate),
        end: endOfYear(currentDate),
      }),
    [currentDate],
  );

  const secondsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      map[e.date] = (map[e.date] ?? 0) + (e.duration ?? e.elapsed_seconds ?? 0);
    }
    return map;
  }, [entries]);

  const maxSec = useMemo(() => {
    let m = 0;
    for (const v of Object.values(secondsByDate)) if (v > m) m = v;
    return m;
  }, [secondsByDate]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {months.map((monthDate) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
        return (
          <div
            key={monthDate.toISOString()}
            role={onSelectMonth ? "button" : undefined}
            tabIndex={onSelectMonth ? 0 : undefined}
            aria-label={onSelectMonth ? `Open ${format(monthDate, "MMMM yyyy")} in month view` : undefined}
            onClick={(e) => {
              if (!onSelectMonth) return;
              if ((e.target as HTMLElement).closest("[data-day-cell]")) return;
              onSelectMonth(monthDate);
            }}
            onKeyDown={(e) => {
              if (!onSelectMonth) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectMonth(monthDate);
              }
            }}
            className={cn(
              "rounded-md border border-border bg-background p-3 transition-colors",
              onSelectMonth &&
                "cursor-pointer hover:border-foreground/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <p className="mb-2 text-xs font-medium text-foreground">{format(monthDate, "MMMM")}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((date) => {
                const key = format(date, "yyyy-MM-dd");
                const sec = secondsByDate[key] ?? 0;
                const inMonth = isSameMonth(date, monthDate);
                const intensity = maxSec > 0 ? Math.min(1, sec / maxSec) : 0;
                const today = isToday(date);
                return (
                  <button
                    key={key}
                    type="button"
                    data-day-cell
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(key);
                    }}
                    title={`${format(date, "d MMM")} · ${Math.round(sec / 60)} min`}
                    className={cn(
                      "aspect-square w-full rounded-sm border border-transparent transition-colors",
                      !inMonth && "opacity-25",
                      today && "border-foreground/60",
                      sec === 0 && "bg-muted/40 hover:bg-muted",
                    )}
                    style={
                      sec > 0
                        ? { backgroundColor: `rgba(176, 238, 143, ${0.25 + intensity * 0.75})` }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Log Dialog (minimal NL entry) ─────────────────────────────────────────────

function LogDialog({
  open,
  onOpenChange,
  companies,
  initialDate,
  initialStartMinutes,
  initialEndMinutes,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companies: Array<{ id: string; name: string }>;
  initialDate?: string | null;
  initialStartMinutes?: number;
  initialEndMinutes?: number;
}) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<NLParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const hasPrefilledTimes = initialStartMinutes !== undefined && initialEndMinutes !== undefined;

  useEffect(() => {
    if (!open) {
      setText("");
      setParsed(null);
      setShowDetails(false);
      setIsParsing(false);
    }
  }, [open]);

  async function handleParse() {
    if (!text.trim()) return;
    setIsParsing(true);
    try {
      const result = await parseNaturalLanguage(text.trim());
      setParsed(result);
      setShowDetails(true);
    } catch {
      toast({ title: "Could not parse entry", variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  }

  async function handleSave() {
    const entryDate = parsed?.date ?? initialDate ?? format(new Date(), "yyyy-MM-dd");
    let startTime: string;
    let stopTime: string;

    if (hasPrefilledTimes) {
      startTime = buildIsoDateTimeFromMinutes(entryDate, initialStartMinutes!);
      stopTime = buildIsoDateTimeFromMinutes(entryDate, initialEndMinutes!);
    } else if (parsed?.start_time) {
      startTime = parsed.start_time;
      const durationMs = (parsed?.duration_seconds ?? 3600) * 1000;
      stopTime = new Date(new Date(startTime).getTime() + durationMs).toISOString();
    } else {
      const stop = new Date();
      const start = new Date(stop.getTime() - (parsed?.duration_seconds ?? 3600) * 1000);
      startTime = start.toISOString();
      stopTime = stop.toISOString();
    }

    try {
      await createTimeEntry({
        client_company_id: parsed?.client_company_id ?? null,
        description: parsed?.description ?? (text.trim() || null),
        start_time: startTime,
        stop_time: stopTime,
        date: entryDate,
        billable: true,
        currency: "SEK",
      });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({ title: "Time entry logged" });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to save entry", variant: "destructive" });
    }
  }

  const parsedCompanyName = parsed?.client_company_id
    ? (companies.find((c) => c.id === parsed.client_company_id)?.name ?? parsed.client_name_matched)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            Log work
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            placeholder='Describe what you worked on… e.g. "Worked on Acme invoicing for 2 hours this morning"'
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !parsed) handleParse();
            }}
          />

          {hasPrefilledTimes && (
            <p className="text-xs text-muted-foreground">
              Time range: {minutesToTimeStr(initialStartMinutes!)} – {minutesToTimeStr(initialEndMinutes!)}
            </p>
          )}

          {parsed && (
            <div className="rounded-lg border border-border bg-muted/20">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/30 rounded-lg"
                onClick={() => setShowDetails((v) => !v)}
              >
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Parsed fields</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", showDetails && "rotate-180")} />
              </button>
              {showDetails && (
                <div className="border-t px-3 py-2.5 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Company</span>
                    <span className="text-xs font-medium truncate">{parsedCompanyName ?? "None"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Description</span>
                    <span className="text-xs font-medium text-right max-w-[220px]">{parsed.description}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Duration</span>
                    <span className="text-xs font-medium font-mono">{formatDuration(parsed.duration_seconds)}</span>
                  </div>
                  {!hasPrefilledTimes && parsed.start_time && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">Start</span>
                      <span className="text-xs font-medium font-mono">{format(parseISO(parsed.start_time), "HH:mm")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!parsed ? (
            <Button size="sm" onClick={handleParse} disabled={!text.trim() || isParsing}>
              {isParsing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isParsing ? "Enhancing…" : "Enhance with AI"}
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              Save entry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function EntryActionsMenu({
  onEdit,
  onDelete,
  onDuplicate,
  onContinue,
  canContinue = true,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          aria-label="Entry actions"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="2.5" r="1.5" fill="currentColor" />
            <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
            <circle cx="7.5" cy="12.5" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Duplicate
        </DropdownMenuItem>
        {canContinue && onContinue ? (
          <DropdownMenuItem onClick={onContinue}>
            <Play className="mr-2 h-3.5 w-3.5" />
            Continue timer
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const HOUR_HEIGHT = 52;
const MINUTES_IN_DAY = 24 * 60;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

const NO_CLIENT_POPOVER_VALUE = "__no_client__";

function minutesToTimeString(minutes: number) {
  const clamped = Math.max(0, Math.min(MINUTES_IN_DAY, minutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeStringToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const total = h * 60 + m;
  if (total < 0 || total > MINUTES_IN_DAY) return null;
  return total;
}

function InlineCreateForm({
  dateValue,
  startMinutes,
  endMinutes,
  companies,
  onRangeChange,
  onCancel,
  onCreated,
}: {
  dateValue: string;
  startMinutes: number;
  endMinutes: number;
  companies: Array<{ id: string; name: string }>;
  onRangeChange: (next: { startMinutes: number; endMinutes: number }) => void;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [description, setDescription] = useState("");
  const [clientValue, setClientValue] = useState<string>(NO_CLIENT_POPOVER_VALUE);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startStr = minutesToTimeString(startMinutes);
  const endStr = minutesToTimeString(endMinutes);
  const durationSec = Math.max(0, (endMinutes - startMinutes) * 60);
  const invalidRange = endMinutes - startMinutes < 15;

  async function handleSave() {
    if (invalidRange) return;
    setSaving(true);
    try {
      await createTimeEntry({
        client_company_id: clientValue === NO_CLIENT_POPOVER_VALUE ? null : clientValue,
        description: description.trim() || null,
        start_time: buildIsoDateTimeFromMinutes(dateValue, startMinutes),
        stop_time: buildIsoDateTimeFromMinutes(dateValue, endMinutes),
        date: dateValue,
        billable: true,
        currency: "SEK",
      });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({ title: "Time entry logged" });
      onCreated();
    } catch {
      toast({ title: "Failed to save entry", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-3 p-3"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">New entry</p>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {formatDuration(durationSec)}
        </span>
      </div>
      <div>
        <Label htmlFor="inline-create-desc" className="sr-only">
          Description
        </Label>
        <Input
          id="inline-create-desc"
          autoFocus
          placeholder="What did you work on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
            if (e.key === "Escape") onCancel();
          }}
          className="h-8 text-sm"
        />
      </div>
      <div>
        <Label className="sr-only">Client</Label>
        <Select value={clientValue} onValueChange={setClientValue}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="No client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CLIENT_POPOVER_VALUE}>No client</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="time"
          value={startStr}
          onChange={(e) => {
            const mins = timeStringToMinutes(e.target.value);
            if (mins === null) return;
            onRangeChange({
              startMinutes: Math.min(mins, endMinutes - 15),
              endMinutes,
            });
          }}
          className="h-8 flex-1 text-sm"
          aria-label="Start time"
        />
        <span className="text-xs text-muted-foreground">→</span>
        <Input
          type="time"
          value={endStr}
          onChange={(e) => {
            const mins = timeStringToMinutes(e.target.value);
            if (mins === null) return;
            onRangeChange({
              startMinutes,
              endMinutes: Math.max(mins, startMinutes + 15),
            });
          }}
          className="h-8 flex-1 text-sm"
          aria-label="End time"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="border-0 text-[#1a1a1a] font-medium hover:opacity-90"
          style={{ backgroundColor: "#b0ee8f" }}
          onClick={handleSave}
          disabled={saving || invalidRange}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

type TimelineInteraction =
  | {
      type: "move";
      entry: TimeEntry;
      startY: number;
      startMinutes: number;
      endMinutes: number;
    }
  | {
      type: "resize-start";
      entry: TimeEntry;
      startY: number;
      startMinutes: number;
      endMinutes: number;
    }
  | {
      type: "resize-end";
      entry: TimeEntry;
      startY: number;
      startMinutes: number;
      endMinutes: number;
    }
  | {
      type: "create";
      anchorY: number;
      anchorMinutes: number;
      currentMinutes: number;
    };

function DayTimeline({
  dateValue,
  entries,
  companies,
  onReschedule,
  onEdit,
  onCreated,
}: {
  dateValue: string;
  entries: TimeEntry[];
  companies: Array<{ id: string; name: string }>;
  onReschedule: (entry: TimeEntry, nextDate: string, startMinutes: number, endMinutes: number) => void;
  onEdit: (entry: TimeEntry) => void;
  onCreated?: () => void;
}) {
  const [interaction, setInteraction] = useState<TimelineInteraction | null>(null);
  const [preview, setPreview] = useState<Record<string, { startMinutes: number; endMinutes: number }>>({});
  const [pendingCreate, setPendingCreate] = useState<{ startMinutes: number; endMinutes: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interaction) return;

    function handleMouseMove(event: MouseEvent) {
      if (interaction.type === "create") {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const relY = event.clientY - rect.top;
          const currentMinutes = Math.max(0, Math.min(MINUTES_IN_DAY, snapMinutes(relY / PIXELS_PER_MINUTE)));
          setInteraction({ ...interaction, currentMinutes });
        }
        return;
      }

      const deltaMinutes = snapMinutes((event.clientY - interaction.startY) / PIXELS_PER_MINUTE);
      const duration = interaction.endMinutes - interaction.startMinutes;

      if (interaction.type === "move") {
        const nextStart = Math.max(0, Math.min(MINUTES_IN_DAY - duration, interaction.startMinutes + deltaMinutes));
        setPreview({
          [interaction.entry.id]: {
            startMinutes: nextStart,
            endMinutes: nextStart + duration,
          },
        });
        return;
      }

      if (interaction.type === "resize-start") {
        const nextStart = Math.max(0, Math.min(interaction.endMinutes - 15, interaction.startMinutes + deltaMinutes));
        setPreview({
          [interaction.entry.id]: {
            startMinutes: snapMinutes(nextStart),
            endMinutes: interaction.endMinutes,
          },
        });
        return;
      }

      const nextEnd = Math.max(interaction.startMinutes + 15, Math.min(MINUTES_IN_DAY, interaction.endMinutes + deltaMinutes));
      setPreview({
        [interaction.entry.id]: {
          startMinutes: interaction.startMinutes,
          endMinutes: snapMinutes(nextEnd),
        },
      });
    }

    function handleMouseUp() {
      if (interaction.type === "create") {
        const start = Math.min(interaction.anchorMinutes, interaction.currentMinutes);
        const end = Math.max(interaction.anchorMinutes, interaction.currentMinutes);
        if (end - start >= 15) {
          setPendingCreate({ startMinutes: start, endMinutes: end });
        }
        setInteraction(null);
        return;
      }

      const next = preview[interaction.entry.id];
      if (next) {
        onReschedule(interaction.entry, dateValue, next.startMinutes, next.endMinutes);
      }
      setPreview({});
      setInteraction(null);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp, { once: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dateValue, interaction, onReschedule, preview]);

  const timelineEntries = entries
    .slice()
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((entry) => {
      const draft = preview[entry.id];
      const startMinutes = draft?.startMinutes ?? entryStartMinutes(entry);
      const endMinutes = draft?.endMinutes ?? entryEndMinutes(entry);
      return { entry, startMinutes, endMinutes };
    });

  return (
    <div className="rounded-md border bg-background">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Day timeline</h3>
        <p className="text-xs text-muted-foreground">Drag entries to move them. Drag the top or bottom edge to resize duration.</p>
      </div>
      <div ref={containerRef} className="relative h-[1248px] overflow-hidden select-none">
        <div className="absolute inset-0">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div
              key={hour}
              className="absolute inset-x-0 border-t border-border/60"
              style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
            >
              <span className="absolute left-2 top-1 text-[10px] font-mono text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-14 right-3">
          {/* Background drag-to-create area */}
          <div
            className={cn("absolute inset-0", pendingCreate ? "" : "cursor-crosshair")}
            style={{ zIndex: 0 }}
            onMouseDown={(e) => {
              if (pendingCreate) return;
              e.preventDefault();
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) {
                const relY = e.clientY - rect.top;
                const anchorMinutes = Math.max(0, Math.min(MINUTES_IN_DAY, snapMinutes(relY / PIXELS_PER_MINUTE)));
                setInteraction({ type: "create", anchorY: e.clientY, anchorMinutes, currentMinutes: anchorMinutes });
              }
            }}
          />
          {/* Drag-in-progress preview block */}
          {interaction?.type === "create" && (() => {
            const previewStart = Math.min(interaction.anchorMinutes, interaction.currentMinutes);
            const previewEnd = Math.max(interaction.anchorMinutes, interaction.currentMinutes);
            return (
              <div
                className="pointer-events-none absolute left-0 right-0 rounded-md border-2 border-dashed"
                style={{
                  top: previewStart * PIXELS_PER_MINUTE,
                  height: Math.max((previewEnd - previewStart) * PIXELS_PER_MINUTE, 4),
                  borderColor: "#b0ee8f",
                  backgroundColor: "#b0ee8f33",
                  zIndex: 20,
                }}
              />
            );
          })()}
          {/* Post-drag pending block + inline popover */}
          {pendingCreate && (
            <Popover
              open
              onOpenChange={(open) => {
                if (!open) setPendingCreate(null);
              }}
            >
              <PopoverAnchor asChild>
                <div
                  className="absolute left-0 right-0 rounded-md border-2 border-dashed"
                  style={{
                    top: pendingCreate.startMinutes * PIXELS_PER_MINUTE,
                    height: Math.max(
                      (pendingCreate.endMinutes - pendingCreate.startMinutes) * PIXELS_PER_MINUTE,
                      4,
                    ),
                    borderColor: "#b0ee8f",
                    backgroundColor: "#b0ee8f33",
                    zIndex: 20,
                  }}
                />
              </PopoverAnchor>
              <PopoverContent
                side="right"
                align="start"
                sideOffset={16}
                collisionPadding={16}
                className="w-80 p-0"
              >
                <InlineCreateForm
                  dateValue={dateValue}
                  startMinutes={pendingCreate.startMinutes}
                  endMinutes={pendingCreate.endMinutes}
                  companies={companies}
                  onRangeChange={(next) => setPendingCreate(next)}
                  onCancel={() => setPendingCreate(null)}
                  onCreated={() => {
                    setPendingCreate(null);
                    onCreated?.();
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
          {timelineEntries.map(({ entry, startMinutes, endMinutes }) => {
            const top = startMinutes * PIXELS_PER_MINUTE;
            const height = Math.max((endMinutes - startMinutes) * PIXELS_PER_MINUTE, 28);
            const interactive = Boolean(entry.stop_time);
            return (
              <div
                key={entry.id}
                className={cn(
                  "absolute left-0 right-0 overflow-hidden rounded-md border px-3 py-2 shadow-sm",
                  interactive ? "cursor-move" : "cursor-default opacity-80",
                )}
                style={{
                  top,
                  height,
                  zIndex: 10,
                  backgroundColor: `${clientColor(entry.client_name)}1A`,
                  borderColor: `${clientColor(entry.client_name)}55`,
                }}
                onDoubleClick={() => onEdit(entry)}
                onMouseDown={(event) => {
                  if (!interactive) return;
                  event.preventDefault();
                  setInteraction({
                    type: "move",
                    entry,
                    startY: event.clientY,
                    startMinutes,
                    endMinutes,
                  });
                  setPreview({
                    [entry.id]: { startMinutes, endMinutes },
                  });
                }}
              >
                {interactive ? (
                  <button
                    type="button"
                    className="absolute inset-x-0 top-0 h-2 cursor-ns-resize"
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setInteraction({
                        type: "resize-start",
                        entry,
                        startY: event.clientY,
                        startMinutes,
                        endMinutes,
                      });
                      setPreview({
                        [entry.id]: { startMinutes, endMinutes },
                      });
                    }}
                  />
                ) : null}
                <div className="pr-8">
                  <p className="truncate text-xs font-semibold">{describeEntry(entry)}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{secondaryEntryLabel(entry) || "No client or project"}</p>
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                    {String(Math.floor(startMinutes / 60)).padStart(2, "0")}:{String(startMinutes % 60).padStart(2, "0")} - {String(Math.floor(endMinutes / 60)).padStart(2, "0")}:{String(endMinutes % 60).padStart(2, "0")}
                  </p>
                </div>
                {interactive ? (
                  <button
                    type="button"
                    className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setInteraction({
                        type: "resize-end",
                        entry,
                        startY: event.clientY,
                        startMinutes,
                        endMinutes,
                      });
                      setPreview({
                        [entry.id]: { startMinutes, endMinutes },
                      });
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Day Detail Dialog ────────────────────────────────────────────────────────

function DayDetailDialog({
  open,
  onOpenChange,
  dateValue,
  entries,
  companies,
  onEdit,
  onDelete,
  onDuplicate,
  onContinue,
  onReschedule,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dateValue: string;
  entries: TimeEntry[];
  companies: Array<{ id: string; name: string }>;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onDuplicate: (entry: TimeEntry) => void;
  onContinue: (entry: TimeEntry) => void;
  onReschedule: (entry: TimeEntry, nextDate: string, startMinutes: number, endMinutes: number) => void;
}) {
  const [logOpen, setLogOpen] = useState(false);
  const totalSec = entries.reduce((sum, e) => sum + (e.duration ?? e.elapsed_seconds ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="flex-none pl-6 pr-14 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold">
                {format(parseISO(dateValue), "EEEE, d MMMM yyyy")}
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? "entry" : "entries"} · {formatDuration(totalSec)}
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 border-0 text-[#1a1a1a] font-medium hover:opacity-90"
              style={{ backgroundColor: "#b0ee8f" }}
              onClick={() => setLogOpen(true)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Log
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid md:grid-cols-[minmax(0,1fr)_300px] h-full">
            <div className="overflow-y-auto border-r">
              <DayTimeline
                dateValue={dateValue}
                entries={entries}
                companies={companies}
                onReschedule={onReschedule}
                onEdit={onEdit}
              />
            </div>
            <div className="divide-y overflow-y-auto">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center text-muted-foreground">
                  <p className="text-sm font-medium text-foreground">No entries yet</p>
                  <p className="text-xs">Drag on the timeline to create one.</p>
                </div>
              ) : (
                entries
                  .slice()
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((entry) => (
                    <div key={entry.id} className="group flex items-start gap-3 px-4 py-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: clientColor(entry.client_name) }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{describeEntry(entry)}</p>
                        {entry.client_name && (
                          <p className="truncate text-xs text-muted-foreground">{entry.client_name}</p>
                        )}
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{formatRange(entry)}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {formatDuration(entry.duration ?? entry.elapsed_seconds ?? 0)}
                      </span>
                      <EntryActionsMenu
                        onEdit={() => onEdit(entry)}
                        onDelete={() => onDelete(entry.id)}
                        onDuplicate={() => onDuplicate(entry)}
                        onContinue={() => onContinue(entry)}
                        canContinue={Boolean(entry.stop_time)}
                      />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <LogDialog
          open={logOpen}
          onOpenChange={setLogOpen}
          companies={companies}
          initialDate={dateValue}
        />
      </DialogContent>
    </Dialog>
  );
}

type CalendarView = "day" | "week" | "month" | "year";

export function TimeTrackingView() {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [dayDialogDate, setDayDialogDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [logOpen, setLogOpen] = useState(false);
  const [draggingEntryId, setDraggingEntryId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { companies } = useCompany();
  const { startTracking } = useTimer();

  const { dateFrom, dateTo, rangeLabel } = useMemo(() => {
    if (view === "day") {
      const d = format(currentDate, "yyyy-MM-dd");
      return { dateFrom: d, dateTo: d, rangeLabel: format(currentDate, "EEE, d MMM yyyy") };
    }
    if (view === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      const sameMonth = isSameMonth(ws, we);
      const label = sameMonth
        ? `${format(ws, "d")} – ${format(we, "d MMM yyyy")}`
        : `${format(ws, "d MMM")} – ${format(we, "d MMM yyyy")}`;
      return {
        dateFrom: format(ws, "yyyy-MM-dd"),
        dateTo: format(we, "yyyy-MM-dd"),
        rangeLabel: label,
      };
    }
    if (view === "year") {
      return {
        dateFrom: format(startOfYear(currentDate), "yyyy-MM-dd"),
        dateTo: format(endOfYear(currentDate), "yyyy-MM-dd"),
        rangeLabel: format(currentDate, "yyyy"),
      };
    }
    return {
      dateFrom: format(startOfMonth(currentDate), "yyyy-MM-dd"),
      dateTo: format(endOfMonth(currentDate), "yyyy-MM-dd"),
      rangeLabel: format(currentDate, "MMMM yyyy"),
    };
  }, [view, currentDate]);

  const today = new Date();
  const fallbackEntryDate = isSameMonth(currentDate, today)
    ? format(today, "yyyy-MM-dd")
    : format(startOfMonth(currentDate), "yyyy-MM-dd");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["time-entries", dateFrom, dateTo],
    queryFn: () => listTimeEntries({ date_from: dateFrom, date_to: dateTo }),
    refetchInterval: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({ title: "Entry deleted" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: TimeEntryUpdate }) => updateTimeEntry(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
  });

  const dayDialogEntries = useMemo(
    () => entries.filter((entry) => entry.date === dayDialogDate),
    [entries, dayDialogDate],
  );

  function openDayDialog(dateValue: string) {
    setDayDialogDate(dateValue);
    setDayDialogOpen(true);
  }

  async function handleDuplicate(entry: TimeEntry) {
    try {
      await createTimeEntry({
        client_company_id: entry.client_company_id,
        description: entry.description,
        start_time: entry.start_time,
        stop_time: entry.stop_time ?? undefined,
        date: entry.date,
        billable: entry.billable,
        rate: entry.rate ?? undefined,
        currency: entry.currency,
      });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({ title: "Entry duplicated" });
    } catch {
      toast({ title: "Failed to duplicate entry", variant: "destructive" });
    }
  }

  async function handleContinue(entry: TimeEntry) {
    await startTracking({
      client_company_id: entry.client_company_id,
      description: entry.description,
    });
    queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    toast({ title: "Timer restarted from entry" });
  }

  async function handleReschedule(entry: TimeEntry, nextDate: string, startMinutes: number, endMinutes: number) {
    if (!entry.stop_time) return;
    await updateMutation.mutateAsync({
      entryId: entry.id,
      data: {
        date: nextDate,
        start_time: buildIsoDateTimeFromMinutes(nextDate, snapMinutes(startMinutes)),
        stop_time: buildIsoDateTimeFromMinutes(nextDate, snapMinutes(endMinutes)),
      },
    });
  }

  async function handleMoveEntryToDate(entryId: string, targetDate: string) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    setDraggingEntryId(null);
    if (!entry || !entry.stop_time || entry.date === targetDate) return;
    await handleReschedule(entry, targetDate, entryStartMinutes(entry), entryEndMinutes(entry));
    toast({ title: "Entry moved" });
  }

  function shiftDate(direction: 1 | -1) {
    setSelectedDate(null);
    setCurrentDate((value) => {
      if (view === "day") return direction === 1 ? addDays(value, 1) : subDays(value, 1);
      if (view === "week") return direction === 1 ? addWeeks(value, 1) : subWeeks(value, 1);
      if (view === "year") return direction === 1 ? addYears(value, 1) : subYears(value, 1);
      return direction === 1 ? addMonths(value, 1) : subMonths(value, 1);
    });
  }

  const dayDateValue = format(currentDate, "yyyy-MM-dd");
  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.date === dayDateValue),
    [entries, dayDateValue],
  );

  const views: CalendarView[] = ["day", "week", "month", "year"];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: sleek view toggle */}
        <div
          role="tablist"
          aria-label="Calendar view"
          className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5"
        >
          {views.map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                role="tab"
                aria-selected={active}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            );
          })}
        </div>

        {/* Right: log + range nav */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="border-0 text-[#1a1a1a] font-medium hover:opacity-90"
            style={{ backgroundColor: "#b0ee8f" }}
            onClick={() => setLogOpen(true)}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Log
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Previous range"
            onClick={() => shiftDate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium tabular-nums">
            {rangeLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Next range"
            onClick={() => shiftDate(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 rounded-md border border-border bg-background py-12 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : view === "day" ? (
        <DayTimeline
          dateValue={dayDateValue}
          entries={dayEntries}
          companies={companies}
          onReschedule={handleReschedule}
          onEdit={(entry) => openDayDialog(entry.date)}
        />
      ) : view === "year" ? (
        <YearCalendar
          currentDate={currentDate}
          entries={entries}
          onSelectDate={(date) => openDayDialog(date)}
          onSelectMonth={(monthDate) => {
            setCurrentDate(monthDate);
            setSelectedDate(null);
            setView("month");
          }}
        />
      ) : (
        <TrackerCalendar
          view={view === "week" ? "week" : "month"}
          currentDate={currentDate}
          entries={entries}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            if (date) openDayDialog(date);
          }}
          draggingEntryId={draggingEntryId}
          onBeginDragEntry={(entry) => setDraggingEntryId(entry.id)}
          onEndDragEntry={() => setDraggingEntryId(null)}
          onMoveEntryToDate={handleMoveEntryToDate}
        />
      )}

      <DayDetailDialog
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        dateValue={dayDialogDate}
        entries={dayDialogEntries}
        companies={companies}
        onEdit={(entry) => openDayDialog(entry.date)}
        onDelete={(id) => deleteMutation.mutate(id)}
        onDuplicate={handleDuplicate}
        onContinue={handleContinue}
        onReschedule={handleReschedule}
      />
      <LogDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        companies={companies}
        initialDate={fallbackEntryDate}
      />
    </div>
  );
}
