import { LanguageDropdown } from './LanguageDropdown'

export default function Header() {
  return (
    <header className="p-4 flex gap-2 bg-white text-black justify-center border-b border-gray-200">
      <LanguageDropdown />
    </header>
  )
}
