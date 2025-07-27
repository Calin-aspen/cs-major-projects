tabla = [];
for (var i = 0; i < 8; i++) {
    tabla[i] = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];
}
tabla[0] = ['bt', 'bc', 'bd', 'bn', 'br', 'bd', 'bc', 'bt'];
tabla[1] = ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'];
tabla[6] = ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'];
tabla[7] = ['wt', 'wc', 'wd', 'wn', 'wr', 'wd', 'wc', 'wt'];
take = [];
function reset_take() {
    for (var i = 0; i < 8; i++) {
        take[i] = [false, false, false, false, false, false, false, false];
    }
}
reset_take();
whitemoves = true;
heldX = -1;
heldY = -1;
whatWasHeldPiece = 'x';

// Variabile pentru mutări speciale
var enPassantTarget = null;
var enPassantPossible = false;
var castlingRights = {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true
};
var kingHasMoved = { white: false, black: false };
var rookHasMoved = { 
    white: { kingside: false, queenside: false },
    black: { kingside: false, queenside: false }
};

function existaog(i, j) {
    return (0 <= i && i < 8 && 0 <= j && j < 8);
}

function esteSah(tablaTemp, isWhite) {
    let regeX = -1;
    let regeY = -1;
    const kingColor = isWhite ? 'w' : 'b';
    const enemyColor = isWhite ? 'b' : 'w';
    
    for (let k = 0; k < 8; k++) {
        for (let l = 0; l < 8; l++) {
            if (tablaTemp[k][l] === kingColor + 'r') {
                regeX = k;
                regeY = l;
                break;
            }
        }
        if (regeX !== -1) break;
    }

    // Verifică atacurile pionilor
    const pawnDir = isWhite ? 1 : -1;
    if (existaog(regeX - pawnDir, regeY - 1) && tablaTemp[regeX - pawnDir][regeY - 1] === enemyColor + 'p') {
        return true;
    }
    if (existaog(regeX - pawnDir, regeY + 1) && tablaTemp[regeX - pawnDir][regeY + 1] === enemyColor + 'p') {
        return true;
    }

    // Verifică atacurile cailor
    const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];
    for (const [dx, dy] of knightMoves) {
        const x = regeX + dx;
        const y = regeY + dy;
        if (existaog(x, y) && tablaTemp[x][y] === enemyColor + 'c') {
            return true;
        }
    }

    // Verifică atacurile pe diagonală (nebun/regină)
    const diagonalDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dx, dy] of diagonalDirections) {
        for (let k = 1; k < 8; k++) {
            const x = regeX + dx * k;
            const y = regeY + dy * k;
            if (!existaog(x, y)) break;
            
            const piece = tablaTemp[x][y];
            if (piece === 'x') continue;
            
            if (piece === enemyColor + 'd' || piece === enemyColor + 'n') {
                return true;
            }
            break;
        }
    }

    // Verifică atacurile pe linie dreaptă (turn/regină)
    const straightDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dy] of straightDirections) {
        for (let k = 1; k < 8; k++) {
            const x = regeX + dx * k;
            const y = regeY + dy * k;
            if (!existaog(x, y)) break;
            
            const piece = tablaTemp[x][y];
            if (piece === 'x') continue;
            
            if (piece === enemyColor + 't' || piece === enemyColor + 'n') {
                return true;
            }
            break;
        }
    }

    // Verifică atacurile regelui advers
    const kingDirections = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    for (const [dx, dy] of kingDirections) {
        const x = regeX + dx;
        const y = regeY + dy;
        if (existaog(x, y) && tablaTemp[x][y] === enemyColor + 'r') {
            return true;
        }
    }

    return false;
}

function exista(i, j) {
    if (!existaog(i, j)) {
        return false;
    }

    // Nu poți lua piesa ta
    if (tabla[i][j] !== 'x' && tabla[i][j][0] === (whitemoves ? 'w' : 'b')) {
        return false;
    }

    let tabla2 = JSON.parse(JSON.stringify(tabla));
    tabla2[heldX][heldY] = 'x';
    tabla2[i][j] = whatWasHeldPiece;

    // Verifică dacă mutarea lasă regele în șah
    return !esteSah(tabla2, whitemoves);
}

function estealb(x, y) {
    return tabla[x][y][0] == 'w';
}

