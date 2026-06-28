const puzzleStage = document.querySelector("#puzzleStage");
const shuffleButton = document.querySelector("#shufflePuzzle");
const resetButton = document.querySelector("#resetPuzzle");

if (puzzleStage) {
  puzzleStage.style.setProperty("--puzzle-image", `url("${puzzleStage.dataset.image}")`);
}

const rows = 3;
const columns = 3;
let activePiece = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let topLayer = 20;

function getPieceSize() {
  return {
    width: puzzleStage.clientWidth / columns,
    height: puzzleStage.clientHeight / rows,
  };
}

function keepInsideStage(value, max) {
  return Math.max(0, Math.min(value, max));
}

function movePiece(piece, x, y) {
  const pieceSize = getPieceSize();
  const maxX = puzzleStage.clientWidth - pieceSize.width;
  const maxY = puzzleStage.clientHeight - pieceSize.height;
  const nextX = keepInsideStage(x, maxX);
  const nextY = keepInsideStage(y, maxY);

  piece.dataset.x = nextX;
  piece.dataset.y = nextY;
  piece.style.setProperty("--piece-x", `${nextX}px`);
  piece.style.setProperty("--piece-y", `${nextY}px`);
}

function placePieceInGrid(piece) {
  const pieceSize = getPieceSize();
  const row = Number(piece.dataset.row);
  const column = Number(piece.dataset.column);

  movePiece(piece, column * pieceSize.width, row * pieceSize.height);
}

function bringToTop(piece) {
  topLayer += 1;
  piece.style.zIndex = topLayer;
}

function resetPuzzle() {
  document.querySelectorAll(".puzzle-piece").forEach((piece) => {
    bringToTop(piece);
    placePieceInGrid(piece);
  });
}

function shufflePuzzle() {
  const pieceSize = getPieceSize();
  const maxX = puzzleStage.clientWidth - pieceSize.width;
  const maxY = puzzleStage.clientHeight - pieceSize.height;

  document.querySelectorAll(".puzzle-piece").forEach((piece) => {
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    bringToTop(piece);
    movePiece(piece, randomX, randomY);
  });
}

function startDrag(event) {
  activePiece = event.currentTarget;
  const pieceBox = activePiece.getBoundingClientRect();

  dragOffsetX = event.clientX - pieceBox.left;
  dragOffsetY = event.clientY - pieceBox.top;
  activePiece.classList.add("dragging");
  activePiece.setPointerCapture(event.pointerId);
  bringToTop(activePiece);
}

function dragPiece(event) {
  if (!activePiece) {
    return;
  }

  const stageBox = puzzleStage.getBoundingClientRect();
  const nextX = event.clientX - stageBox.left - dragOffsetX;
  const nextY = event.clientY - stageBox.top - dragOffsetY;

  movePiece(activePiece, nextX, nextY);
}

function stopDrag(event) {
  if (!activePiece) {
    return;
  }

  activePiece.classList.remove("dragging");
  if (activePiece.hasPointerCapture(event.pointerId)) {
    activePiece.releasePointerCapture(event.pointerId);
  }
  activePiece = null;
}

function movePieceWithKeyboard(event) {
  const step = event.shiftKey ? 24 : 10;
  const keys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];

  if (!keys.includes(event.key)) {
    return;
  }

  event.preventDefault();
  bringToTop(event.currentTarget);

  const currentX = Number(event.currentTarget.dataset.x);
  const currentY = Number(event.currentTarget.dataset.y);

  if (event.key === "ArrowUp") {
    movePiece(event.currentTarget, currentX, currentY - step);
  }

  if (event.key === "ArrowRight") {
    movePiece(event.currentTarget, currentX + step, currentY);
  }

  if (event.key === "ArrowDown") {
    movePiece(event.currentTarget, currentX, currentY + step);
  }

  if (event.key === "ArrowLeft") {
    movePiece(event.currentTarget, currentX - step, currentY);
  }
}

function createPuzzlePieces() {
  const puzzleImage = new URL(puzzleStage.dataset.image, window.location.href).href;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const piece = document.createElement("div");
      const horizontalPosition = (column / (columns - 1)) * 100;
      const verticalPosition = (row / (rows - 1)) * 100;

      piece.className = "puzzle-piece";
      piece.tabIndex = 0;
      piece.setAttribute("role", "button");
      piece.setAttribute("aria-label", `Morceau ${row * columns + column + 1}`);
      piece.dataset.row = row;
      piece.dataset.column = column;
      piece.style.backgroundImage = `url("${puzzleImage}")`;
      piece.style.backgroundPosition = `${horizontalPosition}% ${verticalPosition}%`;
      piece.style.zIndex = row * columns + column + 1;

      piece.addEventListener("pointerdown", startDrag);
      piece.addEventListener("pointermove", dragPiece);
      piece.addEventListener("pointerup", stopDrag);
      piece.addEventListener("pointercancel", stopDrag);
      piece.addEventListener("keydown", movePieceWithKeyboard);

      puzzleStage.appendChild(piece);
      placePieceInGrid(piece);
    }
  }

  shufflePuzzle();
}

if (puzzleStage && shuffleButton && resetButton) {
  window.addEventListener("resize", resetPuzzle);
  shuffleButton.addEventListener("click", shufflePuzzle);
  resetButton.addEventListener("click", resetPuzzle);
  createPuzzlePieces();
}
