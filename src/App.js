
import React, { useState, useEffect, useRef } from 'react';
import '98.css';

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showSoundPopup, setShowSoundPopup] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoCount = 8;
  const [zIndices, setZIndices] = useState({ about: 1, gallery: 2, sound: 3, video: 4 });
  const [topZIndex, setTopZIndex] = useState(4);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const [fadeTransition, setFadeTransition] = useState(false);

  // Bring window to front
  const bringToFront = (key) => {
    const newTop = topZIndex + 1;
    setZIndices(prev => ({ ...prev, [key]: newTop }));
    setTopZIndex(newTop);
  };

  // Background music setup
  useEffect(() => {
    if (audioRef.current) return;

    const audio = new Audio('/audio/bg-mus.wav');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().catch((e) => console.log('Blocked:', e));
      window.removeEventListener('click', tryPlay);
    };

    audio.play().catch(() => window.addEventListener('click', tryPlay));

    return () => {
      window.removeEventListener('click', tryPlay);
      audio.pause();
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0.5 : 0;
    setIsMuted(!isMuted);
  };

  // Clock
  useEffect(() => {
    const formatTime = (date) => {
      let h = date.getHours();
      const m = date.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    setCurrentTime(formatTime(new Date()));
    const intervalId = setInterval(() => setCurrentTime(formatTime(new Date())), 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAbout(false);
        setShowSoundPopup(false);
        setShowVideoPopup(false);
        setShowPhotoGallery(false);
      }

      if (showPhotoGallery) {
        if (e.key === 'ArrowLeft') {
          setFadeTransition(true);
          setTimeout(() => {
            setCurrentPhotoIndex((prev) => (prev === 0 ? photoCount - 1 : prev - 1));
            setFadeTransition(false);
          }, 100);
        } else if (e.key === 'ArrowRight') {
          setFadeTransition(true);
          setTimeout(() => {
            setCurrentPhotoIndex((prev) => (prev + 1) % photoCount);
            setFadeTransition(false);
          }, 100);
        }
      }

      if (document.activeElement && e.key === 'Enter') {
        document.activeElement.click?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPhotoGallery]);

  // Prevent background scroll when modals are open
  useEffect(() => {
    const isAnyModalOpen = showAbout || showPhotoGallery || showSoundPopup || showVideoPopup;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [showAbout, showPhotoGallery, showSoundPopup, showVideoPopup]);

  const icons = [
    {
      icon: '/icons/time.gif',
      label: 'Photography',
      onClick: () => {
        setShowPhotoGallery(true);
        setCurrentPhotoIndex(0);
        bringToFront('gallery');
      },
    },
    {
      icon: '/icons/sounds.gif',
      label: 'Sound',
      onClick: () => {
        setShowSoundPopup(true);
        bringToFront('sound');
      },
    },
    {
      icon: '/icons/video.gif',
      label: 'Video',
      onClick: () => {
        setShowVideoPopup(true);
        bringToFront('video');
      },
    },
    {
      icon: '/icons/resume.png',
      label: 'Resume',
      link: '#',
    },
    {
      icon: '/icons/folder.gif',
      label: 'Digital Garden',
      link: 'https://dg-git-main-kels-projects-1630813e.vercel.app/',
    },
    {
      icon: '/icons/info.png',
      label: 'About',
      onClick: () => {
        setShowAbout(true);
        bringToFront('about');
      },
    },
  ];

  return (
    <div
      style={{
        backgroundImage: "url('/backgrounds/bg2.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
      }}
    >
      {/* Title Bar */}
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
        <div>Xinyu Kelly Yan’s Desktop</div>
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

      {/* Icons Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.5rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {icons.map((item, idx) => (
          <div
            key={idx}
            tabIndex={0}
            style={{ textAlign: 'center', cursor: item.onClick ? 'pointer' : 'default', outline: 'none' }}
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

      {/* Modals */}
      {/** Keep using your existing popup/modal structure for About, Sound, and Video. Here's the only updated one: **/}
      {showPhotoGallery && (
        <div
          className="window"
          onMouseDown={() => bringToFront('gallery')}
          style={{
            zIndex: zIndices.gallery,
            width: '500px',
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
          }}
        >
          <div className="title-bar">
            <div className="title-bar-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Photo Gallery
            </div>
            <div className="title-bar-controls">
              <button onClick={() => setShowPhotoGallery(false)} aria-label="Close" />
            </div>
          </div>
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <img
              src={`/photos/photo${currentPhotoIndex + 1}.jpg`}
              alt={`Photo ${currentPhotoIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                border: '2px solid black',
                opacity: fadeTransition ? 0.3 : 1,
                transition: 'opacity 0.3s ease',
              }}
            />
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setFadeTransition(true);
                  setTimeout(() => {
                    setCurrentPhotoIndex((prev) => (prev === 0 ? photoCount - 1 : prev - 1));
                    setFadeTransition(false);
                  }, 100);
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => {
                  setFadeTransition(true);
                  setTimeout(() => {
                    setCurrentPhotoIndex((prev) => (prev + 1) % photoCount);
                    setFadeTransition(false);
                  }, 100);
                }}
                style={{ marginLeft: '1rem' }}
              >
                Next →
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', fontFamily: 'Courier', fontSize: '14px', color: '#555' }}>
              Photo {currentPhotoIndex + 1} of {photoCount}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
