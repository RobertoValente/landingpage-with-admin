"use client"

import { useEffect } from "react"

/**
 * Parses arbitrary HTML containing <script> tags and appends real, executable
 * script elements to either <head> or <body>. React's dangerouslySetInnerHTML
 * does not execute scripts, so we create them imperatively via the DOM.
 */
export function ScriptInjector({
  html,
  position,
}: {
  html: string
  position: "head" | "body"
}) {
  useEffect(() => {
    if (!html.trim()) return

    const target = position === "head" ? document.head : document.body
    const temp = document.createElement("div")
    temp.innerHTML = html

    temp.querySelectorAll("script").forEach((old) => {
      const script = document.createElement("script")
      Array.from(old.attributes).forEach((attr) =>
        script.setAttribute(attr.name, attr.value)
      )
      script.textContent = old.textContent
      target.appendChild(script)
    })
  }, [html, position])

  return null
}
