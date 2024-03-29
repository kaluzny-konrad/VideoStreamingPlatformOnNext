import Link from "next/link";
import React from "react";
import { buttonVariants } from "./ui/button";
import NavDesktopLoggedItems from "./NavDesktopLoggedItems";

type Props = {};

export default function NavDesktopItems({}: Props) {
  return (
    <div className="w-96 flex flex-row justify-end items-center">
      <Link href={"/courses"} className={buttonVariants({ variant: "ghost" })}>
        Explore
      </Link>
      <NavDesktopLoggedItems />
    </div>
  );
}
