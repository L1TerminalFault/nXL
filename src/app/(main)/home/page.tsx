import { BsListNested } from "react-icons/bs";
import { FaCogs } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";

export default function Home() {
  return (
    <div className="p-4 flex flex-col w-full h-full gap-6">
      <div className="px-10 py-20 gap-9 text-lg bg-white/5 rounded-4xl flex items-center">
        <BsListNested className="shrink-0" size={50} />
        NxL helps you summarize your company expenses by automatically listening
        for the data from the app. You can view your expenses in a clear and
        organized way, making it easier to manage your finances.
      </div>
      <div className="bg-white/5 gap-7 p-10 flex items-center rounded-3xl">
        <FaCogs className="shrink-0" size={50} />
        Sign Up or Login to get started
      </div>
      <div className="bg-white/5 gap-7 p-10 flex items-center rounded-3xl">
        <LuInfo className="shrink-0" size={50} />
        Contact us for any problems
      </div>
    </div>
  );
}
