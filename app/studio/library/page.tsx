"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Check, LayoutGrid, List } from "lucide-react";
import { useTeam } from "@/lib/studio/TeamContext";
import { useToast } from "@/lib/studio/ToastContext";
import { DetailPanel } from "@/components/studio/library/DetailPanel";
import { getTeamGenerations, getTeamMembers } from "@/lib/api/teams";
import { getTools } from "@/lib/api/tools";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import { dedupeByJobId } from "@/lib/tools/dedupe-generations";
import { titleCase } from "@/lib/tools/group-by-category";
import type { Generation, GenerationsPeriod } from "@/lib/types/generation";
import type { TeamMember } from "@/lib/types/team";
import type { Tool } from "@/lib/types/tool";

const PAGE_SIZE = 25;

type DateChoice = GenerationsPeriod | "custom";
const DATE_CHOICES: { value: DateChoice; label: string }[] = [
  { value: "all_time", label: "All time" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shortDay(ymd: string) {
  return new Date(`${ymd}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Local-day bounds, sent as ISO instants so the backend filters on the
// user's own calendar days.
const dayStart = (ymd: string) => new Date(`${ymd}T00:00:00`).toISOString();
const dayEnd = (ymd: string) => new Date(`${ymd}T23:59:59.999`).toISOString();

const selectCls =
  "appearance-none border border-border bg-surface py-2.5 pl-3.5 pr-9 text-[12.5px] text-text outline-none hover:border-accent focus:border-accent";

// Fetch as a blob so the browser saves the file instead of navigating to it.
async function downloadImage(g: Generation): Promise<boolean> {
  if (!g.outputUrl) return false;
  try {
    const res = await fetch(g.outputUrl);
    if (!res.ok) return false;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await res.blob());
    a.download = `shootpx-${g.featureType}-${g.jobId.slice(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    return true;
  } catch {
    return false;
  }
}

export default function StudioLibrary() {
  const { activeTeamId, loading: teamsLoading } = useTeam();
  const { say } = useToast();
  const [detailId, setDetailId] = useState<string | null>(null);

  const [tools, setTools] = useState<Tool[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [toolFilter, setToolFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [dateChoice, setDateChoice] = useState<DateChoice>("all_time");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [customApplied, setCustomApplied] = useState<{ start: string; end: string } | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Only the unfiltered first page is cached — that's what a reload lands on.
  const unfiltered = !toolFilter && !memberFilter && dateChoice === "all_time";
  const cacheKey = activeTeamId ? `library:${activeTeamId}` : null;
  const [items, setItems] = useState<Generation[]>(() =>
    dedupeByJobId((activeTeamId && readCache<Generation[]>(`library:${activeTeamId}`)) || []),
  );
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(
    () => !(activeTeamId && readCache<Generation[]>(`library:${activeTeamId}`)),
  );

  useEffect(() => {
    getTools()
      .then((r) =>
        setTools(r.tools.filter((t) => t.status === "live").sort((a, b) => a.cardSortOrder - b.cardSortOrder)),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeTeamId) return;
    getTeamMembers(activeTeamId)
      .then((r) => setMembers(r.members))
      .catch(() => setMembers([]));
  }, [activeTeamId]);

  const range = dateChoice === "custom" ? customApplied : null;

  function load(nextOffset: number, replace: boolean) {
    if (!activeTeamId) {
      setItems([]);
      setItemsLoading(false);
      return;
    }
    if (dateChoice === "custom" && !range) return; // waiting for Apply
    if (replace) {
      const cached = unfiltered && cacheKey ? readCache<Generation[]>(cacheKey) : null;
      if (cached) setItems(dedupeByJobId(cached));
      else setItemsLoading(true);
    } else {
      setItemsLoading(true);
    }
    getTeamGenerations(activeTeamId, {
      view: "library",
      limit: PAGE_SIZE,
      offset: nextOffset,
      featureType: toolFilter || undefined,
      userId: memberFilter || undefined,
      period: dateChoice === "custom" ? undefined : dateChoice,
      fromDate: range ? dayStart(range.start) : undefined,
      toDate: range ? dayEnd(range.end) : undefined,
    })
      .then((r) => {
        setItems((prev) => dedupeByJobId(replace ? r.generations : [...prev, ...r.generations]));
        setHasMore(r.generations.length === PAGE_SIZE);
        setOffset(nextOffset);
        if (replace && unfiltered && cacheKey) writeCache(cacheKey, r.generations);
        if (replace) setSelected(new Set());
      })
      .catch(() => {
        // Keep whatever we already have rather than blanking the grid out.
      })
      .finally(() => setItemsLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetching from the top when a filter changes
    load(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId, toolFilter, memberFilter, dateChoice, customApplied]);

  const loading = teamsLoading || itemsLoading;
  const toolName = useMemo(() => new Map(tools.map((t) => [t.featureType, t.displayName])), [tools]);
  const labelFor = (g: Generation) => toolName.get(g.featureType) ?? titleCase(g.featureType);

  const dateLabel =
    dateChoice === "custom" && customApplied
      ? `${shortDay(customApplied.start)} – ${shortDay(customApplied.end)}`
      : DATE_CHOICES.find((d) => d.value === dateChoice)!.label;

  function toggle(g: Generation) {
    if (g.status !== "completed" || !g.outputUrl) return; // failed jobs have no output
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(g.jobId)) next.add(g.jobId);
      return next;
    });
  }

  function exitSelect() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function downloadSelected() {
    const picked = items.filter((g) => selected.has(g.jobId));
    exitSelect();
    say(`Downloading ${picked.length} image${picked.length === 1 ? "" : "s"}…`);
    picked.forEach((g, i) =>
      setTimeout(async () => {
        if (!(await downloadImage(g))) say("Couldn't download an image — please try again");
      }, i * 250),
    );
  }

  function onItemClick(g: Generation) {
    if (selectMode) toggle(g);
    else if (g.status === "completed" && g.outputUrl) setDetailId(g.jobId);
  }

  const viewable = items.filter((g) => g.status === "completed" && g.outputUrl);
  const detail = viewable.find((g) => g.jobId === detailId) ?? null;
  const memberById = new Map(members.map((m) => [m.userId, m.name || m.email]));
  function stepDetail(dir: -1 | 1) {
    const i = viewable.findIndex((g) => g.jobId === detailId);
    if (i === -1 || viewable.length < 2) return;
    setDetailId(viewable[(i + dir + viewable.length) % viewable.length].jobId);
  }

  const checkbox = (g: Generation) => {
    const on = selected.has(g.jobId);
    const disabled = g.status !== "completed" || !g.outputUrl;
    return (
      <span
        className={`flex h-5 w-5 flex-none items-center justify-center rounded border-[1.5px] text-accent-ink ${
          on ? "border-accent bg-accent" : "border-border-strong bg-surface"
        } ${disabled ? "opacity-30" : ""}`}
      >
        {on && <Check size={13} strokeWidth={3} />}
      </span>
    );
  };

  const thumb = (g: Generation, sizes: string) =>
    g.status === "completed" && g.outputUrl ? (
      <Image src={g.outputUrl} alt={g.title || labelFor(g)} fill sizes={sizes} className="object-cover" />
    ) : (
      <div className="flex h-full items-center justify-center p-2 text-center text-[11px] text-dim">
        {g.status === "failed" ? "Failed" : "Processing"}
      </div>
    );

  return (
    <div className="flex flex-col gap-6 px-10 py-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <select value={toolFilter} onChange={(e) => setToolFilter(e.target.value)} className={selectCls}>
            <option value="">All tools</option>
            {tools.map((t) => (
              <option key={t.featureType} value={t.featureType}>
                {t.displayName}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dim" />
        </div>

        <div className="relative">
          <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className={selectCls}>
            <option value="">All members</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name || m.email}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dim" />
        </div>

        <div className="relative">
          <button
            onClick={() => setDateOpen((o) => !o)}
            className="flex items-center gap-2 border border-border bg-surface px-3.5 py-2.5 text-[12.5px] hover:border-accent"
          >
            {dateLabel}
            <ChevronDown size={12} className="text-dim" />
          </button>
          {dateOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDateOpen(false)} />
              <div className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-[220px] border border-border-strong bg-surface">
                {DATE_CHOICES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setDateChoice(d.value);
                      if (d.value !== "custom") setDateOpen(false);
                    }}
                    className={`block w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-surface-2 ${
                      dateChoice === d.value ? "text-accent" : "text-text"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
                {dateChoice === "custom" && (
                  <div className="flex flex-col gap-2 border-t border-border p-3">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={customStart}
                        max={customEnd || undefined}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="min-w-0 flex-1 border border-border bg-bg px-2 py-1.5 text-xs [color-scheme:dark]"
                      />
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="min-w-0 flex-1 border border-border bg-bg px-2 py-1.5 text-xs [color-scheme:dark]"
                      />
                    </div>
                    <button
                      disabled={!customStart || !customEnd}
                      onClick={() => {
                        setCustomApplied({ start: customStart, end: customEnd });
                        setDateOpen(false);
                      }}
                      className="rounded-full bg-accent py-2 text-[12.5px] font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {selected.size > 0 && (
          <button
            onClick={downloadSelected}
            className="whitespace-nowrap rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Download ({selected.size})
          </button>
        )}
        <button
          onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] hover:border-accent ${
            selectMode ? "border-accent text-accent" : "border-border-strong text-text"
          }`}
        >
          {selectMode ? "Cancel" : "Select"}
        </button>
        <div className="flex border border-border">
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`px-3 py-2.5 ${view === "grid" ? "bg-accent text-accent-ink" : "bg-bg text-dim"}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            className={`border-l border-border px-3 py-2.5 ${view === "list" ? "bg-accent text-accent-ink" : "bg-bg text-dim"}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <p className="py-16 text-center text-sm text-dim">Loading…</p>
      ) : items.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3.5 text-center text-dim">
          <span className="text-4xl opacity-50">▢</span>
          <span className="text-[15px] font-semibold text-muted">
            {unfiltered ? "No projects yet" : "No results for these filters"}
          </span>
          <span className="text-[13px]">
            {unfiltered ? "Run a tool to generate your first shoot." : "Try changing or clearing a filter."}
          </span>
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
              {items.map((g) => (
                <button
                  key={g.jobId}
                  onClick={() => onItemClick(g)}
                  className={`relative aspect-square overflow-hidden border bg-surface text-left ${
                    selected.has(g.jobId) ? "border-accent" : "border-border"
                  }`}
                >
                  {thumb(g, "20vw")}
                  {selectMode && <span className="absolute left-2 top-2">{checkbox(g)}</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="border border-border">
              {items.map((g) => (
                <button
                  key={g.jobId}
                  onClick={() => onItemClick(g)}
                  className="grid w-full grid-cols-[1fr_100px] items-center gap-3 border-b border-border px-4 py-2.5 text-left last:border-b-0 hover:bg-surface"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {selectMode && checkbox(g)}
                    <div className="relative h-9 w-9 flex-none overflow-hidden bg-surface">{thumb(g, "40px")}</div>
                    <span className="truncate text-[13px] font-medium">{labelFor(g)}</span>
                  </div>
                  <span className="text-right font-mono text-[11px] text-dim">{formatDate(g.createdAt)}</span>
                </button>
              ))}
            </div>
          )}

          {hasMore && (
            <button
              onClick={() => load(offset + PAGE_SIZE, false)}
              disabled={loading}
              className="mx-auto rounded-full border border-border-strong px-6 py-2.5 text-[13px] font-medium hover:border-accent disabled:opacity-60"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}

      {detail && (
        <DetailPanel
          item={detail}
          toolLabel={labelFor(detail)}
          memberName={(detail.userId && memberById.get(detail.userId)) || null}
          onClose={() => setDetailId(null)}
          onStep={stepDetail}
          canStep={viewable.length > 1}
          onDownload={async () => {
            if (!(await downloadImage(detail))) say("Couldn't download this image — please try again");
          }}
        />
      )}
    </div>
  );
}
