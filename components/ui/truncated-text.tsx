"use client"

import { useEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TruncatedTextProps {
  text: string
  className?: string
  maxWidth?: string
}

export function TruncatedText({
  text,
  className = "",
  maxWidth = "200px",
}: TruncatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    // Check if text is truncated by comparing scroll width to client width
    setIsTruncated(element.scrollWidth > element.clientWidth)
  }, [text])

  const textElement = (
    <div ref={textRef} className={`truncate ${className}`} style={{ maxWidth }}>
      {text}
    </div>
  )

  // Only wrap with tooltip if text is actually truncated
  if (isTruncated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-default">{textElement}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return textElement
}
