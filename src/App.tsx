
import { useEffect, useState, type FormEvent } from "react";
import {
  Activity, ArrowRight, Bell, CalendarDays, Check, CheckCircle2,
  ClipboardList, Clock3, LayoutDashboard, Menu, Plus, Search,
  Users, Wallet, X, MapPin, MoreHorizontal, Trash2
} from "lucide-react";

type Page = "Overview" | "Events" | "Tasks" | "Expenses" | "Team";

type EventItem = {
  id: number;
  name: string;
  date: string;
  venue: string;
  budget: number;
  status: string;
};

type TaskItem = {
  id: number;
  title: string;
  event: string;
  assignee: string;
  due: string;
  done: boolean;
};

type ExpenseItem = {
  id: number;
  title: string;
  category: string;
  amount: number;
  person: string;
  status: "Pending" | "Approved" | "Rejected";
};

const initialEvents: EventItem[] = [
  { id: 1, name: "TechVista 2026", date: "12 Nov 2026", venue: "Main Auditorium", budget: 85000, status: "Planning" },
  { id: 2, name: "Design Thinking Workshop", date: "18 Nov 2026", venue: "Seminar Hall 2", budget: 30000, status: "In progress" },
  { id: 3, name: "Department Day", date: "25 Nov 2026", venue: "College Campus", budget: 60000, status: "Upcoming" }
];

const initialTasks: TaskItem[] = [
  { id: 1, title: "Finalize event venue", event: "TechVista 2026", assignee: "Nihal", due: "Today", done: false },
  { id: 2, title: "Contact decoration vendors", event: "TechVista 2026", assignee: "Aarav", due: "Tomorrow", done: false },
  { id: 3, title: "Prepare registration form", event: "Design Thinking Workshop", assignee: "Sara", due: "02 Nov", done: true },
  { id: 4, title: "Confirm guest speakers", event: "Department Day", assignee: "Rahul", due: "04 Nov", done: false }
];

const initialExpenses: ExpenseItem[] = [
  { id: 1, title: "Venue booking", category: "Venue", amount: 15000, person: "Nihal", status: "Approved" },
  { id: 2, title: "Printing and banners", category: "Marketing", amount: 4500, person: "Aarav", status: "Pending" },
  { id: 3, title: "Refreshments", category: "Food", amount: 8000, person: "Sara", status: "Approved" }
];

const money = (n: number) => "₹" + n.toLocaleString("en-IN");

function loadData<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

