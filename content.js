// content.js - Rook Sacrifice Detector for Chess.com

// Track the board state and moves
let lastBoardState = null;
let processedMoves = new Set();

// Function to get the current board state from chess.com
function getBoardState() {
  // Chess.com uses different selectors for live games vs analysis
  const board = document.querySelector('.board');
  if (!board) return null;

  const pieces = {};
  const squares = board.querySelectorAll('.square');

  squares.forEach(square => {
    const piece = square.querySelector('[class*="piece"]');
    if (piece) {
      const classes = piece.className;
      const squareClasses = square.className;

      // Extract square coordinate (e.g., "square-11" -> "a1")
      const coordMatch = squareClasses.match(/square-(\d)(\d)/);
      if (coordMatch) {
        const file = String.fromCharCode(96 + parseInt(coordMatch[1])); // 1->a, 2->b, etc
        const rank = coordMatch[2];
        const coord = file + rank;

        // Extract piece type and color
        let pieceType = null;
        let pieceColor = null;

        if (classes.includes('wr')) { pieceType = 'R'; pieceColor = 'w'; }
        else if (classes.includes('br')) { pieceType = 'R'; pieceColor = 'b'; }
        else if (classes.includes('wn')) { pieceType = 'N'; pieceColor = 'w'; }
        else if (classes.includes('bn')) { pieceType = 'N'; pieceColor = 'b'; }
        else if (classes.includes('wb')) { pieceType = 'B'; pieceColor = 'w'; }
        else if (classes.includes('bb')) { pieceType = 'B'; pieceColor = 'b'; }
        else if (classes.includes('wq')) { pieceType = 'Q'; pieceColor = 'w'; }
        else if (classes.includes('bq')) { pieceType = 'Q'; pieceColor = 'b'; }
        else if (classes.includes('wk')) { pieceType = 'K'; pieceColor = 'w'; }
        else if (classes.includes('bk')) { pieceType = 'K'; pieceColor = 'b'; }
        else if (classes.includes('wp')) { pieceType = 'P'; pieceColor = 'w'; }
        else if (classes.includes('bp')) { pieceType = 'P'; pieceColor = 'b'; }

        if (pieceType && pieceColor) {
          pieces[coord] = { type: pieceType, color: pieceColor };
        }
      }
    }
  });

  return pieces;
}

// Detect if a rook sacrifice just occurred
function detectRookSacrifice(oldState, newState) {
  if (!oldState || !newState) return false;

  // Find missing rooks (rooks that were in oldState but not in newState)
  const oldRooks = Object.entries(oldState).filter(([coord, piece]) => piece.type === 'R');
  const newRooks = Object.entries(newState).filter(([coord, piece]) => piece.type === 'R');

  // Check if a rook was captured
  if (oldRooks.length > newRooks.length) {
    const capturedRook = oldRooks.find(([coord]) => !newState[coord] || newState[coord].type !== 'R');

    if (capturedRook) {
      const [rookCoord, rookPiece] = capturedRook;

      // Check if the square now has an opponent's piece (indicating a capture/sacrifice)
      if (newState[rookCoord] && newState[rookCoord].color !== rookPiece.color) {
        return true;
      }

      // Also check if rook moved to a square where it can be captured (sacrifice by moving into danger)
      // This is a simplified check - a real implementation would need full chess logic
      const movedRook = newRooks.find(([newCoord]) =>
        !oldState[newCoord] || oldState[newCoord].type !== 'R'
      );

      if (movedRook) {
        const [newCoord] = movedRook;
        // Check if moved into a square attacked by opponent (simplified: check adjacent pieces)
        const isUnderAttack = checkIfUnderAttack(newCoord, newState, rookPiece.color);
        if (isUnderAttack) {
          return true;
        }
      }
    }
  }

  return false;
}

