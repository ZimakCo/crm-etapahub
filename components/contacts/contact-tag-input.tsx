"use client"

import { useMemo, useState } from "react"
import { LoaderCircle, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ContactTag } from "@/lib/types"

interface ContactTagInputProps {
  availableTags: ContactTag[]
  value: string[]
  onChange: (value: string[]) => void
  onCreateTag?: (name: string) => Promise<ContactTag | void>
  placeholder?: string
  disabled?: boolean
  inputId?: string
  inputTestId?: string
}

function normalizeTagValue(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function dedupeTags(tags: string[]) {
  const values = new Map<string, string>()

  tags.forEach((tag) => {
    const normalized = normalizeTagValue(tag)
    if (!normalized) {
      return
    }

    const key = normalized.toLowerCase()
    if (!values.has(key)) {
      values.set(key, normalized)
    }
  })

  return Array.from(values.values())
}

export function ContactTagInput({
  availableTags,
  value,
  onChange,
  onCreateTag,
  placeholder = "Search or create a tag",
  disabled = false,
  inputId,
  inputTestId,
}: ContactTagInputProps) {
  const [query, setQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const normalizedValue = useMemo(() => dedupeTags(value), [value])
  const normalizedQuery = normalizeTagValue(query)
  const normalizedQueryKey = normalizedQuery.toLowerCase()

  const suggestions = useMemo(() => {
    const selectedKeys = new Set(normalizedValue.map((tag) => tag.toLowerCase()))

    return availableTags
      .filter((tag) => !selectedKeys.has(tag.name.toLowerCase()))
      .filter((tag) =>
        normalizedQueryKey.length === 0
          ? true
          : tag.name.toLowerCase().includes(normalizedQueryKey)
      )
      .slice(0, 8)
  }, [availableTags, normalizedQueryKey, normalizedValue])

  const matchingTag = useMemo(
    () =>
      availableTags.find((tag) => tag.name.toLowerCase() === normalizedQueryKey) ?? null,
    [availableTags, normalizedQueryKey]
  )

  const canCreate =
    Boolean(onCreateTag) &&
    normalizedQuery.length > 0 &&
    !matchingTag &&
    !normalizedValue.some((tag) => tag.toLowerCase() === normalizedQueryKey)

  const addTag = (tagName: string) => {
    onChange(dedupeTags([...normalizedValue, tagName]))
    setQuery("")
  }

  const removeTag = (tagName: string) => {
    const key = tagName.toLowerCase()
    onChange(normalizedValue.filter((tag) => tag.toLowerCase() !== key))
  }

  const handleCreateTag = async () => {
    if (!canCreate || !onCreateTag) {
      return
    }

    setIsCreating(true)
    try {
      const createdTag = await onCreateTag(normalizedQuery)
      addTag(createdTag?.name ?? normalizedQuery)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSubmitCurrentQuery = async () => {
    if (matchingTag) {
      addTag(matchingTag.name)
      return
    }

    if (canCreate) {
      await handleCreateTag()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {normalizedValue.length > 0 ? (
          normalizedValue.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full text-muted-foreground transition hover:text-foreground"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No tags selected yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          data-testid={inputTestId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return
            }

            event.preventDefault()
            void handleSubmitCurrentQuery()
          }}
          placeholder={placeholder}
          disabled={disabled || isCreating}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleSubmitCurrentQuery()}
          disabled={disabled || isCreating || normalizedQuery.length === 0}
          className="sm:w-auto"
        >
          {isCreating ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {canCreate ? "Create Tag" : "Add Tag"}
        </Button>
      </div>

      {(suggestions.length > 0 || canCreate) && (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tag.name)}
                disabled={disabled || isCreating}
                className="rounded-full"
              >
                {tag.name}
                <span className="text-xs text-muted-foreground">{tag.usageCount}</span>
              </Button>
            ))}
            {canCreate && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void handleCreateTag()}
                disabled={disabled || isCreating}
                className="rounded-full"
              >
                <Plus className="size-3.5" />
                Create &quot;{normalizedQuery}&quot;
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
