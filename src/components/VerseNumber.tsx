import { toArabicIndic } from '../utils/arabicNumerals'

interface VerseNumberProps {
  number: number
  className?: string
}

export function VerseNumber({ number, className = '' }: VerseNumberProps) {
  const arabicNumber = toArabicIndic(number)

  return (
    <div className={`inline-block ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width="60"
        height="60"
        role="img"
        aria-label={`Verse ${number}`}
        className="text-primary-600"
      >
        <defs>
          <style>
            {`
              .frame-stroke { stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
              .petal { fill: currentColor; opacity: 0.06; }
              .dot { fill: currentColor; }
              .num { font-family: "Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif; font-size: 26px; fill: currentColor; text-anchor: middle; dominant-baseline: middle; }
            `}
          </style>
        </defs>

        <g transform="translate(60,60)">
          <circle r="44" className="frame-stroke" opacity="0.95" />

          <g id="petals">
            <path
              d="M0,-46 C6,-52 18,-52 22,-46 C18,-40 6,-40 0,-46 Z"
              className="petal"
            />
            <path
              d="M0,-46 C6,-52 18,-52 22,-46 C18,-40 6,-40 0,-46 Z"
              className="frame-stroke"
              fill="none"
            />
          </g>

          <g>
            <use href="#petals" transform="rotate(0)" />
            <use href="#petals" transform="rotate(45)" />
            <use href="#petals" transform="rotate(90)" />
            <use href="#petals" transform="rotate(135)" />
            <use href="#petals" transform="rotate(180)" />
            <use href="#petals" transform="rotate(225)" />
            <use href="#petals" transform="rotate(270)" />
            <use href="#petals" transform="rotate(315)" />
          </g>

          <circle r="30" className="frame-stroke" />

          <g>
            <circle cx="0" cy="-30" r="1.8" className="dot" />
            <circle cx="21" cy="-21" r="1.8" className="dot" />
            <circle cx="30" cy="0" r="1.8" className="dot" />
            <circle cx="21" cy="21" r="1.8" className="dot" />
            <circle cx="0" cy="30" r="1.8" className="dot" />
            <circle cx="-21" cy="21" r="1.8" className="dot" />
            <circle cx="-30" cy="0" r="1.8" className="dot" />
            <circle cx="-21" cy="-21" r="1.8" className="dot" />
          </g>

          <path
            d="M-14,-6 q14,-12 28,0"
            className="frame-stroke"
            opacity="0.9"
          />
          <path d="M-14,6 q14,12 28,0" className="frame-stroke" opacity="0.9" />

          <circle r="17" fill="white" opacity="1" />

          <text x="0" y="0" className="num" style={{ fontSize: '36px' }}>
            {arabicNumber}
          </text>
        </g>
      </svg>
    </div>
  )
}
