import type { SVGProps } from "react"

/**
 * Instagram glyph as a self-contained SVG.
 *
 * lucide-react v1 removed brand icons (Instagram, etc.) for trademark reasons,
 * so this reproduces the same camera-square outline lucide used. It mirrors the
 * lucide icon API: pass `className` for sizing/color (uses `currentColor`).
 */
export function InstagramIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  // Decorative by default (like lucide); only expose to the a11y tree when a label is given.
  const labelled = props["aria-label"] != null || props["aria-labelledby"] != null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export default InstagramIcon
