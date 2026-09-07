import { useEffect, useMemo, useState } from 'react';
import { PRESETS, describe, fitInside, fromHeight, fromWidth, px } from './calc';

type Tab = 'resize' | 'ratio' | 'fit';

function readState() {
  try {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('t');
    return {
      tab: (t === 'ratio' || t === 'fit' ? t : 'resize') as Tab,
      ra: p.get('ra') ?? '16',
      rb: p.get('rb') ?? '9',
      w: p.get('w') ?? '1920',
      h: p.get('h') ?? '',
      bw: p.get('bw') ?? '1280',
      bh: p.get('bh') ?? '720',
      rw: p.get('rw') ?? '3440',
      rh: p.get('rh') ?? '1440',
    };
  } catch {
    return { tab: 'resize' as Tab, ra: '16', rb: '9', w: '1920', h: '', bw: '1280', bh: '720', rw: '3440', rh: '1440' };
  }
}

export default function App() {
  const s = readState();
  const [tab, setTab] = useState<Tab>(s.tab);
  const [ra, setRa] = useState(s.ra);
  const [rb, setRb] = useState(s.rb);
  const [w, setW] = useState(s.w);
  const [h, setH] = useState(s.h);
  const [bw, setBw] = useState(s.bw);
  const [bh, setBh] = useState(s.bh);
  const [rw, setRw] = useState(s.rw);
  const [rh, setRh] = useState(s.rh);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const q = u.searchParams;
      q.set('t', tab);
      q.set('ra', ra); q.set('rb', rb); q.set('w', w); q.set('h', h);
      q.set('bw', bw); q.set('bh', bh); q.set('rw', rw); q.set('rh', rh);
      window.history.replaceState(null, '', u.toString());
    } catch {
      /* ignore */
    }
  }, [tab, ra, rb, w, h, bw, bh, rw, rh]);

  const N = (x: string) => (x.trim() === '' ? NaN : Number(x));

  const resize = useMemo(() => {
    const a = N(ra), b = N(rb), wv = N(w), hv = N(h);
    if (!(a > 0) || !(b > 0)) return null;
    if (wv > 0 && !(hv > 0)) return { w: wv, h: fromWidth(a, b, wv), driver: 'width' as const };
    if (hv > 0 && !(wv > 0)) return { w: fromHeight(a, b, hv), h: hv, driver: 'height' as const };
    if (wv > 0 && hv > 0) return { w: wv, h: fromWidth(a, b, wv), driver: 'width' as const, both: true };
    return null;
  }, [ra, rb, w, h]);

  const ratio = useMemo(() => {
    const wv = N(rw), hv = N(rh);
    if (!(wv > 0) || !(hv > 0)) return null;
    return describe(wv, hv);
  }, [rw, rh]);

  const fit = useMemo(() => {
    const wv = N(w), hv = N(h), BW = N(bw), BH = N(bh);
    // reuse resize's source if available; else use raw w/h
    const src = resize ?? (wv > 0 && hv > 0 ? { w: wv, h: hv } : null);
    if (!src || !(BW > 0) || !(BH > 0)) return null;
    return fitInside(src.w, src.h, BW, BH);
  }, [w, h, bw, bh, resize]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const Field = (label: string, value: string, set: (v: string) => void, ph = '') => (
    <label className="f">
      <span>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => set(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder={ph}
      />
    </label>
  );

  return (
    <div className="app">
      <header>
        <h1>Aspect Ratio Calculator</h1>
        <p className="tag">
          Resize dimensions to a ratio, find the ratio of a size, or fit a size inside a box — all
          without distortion. Common presets for video, photo, print and social.
        </p>
      </header>

      <div className="tabs">
        <button className={tab === 'resize' ? 'on' : ''} onClick={() => setTab('resize')}>Resize to a ratio</button>
        <button className={tab === 'ratio' ? 'on' : ''} onClick={() => setTab('ratio')}>What's the ratio?</button>
        <button className={tab === 'fit' ? 'on' : ''} onClick={() => setTab('fit')}>Fit inside a box</button>
      </div>

      {tab === 'resize' && (
        <div className="panel">
          <div className="ratiorow">
            <span>Ratio</span>
            {Field('', ra, setRa)}
            <b>:</b>
            {Field('', rb, setRb)}
          </div>
          <div className="presets">
            {PRESETS.map((p) => (
              <button key={p.label} className={Number(ra) === p.a && Number(rb) === p.b ? 'on' : ''} onClick={() => { setRa(String(p.a)); setRb(String(p.b)); }}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="two">
            {Field('Width (px)', w, (v) => { setW(v); if (v) setH(''); }, 'leave blank to solve')}
            {Field('Height (px)', h, (v) => { setH(v); if (v) setW(''); }, 'leave blank to solve')}
          </div>
          {resize && (
            <div className="answer">
              <strong>{px(Math.round(resize.w))} × {px(Math.round(resize.h))}</strong>
              <span>
                at {ra}:{rb}
                {resize.driver === 'width' ? ` — height from width` : ` — width from height`}
              </span>
              {resize.both && <p className="warn">Both filled — solved from the width. Clear one to switch.</p>}
            </div>
          )}
        </div>
      )}

      {tab === 'ratio' && (
        <div className="panel">
          <div className="two">
            {Field('Width (px)', rw, setRw)}
            {Field('Height (px)', rh, setRh)}
          </div>
          {ratio && (
            <div className="answer">
              <strong>{ratio.label}</strong>
              <span>{ratio.decimal.toFixed(4)} : 1</span>
              {ratio.name && <p className="named">{ratio.name}</p>}
            </div>
          )}
        </div>
      )}

      {tab === 'fit' && (
        <div className="panel">
          <div className="two">
            {Field('Source width', w, (v) => { setW(v); })}
            {Field('Source height', h, (v) => { setH(v); })}
          </div>
          <div className="two">
            {Field('Box width', bw, setBw)}
            {Field('Box height', bh, setBh)}
          </div>
          {fit && (
            <div className="answer">
              <strong>{px(Math.round(fit.w))} × {px(Math.round(fit.h))}</strong>
              <span>scaled to {(fit.scale * 100).toFixed(1)}% — fits inside {bw} × {bh}, no cropping</span>
            </div>
          )}
          {!fit && <p className="hint">Enter a source size and a box size.</p>}
        </div>
      )}

      <button className="share" onClick={share}>{copied ? 'Link copied' : 'Copy shareable link'}</button>

      <section className="explainer">
        <h2>What an aspect ratio is</h2>
        <p>
          An aspect ratio is the relationship between width and height, written as two numbers
          separated by a colon — <code>16:9</code> means 16 units wide for every 9 tall. It is
          independent of size: 1280×720, 1920×1080 and 3840×2160 are all 16:9. To keep an image or
          video from stretching, any resize has to preserve the ratio.
        </p>
        <h3>Resizing to a ratio</h3>
        <p>
          Fix the ratio, enter the width you want, and the height is width × (ratio height ÷ ratio
          width). For 16:9 at 2560 wide, the height is 2560 × 9 ÷ 16 = 1440. Enter the height instead
          and it solves the other way.
        </p>
        <h3>Finding the ratio of a size</h3>
        <p>
          Divide both numbers by their greatest common divisor. 1920 and 1080 share a factor of 120,
          so 1920:1080 simplifies to 16:9. The calculator also shows the decimal (16 ÷ 9 ≈ 1.778) and
          names the ratio if it matches a common one.
        </p>
        <h3>Common ratios</h3>
        <table>
          <tbody>
            <tr><td>16:9</td><td>HD/4K video, most monitors and TVs, YouTube</td></tr>
            <tr><td>9:16</td><td>Vertical video — TikTok, Reels, Stories</td></tr>
            <tr><td>1:1</td><td>Square — Instagram feed posts</td></tr>
            <tr><td>4:3</td><td>Older screens, many tablets, some cameras</td></tr>
            <tr><td>3:2</td><td>35 mm photos, most DSLR and mirrorless sensors</td></tr>
            <tr><td>21:9 (64:27)</td><td>Ultrawide monitors</td></tr>
            <tr><td>2.39:1</td><td>Anamorphic / cinemascope films</td></tr>
            <tr><td>≈1.414:1</td><td>A4, A3 and the rest of the ISO A paper series</td></tr>
          </tbody>
        </table>
        <h3>Fit vs fill</h3>
        <p>
          "Fit inside" scales a size down so the whole thing sits within a box, which may leave empty
          bars on two sides (letterbox or pillarbox). "Fill" would scale up until the box is covered
          and crop the overflow. This tool does fit — no cropping.
        </p>
        <h3>Is anything sent to a server?</h3>
        <p>No. It is all arithmetic in your browser; the numbers are only stored in the page link.</p>
        <footer>Aspect Ratio Calculator · resize, ratio &amp; fit · no sign-up</footer>
      </section>
    </div>
  );
}
