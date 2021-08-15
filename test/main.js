const assert = require('assert');
const Board = require('../src/board.js').Board;
const BoardView = require('../src/boardview.js').BoardView;
const SquareHelper = require('../src/helpers.js').SquareHelper;
const U64 = require('../src/helpers.js').U64;
// const PieceBoard = require('../src/board.js').PieceBoard;
const ViewHelper = require('../src/helpers.js').ViewHelper;
const PieceBoardList = require('../src/pieceboard.js').PieceBoardList;

Error.stackTraceLimit = 10;

// Boards should return BigInts
describe('Board', function() {
  describe('#parseFenToBoard()', function() {
    it('returns a bitboard for a given fen', function() {
      const board = new Board();
      board.parseFenToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // eslint-disable-line

      assert.equal(board.bb, 18446462598732906495n);
    });
  });

  describe('#flipBoard()', function() {
    it('flips the board', function() {
      const flippedBoard = new Board();
      flippedBoard.parseFenToBoard('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq '); // eslint-disable-line
      flippedBoard.flipBoard();

      assert.equal(flippedBoard.bb, 15992005286099480479n);
    });
  });

  describe('.displayCastleStatus', function() {
    it('returns the integer representing the castling status', function() {
      const board = new Board();
      board.parseFenToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // eslint-disable-line

      assert.equal(board.castleStatus, U64('0x8100000000000081'));
    });
  });

  describe('half-move counter', function() {
    it('returns the integer representing the castling status', function() {
      const boardW43hmc = new Board();
      const boardW3hmc = new Board();
      boardW43hmc.parseFenToBoard('r1bqk12/p2p1ppp/2n5/2b1p3/31P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 43 86')
      boardW3hmc.parseFenToBoard('r1bqk12/p2p1ppp/2n5/2b1p3/31P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 6')
      assert.equal(boardW43hmc.halfMoveClock, 43);
      assert.equal(boardW3hmc.halfMoveClock, 3);
    });
  });

  describe('full move number', function() {
    it('returns the integer representing the castling status', function() {
      const boardW83fmn = new Board();
      const boardW3fmn = new Board();
      boardW83fmn.parseFenToBoard('r1bqk12/p2p1ppp/2n5/2b1p3/31P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 21 83')
      boardW3fmn.parseFenToBoard('r1bqk12/p2p1ppp/2n5/2b1p3/31P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 3')
      assert.equal(boardW83fmn.fullMoveNo, 83);
      assert.equal(boardW3fmn.fullMoveNo, 3);
    });
  });

  describe('isSqAttacked()', function() {
    const board = new Board();
    board.parseFenToBoard('1n2kb1r/1bpp1ppp/3qpn1P/r6R/pp4P1/P1N1PQ2/1PPP1PB1/R1B1K1N1 w Qk - 1 11');

    it('should return true if attacked', function() {
      assert.equal(board.isSqAttacked(SquareHelper.for('d5')), true);    
      assert.equal(board.isSqAttacked(SquareHelper.for('b8')), false);     
      assert.equal(board.isSqAttacked(SquareHelper.for('g1')), false);
    });

    // TODO: add attackedbypiece?
  });

  describe('inCheck()', function() {
    const board = new Board();
    const otherBoard = new Board();
    board.parseFenToBoard('3K4/8/8/8/8/2N5/8/3k4 b - - 0 1');
    otherBoard.parseFenToBoard('4k3/6N1/5b2/4R3/8/8/8/4K3 b - - 0 1');

    it('should return true if side to move is in check', function() {
      assert.equal(board.isInCheck(), true);
      assert.equal(otherBoard.isInCheck(), true);
    });

    it('should also return >0 checkerCount', function() {
      assert.equal(board.checkerCount, 1);
      assert.equal(otherBoard.checkerCount, 2);
    })
  });

  describe('legalMoves()', function() {
    it('should show moves that capture the checker', function() {
      const board = new Board();
      board.parseFenToBoard('3K4/8/8/8/8/2b5/1N6/3k4 b - - 0 1');

      assert.equal(board.legalMoves()[0].from, 3);
      assert.equal(board.legalMoves()[0].to, 2);
      assert.equal(board.legalMoves()[1].from, 3);
      assert.equal(board.legalMoves()[1].to, 4);
      assert.equal(board.legalMoves()[2].from, 3);
      assert.equal(board.legalMoves()[2].to, 10);
      assert.equal(board.legalMoves()[3].from, 3);
      assert.equal(board.legalMoves()[3].to, 11);
      assert.equal(board.legalMoves()[4].from, 3);
      assert.equal(board.legalMoves()[4].to, 12);
      assert.equal(board.legalMoves()[5].from, 18);
      assert.equal(board.legalMoves()[5].to, 9);
    });

    it('should show moves that can block the checker', function() {
      const board = new Board();
      board.parseFenToBoard('3K4/8/8/3Q4/8/2b5/8/3k4 b - - 0 1');

      assert.equal(board.legalMoves()[0].from, 3);
      assert.equal(board.legalMoves()[0].to, 2);
      assert.equal(board.legalMoves()[1].from, 3);
      assert.equal(board.legalMoves()[1].to, 4);
      assert.equal(board.legalMoves()[2].from, 3);
      assert.equal(board.legalMoves()[2].to, 10);
      assert.equal(board.legalMoves()[3].from, 3);
      assert.equal(board.legalMoves()[3].to, 12);
      assert.equal(board.legalMoves()[4].from, 18);
      assert.equal(board.legalMoves()[4].to, 11);
      assert.equal(board.legalMoves()[5].from, 18);
      assert.equal(board.legalMoves()[5].to, 27);
    })

    it('when in double check, can only do king moves', function() {
      const board = new Board();
      board.parseFenToBoard('4k3/6N1/5b2/4R3/8/8/8/4K3 b - - 0 1');

      
      assert.equal(board.legalMoves()[0].from, 60);
      assert.equal(board.legalMoves()[0].to, 51);
      assert.equal(board.legalMoves()[1].from, 60);
      assert.equal(board.legalMoves()[1].to, 53);
      assert.equal(board.legalMoves()[2].from, 60);
      assert.equal(board.legalMoves()[2].to, 59);
      assert.equal(board.legalMoves()[3].from, 60);
      assert.equal(board.legalMoves()[3].to, 61);
    });

    it('knows how to handle en passant check evasions', function() {
      const board = new Board();
      board.parseFenToBoard('8/8/8/2k5/3Pp3/8/8/4K3 b - d3 0 1');
      
      assert.equal(board.legalMoves()[0].from, 34);
      assert.equal(board.legalMoves()[0].to, 25);
      assert.equal(board.legalMoves()[1].from, 34);
      assert.equal(board.legalMoves()[1].to, 26);
      assert.equal(board.legalMoves()[2].from, 34);
      assert.equal(board.legalMoves()[2].to, 27);
      assert.equal(board.legalMoves()[3].from, 34);
      assert.equal(board.legalMoves()[3].to, 33);
      assert.equal(board.legalMoves()[4].from, 34);
      assert.equal(board.legalMoves()[4].to, 35);
      assert.equal(board.legalMoves()[5].from, 34);
      assert.equal(board.legalMoves()[5].to, 41);
      assert.equal(board.legalMoves()[6].from, 34);
      assert.equal(board.legalMoves()[6].to, 42);
      assert.equal(board.legalMoves()[7].from, 34);
      assert.equal(board.legalMoves()[7].to, 43);
      assert.equal(board.legalMoves()[8].from, 28);
      assert.equal(board.legalMoves()[8].to, 19);
      
    });
  });

  describe('#xrayBb()', function() {
    it('shows that king is xrayed', function() {
      const board = new Board();
      board.parseFenToBoard('rn2kbnr/ppp2ppp/3p4/4p3/2B1P1bq/P4N2/1PPP1PPP/RNBQK2R w KQkq - 1 5');
      
      assert.equal(board.isOurKingXrayed(), true);
    });

    it('is aware of blockers', function() {
      const board = new Board();
      board.parseFenToBoard('5K2/8/3Q4/8/8/3r4/8/3k4 b - - 0 1');
      assert.equal(board.isOurPiecePinnedToKing(), true);
    });
  });

  describe('#pins()', function() {
    it('should limit moves when pinned', function() {
      const filePin = new Board();
      const filePinPawn = new Board();
      const rankPin = new Board();
      const rankPinPawn = new Board();
      // const diagPin = new Board();
      // const diagPinPawn = new Board();
      // const antiDiagPin = new Board();
      // const antiDiagPinPawn = new Board();

      filePin.parseFenToBoard('4k3/8/4r3/8/8/4Q3/8/2K5 b - - 0 1');
      filePinMoves = filePin.legalMoves();
      filePinPawn.parseFenToBoard('4k3/4p3/3P4/8/4Q3/8/8/2K5 b - - 0 1');
      filePinPawnMoves = filePinPawn.legalMoves();
      rankPin.parseFenToBoard('R2rk3/8/8/8/8/8/8/2K5 b - - 0 1');
      rankPinMoves = rankPin.legalMoves();
      rankPinPawn.parseFenToBoard('8/1R2pk2/8/8/8/8/8/2K5 b - - 0 1');
      rankPinPawnMoves = rankPinPawn.legalMoves()
      // diagPin.parseFenToBoard('4k3/3r4/8/1B6/8/8/8/2K5 b - - 0 1');
      // diagPinMoves = diagPin.legalMoves()
      // diagPinPawn.parseFenToBoard('4k3/3p4/8/1B6/8/8/8/2K5 b - - 0 1');
      // antiDiagPin.parseFenToBoard('4k3/5r2/8/7B/8/8/8/2K5 b - - 0 1');
      // antiDiagPinPawn.parseFenToBoard('8/2k5/3p4/8/5Q2/8/8/2K5 b - - 0 1');

      // console.log(diagPinMoves)

      assert.equal(filePinMoves[0].from, 60)
      assert.equal(filePinMoves[0].to, 51)
      assert.equal(filePinMoves[1].from, 60)
      assert.equal(filePinMoves[1].to, 52)
      assert.equal(filePinMoves[2].from, 60)
      assert.equal(filePinMoves[2].to, 53)
      assert.equal(filePinMoves[3].from, 60)
      assert.equal(filePinMoves[3].to, 59)
      assert.equal(filePinMoves[4].from, 60)
      assert.equal(filePinMoves[4].to, 61)
      assert.equal(filePinMoves[5].from, 44)
      assert.equal(filePinMoves[5].to, 20)
      assert.equal(filePinMoves[6].from, 44)
      assert.equal(filePinMoves[6].to, 28)
      assert.equal(filePinMoves[7].from, 44)
      assert.equal(filePinMoves[7].to, 36)
      assert.equal(filePinMoves[8].from, 44)
      assert.equal(filePinMoves[8].to, 52)

      assert.equal(filePinPawnMoves[0].from, 60)
      assert.equal(filePinPawnMoves[0].to, 51)
      assert.equal(filePinPawnMoves[1].from, 60)
      assert.equal(filePinPawnMoves[1].to, 53)
      assert.equal(filePinPawnMoves[2].from, 60)
      assert.equal(filePinPawnMoves[2].to, 59)
      assert.equal(filePinPawnMoves[3].from, 60)
      assert.equal(filePinPawnMoves[3].to, 61)
      assert.equal(filePinPawnMoves[4].from, 52)
      assert.equal(filePinPawnMoves[4].to, 36)
      assert.equal(filePinPawnMoves[5].from, 52)
      assert.equal(filePinPawnMoves[5].to, 44)

      assert.equal(rankPinMoves[0].from, 60)
      assert.equal(rankPinMoves[0].to, 51)
      assert.equal(rankPinMoves[1].from, 60)
      assert.equal(rankPinMoves[1].to, 52)
      assert.equal(rankPinMoves[2].from, 60)
      assert.equal(rankPinMoves[2].to, 53)
      assert.equal(rankPinMoves[3].from, 60)
      assert.equal(rankPinMoves[3].to, 61)
      assert.equal(rankPinMoves[4].from, 59)
      assert.equal(rankPinMoves[4].to, 56)
      assert.equal(rankPinMoves[5].from, 59)
      assert.equal(rankPinMoves[5].to, 57)
      assert.equal(rankPinMoves[6].from, 59)
      assert.equal(rankPinMoves[6].to, 58)

      assert.equal(rankPinPawnMoves[0].from, 53)
      assert.equal(rankPinPawnMoves[0].to, 44)
      assert.equal(rankPinPawnMoves[1].from, 53)
      assert.equal(rankPinPawnMoves[1].to, 45)
      assert.equal(rankPinPawnMoves[2].from, 53)
      assert.equal(rankPinPawnMoves[2].to, 46)
      assert.equal(rankPinPawnMoves[3].from, 53)
      assert.equal(rankPinPawnMoves[3].to, 54)
      assert.equal(rankPinPawnMoves[4].from, 53)
      assert.equal(rankPinPawnMoves[4].to, 60)
      assert.equal(rankPinPawnMoves[5].from, 53)
      assert.equal(rankPinPawnMoves[5].to, 61)
      assert.equal(rankPinPawnMoves[6].from, 53)
      assert.equal(rankPinPawnMoves[6].to, 62)
    });
  });
});

