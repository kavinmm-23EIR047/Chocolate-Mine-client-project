import { useRef, useCallback } from 'react';

/**
 * Hook to manage notification sounds for order alerts
 * Plays audio and provides controls for muting/testing
 */
export const useNotificationSound = () => {
  const audioRef = useRef(null);
  const isMutedRef = useRef(false);

  // Initialize audio element
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    return audioRef.current;
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
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`🔊 Playing ${soundType} notification sound`);
          })
          .catch(error => {
            console.warn('🔇 Could not play sound:', error);
          });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [initAudio]);

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