// Simple check if a square is under attack (simplified for demonstration)
function checkIfUnderAttack(coord, boardState, pieceColor) {
  const opponentColor = pieceColor === 'w' ? 'b' : 'w';

  // Check all opponent pieces
  for (const [enemyCoord, enemyPiece] of Object.entries(boardState)) {
    if (enemyPiece.color === opponentColor) {
      // Simplified: just check if any opponent piece is adjacent or on same rank/file
      if (canAttack(enemyCoord, coord, enemyPiece.type)) {
        return true;
      }
    }
  }

  return false;
}

// Simplified attack logic
function canAttack(fromCoord, toCoord, pieceType) {
  const fromFile = fromCoord.charCodeAt(0);
  const fromRank = parseInt(fromCoord[1]);
  const toFile = toCoord.charCodeAt(0);
  const toRank = parseInt(toCoord[1]);

  const fileDiff = Math.abs(fromFile - toFile);
  const rankDiff = Math.abs(fromRank - toRank);

  switch(pieceType) {
    case 'P': return fileDiff === 1 && rankDiff === 1;
    case 'N': return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    case 'B': return fileDiff === rankDiff;
    case 'R': return fileDiff === 0 || rankDiff === 0;
    case 'Q': return fileDiff === rankDiff || fileDiff === 0 || rankDiff === 0;
    case 'K': return fileDiff <= 1 && rankDiff <= 1;
    default: return false;
  }
}

// Alternative: Monitor move list for rook captures
let moveListObserver = null;
let isMonitoringMoveList = false;

function monitorMoveList() {
  // Prevent multiple simultaneous attempts to monitor
  if (isMonitoringMoveList) {
    console.log('RookSacAlert: Already monitoring, skipping duplicate setup');
    return;
  }

  // Try multiple selectors for different chess.com layouts
  let moveList = document.querySelector('.move-list-component') ||
                 document.querySelector('vertical-move-list') ||
                 document.querySelector('wc-mode-swap-move-list') ||
                 document.querySelector('wc-simple-move-list') ||
                 document.querySelector('.moves') ||
                 document.querySelector('[class*="move-list"]');

  // If we found wc-mode-swap-move-list, check if it has wc-simple-move-list inside
  if (moveList && moveList.tagName === 'WC-MODE-SWAP-MOVE-LIST') {
    const inner = moveList.querySelector('wc-simple-move-list');
    if (inner) {
      console.log('RookSacAlert: Using inner wc-simple-move-list');
      moveList = inner;
    }
  }

  if (!moveList) {
    console.log('RookSacAlert: Move list not found, retrying...');
    // Retry after a delay if move list not found yet
    setTimeout(() => {
      isMonitoringMoveList = false;
      monitorMoveList();
    }, 2000);
    return;
  }

  isMonitoringMoveList = true;
  console.log('RookSacAlert: Monitoring move list:', moveList);

  // Disconnect existing observer if any
  if (moveListObserver) {
    moveListObserver.disconnect();
  }

  let lastProcessedMove = '';

  moveListObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const moveText = node.textContent || '';

          // Skip if empty or already processed in this batch
          if (!moveText.trim() || moveText === lastProcessedMove) {
            return;
          }

          console.log('RookSacAlert: New move detected:', moveText);

          // Check if this node has a rook icon/indicator
          const hasRookIcon = node.querySelector && (
            node.querySelector('.icon-font-chess.rook-white') ||
            node.querySelector('.icon-font-chess.rook-black') ||
            node.querySelector('[data-figurine="R"]') ||
            node.querySelector('[class*="rook"]') ||
            (node.className && node.className.includes && node.className.includes('rook'))
          );

          // Check for captures (x in the notation)
          const isCapture = /x/.test(moveText);

          console.log('RookSacAlert: Move analysis - hasRookIcon:', !!hasRookIcon, 'isCapture:', isCapture, 'node:', node);

          // Check for explicit rook notation (Rxe5) OR rook icon + capture
          const isRookCapture = /R[a-h]?x/.test(moveText) || (hasRookIcon && isCapture);

          // Create unique key for this move
          const moveKey = moveText.trim() + '_' + Date.now();

          if (isRookCapture && !processedMoves.has(moveText.trim())) {
            console.log('RookSacAlert: ROOK SACRIFICE DETECTED!', moveText, 'hasRookIcon:', !!hasRookIcon);
            processedMoves.add(moveText.trim());
            lastProcessedMove = moveText;
            playRookSacrificeVideo(moveText.trim());
          }
        }
      });
    });
  });

  moveListObserver.observe(moveList, { childList: true, subtree: true });
}