function btnf(id) {
    var i = Math.floor((id - 1) / 8);
    var j = (id - 1) % 8;
    
    if (heldX == -1 && heldY == -1) {
        // Ridicarea piesei
        if ((whitemoves && estealb(i, j)) || (!whitemoves && !estealb(i, j))) {
            heldX = i;
            heldY = j;
            whatWasHeldPiece = tabla[i][j];
            reset_take();
            
            switch(whatWasHeldPiece[1]) {
                case 'p': // Pion
                    const dir = whitemoves ? -1 : 1;
                    const startRow = whitemoves ? 6 : 1;
                    
                    // Mutări înainte
                    if (exista(i + dir, j) && tabla[i + dir][j] == 'x') {
                        take[i + dir][j] = true;
                        if (i == startRow && tabla[i + 2*dir][j] == 'x') {
                            take[i + 2*dir][j] = true;
                        }
                    }
                    
                    // Capturi normale
                    if (exista(i + dir, j - 1) && tabla[i + dir][j - 1] != 'x' && estealb(i + dir, j - 1) != whitemoves) {
                        take[i + dir][j - 1] = true;
                    }
                    if (exista(i + dir, j + 1) && tabla[i + dir][j + 1] != 'x' && estealb(i + dir, j + 1) != whitemoves) {
                        take[i + dir][j + 1] = true;
                    }
                    
                    // En passant
                    if (enPassantPossible && enPassantTarget && i == enPassantTarget[0]) {
                        if (j - 1 == enPassantTarget[1] && exista(i + dir, j - 1)) {
                            take[i + dir][j - 1] = true;
                        }
                        if (j + 1 == enPassantTarget[1] && exista(i + dir, j + 1)) {
                            take[i + dir][j + 1] = true;
                        }
                    }
                    break;
                    
                case 'c': // Cal
                    const knightMoves = [
                        [2,1], [2,-1], [-2,1], [-2,-1],
                        [1,2], [1,-2], [-1,2], [-1,-2]
                    ];
                    for (const [di, dj] of knightMoves) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (exista(ni, nj) && (tabla[ni][nj] == 'x' || estealb(ni, nj) != whitemoves)) {
                            take[ni][nj] = true;
                        }
                    }
                    break;
                    
                case 't': // Turn
                    const rookDirs = [[1,0], [-1,0], [0,1], [0,-1]];
                    for (const [di, dj] of rookDirs) {
                        for (let k = 1; k < 8; k++) {
                            const ni = i + di*k;
                            const nj = j + dj*k;
                            if (!exista(ni, nj)) break;
                            if (tabla[ni][nj] != 'x' && estealb(ni, nj) == whitemoves) break;
                            take[ni][nj] = true;
                            if (tabla[ni][nj] != 'x') break;
                        }
                    }
                    break;
                    
                case 'd': // Nebun
                    const bishopDirs = [[1,1], [1,-1], [-1,1], [-1,-1]];
                    for (const [di, dj] of bishopDirs) {
                        for (let k = 1; k < 8; k++) {
                            const ni = i + di*k;
                            const nj = j + dj*k;
                            if (!exista(ni, nj)) break;
                            if (tabla[ni][nj] != 'x' && estealb(ni, nj) == whitemoves) break;
                            take[ni][nj] = true;
                            if (tabla[ni][nj] != 'x') break;
                        }
                    }
                    break;
                    
                case 'n': // Regină
                    const queenDirs = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
                    for (const [di, dj] of queenDirs) {
                        for (let k = 1; k < 8; k++) {
                            const ni = i + di*k;
                            const nj = j + dj*k;
                            if (!exista(ni, nj)) break;
                            if (tabla[ni][nj] != 'x' && estealb(ni, nj) == whitemoves) break;
                            take[ni][nj] = true;
                            if (tabla[ni][nj] != 'x') break;
                        }
                    }
                    break;
                    
                case 'r': // Rege
                    const kingMoves = [
                        [1,0], [-1,0], [0,1], [0,-1],
                        [1,1], [1,-1], [-1,1], [-1,-1]
                    ];
                    for (const [di, dj] of kingMoves) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (exista(ni, nj) && (tabla[ni][nj] == 'x' || estealb(ni, nj) != whitemoves)) {
                            take[ni][nj] = true;
                        }
                    }
                    
                    // Rocadă
                    if (!kingHasMoved[whitemoves ? 'white' : 'black']) {
                        const row = whitemoves ? 7 : 0;
                        
                        // Rocadă mică
                        if ((whitemoves ? castlingRights.whiteKingside : castlingRights.blackKingside) &&
                            tabla[row][5] == 'x' && tabla[row][6] == 'x') {
                            // Verifică dacă pătratele nu sunt în șah
                            let tempTabla = JSON.parse(JSON.stringify(tabla));
                            tempTabla[row][4] = 'x';
                            tempTabla[row][5] = (whitemoves ? 'w' : 'b') + 'r';
                            if (!esteSah(tempTabla, whitemoves)) {
                                tempTabla[row][5] = 'x';
                                tempTabla[row][6] = (whitemoves ? 'w' : 'b') + 'r';
                                if (!esteSah(tempTabla, whitemoves)) {
                                    take[row][6] = true;
                                }
                            }
                        }
                        
                        // Rocadă mare
                        if ((whitemoves ? castlingRights.whiteQueenside : castlingRights.blackQueenside) &&
                            tabla[row][3] == 'x' && tabla[row][2] == 'x' && tabla[row][1] == 'x') {
                            // Verifică dacă pătratele nu sunt în șah
                            let tempTabla = JSON.parse(JSON.stringify(tabla));
                            tempTabla[row][4] = 'x';
                            tempTabla[row][3] = (whitemoves ? 'w' : 'b') + 'r';
                            if (!esteSah(tempTabla, whitemoves)) {
                                tempTabla[row][3] = 'x';
                                tempTabla[row][2] = (whitemoves ? 'w' : 'b') + 'r';
                                if (!esteSah(tempTabla, whitemoves)) {
                                    take[row][2] = true;
                                }
                            }
                        }
                    }
                    break;
            }
            update();
        }
    } else {
        // Plasarea piesei
        if (take[i][j]) {
            // Captură en passant
            if (whatWasHeldPiece[1] == 'p' && j != heldY && tabla[i][j] == 'x') {
                tabla[heldX][j] = 'x'; // Elimină pionul capturat
            }
            
            // Rocadă - mută tura
            if (whatWasHeldPiece[1] == 'r' && Math.abs(j - heldY) > 1) {
                const row = whitemoves ? 7 : 0;
                if (j > heldY) { // Rocadă mică
                    tabla[row][5] = tabla[row][7];
                    tabla[row][7] = 'x';
                } else { // Rocadă mare
                    tabla[row][3] = tabla[row][0];
                    tabla[row][0] = 'x';
                }
            }
            
            // Actualizează ținta en passant
            if (whatWasHeldPiece[1] == 'p' && Math.abs(i - heldX) == 2) {
                enPassantTarget = [i + (heldX - i)/2, j];
                enPassantPossible = true;
            } else {
                enPassantPossible = false;
                enPassantTarget = null;
            }
            
            // Actualizează drepturile de rocadă
            if (whatWasHeldPiece == 'wr') {
                kingHasMoved.white = true;
                castlingRights.whiteKingside = false;
                castlingRights.whiteQueenside = false;
            } else if (whatWasHeldPiece == 'br') {
                kingHasMoved.black = true;
                castlingRights.blackKingside = false;
                castlingRights.blackQueenside = false;
            } else if (whatWasHeldPiece == 'wt' && heldY == 0) {
                rookHasMoved.white.queenside = true;
                castlingRights.whiteQueenside = false;
            } else if (whatWasHeldPiece == 'wt' && heldY == 7) {
                rookHasMoved.white.kingside = true;
                castlingRights.whiteKingside = false;
            } else if (whatWasHeldPiece == 'bt' && heldY == 0) {
                rookHasMoved.black.queenside = true;
                castlingRights.blackQueenside = false;
            } else if (whatWasHeldPiece == 'bt' && heldY == 7) {
                rookHasMoved.black.kingside = true;
                castlingRights.blackKingside = false;
            }
            
            // Efectuează mutarea
            tabla[heldX][heldY] = 'x';
            tabla[i][j] = whatWasHeldPiece;
            
            heldX = -1;
            heldY = -1;
            whitemoves = !whitemoves;
            reset_take();
            update();
        } else {
            heldX = -1;
            heldY = -1;
            reset_take();
            update();
        }
    }
}

