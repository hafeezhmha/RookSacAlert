# RookSacAlert

## Overview

Ever make a rook sacrifice and wish Levy Rozman would pop up and yell "AND HE SACS THE ROOK!"? Well, now he does.

This Chrome extension automatically detects when a rook sacrifice occurs during your chess.com games and plays the iconic clip. Every. Single. Time. Whether you're playing live, reviewing games, or analyzing positions, RookSacAlert is there to hype up your sacrifices like you're in a GothamChess video.

## Features

- **Automatic Detection**: Monitors chess.com game pages for rook sacrifice moves
- **Video Overlay**: Plays a full-screen video clip when a sacrifice is detected
- **Sound Control**: Toggle video sound on/off from the extension popup
- **History Tracking**: View the last 10 rook sacrifices detected with timestamps
- **Works Everywhere**: Functions on live games, replays, analysis boards, and studies

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will now be active on all chess.com pages

## How It Works

The extension uses two detection methods:

1. **Move List Monitoring**: Watches for rook capture notation (Rx) in the move list
2. **Board State Analysis**: Tracks board state changes to detect rook disappearances

When a rook sacrifice is detected:
- A full-screen dark overlay appears
- The video clip plays automatically (with optional sound)
- The sacrifice is logged in your history
- The overlay disappears when the video ends

## Usage

### During a Game
Simply play chess on chess.com as normal. When you or your opponent makes a rook sacrifice, the video will play automatically.

### Reviewing Games
Navigate through game moves using chess.com's interface. When you reach a move where a rook is sacrificed, the video will trigger.

### Extension Popup
Click the extension icon to:
- See recent sacrifices detected
- Toggle sound on/off
- Click any sacrifice entry to return to that game

## Technical Details

### Detection Logic
The extension identifies rook sacrifices by:
- Monitoring for "Rxe5", "Rxf7+", or similar chess notation
- Detecting when a rook piece disappears from the board due to capture
- Checking if the rook moved into an attacked square

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Content Script**: Runs on all chess.com pages to monitor games
- **Service Worker**: Minimal background script for extension lifecycle
- **Storage API**: Tracks sacrifice history and user preferences

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main detection logic and video overlay
- `overlay.css` - Styling for video player overlay
- `popup.html/js` - Extension popup interface
- `background.js` - Service worker
- `assets/THE_ROOK.mp4` - The video clip that plays

## Testing

See [TESTING.md](TESTING.md) for detailed testing instructions.

## Known Limitations

- Detection is based on move notation and board state changes
- May not catch every theoretical rook sacrifice in complex positions
- Requires visible move list for primary detection method
- Only works on chess.com (not other chess platforms)

## Future Enhancements

Possible improvements:
- Full chess engine integration for true sacrifice detection
- Support for other piece sacrifices (queens, bishops, knights)
- Customizable video clips
- Statistics dashboard
- Export sacrifice history

## Author

Created by [hafeezhmha](https://github.com/hafeezhmha)

## Credits

Inspired by chess commentary and the dramatic moments of rook sacrifices in competitive chess.
