import { CSSProperties, ReactNode } from 'react'
import { ReviewTheme } from '../../types/instagramReview'

export type RetroDecorVariant = 'cover' | 'review' | 'summary' | 'track' | 'song'

interface RetroDesktopDecorProps {
  variant: RetroDecorVariant
  style: ReviewTheme
}

interface RetroWindowProps {
  title: string
  style: ReviewTheme
  children: ReactNode
  className?: string
  contentClassName?: string
}

interface RetroScoreBoxProps {
  score: number
  style: ReviewTheme
  label?: string
  compact?: boolean
}

type AssetType =
  | 'folder'
  | 'globe'
  | 'crt'
  | 'cassette'
  | 'trash'
  | 'magnifier'
  | 'file'
  | 'camera'
  | 'paint'
  | 'dialog'
  | 'cursor'
  | 'error'
  | 'jpg'
  | 'notepad'
  | 'phone'
  | 'browser'

interface AssetPlacement {
  type: AssetType
  className: string
  rotate?: number
  scale?: number
}

const placements: Record<RetroDecorVariant, AssetPlacement[]> = {
  cover: [
    { type: 'folder', className: 'left-[4.5%] top-[20%]', rotate: -7, scale: 1.08 },
    { type: 'globe', className: 'right-[5%] top-[18%]', rotate: 8 },
    { type: 'cursor', className: 'left-[7%] bottom-[8%]', rotate: -10, scale: 0.95 },
    { type: 'dialog', className: 'right-[5%] bottom-[7%]', rotate: 5, scale: 0.92 },
  ],
  review: [
    { type: 'notepad', className: 'right-[4%] top-[17%]', rotate: 5, scale: 0.96 },
    { type: 'paint', className: 'left-[4.5%] bottom-[7%]', rotate: -5, scale: 0.94 },
    { type: 'jpg', className: 'right-[7%] bottom-[8%]', rotate: 8, scale: 0.9 },
  ],
  summary: [
    { type: 'folder', className: 'right-[4.5%] top-[17%]', rotate: 7, scale: 0.95 },
    { type: 'magnifier', className: 'left-[5%] bottom-[8%]', rotate: -10, scale: 0.92 },
    { type: 'trash', className: 'right-[6%] bottom-[7%]', rotate: 4, scale: 0.88 },
  ],
  track: [
    { type: 'cassette', className: 'left-[5%] top-[18%]', rotate: -7 },
    { type: 'dialog', className: 'right-[5%] top-[22%]', rotate: 6 },
    { type: 'camera', className: 'right-[7%] bottom-[7%]', rotate: -5, scale: 0.88 },
  ],
  song: [
    { type: 'browser', className: 'left-[4%] top-[18%]', rotate: -4, scale: 0.92 },
    { type: 'phone', className: 'right-[6%] top-[18%]', rotate: 8, scale: 0.92 },
    { type: 'jpg', className: 'left-[6%] bottom-[7%]', rotate: -8, scale: 0.92 },
    { type: 'cursor', className: 'right-[7%] bottom-[6%]', rotate: 10, scale: 0.9 },
  ],
}

export function retroPanelStyle(style: ReviewTheme, background = style.cardColor): CSSProperties {
  return {
    backgroundColor: background,
    borderTop: `3px solid ${style.coverFrameColor}`,
    borderLeft: `3px solid ${style.coverFrameColor}`,
    borderRight: `3px solid ${style.textColor}`,
    borderBottom: `3px solid ${style.textColor}`,
    boxShadow: `10px 10px 0 ${style.textColor}28`,
  }
}

export function RetroDesktopDecor({ variant, style }: RetroDesktopDecorProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: `linear-gradient(${style.coverFrameColor}33 1px, transparent 1px), linear-gradient(90deg, ${style.coverFrameColor}33 1px, transparent 1px)`,
          backgroundSize: '54px 54px',
        }}
      />
      {placements[variant].map((asset, index) => (
        <div
          key={`${asset.type}-${index}`}
          className={`absolute ${asset.className}`}
          style={{
            transform: `rotate(${asset.rotate || 0}deg) scale(${asset.scale || 1})`,
            transformOrigin: 'center',
            filter: `drop-shadow(8px 8px 0 ${style.textColor}28)`,
          }}
        >
          <RetroAsset type={asset.type} style={style} />
        </div>
      ))}
    </div>
  )
}