// PieceBoard should return BigInts
// Not sure if this is good as it relies on the parent class
describe('PieceBoard', function() {
  describe('.bb', function() {
    it('returns the correct bigint', function() {
      const boardWRooksAtCorner = new Board();
      boardWRooksAtCorner.parseFenToBoard('r2qkb1r/p1ppnppp/bpn1p3/8/5P2/4PNP1/PPPP2BP/RNBQK2R w KQkq - 3 6');
      assert.equal(boardWRooksAtCorner.pieceBoardList.r.bb, 9295429630892703744n);
      assert.equal(boardWRooksAtCorner.pieceBoardList.R.bb, 129n);
    });
  });
});

// PawnBoards, RookBoards, etc are children of PieceBoard
describe('PawnBoard', function() {
  describe('#moves()', function() {
    it('returns legal pawn moves', function() {
      const boardWManyPawnAttacks = new Board();
      boardWManyPawnAttacks.parseFenToBoard('rnbqkbnr/1p2pp1p/8/p1pp2p1/1P2PP1P/8/P1PP2P1/RNBQKBNR');

      let whitePawnMoves = boardWManyPawnAttacks.moves('P');
      let blackPawnMoves = boardWManyPawnAttacks.moves('p');

      assert.equal(whitePawnMoves[0].from, 8);
      assert.equal(whitePawnMoves[0].to, 16);
      assert.equal(whitePawnMoves[1].from, 8);
      assert.equal(whitePawnMoves[1].to, 24);
      assert.equal(whitePawnMoves[2].from, 10);
      assert.equal(whitePawnMoves[2].to, 18);
      assert.equal(whitePawnMoves[3].from, 10);
      assert.equal(whitePawnMoves[3].to, 26);
      assert.equal(whitePawnMoves[4].from, 11);
      assert.equal(whitePawnMoves[4].to, 19);
      assert.equal(blackPawnMoves[0].from, 32);
      assert.equal(blackPawnMoves[0].to, 24);
      assert.equal(blackPawnMoves[1].from, 32);
      assert.equal(blackPawnMoves[1].to, 25);
      assert.equal(blackPawnMoves[2].from, 34);
      assert.equal(blackPawnMoves[2].to, 25);
      assert.equal(blackPawnMoves[3].from, 34);
      assert.equal(blackPawnMoves[3].to, 26);
      assert.equal(blackPawnMoves[4].from, 35);
      assert.equal(blackPawnMoves[4].to, 27);
    });

    it('shows threats', function() {
      const wBoardWAttacks = new Board();
      wBoardWAttacks.parseFenToBoard('r1bqkbnr/pppppppp/8/n7/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 1 3');
      let whitePawnMoves = wBoardWAttacks.moves('P')
      
      const bBoardWAttacks = new Board();
      bBoardWAttacks.parseFenToBoard('r1bqkb1r/pppp1ppp/5n2/4P3/3Q4/8/PPP2PPP/RNB1KB1R b KQkq - 0 6');
      let blackPawnMoves = bBoardWAttacks.moves('p')

      assert.equal(whitePawnMoves[3].threat, true);
      assert.equal(blackPawnMoves[4].threat, true);
    });

    it('shows checks', function() {
      const wBoardWChecks = new Board();
      wBoardWChecks.parseFenToBoard('r1bqkb1r/pp2pppp/4Pn2/n1pp1P2/8/8/PPPP2PP/RNBQKBNR w KQkq - 1 6');
      let whitePawnMoves = wBoardWChecks.moves('P')

      const bBoardWChecks = new Board();
      bBoardWChecks.parseFenToBoard('rnbq1bnr/pp2pkpp/8/3p4/5P2/2p2N2/PPPP2PP/RNBQKB1R b KQ - 1 6');

      let blackPawnMoves = bBoardWChecks.moves('p');


      // add white pawn moves
      assert.equal(blackPawnMoves[1].capture, true);
      assert.equal(blackPawnMoves[1].check, true);
    });

    it('knows en passant', function() {
      const boardWep = new Board();
      boardWep.parseFenToBoard('rnbq1bnr/p1p1kppp/8/1pPpp3/4P3/8/PP1PKPPP/RNBQ1BNR w - b6 0 5');
      let whitePawnMoves = boardWep.moves('P')
      
      const boardBlkWep = new Board();
      boardBlkWep.parseFenToBoard('rnbq1bnr/p1p1kppp/8/2Ppp3/Pp2P3/3P4/1P2KPPP/RNBQ1BNR b - a3 0 6');
      let blackPawnMoves = boardBlkWep.moves('p');

      assert.equal(whitePawnMoves[13].capture, true);
      assert.equal(whitePawnMoves[13].ep, true);
      assert.equal(blackPawnMoves[0].capture, true);
      assert.equal(blackPawnMoves[0].ep, true);
    });

    it('knows promotions', function() {
      const board = new Board();
      board.parseFenToBoard('r2qkb1r/pP1b1ppp/2n2n2/4p3/8/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 3 7');
      const whitePawnMoves = board.legalMoves();
      
      assert.equal(whitePawnMoves[30].promoteTo, 'Q');
      assert.equal(whitePawnMoves[31].promoteTo, 'R');
      assert.equal(whitePawnMoves[32].promoteTo, 'B');
      assert.equal(whitePawnMoves[33].promoteTo, 'N');
      assert.equal(whitePawnMoves[34].promoteTo, 'Q');
      assert.equal(whitePawnMoves[35].promoteTo, 'R');
      assert.equal(whitePawnMoves[36].promoteTo, 'B');
      assert.equal(whitePawnMoves[37].promoteTo, 'N');
    });
  });
});

