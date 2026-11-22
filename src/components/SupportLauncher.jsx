import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Headset, X } from 'lucide-react';
import './support-launcher.css';

const channels = [
  {
    id: 'telegram',
    label: 'Telegram support group',
    detail: 'Telegram',
    url: 'https://t.me/+q43QONRtkrg5NGFk',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp support at +91 7654352441',
    detail: '+91 7654352441',
    url: 'https://wa.me/917654352441',
  },
  {
    id: 'instagram',
    label: 'Instagram @babiesiq.tech',
    detail: '@babiesiq.tech',
    url: 'https://www.instagram.com/babiesiq.tech/',
  },
];

function ChannelIcon({ channel }) {
  if (channel === 'telegram') {
    return <svg viewBox="0 0 24 24" role="img" aria-hidden="true" fill="currentColor">
      <path d="M21.94 4.66c.3-1.34-.48-1.87-1.76-1.4L2.7 10.04c-1.19.47-1.17 1.13-.22 1.42l4.48 1.4 1.7 5.26c.21.58.1.81.72.81.49 0 .71-.23.99-.5l2.17-2.1 4.5 3.34c.83.46 1.43.22 1.64-.76l3.26-14.25ZM8.14 12.57l9.65-6.08c.48-.29.92-.13.56.2L10.08 14.1l-.32 3.55-1.62-5.08Z"/>
    </svg>;
  }
  if (channel === 'whatsapp') {
    return <svg viewBox="0 0 24 24" role="img" aria-hidden="true" fill="currentColor">
      <path d="M12.01 2a9.92 9.92 0 0 0-8.56 14.97 9.96 9.96 0 0 0-1.16 8.54L1 23l4.55-1.2A9.97 9.97 0 1 0 12.01 2Zm0 18.12a8.15 8.15 0 0 1-4.16-1.14l-.3-.17-2.7.71.72-2.62-.2-.32a8.16 8.16 0 1 1 6.64 3.54Zm4.49-6.11c-.25-.12-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.12-.17.25-.65.81-.8.98-.15.17-.29.19-.54.07-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5l.38-.44c.13-.15.17-.25.26-.42.08-.17.04-.32-.02-.44-.06-.12-.57-1.37-.78-1.87-.2-.48-.4-.41-.56-.42h-.49c-.17 0-.45.06-.69.32-.23.25-.9.88-.9 2.16 0 1.27.93 2.5 1.06 2.24.12.16 1.84 2.81 4.47 3.94.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.08 1.48-.61 1.68-1.2.21-.59.21-1.09.15-1.2-.06-.1-.22-.16-.46-.28Z"/>
    </svg>;
  }
  return <svg viewBox="0 0 24 24" role="img" aria-hidden="true" fill="currentColor">
    <path d="M7.3 2.5h9.4a4.8 4.8 0 0 1 4.8 4.8v9.4a4.8 4.8 0 0 1-4.8 4.8H7.3a4.8 4.8 0 0 1-4.8-4.8V7.3a4.8 4.8 0 0 1 4.8-4.8Zm0 1.9a2.9 2.9 0 0 0-2.9 2.9v9.4a2.9 2.9 0 0 0 2.9 2.9h9.4a2.9 2.9 0 0 0 2.9-2.9V7.3a2.9 2.9 0 0 0-2.9-2.9H7.3Zm4.7 3.1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.9a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm4.8-3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/>
  </svg>;
}


const PLACEMENT_KEY = 'babiesiq-support-position-v2';
const DEFAULT_PLACEMENT = { x: 1, y: 0.69 };
const EDGE_GAP = 12;
const DRAG_THRESHOLD = 7;

function getViewport() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    size: width <= 420 ? 64 : width >= 768 ? 74 : 70,
  };
}

function clamp(value, low, high) {
  return Math.min(Math.max(value, low), Math.max(low, high));
}

function getLimits(viewport) {
  return {
    minX: EDGE_GAP,
    maxX: Math.max(EDGE_GAP, viewport.width - viewport.size - EDGE_GAP),
    minY: EDGE_GAP,
    // Keep the small "Support" caption visible at the bottom of the viewport.
    maxY: Math.max(EDGE_GAP, viewport.height - viewport.size - 40),
  };
}

function fromNormalized(placement, viewport) {
  const limits = getLimits(viewport);
  return {
    x: limits.minX + clamp(placement.x, 0, 1) * (limits.maxX - limits.minX),
    y: limits.minY + clamp(placement.y, 0, 1) * (limits.maxY - limits.minY),
  };
}

function toNormalized(position, viewport) {
  const limits = getLimits(viewport);
  return {
    x: clamp((position.x - limits.minX) / (limits.maxX - limits.minX || 1), 0, 1),
    y: clamp((position.y - limits.minY) / (limits.maxY - limits.minY || 1), 0, 1),
  };
}

function clampPosition(position, viewport) {
  const limits = getLimits(viewport);
  return {
    x: clamp(position.x, limits.minX, limits.maxX),
    y: clamp(position.y, limits.minY, limits.maxY),
  };
}

