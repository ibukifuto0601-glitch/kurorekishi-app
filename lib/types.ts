export interface Letter {
  id: string
  content: string
  envelopeColor: string
  createdAt: string
  type: 'sent' | 'received'
  isAI?: boolean
  reaction?: string
  comment?: string
}

export interface EnvelopeColorDef {
  id: string
  name: string
  bg: string
  dark: string
  light: string
  emoji: string
  gradient: string
}

export const ENVELOPE_COLORS: EnvelopeColorDef[] = [
  {
    id: 'rose',
    name: 'ローズ',
    bg: '#FFB3C6',
    dark: '#FF85A1',
    light: '#FFE4EC',
    emoji: '🌸',
    gradient: 'from-rose-300 to-pink-400',
  },
  {
    id: 'sky',
    name: 'スカイ',
    bg: '#B3D4FF',
    dark: '#7AB8FF',
    light: '#D6EAFF',
    emoji: '☁️',
    gradient: 'from-sky-300 to-blue-400',
  },
  {
    id: 'amber',
    name: 'サニー',
    bg: '#FFE8A3',
    dark: '#FFD060',
    light: '#FFF4D6',
    emoji: '🌼',
    gradient: 'from-amber-300 to-yellow-400',
  },
  {
    id: 'mint',
    name: 'ミント',
    bg: '#A8F0D1',
    dark: '#5FD9A8',
    light: '#D4F8EC',
    emoji: '🌿',
    gradient: 'from-emerald-300 to-teal-400',
  },
  {
    id: 'lavender',
    name: 'ラベンダー',
    bg: '#D4B3FF',
    dark: '#B07FFF',
    light: '#ECDCFF',
    emoji: '💜',
    gradient: 'from-violet-300 to-purple-400',
  },
]

export const SAMPLE_TEXTS = [
  '静まり返ったテスト中にお腹が「ぎゅるるる～」と鳴って、みんなの視線が一気に自分に集まった。あれはほんとに恥ずかしかった。',
  '道で手を振られたから笑顔で振り返したら、私の後ろの人への挨拶だった。',
  '体育祭のリレーでバトンを落として転んで、滑ってそのまま隣のレーンの子を巻き込んだ。今でも語り草になってる。',
  'SNSのストーリーに投稿するつもりだった「あいつ超むかつく」をそのあいつにDMで直接送ってしまった。',
  'バイト先で数時間働いた後、トイレの鏡を見たら服を完全に裏表逆に着ていた。',
]