describe('KnightBoard', function() {
  describe('#moves()', function() {
    it('returns legal moves', function() {
      const boardWManyKnightMoves = new Board();
      boardWManyKnightMoves.parseFenToBoard('rnbqkb1r/ppppp1pp/n7/5p2/3P1PN1/2P5/PP2P1PP/RNBQKB1R b KQkq - 1 6');

      let blackKnightMoves = boardWManyKnightMoves.moves('n');

      assert.equal(blackKnightMoves[0].from, 40);
      assert.equal(blackKnightMoves[0].to, 25);
      assert.equal(blackKnightMoves[1].from, 40);
      assert.equal(blackKnightMoves[1].to, 34);
      assert.equal(blackKnightMoves[2].from, 57);
      assert.equal(blackKnightMoves[2].to, 42);
    });

    it('shows threats', function() {
      const boardWManyKnightAttacks = new Board();
      boardWManyKnightAttacks.parseFenToBoard('1nb1kb1r/1ppp1ppp/2n3q1/pQ1rp3/P3P1P1/1PN2N1P/2PP1P2/R1B1KB1R w KQk - 5 10');
     
      let whiteKnightMoves = boardWManyKnightAttacks.moves('N');

      assert.equal(whiteKnightMoves[8].threat, true);

    });

    it('shows checks', function() {
      const boardWKnightChecks = new Board();
      boardWKnightChecks.parseFenToBoard('r1bqkb1r/pppp1ppp/5n2/3Np3/3nP3/5N2/PPPP1PPP/R1BQKB1R w KQkq - 6 5');

      let whiteKnightMoves = boardWKnightChecks.moves('N');

      assert.equal(whiteKnightMoves[10].check, true);
      assert.equal(whiteKnightMoves[11].check, true);
    });
  });
});

