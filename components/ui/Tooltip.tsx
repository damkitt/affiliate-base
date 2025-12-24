"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

// Mobile-friendly Tooltip that uses click on touch devices
const Tooltip = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> & {
        children: React.ReactNode
    }
>(({ children, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [isTouchDevice, setIsTouchDevice] = React.useState(false)

    React.useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }, [])

    // On touch devices, control via state (click to toggle)
    // On desktop, let Radix handle hover behavior
    if (isTouchDevice) {
        return (
            <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
                {children}
            </TooltipPrimitive.Root>
        )
    }

    return (
        <TooltipPrimitive.Root {...props}>
            {children}
        </TooltipPrimitive.Root>
    )
})
Tooltip.displayName = "Tooltip"

const TooltipTrigger = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, ...props }, ref) => {
    return (
        <TooltipPrimitive.Trigger
            ref={ref}
            onClick={(e) => {
                // On touch devices, prevent default and let Radix handle the state
                if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                    e.preventDefault()
                }
                onClick?.(e)
            }}
            {...props}
        />
    )
})
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            "relative z-50 overflow-hidden rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-zinc-200 shadow-2xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

