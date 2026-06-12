"use client"

import * as React from "react"
import { DayPicker, UI, DayFlag, SelectionState, type CalendarDay } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background p-2",
        className
      )}
      classNames={{
        [UI.Root]: cn("w-fit"),
        [UI.Months]: cn("relative flex flex-col gap-4 md:flex-row"),
        [UI.Month]: cn("flex w-full flex-col gap-4"),
        [UI.Nav]: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1"
        ),
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 p-0 select-none aria-disabled:opacity-50"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 p-0 select-none aria-disabled:opacity-50"
        ),
        [UI.MonthCaption]: cn(
          "flex h-7 w-full items-center justify-center px-7"
        ),
        [UI.Dropdowns]: cn(
          "flex h-7 w-full items-center justify-center gap-1.5 text-sm font-medium"
        ),
        [UI.DropdownRoot]: cn("relative rounded-md"),
        [UI.Dropdown]: cn(
          "absolute inset-0 bg-popover opacity-0"
        ),
        [UI.CaptionLabel]: cn("text-sm font-medium select-none"),
        [UI.MonthGrid]: cn("w-full border-collapse"),
        [UI.Weekdays]: cn("flex"),
        [UI.Weekday]: cn(
          "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none"
        ),
        [UI.Week]: cn("mt-2 flex w-full"),
        [UI.WeekNumberHeader]: cn("w-7 select-none"),
        [UI.WeekNumber]: cn(
          "text-[0.8rem] text-muted-foreground select-none"
        ),
        [UI.Day]: cn(
          "group/day relative aspect-square h-full w-full rounded-md p-0 text-center select-none",
          classNames?.[UI.Day]
        ),
        [SelectionState.range_start]: cn(
          "relative isolate z-0 rounded-l-md bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted"
        ),
        [SelectionState.range_middle]: cn("rounded-none"),
        [SelectionState.range_end]: cn(
          "relative isolate z-0 rounded-r-md bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted"
        ),
        [SelectionState.selected]: cn("bg-primary text-primary-foreground"),
        [DayFlag.today]: cn(
          "rounded-md bg-muted text-foreground"
        ),
        [DayFlag.outside]: cn(
          "text-muted-foreground aria-selected:text-muted-foreground"
        ),
        [DayFlag.disabled]: cn(
          "text-muted-foreground opacity-50"
        ),
        [DayFlag.hidden]: cn("invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className="size-4" {...props} />
          }
          return <ChevronRightIcon className="size-4" {...props} />
        },
        DayButton: ({ day, modifiers, ...props }) => {
          return (
            <button
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "relative isolate z-10 flex aspect-square size-auto w-full min-w-7 flex-col gap-1 border-0 leading-none font-normal",
                modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                modifiers.range_start && "rounded-l-md bg-primary text-primary-foreground",
                modifiers.range_end && "rounded-r-md bg-primary text-primary-foreground",
                modifiers.range_middle && "rounded-none bg-muted text-foreground",
                modifiers.today && "bg-accent text-accent-foreground",
                modifiers.outside && "text-muted-foreground opacity-50",
                modifiers.disabled && "text-muted-foreground opacity-50 cursor-not-allowed"
              )}
              {...props}
            />
          )
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