describe('BishopBoard', function() {
  describe('#moves()', function() {
    const boardWManyBishopAttacks = new Board()
    boardWManyBishopAttacks.parseFenToBoard('rn2k2r/p1pq1ppp/1p1p1n2/2b1p3/2B1P1b1/BPNP4/P1PQ1PPP/R3K1NR w KQkq - 6 8');

    let whiteBishopMoves = boardWManyBishopAttacks.moves('B');

    it('returns legal moves', function() {
      assert.equal(whiteBishopMoves[0].from, 16);
      assert.equal(whiteBishopMoves[0].to, 2);
      assert.equal(whiteBishopMoves[1].from, 16);
      assert.equal(whiteBishopMoves[1].to, 9);
      assert.equal(whiteBishopMoves[2].from, 16);
      assert.equal(whiteBishopMoves[2].to, 25);
      assert.equal(whiteBishopMoves[3].from, 16);
      assert.equal(whiteBishopMoves[3].to, 34);
      assert.equal(whiteBishopMoves[4].from, 26);
      assert.equal(whiteBishopMoves[4].to, 33);
      assert.equal(whiteBishopMoves[5].from, 26);
      assert.equal(whiteBishopMoves[5].to, 35);
      assert.equal(whiteBishopMoves[6].from, 26);
      assert.equal(whiteBishopMoves[6].to, 40);
      assert.equal(whiteBishopMoves[7].from, 26);
      assert.equal(whiteBishopMoves[7].to, 44);
      assert.equal(whiteBishopMoves[8].from, 26);
      assert.equal(whiteBishopMoves[8].to, 53);
    });

    it('shows threats', function() {
      assert.equal(whiteBishopMoves[4].threat, true);
    });

    it('shows checks', function() {
      assert.equal(whiteBishopMoves[8].check, true);
    });
  });
});

