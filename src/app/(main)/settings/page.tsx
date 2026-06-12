"use client";

import { useThemeStore, defaultThemes } from "@/lib/theme";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { currentTheme, setTheme, updateCustomColor, updateCustomBackgroundImage } = useThemeStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCustomBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const presetImages = [
    { name: "Neon Cyberpunk", url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2000&auto=format&fit=crop" },
    { name: "Deep Space", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop" },
    { name: "Aurora", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop" },
    { name: "Soft Geometry", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop" },
    { name: "Dark Fluid", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" }
  ];

  return (
    <div className="md:p-10 p-3 pt-6 gap-8 h-full min-h-screen items-center justify-center/ w-full flex flex-col padding-bottom-safe">
      <div className="z-10 px-3 w-full flex justify-between items-center">
        <div className="text-2xl font-bold">Settings</div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col w-full h-full gap-8 max-w-4xl"
      >
        <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-2xl //border border-theme-border rounded-3xl p-6 flex flex-col gap-4 shadow-lg w-full">
          <div className="text-xl font-bold">Themes</div>
          <div className="text-theme-text/70 text-sm">Select a preset theme, pick a custom color, or upload your own background image.</div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            {defaultThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme)}
                style={{
                  backgroundColor: theme.bg,
                  color: theme.fg,
                  border: currentTheme.id === theme.id ? `2px solid ${theme.accent}` : "2px solid transparent"
                }}
                className={`py-3 px-6 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
              >
                {currentTheme.id === theme.id && <div className="w-2 h-2 rounded-full bg-theme-text" />}
                {theme.name}
              </button>
            ))}
          </div>
          
          <div className="flex w-full mt-6 gap-8 pb-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="text-sm font-semibold uppercase opacity-60">Custom Color</div>
              <div className="flex gap-4 items-center">
                <input 
                   type="color" 
                   value={currentTheme.bg.startsWith("#") ? currentTheme.bg : "#000000"} 
                   onChange={(e) => updateCustomColor(e.target.value)}
                   className="h-14 w-14 //rounded-full outline-none border-0 p-0 cursor-pointer overflow-hidden border-transparent bg-transparent"
                />
                <div className="text-theme-text/80 font-mono bg-theme-border px-4 py-2 rounded-full">{currentTheme.bg.startsWith("#") ? currentTheme.bg : "Custom"}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div className="text-sm font-semibold uppercase opacity-60">Background Image</div>
              <div className="flex flex-col gap-3">
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleImageUpload}
                   className="text-theme-text/80 font-mono file:bg-theme-accent file:border-none file:text-theme-text file:px-4 file:py-2 file:rounded-full file:cursor-pointer hover:file:opacity-80"
                 />

                 <div className="flex flex-wrap gap-2 mt-2">
                   {presetImages.map(img => (
                     <div 
                       key={img.name} 
                       onClick={() => updateCustomBackgroundImage(img.url)}
                       className="w-16 h-16 rounded-xl bg-cover bg-center cursor-pointer border-2 hover:opacity-80 transition-all active:scale-95"
                       style={{ backgroundImage: `url(${img.url})`, borderColor: currentTheme.bgImage === img.url ? currentTheme.accent : 'transparent' }}
                       title={img.name}
                     />
                   ))}
                 </div>

                 {currentTheme.bgImage && (
                   <button 
                     onClick={() => updateCustomColor(currentTheme.bg)} 
                     className="text-xs text-red-400 text-left hover:underline w-fit mt-1"
                   >
                     Remove background image
                   </button>
                 )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-theme-card backdrop-blur-2xl //border border-theme-border rounded-4xl p-6 flex flex-col gap-4 shadow-lg w-full">
          <div className="text-xl hidden font-bold">Navigation Options</div>
          <div className="flex flex-col gap-4">
             <Link href="/about" className="py-4/ px-6/ bg-theme-accent/ hover:opacity-80 rounded-2xl flex items-center justify-between transition-opacity w-full">
               <span>Information</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
             </Link>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
