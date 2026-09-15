/**
 * A shield-and-checkmark mark — reads as "verified case," which is the
 * whole point of this app (an agent verifies a claim before an attorney
 * sees it). Custom-drawn rather than a stock icon so it's ownable as a
 * product mark, not just another icon from the same set used everywhere
 * else in the UI.
 */
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Legal Intake Suite"
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b4cf5" />
          <stop offset="100%" stopColor="#0b1740" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoBg)" />
      <path
        d="M16 6.5L23 9V15C23 20 20 23.5 16 25.5C12 23.5 9 20 9 15V9L16 6.5Z"
        fill="none"
        stroke="#FBF9F3"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 15.3L15 17.8L19.8 12.8"
        fill="none"
        stroke="#06D64B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
