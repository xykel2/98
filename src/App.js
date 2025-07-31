import React, { useState, useEffect, useRef } from 'react';
import '98.css';

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showSoundPopup, setShowSoundPopup] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoCount = 13;
  const [zIndices, setZIndices] = useState({
    about: 1,
    gallery: 2,
    sound: 3,
  });
  const [topZIndex, setTopZIndex] = useState(3);

  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const bringToFront = (key) => {
    const newTop = topZIndex + 1;
    setZIndices(prev => ({ ...prev, [key]: newTop }));
    setTopZIndex(newTop);
  };

  useEffect(() => {
    if (audioRef.current) return;

    const audio = new Audio('/audio/bg-mus.wav');
    audio.loop = true;
    audio.volume = 0.5;

    audioRef.current = audio; // Store audio element

    const tryPlay = () => {
      audio.play().catch(e => {
        console.log("Still blocked:", e);
      });
      window.removeEventListener('click', tryPlay); // Clean up listener
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
    },    { icon: '/icons/resume.png', 
      label: 'Projects', 
      onClick: () => {
        setShowProjectPopup(true);
        bringToFront('projects');
      }},
    {
      icon: '/icons/folder.gif',
      label: 'Musings',
      link: 'https://dg-git-main-kels-projects-1630813e.vercel.app/',
    },
    {icon:'/icons/web.gif',
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

  return (
    <div
      style={{
        backgroundImage: "url('/backgrounds/bg4.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
      }}
    >
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
          <div key={idx} style={{ textAlign: 'center', cursor: item.onClick ? 'pointer' : 'default' }}>
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
        {showAbout && (
          <div
            className="window"
            onMouseDown={() => bringToFront('about')}
           style={{
  zIndex: zIndices.gallery,
  width: '90vw',
  maxWidth: '500px',
  height: '80vh',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'auto',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
  backgroundColor: 'gainsboro',
  display: 'flex',
  flexDirection: 'column',
}}

          >
            <div className="title-bar">
              <div className="title-bar-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>About me</div>
              <div className="title-bar-controls">
                <button onClick={() => setShowAbout(false)} aria-label="Close" />
              </div>
            </div>
            <div style={{ fontFamily: 'Courier', padding: '1rem', fontSize: '16px', lineHeight: '1.5' }}>
              <p>Xinyu Kelly Yan is a self-proclaimed <a href="https://www.theguardian.com/cities/2016/jul/29/female-flaneur-women-reclaim-streets" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">flaneuse</a> studying urban planning. </p>
              <p>She has been roaming the streets, roofs, and ruins of cities while looking for Shanghai elsewhere since 2001.</p>
              <p>Currently falling in love with the world and nurturing her <a href="https://www.are.na/xinyu-yan/channels" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">fascinations</a> in all things place-based, audiovisual, and embodied.</p>
              <img
    src="/me.jpg"
    alt="Portrait of Xinyu Kelly Yan"
    style={{
      width: '100%',
      maxWidth: '300px',
      height: 'auto',
      display: 'block',
      margin: '0 auto 1rem auto',
      border: '2px solid black'
    }}
  />
            </div>
          </div>
        )}

        {showPhotoGallery && (
          <div
            className="window"
            onMouseDown={() => bringToFront('gallery')}
           style={{
  zIndex: zIndices.gallery,
  width: '90vw',
  maxWidth: '500px',
  height: '80vh',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'auto',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
  backgroundColor: 'gainsboro',
  display: 'flex',
  flexDirection: 'column',
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
          </div>
        )}

        {showSoundPopup && (
          <div
            className="window"
            onMouseDown={() => bringToFront('sound')}
         style={{
  zIndex: zIndices.gallery,
  width: '90vw',
  maxWidth: '500px',
  height: '80vh',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'auto',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
  backgroundColor: 'gainsboro',
  display: 'flex',
  flexDirection: 'column',
}}

          >
            <div className="title-bar">
              <div className="title-bar-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Sounds
              </div>
              <div className="title-bar-controls">
                <button onClick={() => setShowSoundPopup(false)} aria-label="Close" />
              </div>
            </div>
            <div style={{ fontFamily: 'Courier', padding: '1rem', fontSize: '16px', lineHeight: '1.5' }}>
            
                <img
    src="/serge.png"
    alt="Portrait of Serge at RISD"
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
                I work with digital and analog synthesizers, field recordings, and found objects to make ambient drones.
                This space holds fragments from my sonic world:
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
 <p> Currently making drones with bekki as <a href= "https://onehourcleaner.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
              One Hour Cleaner.</a> </p>
  <p> My vocals also appear in <a href="https://www.portalrental.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500"> Portal Rental's upcoming albulm</a>
  , and <a href= "https://open.spotify.com/track/44L7BBmZJsY0OAMIFuU7Jz?si=p_QvrXMpSL2lWH9lhME7Ig" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500"> Morning Close' Rendezvous</a>. </p>
            </div>
          </div>
        )}

{showVideoPopup && (
          <div
            className="window"
            onMouseDown={() => bringToFront('video')}
         style={{
  zIndex: zIndices.gallery,
  width: '90vw',
  maxWidth: '500px',
  height: '80vh',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'auto',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
  backgroundColor: 'gainsboro',
  display: 'flex',
  flexDirection: 'column',
}}

          >
            <div className="title-bar">
              <div className="title-bar-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Videos
              </div>
              <div className="title-bar-controls">
                <button onClick={() => setShowVideoPopup(false)} aria-label="Close" />
              </div>
            </div>
            <div style={{ fontFamily: 'Courier', padding: '1rem', fontSize: '16px', lineHeight: '1.5' }}>
              <p>
                I work with digital video, found footage, and analog film. 
                When you dream, do you see from your eyes or another body or a bodiless perspective? 
                Do you hear non-diegetic music?
                I wonder if people started dreaming differently after the invention of cinema. </p><p>
                <a href="https://kellyyan.notion.site/VIDEOS-bb25bb9e99c948639f6b27038e481d04?source=copy_link" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
                  Watch mine here.
                  </a>
              </p>
              </div>
              <div>
              <video width="100%" height="auto" controls>
                <source src="/5975.mp4" type="video/mp4" /></video>
                </div>
          </div>
        )}

{showProjectPopup && (
          <div
            className="window"
            onMouseDown={() => bringToFront('projects')}
         style={{
  zIndex: zIndices.gallery,
  width: '90vw',
  maxWidth: '500px',
  height: '80vh',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'auto',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.3)',
  backgroundColor: 'gainsboro',
  display: 'flex',
  flexDirection: 'column',
}}

          >
            <div className="title-bar">
              <div className="title-bar-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Projects
              </div>
              <div className="title-bar-controls">
                <button onClick={() => setShowProjectPopup(false)} aria-label="Close" />
              </div>
            </div>
            <div style={{ fontFamily: 'Courier', padding: '1rem', fontSize: '16px', lineHeight: '1.5' }}>
              <p> Design and Prototype for    <a href="https://artculturetourism.com/broadstreetstories/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
                  Broad Street Stories</a> </p>
              <p> Advocacy for China Disposession Watch. Digital platform to come soon. </p>
              <p> Photos for <a href="https://atlanticmills.ppsri.org/" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-500">
              Atlantic Mills Anthology</a></p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}