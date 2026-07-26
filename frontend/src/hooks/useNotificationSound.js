import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage notification sounds for order alerts
 * Plays audio and provides controls for muting/testing
 */
export const useNotificationSound = () => {
  const audioRef = useRef(null);
  const isMutedRef = useRef(false);

  // Auto-unlock AudioContext on first user interaction to bypass browser autoplay restrictions
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Initialize audio element
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    return audioRef.current;
  }, []);

  // Web Audio API Synthesizer fallback for reliable notification sound without relying on external files
  const playSynthChime = useCallback((soundType = 'order') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (soundType === 'order') {
        // High quality dual-tone chime for new order
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5 note
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.15); // A5 note
        gain2.gain.setValueAtTime(0.4, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.6);
      } else if (soundType === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (err) {
      console.error('Synth sound playback error:', err);
    }
  }, []);

  /**
   * Play notification sound
   * @param {string} soundType - Type of sound: 'order', 'alert', 'success'
   * @param {boolean} force - Force play even if muted
   */
  const playSound = useCallback(async (soundType = 'order', force = false) => {
    if (!force && isMutedRef.current) {
      console.log('🔇 Notifications muted - sound not played');
      return;
    }

    try {
      const audio = initAudio();
      
      // Map sound types to audio files
      const soundMap = {
        order: '/sounds/order-notification.mp3',
        alert: '/sounds/alert.mp3',
        success: '/sounds/success.mp3'
      };

      const soundPath = soundMap[soundType] || soundMap.order;
      
      audio.src = soundPath;
      audio.volume = 0.7; // Set to 70% volume
      
      // Stop any currently playing audio
      audio.pause();
      audio.currentTime = 0;

      audio.onerror = () => {
        console.warn(`🔇 Sound file ${soundPath} missing or errored, using Web Audio synth chime`);
        playSynthChime(soundType);
      };
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`🔊 Playing ${soundType} notification sound`);
          })
          .catch(error => {
            console.warn('🔇 HTML5 Audio play failed, falling back to Web Audio synth chime:', error);
            playSynthChime(soundType);
          });
      }
    } catch (error) {
      console.error('Error playing notification sound, falling back to synth:', error);
      playSynthChime(soundType);
    }
  }, [initAudio, playSynthChime]);

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    console.log(`🔕 Notifications ${isMutedRef.current ? 'muted' : 'unmuted'}`);
    return isMutedRef.current;
  }, []);

  /**
   * Set mute state explicitly
   */
  const setMuted = useCallback((muted) => {
    isMutedRef.current = Boolean(muted);
    return isMutedRef.current;
  }, []);

  /**
   * Get current mute state
   */
  const isMuted = useCallback(() => isMutedRef.current, []);

  /**
   * Stop currently playing sound
   */
  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  /**
   * Test play all sounds
   */
  const testSounds = useCallback(async () => {
    console.log('🎵 Testing all notification sounds...');
    
    const sounds = ['order', 'alert', 'success'];
    for (const sound of sounds) {
      await new Promise(resolve => {
        setTimeout(() => {
          playSound(sound, true); // Force play for testing
          resolve();
        }, 800);
      });
    }
  }, [playSound]);

  return {
    playSound,
    toggleMute,
    setMuted,
    isMuted,
    stopSound,
    testSounds
  };
};

export default useNotificationSound;
