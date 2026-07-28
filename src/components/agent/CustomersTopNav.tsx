import { Search, Bell, HelpCircle } from "lucide-react";
import Image from "next/image";

export function CustomersTopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-container-margin shadow-sm">
      <div className="flex flex-1 items-center">
        <div className="group relative w-96">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            placeholder="Search customers, companies..."
            className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 font-body-md focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <Bell aria-hidden className="size-6" />
        </button>
        <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <HelpCircle aria-hidden className="size-6" />
        </button>
        <div className="mx-2 h-8 w-[1px] bg-outline-variant"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-label-md leading-none text-on-surface">
              Sarah Jenkins
            </p>
            <p className="text-[10px] text-outline">Senior Agent</p>
          </div>
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsyOWHgeBdgNX4IZF46-xPklGyBFZFvo2Sa5fWV4yoRxcNZjugTfwVPe4tyuC0oopNOD7rAiQWTBu3fXzFLqjCJj617sq_-2F-MiwQPu1O2f2M5SdW_49Ti5eOV85RSZn32PegnMvGQXsFPKOhIMGyObQ2iYyiM8aXqHufzaikQDDDgi4DB-U6aIffFxBjckyEKwkMfH7UXEeAV1Jpu7u9vjNFTGilpWw3lwvz-XTdOiKNmRW7MGa9PUDUtnYnJ_odShhOk6d7NGIj"
            alt="Agent Profile"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-surface-variant"
          />
        </div>
      </div>
    </header>
  );
}