function update() {
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var p = i * 8 + j + 1;
            var btn = document.getElementById("btn" + p);
            btn.innerText = tabla[i][j];
            var map = {
                'bt': 'Chess_rdt60.png',
                'bc': 'Chess_ndt60.png',
                'bd': 'Chess_bdt60.png',
                'br': 'Chess_kdt60.png',
                'bn': 'Chess_qdt60.png',
                'bp': 'Chess_pdt60.png',
                'wt': 'Chess_rlt60.png',
                'wd': 'Chess_blt60.png',
                'wc': 'Chess_nlt60.png',
                'wr': 'Chess_klt60.png',
                'wn': 'Chess_qlt60.png',
                'wp': 'Chess_plt60.png',
                '.': 'circle.png'
            };
            
            if (tabla[i][j] == 'x') {
                if (take[i][j]) {
                    // Arată cerc pentru mutări posibile
                    if (enPassantPossible && enPassantTarget && i == enPassantTarget[0] && 
                        (j == enPassantTarget[1] - 1 || j == enPassantTarget[1] + 1)) {
                        btn.innerHTML = "<img src='circle.png' class='piesa' width='50px' height='50px'>";
                    } else if (!enPassantPossible || !enPassantTarget || i != enPassantTarget[0]) {
                        btn.innerHTML = "<img src='circle.png' class='piesa' width='50px' height='50px'>";
                    }
                } else {
                    btn.innerHTML = "";
                }
                btn.style.backgroundColor = "";
            } else {
                if (take[i][j]) {
                    btn.style.backgroundColor = "red";
                } else {
                    btn.style.backgroundColor = "";
                }
                btn.innerHTML = "<img src='" + map[tabla[i][j]] + "' class='piesa' width='50px' height='50px'>";
            }
        }
    }
}
update();