export function RetroWindow({ title, style, children, className = '', contentClassName = '' }: RetroWindowProps) {
  return (
    <div className={`min-w-0 ${className}`} style={{ ...retroPanelStyle(style), borderRadius: 4 }}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-2"
        style={{
          backgroundColor: style.accentColor,
          color: style.coverFrameColor,
          borderBottom: `3px solid ${style.textColor}`,
        }}
      >
        <span className="truncate font-black uppercase tracking-[0.12em]" style={{ fontSize: '1.65cqw' }}>
          {title}
        </span>
        <span className="flex shrink-0 gap-1">
          <span className="grid h-5 w-5 place-items-center border-2 bg-white text-xs font-black" style={{ borderColor: style.textColor, color: style.textColor }}>
            _
          </span>
          <span className="grid h-5 w-5 place-items-center border-2 bg-white text-xs font-black" style={{ borderColor: style.textColor, color: style.textColor }}>
            x
          </span>
        </span>
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  )
}

export function RetroScoreBox({ score, style, label = 'score', compact = false }: RetroScoreBoxProps) {
  return (
    <div
      className="text-center"
      style={{
        ...retroPanelStyle(style, style.coverFrameColor),
        padding: compact ? '8%' : '10%',
        minWidth: compact ? '118px' : '170px',
      }}
    >
      <p className="font-black uppercase tracking-[0.18em]" style={{ color: style.accentColor, fontSize: compact ? '1.45cqw' : '1.7cqw' }}>
        {label}
      </p>
      <p className="font-black tabular-nums leading-[1.05]" style={{ color: style.textColor, fontSize: compact ? '5.2cqw' : '7.4cqw' }}>
        {score.toFixed(1)}
      </p>
      <div className="mt-[8%] h-3 border-2 bg-white" style={{ borderColor: style.textColor }}>
        <div className="h-full" style={{ width: `${Math.max(0, Math.min(10, score)) * 10}%`, backgroundColor: style.accentColor }} />
      </div>
    </div>
  )
}

function RetroAsset({ type, style }: { type: AssetType; style: ReviewTheme }) {
  switch (type) {
    case 'folder':
      return <FolderStack style={style} />
    case 'globe':
      return <GlobeIcon style={style} />
    case 'crt':
      return <CrtComputer style={style} />
    case 'cassette':
      return <CassetteStack style={style} />
    case 'trash':
      return <TrashCan style={style} />
    case 'magnifier':
      return <Magnifier style={style} />
    case 'file':
      return <FileIcon style={style} label="TXT" />
    case 'camera':
      return <CameraIcon style={style} />
    case 'paint':
      return <MiniWindow style={style} label="PAINT" />
    case 'dialog':
      return <DialogIcon style={style} />
    case 'cursor':
      return <CursorIcon style={style} />
    case 'error':
      return <ErrorWindow style={style} />
    case 'jpg':
      return <FileIcon style={style} label="JPG" />
    case 'notepad':
      return <Notepad style={style} />
    case 'phone':
      return <FlipPhone style={style} />
    case 'browser':
      return <BrowserIcon style={style} />
    default:
      return null
  }
}

function AssetShell({ style, children, width = 138, height = 118 }: { style: ReviewTheme; children: ReactNode; width?: number; height?: number }) {
  return (
    <div
      className="relative"
      style={{
        width,
        height,
        color: style.textColor,
      }}
    >
      {children}
    </div>
  )
}

function FolderStack({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={150} height={118}>
      <div className="absolute left-5 top-7 h-20 w-28 border-[3px]" style={{ backgroundColor: '#ffd45c', borderColor: style.textColor }} />
      <div className="absolute left-2 top-4 h-20 w-30 border-[3px]" style={{ width: 120, backgroundColor: '#ffe887', borderColor: style.textColor }} />
      <div className="absolute left-2 top-0 h-8 w-16 border-[3px]" style={{ backgroundColor: '#ffe887', borderColor: style.textColor }} />
      <div className="absolute left-7 top-10 h-2 w-20 bg-white opacity-50" />
    </AssetShell>
  )
}

function GlobeIcon({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={124} height={124}>
      <div className="absolute inset-2 rounded-full border-[4px]" style={{ backgroundColor: '#62d6ff', borderColor: style.textColor }}>
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-white/70" />
        <div className="absolute left-2 top-1/2 h-1 w-[82%] -translate-y-1/2 bg-white/70" />
        <div className="absolute left-[18%] top-[22%] h-8 w-14 rounded-full bg-emerald-300" />
        <div className="absolute bottom-[18%] right-[18%] h-7 w-10 rounded-full bg-lime-300" />
      </div>
    </AssetShell>
  )
}

