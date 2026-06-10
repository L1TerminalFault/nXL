"use client";

import Link from "next/link";
import { SVGProps } from "react";
import { FaAlignLeft as List } from "react-icons/fa";
import { RiFileList2Line as Sum } from "react-icons/ri";
import {MdOutlineTask as Ord} from "react-icons/md";
import { GoHomeFill as Home } from "react-icons/go";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const routes = [
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
    name: "Summary",
    href: "/summary",
    icon: (props: SVGProps<SVGSVGElement>) => <Sum {...props} />,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: (props: SVGProps<SVGSVGElement>) => <Ord {...props} />,
  },
];

export default function NavBar() {
  const pathname = usePathname();

  useEffect(() => {
    const followee = document.getElementById("followee");
    const follower = document.getElementById("follower");
    // setWidth(window.innerWidth)
    // alert(` ${followee?.getBoundingClientRect()?.y}`);

    if (follower) {
      if (follower.style.display !== "inline")
        follower.style.display = "inline";
      follower.style.left = `${followee?.getBoundingClientRect()?.x}px`;
      // if (window.innerWidth > 768)
      //   follower.style.top = `${followee?.getBoundingClientRect()?.y ? followee?.getBoundingClientRect()?.y - 8 : 0}px`;
      // else follower.style.bottom = "20px";
      follower.style.width = `${followee?.clientWidth}px`;
      follower.style.height = `${followee?.clientHeight}px`;
    }
  });

  return (
    <div className="flex z-10 pb-6 md:px-10 px-10 w-full fixed  bottom-0">
      <div
        id="follower"
        className="p-4 hidden bg-white/10 absolute mt-2 transition-all z-10 rounded-full duration-400"
      />
      <div className="flex //max-md: items-center //md:flex-col //md:gap-4 shadow-lg shadow-black/30 p-2 //max-md:p-1 rounded-full //md:h-full //max-md: backdrop-blur-xl w-full //max-md: bg-gray-100/5 //max-md: justify-between //md:pt-34">
        {routes.map((route) => (
          <Link
            id={`${route.href.includes(pathname) ? "followee" : ""}`}
            key={route.href}
            href={route.href}
            className={`flex max-md:flex-col items-center justify-center gap-1.5 md:gap-2 text-lg p-1.5 px-5 //px-4 rounded-full ${route.href.includes(pathname) ? "hover:bg-transparent" : "hover:bg-white/5 text-gray-400 px-3"} transition-all items-center`}
          >
            <route.icon className="text-xl" />
            <div className={`flex items-center max-md:text-[10px] justify-center`}>
              {route.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