function loadPlacement() {
  try {
    const data = JSON.parse(window.localStorage.getItem(PLACEMENT_KEY) || 'null');
    if (data && Number.isFinite(data.x) && Number.isFinite(data.y) &&
        data.x >= 0 && data.x <= 1 && data.y >= 0 && data.y <= 1) {
      return data;
    }
  } catch {
    // Blocked storage should never hide the support button.
  }
  return DEFAULT_PLACEMENT;
}

function savePlacement(position, viewport) {
  try {
    window.localStorage.setItem(PLACEMENT_KEY, JSON.stringify(toNormalized(position, viewport)));
  } catch {
    // Dragging still works with storage disabled.
  }
}

function bubbleOffsets(position, viewport) {
  const { size, width, height } = viewport;
  const centerX = position.x + size / 2;
  const centerY = position.y + size / 2;
  const bubbleSize = width <= 420 ? 50 : 54;
  const halfBubble = bubbleSize / 2;
  const dirX = centerX < width / 2 ? 1 : -1;
  const dirY = centerY < height / 2 ? 1 : -1;
  const roomX = dirX > 0
    ? width - EDGE_GAP - centerX - halfBubble
    : centerX - halfBubble - EDGE_GAP;
  const roomY = dirY > 0
    ? height - EDGE_GAP - centerY - halfBubble
    : centerY - halfBubble - EDGE_GAP;
  const horizontal = clamp(122, 0, roomX);
  const vertical = clamp(122, 0, roomY);
  const diagonalX = Math.min(91, horizontal);
  const diagonalY = Math.min(90, vertical);
  // Telegram: diagonal; WhatsApp: vertical; Instagram: horizontal.
  return [
    [dirX * diagonalX, dirY * diagonalY],
    [0, dirY * vertical],
    [dirX * horizontal, 0],
  ];
}

export default function SupportLauncher() {
  const { pathname } = useLocation();
  const rootRef = useRef(null);
  const gestureRef = useRef(null);
  const ignoreClickRef = useRef(false);
  const viewportRef = useRef(getViewport());
  const [position, setPosition] = useState(() => fromNormalized(loadPlacement(), getViewport()));
  const positionRef = useRef(position);
  const [viewport, setViewport] = useState(viewportRef.current);
  const [open, setOpen] = useState(false);

  // Stay on the same proportional spot after orientation changes or a resize.
  useEffect(() => {
    const onResize = () => {
      const current = getViewport();
      const normalized = toNormalized(positionRef.current, viewportRef.current);
      const next = fromNormalized(normalized, current);
      viewportRef.current = current;
      positionRef.current = next;
      setViewport(current);
      setPosition(next);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector('.iq-support-trigger')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const onPointerDown = (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    ignoreClickRef.current = false;
    gestureRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      original: { ...positionRef.current },
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!gesture.moved) {
      gesture.moved = true;
      setOpen(false);
    }
    const next = clampPosition({
      x: gesture.original.x + dx,
      y: gesture.original.y + dy,
    }, viewportRef.current);
    positionRef.current = next;
    setPosition(next);
    ignoreClickRef.current = true;
    event.preventDefault();
  };

  const finishPointer = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.id) return;
    gestureRef.current = null;
    if (gesture.moved) savePlacement(positionRef.current, viewportRef.current);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onTriggerClick = (event) => {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      event.preventDefault();
      return;
    }
    setOpen((value) => !value);
  };

  const onTriggerKeyDown = (event) => {
    if (!event.altKey || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 16;
    const next = clampPosition({
      x: positionRef.current.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
      y: positionRef.current.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
    }, viewportRef.current);
    positionRef.current = next;
    setPosition(next);
    setOpen(false);
    savePlacement(next, viewportRef.current);
  };

  const offsets = bubbleOffsets(position, viewport);

  return <aside
    ref={rootRef}
    className={'iq-support-dock' + (open ? ' is-open' : '')}
    aria-label="BabiesIQ Cloud support"
    style={{ left: position.x + 'px', top: position.y + 'px' }}
  >
    <div id="iq-support-channels" className="iq-support-channels" aria-hidden={!open}>
      {channels.map((channel, index) => <a
        key={channel.id}
        className={'iq-support-bubble iq-support-bubble--' + channel.id}
        href={channel.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          '--tx': offsets[index][0] + 'px',
          '--ty': offsets[index][1] + 'px',
        }}
        aria-label={channel.label}
        title={channel.label}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      >
        <ChannelIcon channel={channel.id}/>
        <span className="iq-support-tip" aria-hidden="true">{channel.detail}</span>
      </a>)}
    </div>
    <button
      type="button"
      className="iq-support-trigger"
      aria-label={open ? 'Close support options. Drag to move.' : 'Open support options. Drag to move.'}
      aria-expanded={open}
      aria-controls="iq-support-channels"
      title={open ? 'Close support' : 'Drag to move · Tap to contact support'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onLostPointerCapture={finishPointer}
      onClick={onTriggerClick}
      onKeyDown={onTriggerKeyDown}
    >
      <span className="iq-support-trigger-shine" aria-hidden="true" />
      {open ? <X size={31} strokeWidth={2.4} aria-hidden="true" /> : <Headset size={35} strokeWidth={2.2} aria-hidden="true" />}
      <span className="iq-support-live-dot" aria-hidden="true"/>
    </button>
    <span className="iq-support-caption" aria-hidden="true">{open ? 'Close' : 'Support'}</span>
  </aside>;
}