describe('RookBoard', function() {
  describe('#moves()', function() {
    const boardWManyRookAttacks = new Board();
    boardWManyRookAttacks.parseFenToBoard('1nb1kb2/1pqpppp1/2pr1r1n/p6p/P3R2P/2R2P2/1PPPPKP1/1NBQ1BN1 b - - 5 10');

    let blackRookMoves = boardWManyRookAttacks.moves('r');

    it('returns legal moves', function() {
      assert.equal(blackRookMoves[0].from, 43);
      assert.equal(blackRookMoves[0].to, 11);
      assert.equal(blackRookMoves[1].from, 43);
      assert.equal(blackRookMoves[1].to, 19);
      assert.equal(blackRookMoves[2].from, 43);
      assert.equal(blackRookMoves[2].to, 27);
      assert.equal(blackRookMoves[3].from, 43);
      assert.equal(blackRookMoves[3].to, 35);
      assert.equal(blackRookMoves[4].from, 43);
      assert.equal(blackRookMoves[4].to, 44);
      assert.equal(blackRookMoves[5].from, 45);
      assert.equal(blackRookMoves[5].to, 21);
      assert.equal(blackRookMoves[6].from, 45);
      assert.equal(blackRookMoves[6].to, 29);
      assert.equal(blackRookMoves[7].from, 45);
      assert.equal(blackRookMoves[7].to, 37);
      assert.equal(blackRookMoves[8].from, 45);
      assert.equal(blackRookMoves[8].to, 44);
      assert.equal(blackRookMoves[9].from, 45);
      assert.equal(blackRookMoves[9].to, 46);
    });

    it('shows threats', function() {
      assert.equal(blackRookMoves[0].threat, true);
    });

    it('shows checks', function() {
      assert.equal(blackRookMoves[5].check, true);
    });
  });
});

