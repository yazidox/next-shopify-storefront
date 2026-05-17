import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Drop-in replacements for next/link, useRouter, redirect, etc. — these
// automatically prepend the active locale prefix when needed.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