function CrtComputer({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={150} height={130}>
      <div className="absolute left-3 top-2 h-20 w-32 border-[4px]" style={{ ...retroPanelStyle(style, '#d8e1ff'), boxShadow: 'none' }}>
        <div className="m-3 h-11 border-[3px]" style={{ backgroundColor: '#78f6d1', borderColor: style.textColor }} />
      </div>
      <div className="absolute left-14 top-24 h-5 w-12 border-[3px]" style={{ backgroundColor: style.coverFrameColor, borderColor: style.textColor }} />
      <div className="absolute left-8 top-[108px] h-4 w-24 border-[3px]" style={{ backgroundColor: '#cbd5e1', borderColor: style.textColor }} />
    </AssetShell>
  )
}

function CassetteStack({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={148} height={116}>
      <div className="absolute left-4 top-7 h-16 w-30 border-[3px]" style={{ width: 120, backgroundColor: '#ff9ad5', borderColor: style.textColor }} />
      <div className="absolute left-0 top-2 h-16 w-30 border-[3px]" style={{ width: 120, backgroundColor: '#fef3c7', borderColor: style.textColor }}>
        <div className="absolute left-4 top-5 h-7 w-7 rounded-full border-[3px] bg-white" style={{ borderColor: style.textColor }} />
        <div className="absolute right-4 top-5 h-7 w-7 rounded-full border-[3px] bg-white" style={{ borderColor: style.textColor }} />
        <div className="absolute left-11 top-7 h-3 w-8 bg-slate-800" />
      </div>
    </AssetShell>
  )
}

function TrashCan({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={104} height={126}>
      <div className="absolute left-4 top-8 h-20 w-16 border-[3px]" style={{ backgroundColor: '#dbeafe', borderColor: style.textColor }} />
      <div className="absolute left-2 top-5 h-4 w-20 border-[3px]" style={{ backgroundColor: style.coverFrameColor, borderColor: style.textColor }} />
      <div className="absolute left-8 top-1 h-4 w-8 border-[3px]" style={{ backgroundColor: style.coverFrameColor, borderColor: style.textColor }} />
      <div className="absolute left-8 top-14 h-12 w-1 bg-slate-500" />
      <div className="absolute left-12 top-14 h-12 w-1 bg-slate-500" />
      <div className="absolute left-16 top-14 h-12 w-1 bg-slate-500" />
    </AssetShell>
  )
}

function Magnifier({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={126} height={126}>
      <div className="absolute left-4 top-4 h-16 w-16 rounded-full border-[5px]" style={{ backgroundColor: '#dff7ff', borderColor: style.textColor }} />
      <div className="absolute left-[70px] top-[72px] h-10 w-5 rotate-[-45deg] border-[3px]" style={{ backgroundColor: style.accentColor, borderColor: style.textColor }} />
    </AssetShell>
  )
}

function FileIcon({ style, label }: { style: ReviewTheme; label: string }) {
  return (
    <AssetShell style={style} width={112} height={132}>
      <div className="absolute left-3 top-2 h-28 w-20 border-[3px]" style={{ backgroundColor: style.coverFrameColor, borderColor: style.textColor }}>
        <div className="absolute right-[-3px] top-[-3px] h-7 w-7 border-b-[3px] border-l-[3px]" style={{ backgroundColor: '#c7f9ff', borderColor: style.textColor }} />
        <div className="absolute bottom-5 left-2 right-2 border-[3px] px-1 text-center text-sm font-black" style={{ backgroundColor: style.accentColor, borderColor: style.textColor, color: style.coverFrameColor }}>
          {label}
        </div>
      </div>
    </AssetShell>
  )
}

function CameraIcon({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={136} height={104}>
      <div className="absolute left-2 top-8 h-16 w-28 border-[3px]" style={{ backgroundColor: '#d8b4fe', borderColor: style.textColor }}>
        <div className="absolute left-10 top-3 h-9 w-9 rounded-full border-[4px] bg-white" style={{ borderColor: style.textColor }} />
        <div className="absolute right-3 top-3 h-4 w-4 bg-white" />
      </div>
      <div className="absolute left-8 top-4 h-6 w-14 border-[3px]" style={{ backgroundColor: '#f9a8d4', borderColor: style.textColor }} />
    </AssetShell>
  )
}

