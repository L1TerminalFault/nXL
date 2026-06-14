"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/utils";
import Loader from "@/components/Loader";
import { VscRefresh as Refresh } from "react-icons/vsc";
import { IoAdd as FaAdd } from "react-icons/io5";
import { motion } from "framer-motion";
import { useTransactionStore } from "@/lib/store";

type Order = {
  _id: string;
  customer: string;
  items: string;
  amount: number;
  status: "pending" | "done";
  date: string;
};

export default function OrdersPage() {
  const { user } = useUser();
  const { orders, setOrders } = useTransactionStore();
  const [loading, setLoading] = useState(!orders || orders.length === 0);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");

  const [form, setForm] = useState({ customer: "", items: "", amount: "" });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Just fetch all data which includes orders
      const res = await fetch("/api/fetchTransactions?user=" + user?.id);
      const data = await res.json();
      if (data.status === "success") {
        setOrders(data.orders);
      }
	    // setOrders([
	    //         {
	    //     	    phoneNumber: "0911681165",
	    //     	    message: "jjjjjjjjjjjjjjjklsdjf lskdhf j lkjdflk js fsdlfk dsjfkds jlkdfhdsokfjdsklfj dsjsd fkldsjflkdsjfdskljdslkfjsdklfjsdk",
	    //     	    date: Date.now(),
	    //     	    status: "pending",
	    //         },
	    //         {
	    //     	    phoneNumber: "0911681165",
	    //     	    message: "jjjjjjjjjjjjjjjklsdjf lskdhf j lkjdflk js fsdlfk dsjfkds jlkdfhdsokfjdsklfj dsjsd fkldsjflkdsjfdskljdslkfjsdklfjsdk",
	    //     	    date: Date.now(),
	    //     	    status: "pending",
	    //     	    
	    //         },
	    //         {
	    //     	    phoneNumber: "0911681165",
	    //     	    message: "jjjjjjjjjjjjjjjklsdjf lskdhf j lkjdflk js fsdlfk dsjfkds jlkdfhdsokfjdsklfj dsjsd fkldsjflkdsjfdskljdslkfjsdklfjsdk",
	    //     	    date: Date.now(),
	    //     	    status: "pending",
	    //         },
	    //         {
	    //     	    phoneNumber: "0911681165",
	    //     	    message: "jjjjjjjjjjjjjjjklsdjf lskdhf j lkjdflk js fsdlfk dsjfkds jlkdfhdsokfjdsklfj dsjsd fkldsjflkdsjfdskljdslkfjsdklfjsdk",
	    //     	    date: Date.now(),
	    //     	    status: "pending",
	    //         },
	    //         {
	    //     	    phoneNumber: "0911681165",
	    //     	    message: "jjjjjjjjjjjjjjjklsdjf lskdhf j lkjdflk js fsdlfk dsjfkds jlkdfhdsokfjdsklfj dsjsd fkldsjflkdsjfdskljdslkfjsdklfjsdk",
	    //     	    date: Date.now(),
	    //     	    status: "done",
	    //         },
	    // ])
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orders) fetchOrders();
    else setLoading(false);
  }, []);

  const handleCreate = async () => {
    if (!form.customer || !form.items || !form.amount) return alert("Fill all fields");
    setLoading(true);
    try {
        await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, amount: Number(form.amount) }),
        });
        setForm({ customer: "", items: "", amount: "" });
        setShowAddPopup(false);
        fetchOrders();
    } catch (e) {
        console.error(e);
        setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "pending" | "done") => {
    try {
        // setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        await fetch(`/api/orders?id=${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        fetchOrders();
    } catch (e) {
        console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    // if (!confirm("Are you sure you want to delete this order?")) return;
    try {
        // setOrders(prev => prev.filter(o => o._id !== id));
        await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
        fetchOrders();
    } catch (e) {
        console.error(e);
    }
  };

  const filteredOrders = orders.filter(o => filter === "all" ? true : o.status === filter);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="md:p-10 p-3 pt-6 gap-8 h-full min-h-screen w-full flex flex-col padding-bottom-safe">
      
      {false && (
         <div onClick={() => setShowAddPopup(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-theme-card border border-theme-border rounded-3xl p-6 flex flex-col gap-4">
                 <div className="text-xl font-bold">Add Order</div>
                 <div className="flex flex-col gap-2">
                     <label className="text-xs text-theme-text/50 uppercase font-bold">Name</label>
                     <input type="text" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} className="bg-theme-accent border border-theme-border rounded-full px-4 py-2 text-theme-text outline-none focus:border-white/30 transition-colors" />
                 </div>
                 <div className="flex flex-col gap-2">
                     <label className="text-xs text-theme-text/50 uppercase font-bold">Items</label>
                     <input type="text" value={form.items} onChange={e => setForm({...form, items: e.target.value})} className="bg-theme-accent border border-theme-border rounded-full px-4 py-2 text-theme-text outline-none focus:border-white/30 transition-colors" />
                 </div>
                 <div className="flex flex-col gap-2">
                     <label className="text-xs text-theme-text/50 uppercase font-bold">Amount (ETB)</label>
                     <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="bg-theme-accent border border-theme-border rounded-full px-4 py-2 text-theme-text outline-none focus:border-white/30 transition-colors" />
                 </div>
                 <div className="flex w-full justify-end mt-4">
                     <button onClick={handleCreate} disabled={loading} className="py-2 px-6 rounded-full bg-theme-accent/50 hover:bg-theme-border transition-colors disabled:opacity-50 font-bold">Create</button>
                 </div>
             </div>
         </div>
      )}

      <div className="z-10 px-3 w-full justify-between flex gap-10 items-center">
        <div className="text-2xl font-bold">Orders</div>
        <div className="flex gap-4">
          <div onClick={fetchOrders} className="p-3 backdrop-blur-2xl rounded-full bg-theme-accent/50 hover:bg-theme-card/80 transition-colors cursor-pointer text-theme-text">
            <Refresh className="size-5" />
          </div>
          {false && isAdmin(user?.id) ? (
            <div onClick={() => setShowAddPopup(true)} className="p-3 rounded-full backdrop-blur-2xl bg-theme-accent/50 hover:bg-theme-card/80 transition-colors cursor-pointer text-theme-text">
              <FaAdd className="size-5" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex px-3 gap-2 w-full">
         <button onClick={() => setFilter("pending")} className={`px-5 py-2 rounded-full text-sm transition-colors /border-2 ${filter === "pending" ? "bg-theme-accent/50" : "bg-theme-card"} backdrop-blur-2xl text-theme-text`}>Pending</button>
         <button onClick={() => setFilter("done")} className={`px-5 py-2 rounded-full text-sm transition-colors /border-2 ${filter === "done" ? "bg-theme-accent/50" : "bg-theme-card"} backdrop-blur-2xl text-theme-text`}>Done</button>
         <button onClick={() => setFilter("all")} className={`px-5 py-2 rounded-full text-sm transition-colors /border-2 ${filter === "all" ? "bg-theme-accent/50" : "bg-theme-card"} backdrop-blur-2xl text-theme-text`}>All</button>
      </div>

      <div className="flex flex-col flex-1 w-full relative min-h-[50vh]">
         {loading ? (
             <div className="flex w-full h-full items-center justify-center opacity-50"><Loader /></div>
         ) : filteredOrders.length === 0 ? (
             <div className="flex w-full h-full items-center justify-center text-theme-text/50">No orders found.</div>
         ) : (
             <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4 w-full">
                 {filteredOrders.map(order => (
                     <motion.div key={order._id} variants={itemVariants} className="w-full flex md:flex-row flex-col gap-4 justify-between bg-theme-card border border-theme-border rounded-3xl p-5 shadow-xl">
                         <div className="flex flex-col gap-2 flex-1">
                             <div className="flex gap-2 items-center">
                                 <div className="font-bold md:text-lg">{order.phoneNumber}</div>
                                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "pending" ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500"}`}>{order.status}</div>
                                 <div className="text-theme-text/50 text-xs ml-auto">{new Date(order.date).toLocaleDateString()}</div>
                             </div>
                             <div className="font-mono text-blue-400 font-bold mt-1">{order.message}</div>
                         </div>
                         <div className="flex gap-2 md:flex-col flex-row md:items-end items-center justify-end">
                             {isAdmin(user?.id) && order.status === "pending" && (
                                <button onClick={() => handleUpdateStatus(order._id, "done")} className="px-4 py-2 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-500 transition-colors text-xs font-bold uppercase tracking-wider flex-1 md:flex-none">Mark Done</button>
                             )}
                             {isAdmin(user?.id) && order.status === "done" && (
                                <button onClick={() => handleUpdateStatus(order._id, "pending")} className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 transition-colors text-xs font-bold uppercase tracking-wider flex-1 md:flex-none">Mark Pending</button>
                             )}
                             {isAdmin(user?.id) && (
                                <button onClick={() => handleDelete(order._id)} className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors text-xs font-bold uppercase tracking-wider">Delete</button>
                             )}
                         </div>
                     </motion.div>
                 ))}
             </motion.div>
         )}
      </div>

    </div>
  );
}
