const Board = require('./board.js').Board;
const BitHelper = require('./helpers.js').BitHelper;
const BoardHelper = require('./helpers.js').BoardHelper;
const ViewHelper = require('./helpers.js').ViewHelper;
const Square = require('./square.js').Square;
const Direction = require('./move.js').Direction;
const MoveList = require('./move.js').MoveList;

class PieceBoard {
  static for(fenChar, pieceBit) {
    let PieceClass;
    switch (fenChar) {
      case 'k':
        PieceClass = BlackKingBoard;
        break;
      case 'q':
        PieceClass = BlackQueenBoard;
        break;
      case 'r':
        PieceClass = BlackRookBoard;
        break;
      case 'b':
        PieceClass = BlackBishopBoard;
        break;
      case 'n':
        PieceClass = BlackKnightBoard;
        break;
      case 'p':
        PieceClass = BlackPawnBoard;
        break;
      case 'K':
        PieceClass = WhiteKingBoard;
        break;
      case 'Q':
        PieceClass = WhiteQueenBoard;
        break;
      case 'R':
        PieceClass = WhiteRookBoard;
        break;
      case 'B':
        PieceClass = WhiteBishopBoard;
        break;
      case 'N':
        PieceClass = WhiteKnightBoard;
        break;
      case 'P':
        PieceClass = WhitePawnBoard;
        break;
    }
    return new PieceClass(pieceBit);
  }

  on(board) {
    this.mainBoardBb = board.bb;
    this.whiteBb = board.whiteBb;
    this.blackBb = board.blackBb;
    this.whiteKingBb = board.whiteKingBb;
    this.blackKingBb = board.blackKingBb;
  }
}

// TODO: movegen for pawn using MoveClass
// en passant, king in check, etc
class WhitePawnBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
    this.moveList = [];
  }

  generateMoves(pieceBb) {
    let pawnMoves = BigInt(0);
    const emptySq = ~this.mainBoardBb;
    // start pos parsing
    if (pieceBb & BoardHelper.secondRank()) {
      pawnMoves |= Direction.wSinglePush(pieceBb, emptySq) | 
        Direction.wDoublePush(pieceBb, emptySq);
    } else {
      pawnMoves |= Direction.wSinglePush(pieceBb, emptySq);
    }
    // attack parsing
    pawnMoves |= (Direction.wPawnAttacks(pieceBb) & this.blackBb);
    return pawnMoves;
  }

  moves() {
    Square.indicesFor(this.bb).forEach((fromIdx) => {
      let pieceBb = BitHelper.setBit(BigInt(0), fromIdx);
      const toIdxs = Square.indicesFor(this.generateMoves(pieceBb));
      this.moveList.push(MoveList.for('P', fromIdx, toIdxs, this));
    });

    return this.moveList.flat();
  }
}

class BlackPawnBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
    this.moveList = [];
  }

  generateMoves(pieceBb) {
    let pawnMoves = BigInt(0);
    const emptySq = ~this.mainBoardBb;
    // start pos parsing
    if (pieceBb & BoardHelper.secondRank()) {
      pawnMoves |= Direction.bSinglePush(pieceBb, emptySq) | 
        Direction.wDoublePush(pieceBb, emptySq);
    } else {
      pawnMoves |= Direction.bSinglePush(pieceBb, emptySq);
    }
    // attack parsing
    pawnMoves |= (Direction.bPawnAttacks(pieceBb) & this.whiteBb);
    return pawnMoves;
  }

  moves() {
    Square.indicesFor(this.bb).forEach((fromIdx) => {
      let pieceBb = BitHelper.setBit(BigInt(0), fromIdx);
      const toIdxs = Square.indicesFor(this.generateMoves(pieceBb));
      this.moveList.push(MoveList.for('p', fromIdx, toIdxs, this));
    });

    return this.moveList.flat();
  }
}

class WhiteKnightBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class WhiteBishopBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class WhiteRookBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class WhiteQueenBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class WhiteKingBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class BlackKnightBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class BlackBishopBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class BlackRookBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class BlackQueenBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class BlackKingBoard extends PieceBoard {
  constructor(bb) {
    super();
    this.bb = bb;
  }
}

class PieceBoardList {
  constructor() {
    this.K = PieceBoard.for('K', BigInt(0));
    this.Q = PieceBoard.for('Q', BigInt(0));
    this.R = PieceBoard.for('R', BigInt(0));
    this.B = PieceBoard.for('B', BigInt(0));
    this.N = PieceBoard.for('N', BigInt(0));
    this.P = PieceBoard.for('P', BigInt(0));
    this.k = PieceBoard.for('k', BigInt(0));
    this.q = PieceBoard.for('q', BigInt(0));
    this.r = PieceBoard.for('r', BigInt(0));
    this.b = PieceBoard.for('b', BigInt(0));
    this.n = PieceBoard.for('n', BigInt(0));
    this.p = PieceBoard.for('p', BigInt(0));
  }
}

module.exports = {
  PieceBoard: PieceBoard,
  PieceBoardList: PieceBoardList,
};