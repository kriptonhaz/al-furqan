import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { Translation, TranslationsResponse } from '../types/translation'
import { useSelectedTranslations, useAvailableTranslations, setSelectedTranslations, setAvailableTranslations } from '../stores/translationStore'

interface TranslationsDropdownProps {
  // Remove the props since we'll use global state
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

const getLanguageCode = (languageName: string): string => {
  const codes: Record<string, string> = {
    english: 'EN',
    spanish: 'ES',
    french: 'FR',
    german: 'DE',
    italian: 'IT',
    portuguese: 'PT',
    russian: 'RU',
    chinese: 'ZH',
    japanese: 'JA',
    korean: 'KO',
    arabic: 'AR',
    turkish: 'TR',
    urdu: 'UR',
    hindi: 'HI',
    bengali: 'BN',
    indonesian: 'ID',
    malay: 'MS',
    persian: 'FA',
    dutch: 'NL',
    swedish: 'SV',
    norwegian: 'NO',
    danish: 'DA',
    finnish: 'FI',
    polish: 'PL',
    czech: 'CS',
    hungarian: 'HU',
    romanian: 'RO',
    bulgarian: 'BG',
    greek: 'EL',
    hebrew: 'HE',
    thai: 'TH',
    vietnamese: 'VI',
    ukrainian: 'UK',
    albanian: 'SQ',
    bosnian: 'BS',
    croatian: 'HR',
    serbian: 'SR',
    slovenian: 'SL',
    slovak: 'SK',
    lithuanian: 'LT',
    latvian: 'LV',
    estonian: 'ET',
    maltese: 'MT',
    irish: 'GA',
    welsh: 'CY',
    scottish: 'GD',
    catalan: 'CA',
    basque: 'EU',
    galician: 'GL',
    swahili: 'SW',
    hausa: 'HA',
    yoruba: 'YO',
    igbo: 'IG',
    amharic: 'AM',
    somali: 'SO',
    oromo: 'OM',
    tigrinya: 'TI',
    afrikaans: 'AF',
    zulu: 'ZU',
    xhosa: 'XH',
    sotho: 'ST',
    tswana: 'TN',
    shona: 'SN',
    ndebele: 'ND',
    chichewa: 'NY',
    bemba: 'BEM',
    luo: 'LUO',
    kikuyu: 'KI',
    kamba: 'KAM',
    meru: 'MER',
    embu: 'EMB',
    taita: 'TAI',
    pokomo: 'POK',
    turkana: 'TUK',
    maasai: 'MAS',
    samburu: 'SAQ',
    rendille: 'REL',
    borana: 'BOR',
    gabra: 'GAB',
    burji: 'BUR',
    konso: 'KON',
    gedeo: 'GED',
    sidamo: 'SID',
    wolayta: 'WOL',
    gamo: 'GAM',
    gofa: 'GOF',
    dawro: 'DAW',
    kafa: 'KAF',
    bench: 'BEN',
    sheko: 'SHE',
    dizi: 'DIZ',
    surma: 'SUR',
    mursi: 'MUR',
    hamer: 'HAM',
    banna: 'BAN',
    karo: 'KAR',
    kwegu: 'KWE',
    nyangatom: 'NYA',
    daasanach: 'DAA',
    arbore: 'ARB',
    tsamai: 'TSA',
    ari: 'ARI',
    bodi: 'BOD',
    murle: 'MUR',
    toposa: 'TOP',
    jie: 'JIE',
    karamojong: 'KAR',
    pokot: 'POK',
    sebei: 'SEB',
    sabaot: 'SAB',
    nandi: 'NAN',
    kipsigis: 'KIP',
    tugen: 'TUG',
    marakwet: 'MAR',
    endorois: 'END',
    ogiek: 'OGI',
    sengwer: 'SEN',
    cherangany: 'CHE',
    book: 'BOO',
    terik: 'TER',
    keiyo: 'KEI',
    elgeyo: 'ELG',
    pok: 'POK',
    endo: 'END',
    chepchabas: 'CHE',
  }
  
  return codes[languageName.toLowerCase()] || languageName.substring(0, 2).toUpperCase()
}

export function TranslationsDropdown({}: TranslationsDropdownProps) {
  const selectedTranslations = useSelectedTranslations()
  const availableTranslations = useAvailableTranslations()
  
  const { data: translations, isLoading, error } = useQuery({
    queryKey: ['translations'],
    queryFn: fetchTranslations,
  })

  // Update available translations when data is fetched
  if (translations && translations.length > 0 && availableTranslations.length === 0) {
    setAvailableTranslations(translations)
  }

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

  // Sort translations alphabetically by language name
  const sortedTranslations = availableTranslations.slice().sort((a: Translation, b: Translation) => 
    a.language_name.localeCompare(b.language_name)
  )

  // For now, use the first selected translation for display (single selection)
  const selectedTranslation = selectedTranslations.length > 0 ? selectedTranslations[0] : null

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm font-medium text-primary-700 shrink-0">Translation:</span>
      <Select 
        value={selectedTranslation?.id?.toString() || ''} 
        onValueChange={(value) => {
          const translation = sortedTranslations.find((t: Translation) => t.id.toString() === value)
          if (translation) {
            setSelectedTranslations([translation])
          }
        }}
      >
        <SelectTrigger className="w-full min-w-0 max-w-[280px]">
          <SelectValue>
            {selectedTranslation && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{getLanguageFlag(selectedTranslation.language_name)}</span>
                <span className="shrink-0">({getLanguageCode(selectedTranslation.language_name)})</span>
                <span className="truncate">{selectedTranslation.translated_name.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedTranslations.map((translation: Translation) => (
          <SelectItem key={translation.id} value={translation.id.toString()}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0">{getLanguageFlag(translation.language_name)}</span>
              <span className="shrink-0">({getLanguageCode(translation.language_name)})</span>
              <span className="truncate">{translation.translated_name.name}</span>
            </div>
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
    </div>
  )
}