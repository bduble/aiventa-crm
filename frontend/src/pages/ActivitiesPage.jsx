import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
// If you do not have shadcn/ui for Tabs, Button, Input, stub them or create your own:
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowUpRight, Loader2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import classNames from "classnames";

const CATEGORY_KEYS = [
  "all",
  "lead",
  "showroom",
  "tasks",
  "digital",
  "deals",
  "appraisals",
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(null); // selected activity
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  // TODO: replace with real auth hook
  const role = window.__AIVENTA_USER_ROLE__ || "rep"; // "manager" | "admin" | "rep"

  useEffect(() => {
    const fetchMetrics = async () => {
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
      try {
        const res = await fetch(`/api/activities/metrics?date=${yesterday}`);
        if (!res.ok) throw new Error("Metrics fetch failed");
        setMetrics(await res.json());
      } catch (e) {
        setMetrics(null);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const qs = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
        category: category === "all" ? "" : category,
        search,
      });
      try {
        const res = await fetch(`/api/activities?${qs.toString()}`);
        if (!res.ok) throw new Error("Fetch failed");
        setActivities(await res.json());
      } catch (e) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, dateRange, search]);

  const columns = useMemo(() => [
    {
      accessorKey: "time",
      header: "Time",
      cell: info => format(new Date(info.getValue()), "h:mm aa"),
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "activity_type",
      header: "Type",
      cell: info => <TypeBadge type={info.getValue()} />,
    },
    {
      accessorKey: "advisor",
      header: "Advisor",
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => <StatusBadge status={info.getValue()} />,
    },
  ], []);

  const table = useReactTable({
    data: activities,
    columns,
    state: {
      globalFilter: search,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4 space-y-4">
      <KPIBar metrics={metrics} />

      <Tabs value={category} onValueChange={setCategory} className="w-full">
        <TabsList>
          {CATEGORY_KEYS.map(key => (
            <TabsTrigger key={key} value={key} className="capitalize">
              {key === "digital" ? "Digital Touches" : key}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search (VIN, customer, notes)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="px-3 py-2 text-left font-medium">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => setDrawer(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-1.5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {drawer && (
        <ActivityDrawer activity={drawer} onClose={() => setDrawer(null)} />
      )}
    </div>
  );
}

function KPIBar({ metrics }) {
  if (!metrics) return null;
  const { calls, texts, emails, appointments } = metrics;
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="flex flex-wrap gap-6 p-4">
        <KpiItem label="Calls" value={calls} />
        <KpiItem label="Texts" value={texts} />
        <KpiItem label="Emails" value={emails} />
        <KpiItem label="Appointments" value={appointments} />
      </CardContent>
    </Card>
  );
}

function KpiItem({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-xs uppercase tracking-wide opacity-80 -mt-1">
        {label}
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const map = {
    call: "bg-amber-200 text-amber-700",
    text: "bg-sky-200 text-sky-700",
    email: "bg-emerald-200 text-emerald-700",
    showroom: "bg-purple-200 text-purple-700",
    task: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={classNames("px-2 py-0.5 rounded text-xs", map[type] || "bg-muted")}>{
      type.charAt(0).toUpperCase() + type.slice(1)
    }</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: "bg-green-200 text-green-700",
    pending: "bg-yellow-200 text-yellow-700",
    overdue: "bg-red-200 text-red-700 animate-pulse",
  };
  return (
    <span className={classNames("px-2 py-0.5 rounded text-xs", map[status] || "bg-muted")}>{
      status
    }</span>
  );
}

function DateRangePicker({ value, onChange }) {
  const handleStart = e => onChange({ ...value, start: e.target.value });
  const handleEnd = e => onChange({ ...value, end: e.target.value });
  return (
    <div className="flex items-center gap-1 text-sm">
      <Input type="date" value={value.start} onChange={handleStart} />
      <span className="mx-1">–</span>
      <Input type="date" value={value.end} onChange={handleEnd} />
    </div>
  );
}

function ActivityDrawer({ activity, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex">
      <div className="ml-auto w-full max-w-lg bg-background shadow-xl h-full overflow-y-auto animate-slideIn">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Activity Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </header>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="font-medium">{activity.customer}</h3>
            <p className="text-xs opacity-70">{format(new Date(activity.time), "PPpp")}</p>
          </div>

          <Card>
            <CardContent className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Advisor</span>
                <span>{activity.advisor}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Type</span>
                <span>{activity.activity_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Status</span>
                <StatusBadge status={activity.status} />
              </div>
            </CardContent>
          </Card>

          {/* AI INSIGHTS */}
          <AIInsights activityId={activity.id} />
        </div>
      </div>
    </div>
  );
}

function AIInsights({ activityId }) {
  const [tip, setTip] = useState(null);
  useEffect(() => {
    const getTip = async () => {
      try {
        const res = await fetch(`/api/activities/${activityId}/insight`);
        if (!res.ok) return;
        const { recommendation } = await res.json();
        setTip(recommendation);
      } catch {
        /* ignore */
      }
    };
    getTip();
  }, [activityId]);

  if (!tip) return null;
  return (
    <Card className="border-dashed border-2 border-primary">
      <CardContent className="p-4 flex gap-2 items-start">
        <ArrowUpRight className="shrink-0" />
        <p className="text-sm leading-tight">{tip}</p>
      </CardContent>
    </Card>
  );
}
