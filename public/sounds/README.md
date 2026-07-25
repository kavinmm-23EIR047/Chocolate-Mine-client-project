📢 NOTIFICATION SOUNDS SETUP

This directory will contain audio files for order notifications in the admin and staff panels.

REQUIRED AUDIO FILES:
1. order-notification.mp3 - Plays when a new order is received
2. alert.mp3 - General alert sound (optional)
3. success.mp3 - Success notification (optional)

SETUP INSTRUCTIONS:

1. Create a 'sounds' directory here:
   /public/sounds/

2. Add your audio files. You can:
   - Use free sounds from:
     * https://mixkit.co/free-sound-effects/notification/
     * https://pixabay.com/sound-effects/
     * https://freesound.org/
   - Use these recommended sounds:
     * Order notification: Bell, ding, or chime sound (1-2 seconds)
     * Alert: Sharp beep or alarm (0.5-1 second)
     * Success: Positive chime or whoosh (0.5-1 second)

3. Save as MP3 files (recommended for browser compatibility)

4. File naming:
   - order-notification.mp3
   - alert.mp3
   - success.mp3

AUDIO FILE SUGGESTIONS:

Order Notification: 
- A pleasant bell/ding sound
- Duration: 1-2 seconds
- Volume normalized
- Recommended: "Bell notification" or "Positive notification"

Alert Sound:
- A moderate beep
- Duration: 0.5-1 second
- Recommended: "Alert beep" or "Warning beep"

Success Sound:
- A cheerful chime
- Duration: 0.5-1 second
- Recommended: "Success chime" or "Positive ding"

Once you have the files, place them in /public/sounds/ and the system will automatically use them.

TESTING:
- Open admin panel and look for sound settings
- Click "Test Sounds" to preview all notification sounds
- Use the mute toggle to control notifications

VOLUME CONTROL:
- Default volume is set to 70% (adjustable in useNotificationSound hook)
- Users can toggle mute during their session
