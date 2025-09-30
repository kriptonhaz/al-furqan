import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { Translation, TranslationsResponse } from '../types/translation'

interface TranslationsDropdownProps {
  value: string
  onValueChange: (value: string) => void
}

const fetchTranslations = async (): Promise<Translation[]> => {
  const response = await fetch('/api/translations')
  if (!response.ok) {
    throw new Error('Failed to fetch translations')
  }
  const data: TranslationsResponse = await response.json()
  return data.translations
}

const getLanguageFlag = (languageName: string): string => {
  const flags: Record<string, string> = {
    english: '🇺🇸',
    spanish: '🇪🇸',
    french: '🇫🇷',
    german: '🇩🇪',
    italian: '🇮🇹',
    portuguese: '🇵🇹',
    russian: '🇷🇺',
    chinese: '🇨🇳',
    japanese: '🇯🇵',
    korean: '🇰🇷',
    arabic: '🇸🇦',
    turkish: '🇹🇷',
    urdu: '🇵🇰',
    hindi: '🇮🇳',
    bengali: '🇧🇩',
    indonesian: '🇮🇩',
    malay: '🇲🇾',
    persian: '🇮🇷',
    dutch: '🇳🇱',
    swedish: '🇸🇪',
    norwegian: '🇳🇴',
    danish: '🇩🇰',
    finnish: '🇫🇮',
    polish: '🇵🇱',
    czech: '🇨🇿',
    hungarian: '🇭🇺',
    romanian: '🇷🇴',
    bulgarian: '🇧🇬',
    greek: '🇬🇷',
    hebrew: '🇮🇱',
    thai: '🇹🇭',
    vietnamese: '🇻🇳',
    ukrainian: '🇺🇦',
    albanian: '🇦🇱',
    bosnian: '🇧🇦',
    croatian: '🇭🇷',
    serbian: '🇷🇸',
    slovenian: '🇸🇮',
    slovak: '🇸🇰',
    lithuanian: '🇱🇹',
    latvian: '🇱🇻',
    estonian: '🇪🇪',
    maltese: '🇲🇹',
    irish: '🇮🇪',
    welsh: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    scottish: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    catalan: '🇪🇸',
    basque: '🇪🇸',
    galician: '🇪🇸',
    swahili: '🇰🇪',
    hausa: '🇳🇬',
    yoruba: '🇳🇬',
    igbo: '🇳🇬',
    amharic: '🇪🇹',
    somali: '🇸🇴',
    oromo: '🇪🇹',
    tigrinya: '🇪🇷',
    afrikaans: '🇿🇦',
    zulu: '🇿🇦',
    xhosa: '🇿🇦',
    sotho: '🇿🇦',
    tswana: '🇧🇼',
    shona: '🇿🇼',
    ndebele: '🇿🇼',
    chichewa: '🇲🇼',
    bemba: '🇿🇲',
    luo: '🇰🇪',
    kikuyu: '🇰🇪',
    kamba: '🇰🇪',
    meru: '🇰🇪',
    embu: '🇰🇪',
    taita: '🇰🇪',
    pokomo: '🇰🇪',
    turkana: '🇰🇪',
    maasai: '🇰🇪',
    samburu: '🇰🇪',
    rendille: '🇰🇪',
    borana: '🇰🇪',
    gabra: '🇰🇪',
    burji: '🇰🇪',
    konso: '🇪🇹',
    gedeo: '🇪🇹',
    sidamo: '🇪🇹',
    wolayta: '🇪🇹',
    gamo: '🇪🇹',
    gofa: '🇪🇹',
    dawro: '🇪🇹',
    kafa: '🇪🇹',
    bench: '🇪🇹',
    sheko: '🇪🇹',
    dizi: '🇪🇹',
    surma: '🇪🇹',
    mursi: '🇪🇹',
    hamer: '🇪🇹',
    banna: '🇪🇹',
    karo: '🇪🇹',
    kwegu: '🇪🇹',
    nyangatom: '🇪🇹',
    daasanach: '🇪🇹',
    arbore: '🇪🇹',
    tsamai: '🇪🇹',
    ari: '🇪🇹',
    bodi: '🇪🇹',
    murle: '🇸🇸',
    toposa: '🇸🇸',
    jie: '🇺🇬',
    karamojong: '🇺🇬',
    pokot: '🇺🇬',
    sebei: '🇺🇬',
    sabaot: '🇰🇪',
    nandi: '🇰🇪',
    kipsigis: '🇰🇪',
    tugen: '🇰🇪',
    marakwet: '🇰🇪',
    endorois: '🇰🇪',
    ogiek: '🇰🇪',
    sengwer: '🇰🇪',
    cherangany: '🇰🇪',
    book: '🇰🇪',
    terik: '🇰🇪',
    keiyo: '🇰🇪',
    elgeyo: '🇰🇪',
    pok: '🇰🇪',
    endo: '🇰🇪',
    chepchabas: '🇰🇪',
  }
  
  return flags[languageName.toLowerCase()] || '🌐'
}

export function TranslationsDropdown({ value, onValueChange }: TranslationsDropdownProps) {
  const { data: translations, isLoading, error } = useQuery({
    queryKey: ['translations'],
    queryFn: fetchTranslations,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Loading translations...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        Failed to load translations
      </div>
    )
  }

  const selectedTranslation = translations?.find(t => t.id.toString() === value)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-primary-700">Translation:</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue>
            {selectedTranslation && (
              <div className="flex items-center gap-2">
                <span>{getLanguageFlag(selectedTranslation.language_name)}</span>
                <span>{selectedTranslation.translated_name.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {translations?.map((translation) => (
            <SelectItem key={translation.id} value={translation.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{getLanguageFlag(translation.language_name)}</span>
                <span>{translation.translated_name.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}