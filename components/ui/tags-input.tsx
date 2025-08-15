"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { IconChevronDown, IconX } from "@tabler/icons-react"
import * as React from "react"

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
  maxTags?: number
}

export function TagsInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Add tags...",
  className,
  maxTags,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !value.includes(trimmedTag)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, trimmedTag])
      }
    }
    setInputValue("")
    setShowSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.includes(suggestion) &&
      (inputValue === "" ||
        suggestion.toLowerCase().includes(inputValue.toLowerCase()))
  )

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={cn("w-full relative", className)} ref={containerRef}>
      <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background min-h-[2.5rem] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0.5 text-muted-foreground hover:text-foreground"
              onClick={() => removeTag(tag)}
            >
              <IconX className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        <div className="flex flex-1 min-w-[120px] items-center">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              const newValue = e.target.value
              setInputValue(newValue)
              // Show suggestions if there are any available (filtered or all)
              const currentFiltered = suggestions.filter(
                (suggestion) =>
                  !value.includes(suggestion) &&
                  (newValue === "" ||
                    suggestion.toLowerCase().includes(newValue.toLowerCase()))
              )
              setShowSuggestions(currentFiltered.length > 0)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Always show suggestions when focused if there are any available
              const availableSuggestions = suggestions.filter(
                (suggestion) =>
                  !value.includes(suggestion) &&
                  (inputValue === "" ||
                    suggestion.toLowerCase().includes(inputValue.toLowerCase()))
              )
              setShowSuggestions(availableSuggestions.length > 0)
            }}
            placeholder={
              value.length === 0
                ? suggestions.length > 0
                  ? `${placeholder} (${suggestions.length} available)`
                  : placeholder
                : ""
            }
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
            disabled={maxTags ? value.length >= maxTags : false}
          />
          {suggestions.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setInputValue("") // Clear any filter text
                setShowSuggestions(true) // Always show dropdown when button clicked
                inputRef.current?.focus()
              }}
              title={`Show all ${suggestions.length} available tags`}
            >
              <IconChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  showSuggestions && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No suggestions available
            </div>
          )}
        </div>
      )}

      {maxTags && (
        <p className="text-sm text-muted-foreground mt-1">
          {value.length}/{maxTags} tags
        </p>
      )}
    </div>
  )
}