describe('QueenBoard', function() {
  describe('#moves()', function() {
    const boardWManyQueenAttacks = new Board();
    boardWManyQueenAttacks.parseFenToBoard('rnb1kbnr/pp1p1ppp/8/q1p1p2Q/4P3/5N2/PPPP1PPP/RNB1KB1R w KQkq - 2 4');

    let whiteQueenMoves = boardWManyQueenAttacks.moves('Q');

    it('returns legal moves', function() {
      assert.equal(whiteQueenMoves[0].from, 39)
      assert.equal(whiteQueenMoves[0].to, 23)
      assert.equal(whiteQueenMoves[1].from, 39)
      assert.equal(whiteQueenMoves[1].to, 30)
      assert.equal(whiteQueenMoves[2].from, 39)
      assert.equal(whiteQueenMoves[2].to, 31)
      assert.equal(whiteQueenMoves[3].from, 39)
      assert.equal(whiteQueenMoves[3].to, 36)
      assert.equal(whiteQueenMoves[4].from, 39)
      assert.equal(whiteQueenMoves[4].to, 37)
      assert.equal(whiteQueenMoves[5].from, 39)
      assert.equal(whiteQueenMoves[5].to, 38)
      assert.equal(whiteQueenMoves[6].from, 39)
      assert.equal(whiteQueenMoves[6].to, 46)
      assert.equal(whiteQueenMoves[7].from, 39)
      assert.equal(whiteQueenMoves[7].to, 47)
      assert.equal(whiteQueenMoves[8].from, 39)
      assert.equal(whiteQueenMoves[8].to, 53)
      assert.equal(whiteQueenMoves[9].from, 39)
      assert.equal(whiteQueenMoves[9].to, 55)
    });

    it('shows checks', function() {
      assert.equal(whiteQueenMoves[8].check, true)
    });
  });
});