const nav = [
  { name: "Overview" as Page, icon: LayoutDashboard },
  { name: "Events" as Page, icon: CalendarDays },
  { name: "Tasks" as Page, icon: ClipboardList },
  { name: "Expenses" as Page, icon: Wallet },
  { name: "Team" as Page, icon: Users }
];

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [events, setEvents] = useState(() => loadData("ee-events", initialEvents));
  const [tasks, setTasks] = useState(() => loadData("ee-tasks", initialTasks));
  const [expenses, setExpenses] = useState(() => loadData("ee-expenses", initialExpenses));
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<"event" | "task" | "expense" | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => localStorage.setItem("ee-events", JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem("ee-tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("ee-expenses", JSON.stringify(expenses)), [expenses]);

  const approved = expenses.filter(e => e.status === "Approved").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "Pending").reduce((s, e) => s + e.amount, 0);
  const totalBudget = events.reduce((s, e) => s + e.budget, 0);
  const completed = tasks.filter(t => t.done).length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function addEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const date = String(f.get("date") || "");
    const venue = String(f.get("venue") || "").trim();
    if (!name || !date || !venue) return;
    setEvents(old => [...old, {
      id: Date.now(), name,
      date: new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      venue, budget: Number(f.get("budget") || 0), status: "Planning"
    }]);
    setModal(null);
    notify("Event created successfully");
  }

  function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") || "").trim();
    if (!title) return;
    setTasks(old => [...old, {
      id: Date.now(), title,
      event: String(f.get("event") || "General"),
      assignee: String(f.get("assignee") || "You"),
      due: String(f.get("due") || "Not set"), done: false
    }]);
    setModal(null);
    notify("Task added successfully");
  }

  function addExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") || "").trim();
    const amount = Number(f.get("amount") || 0);
    if (!title || amount <= 0) return;
    setExpenses(old => [...old, {
      id: Date.now(), title, amount,
      category: String(f.get("category") || "Other"),
      person: "You", status: "Pending"
    }]);
    setModal(null);
    notify("Expense submitted");
  }

  function toggleTask(id: number) {
    setTasks(old => old.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function reviewExpense(id: number, status: "Approved" | "Rejected") {
    setExpenses(old => old.map(e => e.id === id ? { ...e, status } : e));
    notify("Expense updated in demo");
  }

  function Sidebar() {
    return (
      <aside className="flex h-full flex-col bg-[#252923] text-white">
        <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BD704E]">
            <CalendarDays size={21}/>
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight">EventEase</p>
            <p className="text-[10px] uppercase tracking-[2px] text-white/40">Department workspace</p>
          </div>
        </div>
        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-white/35">Workspace</p>
          <nav className="space-y-1">
            {nav.map(({ name, icon: Icon }) => (
              <button key={name} onClick={() => { setPage(name); setMenuOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${page === name ? "bg-[#BD704E] text-white" : "text-white/65 hover:bg-white/10"}`}>
                <Icon size={18}/>{name}
                {name === "Tasks" && <span className="ml-auto text-xs">{tasks.filter(t => !t.done).length}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-medium text-[#E6A27D]">Workspace note</p>
            <p className="mt-2 text-xs leading-5 text-white/50">Keep your team aligned. Update tasks and review expenses regularly.</p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8D9C8] text-sm font-semibold text-[#6C4935]">N</div>
            <div><p className="text-sm">Workspace Admin</p><p className="text-[11px] text-white/40">Department team</p></div>
          </div>
        </div>
      </aside>
    );
  }

  function Header() {
    return (
      <header className="flex min-h-[82px] items-center justify-between border-b border-[#E8E3D9] bg-[#FBFAF7] px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 hover:bg-[#F0EDE6] lg:hidden"><Menu size={21}/></button>
          <div><p className="text-xs text-[#929087]">Department / Workspace</p><h2 className="mt-1 text-lg font-semibold text-[#292D27]">{page}</h2></div>
        </div>
        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-lg border border-[#E8E3D9] bg-white px-3 py-2 sm:flex">
            <Search size={15} className="text-[#99958B]"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="w-32 bg-transparent text-xs outline-none"/>
          </label>
          <button onClick={() => notify("You're all caught up")} className="relative rounded-lg border border-[#E8E3D9] bg-white p-2.5"><Bell size={17}/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#BD704E]"/></button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8D9C8] font-semibold text-[#6C4935]">N</div>
        </div>
      </header>
    );
  }

  function Stat({ title, value, note, icon: Icon }: { title: string; value: string; note: string; icon: typeof Wallet }) {
    return (
      <div className="rounded-xl border border-[#EAE5DB] bg-white p-5">
        <div className="flex items-center justify-between"><p className="text-xs text-[#858278]">{title}</p><div className="rounded-lg bg-[#F5F1E9] p-2 text-[#A65D3F]"><Icon size={18}/></div></div>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-[#292D27]">{value}</p>
        <p className="mt-2 text-[11px] text-[#929087]">{note}</p>
      </div>
    );
  }

  function EventCards() {
    const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(event => {
          const spent = expenses.filter(e => e.status === "Approved").reduce((s, e) => s + e.amount, 0);
          const percent = event.budget ? Math.min(spent / event.budget * 100, 100) : 0;
          return (
            <article key={event.id} className="rounded-xl border border-[#EAE5DB] bg-white p-5 transition hover:shadow-md">
              <div className="flex justify-between">
                <div className="rounded-xl bg-[#F6EAE2] p-3 text-[#B56743]"><CalendarDays size={20}/></div>
                <span className="rounded-full bg-[#F5F1E9] px-3 py-1 text-[10px] text-[#827E72]">{event.status}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#292D27]">{event.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-xs text-[#929087]"><Calendar size={14}/>{event.date}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-[#929087]"><MapPin size={14}/>{event.venue}</p>
              <div className="mt-6 flex justify-between text-xs"><span className="text-[#858278]">Budget</span><b>{money(event.budget)}</b></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0EDE6]"><div className="h-full rounded-full bg-[#BD704E]" style={{ width: `${percent}%` }}/></div>
              <button onClick={() => { if (window.confirm("Remove this event?")) { setEvents(old => old.filter(e => e.id !== event.id)); notify("Event removed"); } }} className="mt-4 text-xs text-[#99958B] hover:text-red-600"><Trash2 size={13} className="mr-1 inline"/> Remove event</button>
            </article>
          );
        })}
      </div>
    );
  }

  function TaskRows() {
    return (
      <div className="divide-y divide-[#F0EDE7]">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 py-4">
            <button onClick={() => toggleTask(task.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${task.done ? "border-[#63846A] bg-[#63846A] text-white" : "border-[#D8D4CB]"}`}>
              {task.done && <Check size={13}/>}
            </button>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${task.done ? "text-[#A5A198] line-through" : "text-[#353931]"}`}>{task.title}</p>
              <p className="mt-1 text-[11px] text-[#99958B]">{task.event} · {task.assignee}</p>
            </div>
            <span className="text-[11px] text-[#929087]">{task.due}</span>
          </div>
        ))}
        {tasks.length === 0 && <p className="py-8 text-center text-sm text-[#99958B]">No tasks yet.</p>}
      </div>
    );
  }

  function ExpenseRows() {
    return (
      <div className="divide-y divide-[#F0EDE7]">
        {expenses.map(expense => (
          <div key={expense.id} className="flex flex-wrap items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F1E9] text-[#A65D3F]"><Wallet size={18}/></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#353931]">{expense.title}</p><p className="mt-1 text-[11px] text-[#99958B]">{expense.category} · {expense.person}</p></div>
            <p className="text-sm font-semibold">{money(expense.amount)}</p>
            <span className={`rounded-full px-2.5 py-1 text-[10px] ${expense.status === "Approved" ? "bg-[#EAF1E9] text-[#568064]" : expense.status === "Rejected" ? "bg-[#F9E9E5] text-[#A84E3E]" : "bg-[#F7F0DF] text-[#9B7838]"}`}>{expense.status}</span>
            {expense.status === "Pending" && <div className="flex gap-1"><button onClick={() => reviewExpense(expense.id, "Approved")} className="rounded-lg bg-[#EAF1E9] p-2 text-[#568064]" aria-label="Approve"><Check size={15}/></button><button onClick={() => reviewExpense(expense.id, "Rejected")} className="rounded-lg bg-[#F9E9E5] p-2 text-[#A84E3E]" aria-label="Reject"><X size={15}/></button></div>}
          </div>
        ))}
        {expenses.length === 0 && <p className="py-8 text-center text-sm text-[#99958B]">No expenses yet.</p>}
      </div>
    );
  }

  function Modal() {
    if (!modal) return null;
    const titles = { event: "Create an event", task: "Add a task", expense: "Submit an expense" };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171A16]/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#FBFAF7] p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between"><h3 className="text-lg font-semibold">{titles[modal]}</h3><button onClick={() => setModal(null)} className="rounded-lg p-2 hover:bg-[#EFEBE3]"><X size={19}/></button></div>
          <form onSubmit={modal === "event" ? addEvent : modal === "task" ? addTask : addExpense} className="space-y-4">
            {modal === "event" && <>
              <Field label="Event name" name="name" placeholder="e.g. Annual Tech Fest" required/>
              <Field label="Date" name="date" type="date" required/>
              <Field label="Venue" name="venue" placeholder="Event venue" required/>
              <Field label="Budget (₹)" name="budget" type="number" placeholder="50000"/>
            </>}
            {modal === "task" && <>
              <Field label="Task title" name="title" placeholder="What needs to be done?" required/>
              <label className="block text-xs text-[#77756C]">Event<select name="event" className="mt-2 w-full rounded-lg border border-[#E5E0D6] bg-white p-3 text-sm">{events.map(e => <option key={e.id}>{e.name}</option>)}</select></label>
              <Field label="Assigned to" name="assignee" placeholder="Member name"/>
              <Field label="Due date" name="due" type="date"/>
            </>}
            {modal === "expense" && <>
              <Field label="Expense title" name="title" placeholder="e.g. Printing" required/>
              <Field label="Amount (₹)" name="amount" type="number" placeholder="1000" required/>
              <label className="block text-xs text-[#77756C]">Category<select name="category" className="mt-2 w-full rounded-lg border border-[#E5E0D6] bg-white p-3 text-sm">{["Venue","Food","Decor","Printing","Equipment","Transport","Marketing","Other"].map(x => <option key={x}>{x}</option>)}</select></label>
            </>}
            <button type="submit" className="w-full rounded-lg bg-[#BD704E] py-3 text-sm font-medium text-white hover:bg-[#A85D3D]">Save</button>
          </form>
        </div>
      </div>
    );
  }

  function Field({ label, name, placeholder, type = "text", required = false }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean }) {
    return <label className="block text-xs text-[#77756C]">{label}<input name={name} type={type} placeholder={placeholder} required={required} min={type === "number" ? 0 : undefined} className="mt-2 w-full rounded-lg border border-[#E5E0D6] bg-white p-3 text-sm text-[#292D27] outline-none focus:border-[#BD704E]"/></label>;
  }

  const panel = "rounded-xl border border-[#EAE5DB] bg-white p-5";

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#292D27]">
      <div className="flex min-h-screen">
        <div className="hidden w-[255px] shrink-0 lg:block"><Sidebar/></div>
        {menuOpen && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)}/><div className="relative h-full w-[270px]"><Sidebar/></div></div>}
        <main className="min-w-0 flex-1">
          <Header/>
          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-medium uppercase tracking-[2px] text-[#B16A4A]">YOUR DEPARTMENT, IN SYNC</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[34px]">{page === "Overview" ? "Good work starts here." : page}</h1><p className="mt-2 text-sm text-[#8C897F]">{page === "Overview" ? "A clear view of everything your team is organising." : `Manage your department ${page.toLowerCase()} in one place.`}</p></div>
              <button onClick={() => setModal(page === "Tasks" ? "task" : page === "Expenses" ? "expense" : "event")} className="flex items-center gap-2 rounded-lg bg-[#BD704E] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#A85D3D]"><Plus size={17}/>{page === "Tasks" ? "Add task" : page === "Expenses" ? "Add expense" : "Create event"}</button>
            </div>

            {(page === "Overview" || page === "Expenses") && <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat title="Total events" value={String(events.length)} note="Events in your workspace" icon={CalendarDays}/>
              <Stat title="Total budget" value={money(totalBudget)} note="Across all events" icon={CircleDollarSign}/>
              <Stat title="Approved spending" value={money(approved)} note="Expenses approved in demo" icon={Wallet}/>
              <Stat title="Pending expenses" value={money(pending)} note="Awaiting review" icon={Clock3}/>
            </div>}

            {page === "Overview" && <>
              <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                <section className={panel}>
                  <div className="mb-5 flex items-center justify-between"><div><h3 className="font-semibold">Upcoming events</h3><p className="mt-1 text-xs text-[#99958B]">What's happening next</p></div><button onClick={() => setPage("Events")} className="text-xs font-medium text-[#B16A4A]">View all <ArrowRight size={13} className="inline"/></button></div>
                  <div className="space-y-4">{events.slice(0, 3).map(e => <div key={e.id} className="flex items-center gap-4 rounded-lg bg-[#FAF8F3] p-4"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F0E3D8] text-[#A65D3F]"><CalendarDays size={19}/
                    
<div key={e.id} className="flex items-center gap-4 rounded-lg bg-[#FAF8F3] p-4">
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F0E3D8] text-[#A65D3F]">
    <CalendarDays size={19}/>
  </div>
  <div className="min-w-0 flex-1">
    <p className="truncate text-sm font-semibold">{e.name}</p>
    <p className="mt-1 text-xs text-[#99958B]">{e.date} · {e.venue}</p>
  </div>
  <span className="hidden rounded-full bg-white px-3 py-1 text-[10px] text-[#827E72] sm:block">{e.status}</span>
</div>
)}
{events.length === 0 && <p className="py-8 text-center text-sm text-[#99958B]">No events yet.</p>}
</div>
</section>

<section className={panel}>
  <div className="mb-5">
    <h3 className="font-semibold">Task progress</h3>
    <p className="mt-1 text-xs text-[#99958B]">Your team's current workload</p>
  </div>
  <div className="flex items-end justify-between">
    <p className="text-4xl font-semibold">{completed}<span className="text-lg text-[#99958B]">/{tasks.length}</span></p>
    <span className="text-xs text-[#63846A]">Completed</span>
  </div>
  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0EDE6]">
    <div className="h-full rounded-full bg-[#64836A]" style={{width: `${tasks.length ? completed / tasks.length * 100 : 0}%`}}/>
  </div>
  <p className="mt-3 text-xs text-[#99958B]">{tasks.length - completed} tasks remaining</p>
  <div className="mt-7 border-t border-[#F0EDE7] pt-5">
    <p className="mb-3 text-xs font-medium text-[#858278]">QUICK ACTIONS</p>
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => setModal("task")} className="rounded-lg border border-[#EAE5DB] p-3 text-left text-xs hover:bg-[#FAF8F3]">
        <Plus size={16} className="mb-2 text-[#B16A4A]"/>Add task
      </button>
      <button onClick={() => setModal("expense")} className="rounded-lg border border-[#EAE5DB] p-3 text-left text-xs hover:bg-[#FAF8F3]">
        <Wallet size={16} className="mb-2 text-[#B16A4A]"/>Submit expense
      </button>
    </div>
  </div>
</section>
</div>

<section className={`${panel} mt-6`}>
  <div className="mb-2 flex items-center justify-between">
    <div>
      <h3 className="font-semibold">Recent activity</h3>
      <p className="mt-1 text-xs text-[#99958B]">Latest team updates</p>
    </div>
    <Activity size={19} className="text-[#B16A4A]"/>
  </div>
  <div className="space-y-4 pt-4">
    {tasks.slice(0, 3).map(t => (
      <div key={t.id} className="flex items-center gap-3 text-sm">
        <div className="rounded-full bg-[#F3EAE2] p-2 text-[#B16A4A]"><ClipboardList size={15}/></div>
        <p className="flex-1">{t.assignee} · {t.title}</p>
        <span className="text-xs text-[#99958B]">{t.done ? "Completed" : "In progress"}</span>
      </div>
    ))}
  </div>
</section>
</>}

{page === "Events" && (
  <section>
    <div className="mb-5 flex items-center justify-between">
      <h3 className="font-semibold">All events ({events.length})</h3>
      <span className="text-xs text-[#99958B]">Department calendar</span>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(e => (
        <article key={e.id} className="rounded-xl border border-[#EAE5DB] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-[#F6EAE2] p-3 text-[#B56743]"><CalendarDays size={20}/></div>
            <button onClick={() => {
              if (window.confirm("Delete this event?")) {
                setEvents(old => old.filter(x => x.id !== e.id));
              }
            }} className="p-2 text-[#99958B] hover:text-red-600"><Trash2 size={16}/></button>
          </div>
          <h3 className="mt-5 font-semibold">{e.name}</h3>
          <p className="mt-2 text-xs text-[#99958B]">{e.date}</p>
          <p className="mt-2 text-xs text-[#99958B]"><MapPin size={13} className="mr-1 inline"/>{e.venue}</p>
          <div className="mt-5 flex justify-between border-t border-[#F0EDE7] pt-4 text-xs">
            <span className="text-[#99958B]">Budget</span><b>{money(e.budget)}</b>
          </div>
          <span className="mt-3 inline-block rounded-full bg-[#F5F1E9] px-3 py-1 text-[10px]">{e.status}</span>
        </article>
      ))}
    </div>
  </section>
)}

{page === "Tasks" && (
  <section className={panel}>
    <div className="mb-4">
      <h3 className="font-semibold">Team tasks</h3>
      <p className="mt-1 text-xs text-[#99958B]">{completed} completed · {tasks.length - completed} remaining</p>
    </div>
    <div className="divide-y divide-[#F0EDE7]">
      {tasks.map(t => (
        <div key={t.id} className="flex items-center gap-3 py-4">
          <button onClick={() => toggleTask(t.id)} className={`flex h-5 w-5 items-center justify-center rounded-md border ${t.done ? "border-[#63846A] bg-[#63846A] text-white" : "border-[#D8D4CB]"}`}>
            {t.done && <Check size={13}/>}
          </button>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${t.done ? "text-[#A5A198] line-through" : ""}`}>{t.title}</p>
            <p className="mt-1 text-xs text-[#99958B]">{t.event} · {t.assignee}</p>
          </div>
          <span className="text-xs text-[#99958B]">{t.due}</span>
        </div>
      ))}
    </div>
  </section>
)}

{page === "Expenses" && (
  <section className={panel}>
    <div className="mb-4">
      <h3 className="font-semibold">Expense records</h3>
      <p className="mt-1 text-xs text-[#99958B]">Review submitted expenses</p>
    </div>
    <div className="divide-y divide-[#F0EDE7]">
      {expenses.map(e => (
        <div key={e.id} className="flex flex-wrap items-center gap-3 py-4">
          <div className="rounded-lg bg-[#F5F1E9] p-3 text-[#A65D3F]"><Wallet size={18}/></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{e.title}</p>
            <p className="mt-1 text-xs text-[#99958B]">{e.category} · {e.person}</p>
          </div>
          <b className="text-sm">{money(e.amount)}</b>
          <span className={`rounded-full px-3 py-1 text-[10px] ${e.status === "Approved" ? "bg-[#EAF1E9] text-[#568064]" : e.status === "Rejected" ? "bg-[#F9E9E5] text-[#A84E3E]" : "bg-[#F7F0DF] text-[#9B7838]"}`}>{e.status}</span>
          {e.status === "Pending" && (
            <div className="flex gap-1">
              <button onClick={() => reviewExpense(e.id,"Approved")} className="rounded-lg bg-[#EAF1E9] p-2 text-[#568064]"><Check size={15}/></button>
              <button onClick={() => reviewExpense(e.id,"Rejected")} className="rounded-lg bg-[#F9E9E5] p-2 text-[#A84E3E]"><X size={15}/></button>
            </div>
          )}
        </div>
      ))}
    </div>
    <div className="mt-6 grid gap-3 border-t border-[#F0EDE7] pt-5 sm:grid-cols-3">
      <div><p className="text-xs text-[#99958B]">Approved</p><b className="mt-1 block">{money(approved)}</b></div>
      <div><p className="text-xs text-[#99958B]">Pending</p><b className="mt-1 block">{money(pending)}</b></div>
      <div><p className="text-xs text-[#99958B]">Remaining budget</p><b className="mt-1 block">{money(totalBudget-approved)}</b></div>
    </div>
  </section>
)}

{page === "Team" && (
  <section className={panel}>
    <h3 className="font-semibold">Department team</h3>
    <p className="mt-1 text-xs text-[#99958B]">Team members in the workspace demo</p>
    <div className="mt-5 divide-y divide-[#F0EDE7]">
      {["Nihal","Aarav","Sara","Rahul"].map((name,i) => (
        <div key={name} className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8D9C8] font-semibold text-[#6C4935]">{name[0]}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-[#99958B]">{i===0 ? "Team Lead" : "Organizer"}</p>
          </div>
          <span className="rounded-full bg-[#EAF1E9] px-3 py-1 text-[10px] text-[#568064]">Active</span>
        </div>
      ))}
    </div>
  </section>
)}

<footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[#E7E2D9] pt-5 text-[11px] text-[#A09C92]">
  <span>EventEase · Department Event Manager</span>
  <span>Built for better teamwork.</span>
</footer>
</div>
</main>
</div>

{notice && (
  <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#252923] px-5 py-3 text-sm text-white shadow-xl">
    <CheckCircle2 size={16} className="mr-2 inline text-[#A7C6A8]"/>{notice}
  </div>
)}

{modal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-[#FBFAF7] p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{modal === "event" ? "Create an event" : modal === "task" ? "Add a task" : "Submit an expense"}</h3>
        <button onClick={() => setModal(null)}><X size={20}/></button>
      </div>
      {modal === "event" && (
        <form onSubmit={addEvent} className="space-y-4">
          <Field label="Event name" name="name" required/>
          <Field label="Date" name="date" type="date" required/>
          <Field label="Venue" name="venue" required/>
          <Field label="Budget (₹)" name="budget" type="number"/>
          <Submit/>
        </form>
      )}
      {modal === "task" && (
        <form onSubmit={addTask} className="space-y-4">
          <Field label="Task title" name="title" required/>
          <label className="block text-xs text-[#77756C]">Event
            <select name="event" className="mt-2 w-full rounded-lg border border-[#E5E0D6] bg-white p-3 text-sm">
              {events.map(e => <option key={e.id}>{e.name}</option>)}
            </select>
          </label>
          <Field label="Assigned to" name="assignee"/>
          <Field label="Due date" name="due" type="date"/>
          <Submit/>
        </form>
      )}
      {modal === "expense" && (
        <form onSubmit={addExpense} className="space-y-4">
          <Field label="Expense title" name="title" required/>
          <Field label="Amount (₹)" name="amount" type="number" required/>
          <label className="block text-xs text-[#77756C]">Category
            <select name="category" className="mt-2 w-full rounded-lg border border-[#E5E0D6] bg-white p-3 text-sm">
              {["Venue","Food","Decor","Printing","Equipment","Transport","Marketing","Other"].map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <Submit/>
        </form>
      )}
    </div>
  </div>
)}
</div>
);

function Field({label,name,type="text",required=false}:{label:string;name:string;type?:string;required?:boolean}) {
  return (
    <label className="block text-xs text-[#77756C]">
      {label}
      <input name={name} type={type} required={required} min={type==="number"?0:undefined}
        className="mt-2 w-full rounded-lg border border-[#E5E0D6] bg-white p-3 text-sm outline-none focus:border-[#BD704E]"/>
    </label>
  );
}

function Submit() {
  return <button type="submit" className="w-full rounded-lg bg-[#BD704E] py-3 text-sm font-medium text-white hover:bg-[#A85D3D]">Save and continue</button>;
}
  
