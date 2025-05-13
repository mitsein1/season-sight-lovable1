
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import React from "react";

export default function MainNavigation() {
  const location = useLocation();
  
  return (
    <div className="sticky top-0 z-10 border-b bg-white dark:bg-slate-800 shadow-sm backdrop-blur-md">
      <div className="container mx-auto py-3 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-seasonax-primary dark:text-seasonax-secondary">
              Market Dynamics
            </h1>
            <ThemeToggle />
          </div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={cn(
                  navigationMenuTriggerStyle(),
                  location.pathname === "/" ? "bg-accent" : ""
                )}>
                  Dashboard
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/screener" className={cn(
                  navigationMenuTriggerStyle(),
                  location.pathname === "/screener" ? "bg-accent" : ""
                )}>
                  Screener
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}