// Clear processed moves when navigating to new game
function clearProcessedMoves() {
  processedMoves.clear();
}

// Detect URL changes (new game loaded)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    clearProcessedMoves();
    // Reinitialize move list monitoring for new game
    setTimeout(monitorMoveList, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Play the video overlay
function playRookSacrificeVideo(moveText = "Rook sacrifice") {
  console.log('RookSacAlert: playRookSacrificeVideo called with:', moveText);

  // Avoid playing multiple times in quick succession
  if (window.rookSacVideoPlaying) {
    console.log('RookSacAlert: Video already playing, skipping');
    return;
  }
  window.rookSacVideoPlaying = true;

  console.log('RookSacAlert: Creating video overlay...');

  // Notify popup about the sacrifice (ignore errors if popup closed)
  chrome.runtime.sendMessage({
    action: "rookSacrificeDetected",
    move: moveText,
    url: window.location.href
  }).catch(() => {});

  // Check if sound is enabled
  chrome.storage.local.get({ enableSound: true }, (result) => {
    const muted = !result.enableSound;
    console.log('RookSacAlert: Sound setting - muted:', muted);

    // Remove any existing overlay first
    const existingOverlay = document.getElementById('rook-sac-overlay');
    if (existingOverlay) {
      console.log('RookSacAlert: Removing existing overlay');
      existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'rook-sac-overlay';
    const videoUrl = chrome.runtime.getURL('assets/THE_ROOK.mp4');
    console.log('RookSacAlert: Video URL:', videoUrl);

    overlay.innerHTML = `
      <div class="rook-sac-video-container">
        <video autoplay ${muted ? 'muted' : ''} id="rook-sac-video">
          <source src="${videoUrl}" type="video/mp4">
        </video>
      </div>
    `;

    document.body.appendChild(overlay);
    console.log('RookSacAlert: Overlay appended to body');

    const video = document.getElementById('rook-sac-video');
    console.log('RookSacAlert: Video element:', video);

    const cleanupOverlay = () => {
      const overlayElement = document.getElementById('rook-sac-overlay');
      if (overlayElement) {
        overlayElement.remove();
      }
      window.rookSacVideoPlaying = false;
    };

    video.onended = cleanupOverlay;
    video.onerror = () => {
      console.error('Failed to load rook sacrifice video');
      cleanupOverlay();
    };

    // Fallback: remove after 10 seconds even if video doesn't end
    setTimeout(() => {
      if (document.getElementById('rook-sac-overlay')) {
        cleanupOverlay();
      }
    }, 10000);

    // Allow clicking overlay to dismiss
    overlay.addEventListener('click', cleanupOverlay);
  });
}

// Initialize detection
function init() {
  console.log('Rook Sacrifice Detector initialized on chess.com');

  // Monitor move list for rook captures (primary detection method)
  monitorMoveList();

  // Backup: Poll board state changes
  setInterval(() => {
    const currentState = getBoardState();
    if (lastBoardState && currentState) {
      if (detectRookSacrifice(lastBoardState, currentState)) {
        playRookSacrificeVideo();
      }
    }
    lastBoardState = currentState;
  }, 1000);
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from popup (keeping structure from original)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractPageURL") {
    sendResponse({ url: window.location.href });
  }
});
