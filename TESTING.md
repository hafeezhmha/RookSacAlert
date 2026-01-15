# Testing Instructions for Chess.com Rook Sacrifice Detector

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right corner)
3. Click "Load unpacked"
4. Select the directory containing the extension files
5. The extension should now appear in your extensions list

## Testing the Extension

### Method 1: Watch a Game with Rook Sacrifices

1. Go to chess.com and navigate to a famous game with rook sacrifices:
   - Search for "Mikhail Tal games" or "Bobby Fischer games"
   - Example: https://www.chess.com/games (search for games with rook sacrifices)

2. Play through the moves using the chess board viewer
3. When a move with notation like "Rxe5" or "Rxf7+" appears, the video should automatically play

### Method 2: Play or Analyze a Game

1. Go to https://www.chess.com/play/online (play a live game)
2. OR go to https://www.chess.com/analysis (use the analysis board)
3. Make a rook capture move (move your rook to capture an opponent's piece)
4. The video overlay should appear automatically

### Method 3: Review Historical Games

1. Navigate to any chess.com game review/replay page
2. Step through moves that include rook captures
3. Look for moves with "Rx" notation in the move list

## What to Expect

When a rook sacrifice is detected:
- A full-screen overlay appears with dark background
- The video "THE ROOK.mp4" plays automatically
- Video has rounded corners and shadow effect
- Overlay disappears when video ends (or after 10 seconds max)

## Settings

Click the extension icon to access:
- View recent sacrifices detected (last 10)
- Enable/disable sound for the video
- Click on any sacrifice entry to revisit that game

## Troubleshooting

### Video doesn't play
1. Check browser console (F12) for errors
2. Verify the video file exists at `/assets/THE_ROOK.mp4`
3. Make sure you're on a chess.com page (extension only works on chess.com)

### Detection not working
1. The extension looks for moves with notation "Rxe5", "Rxf7+", etc.
2. Try playing through moves manually in the analysis board
3. Check that the move list is visible on the page

### Multiple videos playing
- The extension prevents multiple simultaneous plays
- If this happens, reload the page and try again

## Detection Logic

The extension uses two methods:

1. **Primary**: Monitors the move list for rook capture notation (Rx)
2. **Backup**: Polls the board state every second to detect rook disappearances

This dual approach ensures detection works across:
- Live games
- Game replays
- Analysis boards
- Study features