function MiniWindow({ style, label }: { style: ReviewTheme; label: string }) {
  return (
    <AssetShell style={style} width={156} height={112}>
      <div className="absolute inset-0 border-[3px]" style={{ backgroundColor: style.cardColor, borderColor: style.textColor }}>
        <div className="h-7 border-b-[3px] px-2 text-xs font-black leading-6" style={{ backgroundColor: style.accentColor, borderColor: style.textColor, color: style.coverFrameColor }}>
          {label}
        </div>
        <div className="m-3 grid grid-cols-4 gap-1">
          {['#ef4444', '#facc15', '#22c55e', '#38bdf8', '#a78bfa', '#fb7185', '#f97316', '#111827'].map((color) => (
            <span key={color} className="h-4 border-2" style={{ backgroundColor: color, borderColor: style.textColor }} />
          ))}
        </div>
      </div>
    </AssetShell>
  )
}

function DialogIcon({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={172} height={116}>
      <div className="absolute inset-0 border-[3px]" style={{ backgroundColor: style.coverFrameColor, borderColor: style.textColor }}>
        <div className="h-7 border-b-[3px]" style={{ backgroundColor: '#2563eb', borderColor: style.textColor }} />
        <div className="px-4 py-3 text-sm font-black">rate.exe</div>
        <div className="mx-auto mt-1 w-20 border-[3px] bg-white py-1 text-center text-xs font-black" style={{ borderColor: style.textColor }}>
          OK
        </div>
      </div>
    </AssetShell>
  )
}

function CursorIcon({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={96} height={118}>
      <div
        className="absolute left-2 top-1 h-24 w-16 border-[3px]"
        style={{
          backgroundColor: style.coverFrameColor,
          borderColor: style.textColor,
          clipPath: 'polygon(0 0, 0 92%, 28% 68%, 42% 100%, 61% 91%, 47% 61%, 82% 61%)',
        }}
      />
    </AssetShell>
  )
}

function ErrorWindow({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={172} height={112}>
      <div className="absolute inset-0 border-[3px]" style={{ backgroundColor: '#fee2e2', borderColor: style.textColor }}>
        <div className="h-7 border-b-[3px]" style={{ backgroundColor: '#dc2626', borderColor: style.textColor }} />
        <div className="px-4 py-3 text-xs font-black">low skip energy</div>
        <div className="mx-auto w-20 border-[3px] bg-white py-1 text-center text-xs font-black" style={{ borderColor: style.textColor }}>
          FIX
        </div>
      </div>
    </AssetShell>
  )
}

function Notepad({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={134} height={148}>
      <div className="absolute inset-0 border-[3px]" style={{ backgroundColor: '#fffde7', borderColor: style.textColor }}>
        <div className="h-7 border-b-[3px] px-2 text-xs font-black leading-6" style={{ backgroundColor: '#e5e7eb', borderColor: style.textColor }}>
          NOTE.TXT
        </div>
        {[0, 1, 2, 3].map((line) => (
          <div key={line} className="mx-4 mt-4 h-1 bg-sky-400" style={{ width: `${70 - line * 7}%` }} />
        ))}
      </div>
    </AssetShell>
  )
}

function FlipPhone({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={94} height={154}>
      <div className="absolute left-5 top-1 h-16 w-12 rounded-t-xl border-[3px]" style={{ backgroundColor: '#a7f3d0', borderColor: style.textColor }} />
      <div className="absolute left-3 top-[66px] h-20 w-16 rounded-b-xl border-[3px]" style={{ backgroundColor: '#f0abfc', borderColor: style.textColor }}>
        <div className="mx-auto mt-4 h-6 w-6 rounded-full border-[3px] bg-white" style={{ borderColor: style.textColor }} />
      </div>
    </AssetShell>
  )
}

function BrowserIcon({ style }: { style: ReviewTheme }) {
  return (
    <AssetShell style={style} width={174} height={122}>
      <div className="absolute inset-0 border-[3px]" style={{ backgroundColor: '#e0f2fe', borderColor: style.textColor }}>
        <div className="flex h-8 items-center gap-1 border-b-[3px] px-2" style={{ backgroundColor: '#c7d2fe', borderColor: style.textColor }}>
          <span className="h-3 w-3 rounded-full border-2 bg-red-300" style={{ borderColor: style.textColor }} />
          <span className="h-3 w-3 rounded-full border-2 bg-yellow-300" style={{ borderColor: style.textColor }} />
          <span className="h-3 w-3 rounded-full border-2 bg-green-300" style={{ borderColor: style.textColor }} />
        </div>
        <div className="mx-3 mt-3 border-[3px] bg-white px-2 py-1 text-xs font-black" style={{ borderColor: style.textColor }}>
          wavee://review
        </div>
      </div>
    </AssetShell>
  )
}
