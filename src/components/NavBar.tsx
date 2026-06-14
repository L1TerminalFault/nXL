"use client";

import Link from "next/link";
import { SVGProps } from "react";
import { FaAlignLeft as List } from "react-icons/fa";
import { RiFileList2Line as Sum } from "react-icons/ri";
import { IoMdSettings as Setting } from "react-icons/io";
import {MdOutlineTask as Ord} from "react-icons/md";
import { GoHomeFill as Home } from "react-icons/go";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {useUser} from "@clerk/nextjs";
import {isAdmin} from "@/lib/utils";

const routesAdmin = [
  {
    name: "Home",
    href: "/home",
    icon: (props: SVGProps<SVGSVGElement>) => <Home {...props} />,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: (props: SVGProps<SVGSVGElement>) => <List {...props} />,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: (props: SVGProps<SVGSVGElement>) => <Ord {...props} />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (props: SVGProps<SVGSVGElement>) => <Setting {...props} />,
  },
];

const routesUser = [
  {
    name: "Home",
    href: "/home",
    icon: (props: SVGProps<SVGSVGElement>) => <Home {...props} />,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: (props: SVGProps<SVGSVGElement>) => <List {...props} />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (props: SVGProps<SVGSVGElement>) => <Setting {...props} />,
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [updatePos, setUpdatePos] = useState(false);
  const {user} = useUser();
  const [routes, setRoutes] = useState(routesUser);

  useEffect(() => {
	  const interval = setInterval(() => setUpdatePos(prev => !prev), 300);
	  const timeout = setTimeout(() => {
		  clearInterval(interval);
		  clearTimeout(timeout);
	  }, 3000);
  }, []);

  useEffect(() => {
	  setRoutes(isAdmin(user?.id) ? routesAdmin : routesUser);
  }, [user?.id]);

  useEffect(() => {
    const followee = document.getElementById("followee");
    const follower = document.getElementById("follower");
    // setWidth(window.innerWidth)
    // alert(` ${followee?.getBoundingClientRect()?.y}`);

    if (follower) {
      if (followee) {
        if (follower.style.display !== "inline")
          follower.style.display = "inline";

        follower.style.left = `${followee?.getBoundingClientRect()?.x}px`;
        // if (window.innerWidth > 768)
        //   follower.style.top = `${followee?.getBoundingClientRect()?.y ? followee?.getBoundingClientRect()?.y - 8 : 0}px`;
        // else follower.style.bottom = "20px";
        follower.style.width = `${followee?.clientWidth}px`;
        follower.style.height = `${followee?.clientHeight}px`;
      } else follower.style.display = "none";
    }
  }, [pathname, updatePos]);

  return (
    <div className="flex z-30 pb-6 md:px-10 px-10 w-full fixed  bottom-0">
      <div
        id="follower"
        className="p-4 hidden bg-theme-accent/70 absolute mt-2 transition-all z-0 rounded-full duration-400"
      />
      <div className="flex relative items-center shadow-lg shadow-black/30 p-2 rounded-full backdrop-blur-lg w-full bg-gray-100/5 justify-between">
        {routes.map((route) => (
          <div
            id={`${pathname.includes(route.href) ? "followee" : ""}`}
            key={route.href}
            // href={route.href}
	    onClick={() => router.push(route.href)}
            className={`relative flex max-md:flex-col z-20 items-center justify-center gap-1.5 md:gap-2 text-lg p-1.5 px-5 rounded-full ${pathname.includes(route.href) ? "bg-theme-accent/70 text-theme-text" : "text-theme-text/50 px-3"} hover:bg-theme-accent/80 transition-all items-center`}
          >
            <route.icon className="text-xl" />
            <div className={`flex items-center max-md:text-[10px] justify-center`}>
              {route.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