describe('KingBoard', function() {
  describe('#moves()', function() {
    it('returns legal moves', function() {
      const boardWManyKingMoves = new Board();
      boardWManyKingMoves.parseFenToBoard('1r3r2/p1pp3p/Pp1k2p1/3p1p2/5P1P/2K1P3/P1PP3P/R1B4R w - - 0 19');

      let whiteKingMoves = boardWManyKingMoves.moves('K');

      assert.equal(whiteKingMoves[0].from, 18)
      assert.equal(whiteKingMoves[0].to, 9)
      assert.equal(whiteKingMoves[1].from, 18)
      assert.equal(whiteKingMoves[1].to, 17)
      assert.equal(whiteKingMoves[2].from, 18)
      assert.equal(whiteKingMoves[2].to, 19)
      assert.equal(whiteKingMoves[3].from, 18)
      assert.equal(whiteKingMoves[3].to, 25)
      assert.equal(whiteKingMoves[4].from, 18)
      assert.equal(whiteKingMoves[4].to, 27)
    });

    it('can castle', function() {
      const boardWCastles = new Board();
      boardWCastles.parseFenToBoard('r3k2r/ppqbbppp/3p1n2/4p1B1/2B1P3/2N4P/PPPQ1PP1/R3K2R w KQkq - 1 11');

      let whiteKingMoves = boardWCastles.moves('K');

      assert.equal(whiteKingMoves[0].castle, true)
      assert.equal(whiteKingMoves[3].castle, true)
    });

    it('cannot castle when in check', function() {
      const board = new Board();
      board.parseFenToBoard('r1bqk2r/pppp1ppp/2n1pn2/1B6/1b1PP3/5N2/PPP2PPP/RNBQK2R w KQkq - 5 5');
      const kingMoves = board.legalMoves()

      assert.equal(kingMoves[0].from, 4)
      assert.equal(kingMoves[0].to, 5)
      assert.equal(kingMoves[1].from, 4)
      assert.equal(kingMoves[1].to, 12)
    })

    it('cannot move to a square attacked by a rook', function() {
      const boardWSqAttackedByRook = new Board();
      boardWSqAttackedByRook.parseFenToBoard('4k3/8/8/5R2/8/8/8/4K3 b - - 0 1');

      let blackKingMoves = boardWSqAttackedByRook.moves('k');

      assert.equal(blackKingMoves.length, 3);
    });

    it('should not move to a blocked square', function() {
      const boardWSqAttackedByRook = new Board();
      boardWSqAttackedByRook.parseFenToBoard('8/4k3/8/8/4R3/8/8/4K3 b - - 0 1');

      let blackKingMoves = boardWSqAttackedByRook.moves('k');

      assert.equal(blackKingMoves.length, 6);
    })
  });
});

