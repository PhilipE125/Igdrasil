import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLog, verifyAuditChain, type AuditEvent } from "@/lib/uploadApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TableFilterBar } from "@/components/ui/table-filter-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Link2,
  Lock,
  Monitor,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

const PAGE_SIZE = 25;

const EVENT_TYPE_LABELS: Record<string, string> = {
  "document.classified_type": "Typ klassificerad",
  "document.classified_accounts": "Konton klassificerade",
  "document.structured": "Text strukturerad",
  "document.extracted": "Text extraherad",
  "document.flagged": "Dokument flaggat",
  "journal.created": "Verifikation skapad",
  "journal.edited": "Verifikation redigerad",
  "journal.approved": "Verifikation godkänd",
  "journal.rejected": "Verifikation avvisad",
  "journal.exported": "Verifikation exporterad",
  "ledger.entry_posted": "Huvudbok bokförd",
  "match.proposed": "Matchning föreslagen",
  "match.auto_approved": "Matchning auto-godkänd",
  "match.approved": "Matchning godkänd",
  "match.rejected": "Matchning avvisad",
  "payment.verifikation_created": "Betalningsverifikation skapad",
  "invoice.status_changed": "Fakturastatus ändrad",
};

const ACTOR_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  user: { label: "Användare", icon: <User className="size-3" />, variant: "default" },
  llm: { label: "AI", icon: <Bot className="size-3" />, variant: "secondary" },
  system: { label: "System", icon: <Monitor className="size-3" />, variant: "outline" },
  scheduler: { label: "Schemalagd", icon: <Clock className="size-3" />, variant: "outline" },
};

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function EventDetailDialog({ event }: { event: AuditEvent }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
          <ChevronRight className="size-3" />
          Detaljer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">{EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}</DialogTitle>
          <DialogDescription>{formatTimestamp(event.created_at)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Aktör</p>
              <p>{ACTOR_CONFIG[event.actor_type]?.label ?? event.actor_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entitet</p>
              <p>{event.entity_type}/{event.entity_id?.slice(0, 8) ?? "-"}</p>
            </div>
          </div>

          {event.hash && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hash-kedja</p>
              <div className="flex items-center gap-2">
                <Lock className="size-3 text-muted-foreground shrink-0" />
                <code className="text-[10px] text-muted-foreground font-mono break-all">{event.hash}</code>
              </div>
              {event.parent_event_id && (
                <div className="flex items-center gap-2 mt-1">
                  <Link2 className="size-3 text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground">Förälder: {event.parent_event_id.slice(0, 8)}</span>
                </div>
              )}
            </div>
          )}

          {event.details && Object.keys(event.details).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Detaljer</p>
              <pre className="rounded-md bg-muted p-2 text-[11px] overflow-x-auto max-h-48">
                {JSON.stringify(event.details, null, 2)}
              </pre>
            </div>
          )}

          {event.previous_state && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tidigare tillstånd</p>
              <pre className="rounded-md bg-muted p-2 text-[11px] overflow-x-auto max-h-32">
                {JSON.stringify(event.previous_state, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditTrailView() {
  const [page, setPage] = useState(1);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-log", page, eventTypeFilter, actorFilter],
    queryFn: () =>
      getAuditLog({
        page,
        page_size: PAGE_SIZE,
        event_type: eventTypeFilter !== "all" ? eventTypeFilter : undefined,
        actor_type: actorFilter !== "all" ? actorFilter : undefined,
      }),
    refetchInterval: 30_000,
  });

  const { data: chainStatus, refetch: recheckChain, isFetching: chainChecking } = useQuery({
    queryKey: ["audit-chain-verify"],
    queryFn: verifyAuditChain,
    staleTime: 60_000,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = data?.items ?? [];
    if (!term) return items;
    return items.filter((event) =>
      [
        EVENT_TYPE_LABELS[event.event_type] ?? event.event_type,
        event.entity_id ?? "",
        event.actor_type,
        event.hash ?? "",
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [data?.items, search]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Granskningslogg</h1>
        <p className="text-sm text-muted-foreground">
          Oföränderlig hash-kedja som spårar alla händelser — klassificeringar, godkännanden, matchningar och betalningar.
        </p>
      </div>

      {/* Chain integrity banner */}
      <Card>
        <CardContent className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            {chainStatus?.valid ? (
              <ShieldCheck className="size-5 text-green-600" />
            ) : chainStatus?.valid === false ? (
              <XCircle className="size-5 text-red-500" />
            ) : (
              <ShieldCheck className="size-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {chainStatus?.valid
                  ? "Hash-kedjan är intakt"
                  : chainStatus?.valid === false
                  ? "Hash-kedjan är bruten"
                  : "Verifierar..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {chainStatus ? `${chainStatus.entries} poster verifierade` : ""}
                {chainStatus?.error ? ` — ${chainStatus.error}` : ""}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => recheckChain()}
            disabled={chainChecking}
          >
            {chainChecking ? "Verifierar..." : "Verifiera kedja"}
          </Button>
        </CardContent>
      </Card>

      {/* Event table */}
      <Card>
        <CardContent className="p-0">
          <TableFilterBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Sök händelse, hash, entitet…"
            activeFilters={[
              ...(eventTypeFilter !== "all"
                ? [{ id: "eventType", label: "Händelse", value: EVENT_TYPE_LABELS[eventTypeFilter] ?? eventTypeFilter, onRemove: () => { setEventTypeFilter("all"); setPage(1); } }]
                : []),
              ...(actorFilter !== "all"
                ? [{ id: "actor", label: "Aktör", value: ACTOR_CONFIG[actorFilter]?.label ?? actorFilter, onRemove: () => { setActorFilter("all"); setPage(1); } }]
                : []),
            ]}
            filterDimensions={[
              {
                id: "eventType",
                label: "Händelsetyp",
                options: Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => ({ value: key, label })),
                currentValue: eventTypeFilter !== "all" ? eventTypeFilter : undefined,
                onSelect: (v) => { setEventTypeFilter(v); setPage(1); },
              },
              {
                id: "actor",
                label: "Aktör",
                options: Object.entries(ACTOR_CONFIG).map(([key, { label }]) => ({ value: key, label })),
                currentValue: actorFilter !== "all" ? actorFilter : undefined,
                onSelect: (v) => { setActorFilter(v); setPage(1); },
              },
            ]}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Tidpunkt</TableHead>
                <TableHead>Händelse</TableHead>
                <TableHead className="w-[100px]">Aktör</TableHead>
                <TableHead className="w-[140px]">Entitet</TableHead>
                <TableHead className="w-[100px]">Hash</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-destructive py-8">
                    Kunde inte ladda granskningsloggen.
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Inga händelser hittades.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((event) => {
                  const actor = ACTOR_CONFIG[event.actor_type] ?? ACTOR_CONFIG.system;
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs tabular-nums">
                        {formatTimestamp(event.created_at)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={actor.variant} className="gap-1 text-[10px]">
                          {actor.icon}
                          {actor.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {event.entity_id?.slice(0, 8) ?? "-"}
                      </TableCell>
                      <TableCell>
                        {event.hash && (
                          <code className="text-[10px] text-muted-foreground font-mono">
                            {event.hash.slice(0, 8)}...
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        <EventDetailDialog event={event} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p > totalPages || p < 1) return null;
              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => setPage(p)}
                    isActive={p === page}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
