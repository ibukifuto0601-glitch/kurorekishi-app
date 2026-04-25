let _ctx: AudioContext | null = null
let _ambientMaster: GainNode | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (_ctx.state === 'suspended') _ctx.resume()
    return _ctx
  } catch { return null }
}

/** null チェック済みの ac を引数として fn に渡す。ac が取れなければ何もしない */
function withCtx(fn: (ac: AudioContext) => void): void {
  const ac = getCtx()
  if (ac) fn(ac)
}

function makeNoise(ac: AudioContext, secs: number): AudioBuffer {
  const n = Math.ceil(ac.sampleRate * secs)
  const buf = ac.createBuffer(1, n, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function burst(ac: AudioContext, freq: number, dur: number, vol: number, delay = 0): void {
  const src = ac.createBufferSource()
  src.buffer = makeNoise(ac, dur)
  const filt = ac.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.value = freq
  filt.Q.value = 1.4
  const g = ac.createGain()
  const t = ac.currentTime + delay
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filt)
  filt.connect(g)
  g.connect(ac.destination)
  src.start(t)
  src.stop(t + dur + 0.01)
}

// Rapid ignition crackling (パチパチパチパチ)
export function playIgnite(): void {
  withCtx((ac) => {
    for (let i = 0; i < 22; i++) {
      burst(
        ac,
        900 + Math.random() * 2600,
        0.01 + Math.random() * 0.03,
        0.14 + Math.random() * 0.24,
        i * 0.033 + Math.random() * 0.018,
      )
    }
  })
}

// Gentle fire crackling
export function playCrackle(): void {
  withCtx((ac) => {
    const pops: [number, number, number, number][] = [
      [700, 0.04, 0.28, 0],   [1400, 0.03, 0.20, 0.07],
      [900, 0.05, 0.30, 0.16], [1700, 0.02, 0.16, 0.23],
      [800, 0.04, 0.24, 0.32], [1200, 0.03, 0.18, 0.41],
      [600, 0.06, 0.20, 0.52], [1500, 0.025, 0.15, 0.62],
      [1000, 0.04, 0.22, 0.73],[650, 0.05, 0.19, 0.85],
    ]
    pops.forEach(([f, d, v, t]) => burst(ac, f, d, v, t))
  })
}

// Paper burning: crinkle → fire roar → settle
export function playBurn(): void {
  withCtx((ac) => {
    const crinkle: [number, number, number, number][] = [
      [3800, 0.04, 0.42, 0.00], [2900, 0.05, 0.36, 0.05],
      [4500, 0.03, 0.30, 0.09], [3300, 0.045, 0.38, 0.14],
      [2600, 0.055, 0.28, 0.20],[4100, 0.035, 0.22, 0.27],
      [3000, 0.04, 0.32, 0.34],
    ]
    crinkle.forEach(([f, d, v, t]) => burst(ac, f, d, v, t))

    const src = ac.createBufferSource()
    src.buffer = makeNoise(ac, 2.0)
    const filt = ac.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.setValueAtTime(300, ac.currentTime)
    filt.frequency.exponentialRampToValueAtTime(1100, ac.currentTime + 0.45)
    filt.frequency.exponentialRampToValueAtTime(500, ac.currentTime + 2.0)
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.40, ac.currentTime + 0.35)
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 2.0)
    src.connect(filt)
    filt.connect(g)
    g.connect(ac.destination)
    src.start(ac.currentTime)
    src.stop(ac.currentTime + 2.1)

    for (let i = 0; i < 20; i++) {
      burst(
        ac,
        600 + Math.random() * 1800,
        0.02 + Math.random() * 0.05,
        0.07 + Math.random() * 0.18,
        0.15 + Math.random() * 1.5,
      )
    }
  })
}

// Smooth "shuu" whoosh for envelope open
export function playOpen(): void {
  withCtx((ac) => {
    const now = ac.currentTime

    // 「シュ〜」: ホワイトノイズをバンドパスで成形し高域→中域へスイープ
    const src = ac.createBufferSource()
    src.buffer = makeNoise(ac, 0.55)

    const filt = ac.createBiquadFilter()
    filt.type = 'bandpass'
    filt.Q.value = 0.9
    filt.frequency.setValueAtTime(3800, now)
    filt.frequency.exponentialRampToValueAtTime(600, now + 0.38)

    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(0.28, now + 0.018)   // 素早く立ち上がる
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.50) // なめらかに消える

    src.connect(filt)
    filt.connect(g)
    g.connect(ac.destination)
    src.start(now)
    src.stop(now + 0.55)
  })
}

// ── アンビエント音（環境音ループ） ──

function scheduleCrackle(ac: AudioContext, master: GainNode, alive: { value: boolean }): void {
  if (!alive.value) return
  const freq = 480 + Math.random() * 1100
  const dur  = 0.012 + Math.random() * 0.042
  const vol  = 0.025 + Math.random() * 0.10
  const n = Math.ceil(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, n, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
  const s = ac.createBufferSource()
  s.buffer = buf
  const f = ac.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  f.Q.value = 1.4
  const g = ac.createGain()
  const t = ac.currentTime
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f)
  f.connect(g)
  g.connect(master)
  s.start(t)
  s.stop(t + dur + 0.01)
  setTimeout(() => scheduleCrackle(ac, master, alive), 90 + Math.random() * 650)
}

export function startAmbient(): () => void {
  const ac = getCtx()
  if (!ac) return () => {}

  const master = ac.createGain()
  master.gain.value = 1
  master.connect(ac.destination)
  _ambientMaster = master

  const alive = { value: true }
  scheduleCrackle(ac, master, alive)

  return () => {
    alive.value = false
    _ambientMaster = null
  }
}

export function setAmbientVolume(vol: number): void {
  if (_ambientMaster) {
    _ambientMaster.gain.setTargetAtTime(vol, _ambientMaster.context.currentTime, 0.4)
  }
}