// BoardView should return Strings
/* eslint-disable max-len */
describe('BoardView', function() {
  // in binary, you have to read from right to left
  // so you need to imagine going through the FEN in reverse order of rank and file
  // ...b8b7b6b5b4b3b2b1a8a7a6a5a4a3a2a1
  // with this function, this makes it easier to understand for regular people
  describe('#display()', function() {
    it('shows the all the pieces on the board', function() {
      const board = new Board();
      board.parseFenToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // eslint-disable-line

      assert.equal(new BoardView(board.pieceBoardList).display(), '11111111\n11111111\n00000000\n00000000\n00000000\n00000000\n11111111\n11111111');
    });

    it('correctly flips the board', function() {
      const flippedBoard = new Board();
      flippedBoard.parseFenToBoard('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq ');
      flippedBoard.flipBoard();

      assert.equal(new BoardView(flippedBoard.pieceBoardList).display(), '11111001\n11110111\n00000100\n00101000\n00101000\n00100000\n11110111\n10111011');
    });
  });
});
/* eslint-enable max-len */

// SquareHelper should return integer indices
describe('SquareHelper', function() {
  describe('#indicesFor', function() {
    const board = new Board();
    board.parseFenToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // eslint-disable-line
    const rookBoard = board.pieceBoardList.r;
    const bKingBoard = board.pieceBoardList.k;
    const wKingBoard = board.pieceBoardList.K;

    it('shows indices of black rook', function() {
      assert.equal(SquareHelper.indicesFor(rookBoard.bb)[0], 56);
      assert.equal(SquareHelper.indicesFor(rookBoard.bb)[1], 63);
    });

    it('shows indices of black king', function() {
      assert.equal(SquareHelper.indicesFor(bKingBoard.bb)[0], 60);
    });

    it('shows indices of white king', function() {
      assert.equal(SquareHelper.indicesFor(wKingBoard.bb)[0], 4);
    });
  });
});

