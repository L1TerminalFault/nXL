"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTransactionStore } from "@/lib/store";
import { VscRefresh as Refresh, VscBell as Bell, VscEye as Eye, VscEyeClosed as EyeOff } from "react-icons/vsc";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { ACC_OWNER, isAdmin } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

import Loader from "@/components/Loader";

export default function HomeDashboard() {
  const { data, dataIn, setData, setDataIn, fetchTransactions, setAllUsers, setOrders } = useTransactionStore();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(!data);
  const [ordersCount, setOrdersCount] = useState(0);
  const [showValues, setShowValues] = useState(false);
  const [showCBE, setShowCBE] = useState(false);
  const [showTeleBirr, setShowTeleBirr] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showIncomes, setShowIncomes] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await (await fetch("/api/getAllUsers")).json();
      setAllUsers(res);
      //console.log("the response " + res);
    } catch (err) {
      console.log("Error fetching users: " + err);
    } finally {
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fetchTransactions?user=" + user?.id);
      const fetched = await res.json();
      
      if (fetched.orders) {
         setOrders(fetched.orders);
         setOrdersCount(fetched.orders.length);
      }

      const parsedData = fetched.data.map((item: any) => ({
        _id: item._id,
        users: item.users,
        transaction: JSON.parse(item.transaction),
      }));
      setData(parsedData);
      setDataIn(parsedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
       if (!data) {
	       fetchData();
	       fetchUsers();
       }
       else setLoading(false);
    }
  }, [data, user, isLoaded]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let balance = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const validData = dataIn.filter(
      (d) => ("parsed" in d.transaction ? d.transaction.parsed : !d.transaction.message?.length)
    );

    validData.forEach(({ transaction }) => {
      let amountStr = transaction.amount;
      if (amountStr.includes(" ")) amountStr = amountStr.split(" ")[1];
      const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));

      const direction = transaction.direction ?? (ACC_OWNER.toLowerCase().includes(transaction.recieverAcc.toLowerCase()) ? "FROM" : "TO");
      const isCredited = direction === "FROM";

      if (isCredited) {
        income += amount;
        incomeCount++;
      } else {
        expense += amount;
        expenseCount++;
      }
    });

    balance = income - expense;

    // Remainings
    const cbeRemainingRaw = dataIn.find((dat) => dat.transaction.bank === "CBE")?.transaction?.remaining || "0";
    const cbeRemaining = parseFloat(cbeRemainingRaw.replace(/[^0-9.-]+/g, "")) || 0;

    const tbRemainingRaw = dataIn.find((dat) => dat.transaction.bank === "TeleBirr")?.transaction?.remaining || "0";
    const tbRemaining = parseFloat(tbRemainingRaw.replace(/[^0-9.-]+/g, "")) || 0;

    return { income, expense, balance, totalTrans: validData.length, incomeCount, expenseCount, cbeRemaining, tbRemaining };
  }, [dataIn]);

  // Aggregate Data Day-By-Day
  const aggregatedData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const validData = dataIn.filter(
      (d) => ("parsed" in d.transaction ? d.transaction.parsed : !d.transaction.message?.length)
    );

    validData.forEach(({ transaction }) => {
      let amountStr = transaction.amount;
      if (amountStr.includes(" ")) amountStr = amountStr.split(" ")[1];
      const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;
      
      const dateKey = new Date(transaction.date).toDateString(); 

      const direction = transaction.direction ?? (ACC_OWNER.toLowerCase().includes(transaction.recieverAcc.toLowerCase()) ? "FROM" : "TO");
      const isCredited = direction === "FROM";

      const existing = map.get(dateKey) || { income: 0, expense: 0 };
      if (isCredited) {
        existing.income += amount;
      } else {
        existing.expense += amount;
      }
      map.set(dateKey, existing);
    });

    return Array.from(map.entries())
      .map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dataIn]);

  const dailyData = aggregatedData.slice(-7);
  const weeklyData = aggregatedData; 

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const maskValue = (val: number, toggle: boolean) => toggle !== undefined ? (toggle ? `ETB ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "******") : showValues ? `ETB ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "******";

  return (
    <div className="md:p-10 p-4 pt-8 gap-8 h-full min-h-screen w-full flex flex-col relative overflow-hidden padding-bottom-safe text-white">
      
      {/* Decorative Cinematic Background Highlights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-theme-card bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[45rem] h-[45rem] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Section */}
      <div className="z-10 w-full justify-between flex flex-wrap gap-6 items-center">
        <div className="flex flex-col">
           <motion.h1 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-4xl md:text-5xl font-extrabold tracking-tight text-theme-text /bg-clip-text /text-transparent /bg-gradient-to-r /from-text-theme-text /to-gray-400 drop-shadow-sm"
           >
             Hi {user?.firstName || "user"}
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             transition={{ delay: 0.2 }}
             className="text-theme-text/60 mt-1 text-sm font-semibold tracking-wider"
           >
             Here's is what's happening today
           </motion.p>
        </div>

        <div className="flex gap-4 items-center">
          {/* Sweet Reminder Pill */}
          <Link href="/orders">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ type: "spring" }}
               className="relative flex items-center gap-3 bg-white/5 hover:bg-white/10 /border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-lg transition-colors cursor-pointer"
             >
               <div className="relative">
                  <Bell className="size-5 text-theme-text/70" />
                  {ordersCount > 0 && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>}
               </div>
               <span className="text-sm font-bold text-theme-text/70">{ordersCount}</span>
               <span className="text-xs text-theme-text/50 uppercase tracking-widest">Orders</span>
             </motion.div>
          </Link>

          <button
            onClick={fetchData}
            className="p-3.5 rounded-full bg-white/5 backdrop-blur-md /border border-white/10 hover:bg-white/10 hover:shadow-lg transition-all text-white"
          >
            <Refresh className="size-5" />
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full h-full flex flex-col gap-8 z-10"
      >
        {/* Cinematic Master Card for Masked Financials */}
        <motion.div variants={itemVariants} className="w-full relative overflow-hidden bg-theme-card backdrop-blur-2xl /border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col gap-6">
           <div className="flex justify-between items-center /bg-white/5 px-4 rounded-2xl /border border-white/5">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 flex hidden items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                 </div>
                 <div>
                    <div className="font-bold text-theme-text">Financial Overview</div>
                    <div className="text-xs text-theme-text/50 //uppercase tracking-wider">Tap to reveal balances</div>
                 </div>
              </div>
              <button onClick={() => setShowValues(!showValues)} className="hidden p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors /border border-white/10">
                 {showValues ? <EyeOff className="size-5 text-gray-400"/> : <Eye className="size-5 text-gray-400"/>}
              </button>
           </div>
           
           <div onClick={() => setShowValues(!showValues)} className="flex flex-col gap-4 w-full cursor-pointer">
	   <div className="w-full flex gap-6">
              <div
                onClick={(e) => {e.stopPropagation();setShowCBE(!showCBE)}}
	        className="bg-white/5 /border w-full border-white/5 p-7 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-theme-text/70 uppercase font-bold tracking-wider">CBE Balance</span>
                  <span className="text-2xl md:text-3xl font-black text-theme-text/70">{maskValue(stats.cbeRemaining, showCBE)}</span>
              </div>
              <div
                onClick={(e) => {e.stopPropagation();setShowTeleBirr(!showTeleBirr)}}
	        className="bg-white/5 /border w-full border-white/5 p-7 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-theme-text/70 uppercase font-bold tracking-wider">TeleBirr Balance</span>
                  <span className="text-2xl md:text-3xl font-black text-theme-text/70">{maskValue(stats.tbRemaining, showTeleBirr)}</span>
              </div>
	      </div>

	      <div className="flex w-full gap-3">
              <div
                onClick={(e) => {e.stopPropagation();setShowIncomes(!showIncomes)}}
	      className="bg-white/5 /border w-full border-white/5 p-4 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-blue-500 uppercase font-bold tracking-wider">Total Income</span>
                  <span className="text-xl md:text-2xl font-black text-blue-400">{maskValue(stats.income, showIncomes)}</span>
              </div>
              <div
                onClick={(e) => {e.stopPropagation();setShowExpenses(!showExpenses)}}
	      className="bg-white/5 /border w-full border-white/5 p-4 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-red-500 uppercase font-bold tracking-wider">Total Expense</span>
                  <span className="text-xl md:text-2xl font-black text-red-400">{maskValue(stats.expense, showExpenses)}</span>
              </div>
	      </div>
           </div>
        </motion.div>

        {/* Breakdown Transactions */}
        <div className="/grid /grid-cols-1 flex flex-wrap /md:grid-cols-3 gap-6 w-full">
          <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-xl /border border-white/5 rounded-3xl p-6 shadow-xl flex gap-4 items-center">
             <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center text-gray-300 font-black text-xl /border border-white/10">
               {stats.totalTrans}
             </div>
             <div>
               <div className="text-sm font-bold text-theme-text/70">Total Records</div>
               <div className="text-xs text-theme-text/50">Processed operations</div>
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-xl /border border-white/5 rounded-3xl p-6 shadow-xl flex gap-4 items-center">
             <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xl /border border-blue-500/20">
               {stats.incomeCount}
             </div>
             <div>
               <div className="text-sm font-bold text-theme-text/70">Incomes</div>
               <div className="text-xs text-theme-text/50">Distinct deposits</div>
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-xl /border border-white/5 rounded-3xl p-6 shadow-xl flex gap-4 items-center">
             <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-black text-xl /border border-red-500/20">
               {stats.expenseCount}
             </div>
             <div>
               <div className="text-sm font-bold text-theme-text/70">Expenses</div>
               <div className="text-xs text-theme-text/50">Distinct payments</div>
             </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full flex-1 pb-10">
          
          {/* Daily Continuous Graph */}
          <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-2xl /border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6 min-h-[450px]">
             <div className="flex justify-between items-center px-2">
               <div>
                  <h2 className="text-xl font-bold tracking-tight text-theme-text">Daily Pulse</h2>
                  <p className="text-theme-text/50 text-xs mt-1 uppercase tracking-widest">Last 7 Days</p>
               </div>
             </div>
             
             <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                    <XAxis 
                       dataKey="date" 
                       stroke="#aaaaaa" 
                       opacity={0.6} 
                       tickLine={false} 
                       axisLine={false}
                       dy={10}
                       tickFormatter={(str) => {
                         const d = new Date(str);
                         return isNaN(d.getTime()) ? str : new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
                       }}
                    />
                    <YAxis 
                       stroke="#aaaaaa" 
                       opacity={0.6} 
                       tickLine={false} 
                       axisLine={false} 
                       dx={-10}
                       tickFormatter={(val) => `${val < 1000000 ? (val / 1000).toFixed(0) + "k" : (val / 1000000).toFixed(1) + "M"}`} 
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', padding: '12px' }}
                       itemStyle={{ fontWeight: 'bold' }}
                       formatter={(value: number) => [`ETB ${value.toLocaleString()}`, ""]}
                    />
                    <Line 
                       type="monotone" 
                       dataKey="income" 
                       name="Income"
                       stroke="#3b82f6" 
                       strokeWidth={4} 
                       dot={{ r: 4, fill: '#3b82f6', strokeWidth: 3, stroke: '#000' }} 
                       activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6', className: "drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" }} 
                    />
                    <Line 
                       type="monotone" 
                       dataKey="expense" 
                       name="Expense"
                       stroke="#ef4444" 
                       strokeWidth={4} 
                       dot={{ r: 4, fill: '#ef4444', strokeWidth: 3, stroke: '#000' }} 
                       activeDot={{ r: 8, strokeWidth: 0, fill: '#ef4444', className: "drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </motion.div>

          {/* Weekly/Monthly Trend Graph */}
          <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-2xl /border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6 min-h-[450px]">
             <div className="flex justify-between items-center px-2">
               <div>
                  <h2 className="text-xl font-bold tracking-tight text-theme-text">Macro Trends</h2>
                  <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">30-Day Trajectory</p>
               </div>
             </div>
             
             <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                    <XAxis 
                       dataKey="date" 
                       stroke="#aaaaaa" 
                       opacity={0.6} 
                       tickLine={false} 
                       axisLine={false}
                       dy={10}
                       tickFormatter={(str) => ""} /* hide excessive dates for macro view */
                    />
                    <YAxis 
                       stroke="#aaaaaa" 
                       opacity={0.6} 
                       tickLine={false} 
                       axisLine={false} 
                       dx={-10}
                       tickFormatter={(val) => `${val < 1000000 ? (val / 1000).toFixed(0) + "k" : (val / 1000000).toFixed(1) + "M"}`} 
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', padding: '12px' }}
                       itemStyle={{ fontWeight: 'bold' }}
                       formatter={(value: number) => [`ETB ${value.toLocaleString()}`, ""]}
                    />
                    <Area 
                       type="monotone" 
                       dataKey="income" 
                       stroke="#3b82f6" 
                       strokeWidth={4} 
                       fill="url(#colorNet)"
                       activeDot={{ r: 8, strokeWidth: 0, className: "drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

