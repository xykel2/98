import React, { useState, useEffect, useRef, useCallback } from 'react';
import '98.css';

// Scroll-triggered phrases that appear as the user scrolls down
const SCROLL_PHRASES = [
  { text: "While this website works as a continually evolving digital archive of my work and thoughts", threshold: 0.08 },
  { text: "there are so many more impermanent and embodied experiences", threshold: 0.18 },
  { text: "of intersubjective becoming that slip away from documentation", threshold: 0.30 },
  { text: "(I am learning to notice all of that, always stirring seeping through me)", threshold: 0.52 },
  { text: "So let's find each other in real life", threshold: 0.59 },
  { text: "dancing, singing, sensing", threshold: 0.70 },
  { text: "remembering, daydreaming, and living", threshold: 0.82 },
  { text: ".", threshold: 0.96 },
  { text: ".", threshold: 0.97 },
  { text: ".", threshold: 0.98 },
  { text: "- In Girum Imus Nocte et Consumimur Igni -", threshold: 0.99 },
];

const BACKGROUND = '/backgrounds/bg4.png';

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showSoundPopup, setShowSoundPopup] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visiblePhrases, setVisiblePhrases] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoCount = 13;
  const [zIndices, setZIndices] = useState({
    about: 1,
    gallery: 2,
    sound: 3,
    video: 4,
    projects: 5,
  });
  const [topZIndex, setTopZIndex] = useState(5);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  // Get initial window size based on screen size
  const getInitialWindowSize = () => {
    const isMobile = window.innerWidth <= 768;
    return {
      width: isMobile ? window.innerWidth * 0.95 : 500,
      height: isMobile ? window.innerHeight * 0.85 : 600,
    };
  };

  // Window positions and sizes
  const [windowStates, setWindowStates] = useState({
    about: { x: 0, y: 0, ...getInitialWindowSize() },
    gallery: { x: 0, y: 0, ...getInitialWindowSize() },
    sound: { x: 0, y: 0, ...getInitialWindowSize() },
    video: { x: 0, y: 0, ...getInitialWindowSize() },
    projects: { x: 0, y: 0, ...getInitialWindowSize() },
  });

  const [dragging, setDragging] = useState({ active: false, window: null, offsetX: 0, offsetY: 0 });
  const [resizing, setResizing] = useState({ active: false, window: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = getInitialWindowSize();
      setWindowStates(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          updated[key] = {
            ...prev[key],
            width: Math.min(prev[key].width, newSize.width),
            height: Math.min(prev[key].height, newSize.height),
          };
        });
        return updated;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bringToFront = (key) => {
    const newTop = topZIndex + 1;
    setZIndices(prev => ({ ...prev, [key]: newTop }));
    setTopZIndex(newTop);
  };

  // Dragging handlers
  const handleMouseDown = (e, windowKey) => {
    // Disable dragging on mobile
    if (window.innerWidth <= 768) return;
    
    if (e.target.closest('.title-bar') && !e.target.closest('.title-bar-controls')) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragging({
        active: true,
        window: windowKey,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      });
      bringToFront(windowKey);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (dragging.active) {
      setWindowStates(prev => ({
        ...prev,
        [dragging.window]: {
          ...prev[dragging.window],
          x: e.clientX - dragging.offsetX,
          y: e.clientY - dragging.offsetY,
        }
      }));
    }

    if (resizing.active) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      
      setWindowStates(prev => ({
        ...prev,
        [resizing.window]: {
          ...prev[resizing.window],
          width: Math.max(300, resizing.startWidth + deltaX),
          height: Math.max(200, resizing.startHeight + deltaY),
        }
      }));
    }
  }, [dragging, resizing]);

  const handleMouseUp = useCallback(() => {
    setDragging({ active: false, window: null, offsetX: 0, offsetY: 0 });
    setResizing({ active: false, window: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  }, []);

  // Resize handlers
  const handleResizeStart = (e, windowKey) => {
    // Disable resizing on mobile
    if (window.innerWidth <= 768) return;
    
    e.stopPropagation();
    setResizing({
      active: true,
      window: windowKey,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: windowStates[windowKey].width,
      startHeight: windowStates[windowKey].height,
    });
    bringToFront(windowKey);
  };

  useEffect(() => {
    if (dragging.active || resizing.active) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging.active, resizing.active, handleMouseMove, handleMouseUp]);

  // Track scroll progress and reveal phrases
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);

      const nowVisible = SCROLL_PHRASES
        .filter(p => progress >= p.threshold)
        .map(p => p.text);
      setVisiblePhrases(nowVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interpolate CSS filters based on scroll: normal → dark, desaturated, slightly blurred
  const p = scrollProgress;
  const brightness = 1 - p * 0.55;       // 1.0 → 0.45
  const saturate   = 1 - p * 0.85;       // 1.0 → 0.15  (near grayscale)
  const blur       = p * 4;              // 0px → 4px
  const contrast   = 1 + p * 0.25;      // 1.0 → 1.25 (slightly punchier as it darkens)
  const bgFilter   = `brightness(${brightness.toFixed(3)}) saturate(${saturate.toFixed(3)}) contrast(${contrast.toFixed(3)}) blur(${blur.toFixed(2)}px)`;

  useEffect(() => {
    if (audioRef.current) return;

    const audio = new Audio('/audio/bg-mus.wav');
    audio.loop = true;
    audio.volume = 0.5;

    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().catch(e => {
        console.log("Still blocked:", e);
      });
      window.removeEventListener('click', tryPlay);
    };

    audio.play().catch(() => {
      window.addEventListener('click', tryPlay);
    });

    return () => {
      window.removeEventListener('click', tryPlay);
      audio.pause();
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    function formatTime(date) {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    }

    setCurrentTime(formatTime(new Date()));

    const intervalId = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const icons = [
    {
      icon: '/icons/time.gif',
      label: 'Images',
      onClick: () => {
        setShowPhotoGallery(true);
        setCurrentPhotoIndex(0);
        bringToFront('gallery');
      }
    },
    {
      icon: '/icons/sounds.gif',
      label: 'Sounds',
      onClick: () => {
        setShowSoundPopup(true);
        bringToFront('sound');
      }
    },
    {
      icon: '/icons/video.gif',
      label: 'Videos',
      onClick: () => {
        setShowVideoPopup(true);
        bringToFront('video');
      }
    },
    {
      icon: '/icons/resume.png',
      label: 'Projects',
      onClick: () => {
        setShowProjectPopup(true);
        bringToFront('projects');
      }
    },
    {
      icon: '/icons/folder.gif',
      label: 'Musings',
      link: 'https://dg-git-main-kels-projects-1630813e.vercel.app/',
    },
    {
      icon: '/icons/web.gif',
      label: 'aelrsty',
      link: 'https://femishonuga.com/webring.html',
    },
    {
      icon: '/icons/info.png',
      label: 'About',
      onClick: () => {
        setShowAbout(true);
        bringToFront('about');
      }
    },
  ];

  const renderWindow = (windowKey, title, content, isVisible, onClose) => {
    if (!isVisible) return null;

    const state = windowStates[windowKey];
    const isMobile = window.innerWidth <= 768;

    return (
      <div
        className="window"
        onMouseDown={(e) => {
          if (!e.target.closest('.title-bar-controls')) {
            bringToFront(windowKey);
          }
        }}
        style={{
          zIndex: zIndices[windowKey],
          width: `${state.width}px`,
          height: `${state.height}px`,
          position: 'fixed',
          top: state.y === 0 ? (isMobile ? '2.5%' : '50%') : `${state.y}px`,
          left: state.x === 0 ? '50%' : `${state.x}px`,
          transform: state.x === 0 && state.y === 0 ? (isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)') : 'none',
          overflow: 'hidden',
          boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
          backgroundColor: 'gainsboro',
          display: 'flex',
          flexDirection: 'column',
          cursor: dragging.active && dragging.window === windowKey ? 'grabbing' : 'default',
        }}
      >
        <div 
          className="title-bar" 
          style={{ cursor: isMobile ? 'default' : 'grab' }}
          onMouseDown={(e) => handleMouseDown(e, windowKey)}
        >
          <div className="title-bar-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {title}
          </div>
          <div className="title-bar-controls">
            <button onClick={onClose} aria-label="Close" />
          </div>
        </div>
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          fontFamily: 'Courier', 
          padding: '1rem', 
          fontSize: '16px', 
          lineHeight: '1.5' 
        }}>
          {content}
        </div>
        {/* Resize handle - hidden on mobile */}
        {!isMobile && (
          <div
            onMouseDown={(e) => handleResizeStart(e, windowKey)}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '20px',
              height: '20px',
              cursor: 'nwse-resize',
              background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #808080 50%, #808080 100%)',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '400vh',
        padding: '2rem',
        position: 'relative',
        backgroundColor: 'black',
      }}
    >
      {/* Fixed background layer with scroll-driven filter — oversized to prevent blur edge clipping */}
      <div style={{
        position: 'fixed',
        inset: '-20px',
        backgroundImage: `url('${BACKGROUND}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: bgFilter,
        zIndex: 0,
        willChange: 'filter',
      }} />
      {/* Floating scroll phrases */}
      <div style={{ position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', pointerEvents: 'none' }}>
        {SCROLL_PHRASES.map((phrase, i) => (
          <div
            key={phrase.text}
            style={{
              fontFamily: 'Courier New, monospace',
              fontSize: '13px',
              color: 'white',
              textShadow: '0 0 8px rgba(0,0,0,0.9), 1px 1px 0 black',
              opacity: visiblePhrases.includes(phrase.text) ? 1 : 0,
              transform: visiblePhrases.includes(phrase.text) ? 'translateX(0)' : 'translateX(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
              transitionDelay: `${i * 0.05}s`,
              letterSpacing: '0.05em',
            }}
          >
           {phrase.text}
          </div>
        ))}
      </div>

      {/* Scroll hint at bottom of viewport */}
      {scrollProgress < 0.05 && (
        <div style={{
          position: 'fixed',
          bottom: '3.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9998,
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          color: 'white',
          textShadow: '1px 1px 0 black',
          animation: 'fadeUpDown 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}>
          ↓ scroll ↓
        </div>
      )}

      <style>{`
        @keyframes fadeUpDown {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) translateY(-6px); }
        }
      `}</style>
      <div
        className="window"
        style={{
          marginBottom: '1rem',
          padding: '0.3rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          fontSize: '18px',
          userSelect: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <div>Xinyu Kelly Yan's Desktop</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{currentTime}</div>
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
            style={{
              marginLeft: '1rem',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              userSelect: 'none',
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div style={{ height: '2.5rem' }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.5rem',
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {icons.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              textAlign: 'center', 
              cursor: item.onClick ? 'pointer' : 'default',
              padding: '0.5rem',
              backgroundColor: hoveredIcon === idx ? 'rgba(0, 0, 255, 0.3)' : 'transparent',
              border: hoveredIcon === idx ? '1px dotted white' : '1px solid transparent',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={() => setHoveredIcon(idx)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={item.icon} alt={item.label} style={{ width: '96px', height: '96px' }} />
                <div style={{ fontFamily: 'Courier', fontSize: '14px', color: 'white', textDecoration: 'underline', marginTop: '0.2rem' }}>{item.label}</div>
              </a>
            ) : (
              <div onClick={item.onClick}>
                <img src={item.icon} alt={item.label} style={{ width: '96px', height: '96px' }} />
                <div style={{ fontFamily: 'Courier', fontSize: '14px', color: 'white', textDecoration: 'underline', marginTop: '0.2rem' }}>{item.label}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 10000 }}>
        {renderWindow(
          'about',
          'About me',
          <>
            <p>Xinyu Kelly Yan is studying urban planning at GSAPP with a BA in anthropology and urban studies from Brown.</p>
            <p>She has been roaming the streets, roofs, and ruins of cities while looking for Shanghai elsewhere since 2001.</p>
            <p>Currently falling in love with the world and nurturing her <a href="https://www.are.na/kelly-xinyu-yan/channels" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">fascinations</a> in all things place-based, audiovisual, and embodied.</p>
            <img
              src="/me.jpg"
              alt="Xinyu Kelly Yan"
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                display: 'block',
                margin: '0 auto 1rem auto',
                border: '2px solid black'
              }}
            />              

          </>,
          showAbout,
          () => setShowAbout(false)
        )}

        {renderWindow(
          'gallery',
          'Photo Gallery',
          <>
            <div style={{ textAlign: 'center' }}>
              <img
                src={`/photos/${currentPhotoIndex + 1}.jpg`}
                alt={`Gallery ${currentPhotoIndex + 1}`}
                style={{ maxWidth: '100%', maxHeight: '400px', border: '2px solid black' }}
              />
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? photoCount - 1 : prev - 1))}>
                  ← Prev
                </button>
                <button onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % photoCount)} style={{ marginLeft: '1rem' }}>
                  Next →
                </button>
              </div>
              <div style={{ marginTop: '0.5rem', fontFamily: 'Courier', fontSize: '14px', color: '#555' }}>
                Photo {currentPhotoIndex + 1} of {photoCount}
              </div>
            </div>
          </>,
          showPhotoGallery,
          () => setShowPhotoGallery(false)
        )}

        {renderWindow(
          'sound',
          'Sounds',
          <>
            <img
              src="/serge.png"
              alt="Serge at RISD"
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                display: 'block',
                margin: '0 auto 1rem auto',
                border: '2px solid black'
              }}
            />
            <p>
              I work with digital and analog synthesizers, field recordings, voice, and any objects my friends lend me.
            </p>
            <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
              <li>
                🎵 
                <a href="https://xykels.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
                  Listen on Bandcamp
                </a>
              </li>
              <li>
                🎤 
                <a href="https://kellyyan.notion.site/SOUNDS-b03b3ea597ed4bf6832160c230ec5942?source=copy_link" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
                  Watch performance documentation
                </a>
              </li>
            </ul>
            <p>Some Sunday nights 11pm-midnight EST you can catch me on the airwaves of 
              New York City playing sounds from Eastern Europe, East and Central Asia. 
              Tune in at <a href="https://wkcr.org" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
              WKCR 89.9FM</a>
            </p>
            <p> Some collaborative work include a harsh noise and dark ambient project with bekki <a href="https://onehourcleaner.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
              One Hour Cleaner</a> and this awesome mixtape of Providence experimental music <a href="https://alter-diy.bandcamp.com/album/altercomp-ii-red-season" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
              ALTERCOMP II.</a> </p>
            <p> My vocals also appear in <a href="https://www.portalrental.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500"> Portal Rental's upcoming album</a>
              , and <a href="https://open.spotify.com/track/44L7BBmZJsY0OAMIFuU7Jz?si=p_QvrXMpSL2lWH9lhME7Ig" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500"> Morning Close' Rendezvous</a>. </p>
          </>,
          showSoundPopup,
          () => setShowSoundPopup(false)
        )}

        {renderWindow(
          'video',
          'Videos',
          <>
            <p>
              When you dream, do you see from your eyes or another body or a bodiless perspective? 
              Do you hear non-diegetic music?
              I wonder if people started dreaming differently after the invention of cinema.
            </p>
            <p>
              <a href="https://kellyyan.notion.site/VIDEOS-bb25bb9e99c948639f6b27038e481d04?source=copy_link" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
                Watch mine here.
              </a>
            </p>
            <div>
              <video width="100%" height="auto" controls>
                <source src="/5975.mp4" type="video/mp4" />
              </video>
            </div>
          </>,
          showVideoPopup,
          () => setShowVideoPopup(false)
        )}

        {renderWindow(
          'projects',
          'Projects',
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>
              Data
            </h2>
            <p>
              Where is the cheap art in new york city? Read my{' '}
              <a 
                href="https://xy2700-tech.github.io/informatics/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-blue-300 hover:text-blue-500"
              >
                NYC Non-profit Arts & Culture Atlas
              </a>
            </p>
            <p>
              What is going on with the data center boom and what can we do about it? Scroll through my team's website to come
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Community
            </h2>
            <p>
              What are the lived experiences of urban displacement in China? Read my advocacy and research for{' '}
              <a 
                href="https://chinadispossessionwatch.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-blue-300 hover:text-blue-500"
              >
                China Dispossession Watch
              </a>
            </p>
            <p>
              What is in the belly of that big mill in Providence? Checkout my photos for{' '}
              <a 
                href="https://atlanticmills.ppsri.org/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-blue-300 hover:text-blue-500"
              >
                Atlantic Mills Anthology
              </a>
            </p>

            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Play
            </h2>
            <p>
              How can you nurture a childs curiosity in the built environment? Grab some crayons, paper, and camera to follow the prompt cards I designed and prototyped for{' '}
              <a 
                href="https://artculturetourism.com/broadstreetstories/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-blue-300 hover:text-blue-500"
              >
                Broad Street Stories
              </a>
            </p>
            <p>
              How can analog and digital algorithms create generative systems of play? Read my research and documentation of my ongoing{' '}
              <a 
                href="https://kellyyan.notion.site/25-26-residency-movement-lab-2a75e3e543388043905ad43dd06f587b?source=copy_link" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-blue-300 hover:text-blue-500"
              >
                residency at Barnard Movement Lab
              </a>
            </p>
          </>,
          showProjectPopup,
          () => setShowProjectPopup(false)
        )}
      </div>
    </div>
  );
}
