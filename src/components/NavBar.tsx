"use client";

import Link from "next/link";
import { SVGProps } from "react";
import { FaAlignLeft as List } from "react-icons/fa";
import { RiFileList2Line as Sum } from "react-icons/ri";
import {MdOutlineTask as Ord} from "react-icons/md";
import { GoHomeFill as Home } from "react-icons/go";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {useUser} from "@clerk/nextjs";
import {isAdmin} from "@/lib/utils";

const routes = [
  {
    name: "Home",
    href: "/home",
    icon: (props: SVGProps<SVGSVGElement>) => <Home {...props} />,
    admin: false,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: (props: SVGProps<SVGSVGElement>) => <List {...props} />,
    admin: false,
  },
  {
    name: "Summary",
    href: "/summary",
    icon: (props: SVGProps<SVGSVGElement>) => <Sum {...props} />,
    admin: false,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: (props: SVGProps<SVGSVGElement>) => <Ord {...props} />,
    admin: true,
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [updatePos, setUpdatePos] = useState(false);
  const {user} = useUser();

  useEffect(() => {
	  const interval = setInterval(() => setUpdatePos(prev => !prev), 300);
	  const timeout = setTimeout(() => {
		  clearInterval(interval);
		  clearTimeout(timeout);
	  }, 3000);
  }, []);

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
    <div className="flex z-10 pb-6 md:px-10 px-10 w-full fixed  bottom-0">
      <div
        id="follower"
        className="p-4 hidden bg-white/10 absolute mt-2 transition-all z-10 rounded-full duration-400"
      />
      <div className="flex //max-md: items-center //md:flex-col //md:gap-4 shadow-lg shadow-black/30 p-2 //max-md:p-1 rounded-full //md:h-full //max-md: backdrop-blur-xl w-full //max-md: bg-gray-100/5 //max-md: justify-between //md:pt-34">
        {routes.map((route) => (
          <div
            id={`${pathname.includes(route.href) ? "followee" : ""}`}
            key={route.href}
            // href={route.href}
	    onClick={() => router.push(route.href)}
            className={`${route.admin && isAdmin(user?.id) ? "flex" : "hidden"} /flex max-md:flex-col items-center justify-center gap-1.5 md:gap-2 text-lg p-1.5 px-5 //px-4 rounded-full ${pathname.includes(route.href) ? "hover:bg-transparent bg-theme-accent/30 text-theme-text" : "hover:bg-theme-accent/40 text-gray-400/ text-theme-text/50 px-3"} transition-all items-center`}
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
