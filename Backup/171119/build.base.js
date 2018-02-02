
/** @function iswall Prüft ob sich an einer Position mit der ausdehnung x,y eine wall befindet
 * @param {RoomPosition} lookpos **/

function iswall(lookpos, x, y) {
    var terr = Game.rooms[lookpos.roomName].lookForAtArea(LOOK_TERRAIN, (lookpos.y - Math.floor(y / 2)), (lookpos.x - Math.floor(x / 2)), (lookpos.y + Math.ceil(y / 2)), (lookpos.x + Math.ceil(x / 2)), true)
    var istwall = false
    var xroom = lookpos.roomName
    new RoomVisual(xroom).circle(lookpos.x, lookpos.y, { radius: 0.30, stroke: 'black' })
    for (var i in terr) {
        if (terr[i].terrain == 'wall') {
            istwall = true
        } else {
        }
    }
    if (istwall == false) {

        var xroom = lookpos.roomName
        for (var i in terr) {
            //new RoomVisual(xroom).circle(terr[i].x, terr[i].y, { radius: 0.30, stroke: 'black' })
        }
    }
    return istwall
}

/**@function findplot findet eine stelle an der ein feld mit der größe 3x3 frei ist. es werden die richtungen 'links' und 'rechts' unterstützt 
*  @param {RoomPosition} roompos 
*  @param {string} richtung
* */

function findplot(roompos, richtung) {
    var istwall = iswall(roompos)
    while (istwall) {
        if (richtung == 'links') {
            roompos.x = roompos.x - 1
        } else {
            roompos.x = roompos.x + 1
        }
        istwall = iswall(roompos)
    }
}

/**@function findplotuz findet eine stelle an der ein feld mit der größe gx,gy frei ist. Die Suche erfolgt in einer Schritten im Kreis.
*  @param {RoomPosition} roompos 
*  @param {string} richtung
* */
function findplotuz(roompos, gx, gy) {
    const room = Game.rooms[roompos.roomName]
    const rahmenx = 49
    const rahmeny = 49
    var dx = roompos.x - rahmenx / 2
    var dy = roompos.y - rahmeny / 2
    var fxw = Math.ceil((rahmenx - gx) / 2) - dx - 3
    var fxo = Math.floor((rahmenx - gx) / 2) + dx - 3
    var fyn = Math.ceil((rahmeny - gy) / 2) - dy - 3
    var fys = Math.floor((rahmeny - gy) / 2) + dy - 3
    var boundn = 3 + Math.ceil(gy / 2)
    var bounds = 46 - Math.floor(gy / 2)
    var boundo = 46 - Math.floor(gx / 2)
    var boundw = 3 + Math.Ceil(gx / 2)
    var spotx = roompos.x
    var spoty = roompos.y
    for (var i = 0; i < fxw; i++) {
        spotx = spotx - 1
        if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
        } else {
            if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                return room.getPositionAt(spotx, spoty)
            }
        }
        for (var j = 0; j < i * 2 + 1; j++) {
            spoty = spoty - 1
            if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
            } else {
                if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                    return room.getPositionAt(spotx, spoty)
                }
            }
        }
        for (var j = 0; j < i * 2 + 2; j++) {
            spotx = spotx + 1
            if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
            } else {
                if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                    return room.getPositionAt(spotx, spoty)
                }
            }
        }
        for (var j = 0; j < i * 2 + 2; j++) {
            spoty = spoty + 1
            if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
            } else {
                if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                    return room.getPositionAt(spotx, spoty)
                }
            }

        }
        for (var j = 0; j < i * 2 + 2; j++) {
            spotx = spotx - 1
            if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
            } else {
                if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                    return room.getPositionAt(spotx, spoty)
                }
            }
        }
    }

}

/**@function findplotou findet eine stelle an der ein feld mit der größe gx,gy frei ist. Die Suche erfolgt in einer Schritten nach 'NW','NO','SW','SO'
*  @param {RoomPosition} roompos 
*  @param {string} gx
*  @param {string} gy
*  @param {string} richtung NW, NO, SW oder SO
* 
* */
function findplotou(roompos, gx, gy, richtung) {
    const room = Game.rooms[roompos.roomName]
    const rahmenx = 49
    const rahmeny = 49
    var dx = roompos.x - rahmenx / 2
    var dy = roompos.y - rahmeny / 2
    var fxw = Math.ceil((rahmenx - gx) / 2 - dx - 3)
    var fxo = Math.floor((rahmenx - gx) / 2 + dx - 3)
    var fyn = Math.ceil((rahmeny - gy) / 2 - dy - 3)
    var fys = Math.floor((rahmeny - gy) / 2 + dy - 3)
    var boundn = 2 + Math.ceil(gy / 2)
    var bounds = 47 - Math.floor(gy / 2)
    var boundo = 47 - Math.floor(gx / 2)
    var boundw = 2 + Math.ceil(gx / 2)
    var spotx = roompos.x
    var spoty = roompos.y
    if (richtung == 'NW') {
        if (fxw > fyn) { var fs = fxw } else { var fs = fyn }
        var mx = +1; var my = -1;
    } else if (richtung == 'NO') {
        if (fxo > fyn) { var fs = fxo } else { var fs = fyn }
        var mx = -1; var my = -1;
    } else if (richtung == 'SW') {
        if (fxw > fys) { var fs = fxw } else { var fs = fys }
        var mx = +1; var my = +1;
    } else if (richtung == 'SO') {
        if (fxo > fyn) { var fs = fxo } else { var fs = fys }
        var mx = -1; var my = +1;
    }

    for (var i = 0; i < fs; i++) {
        spotx = spotx - mx
        if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
        } else {
            new RoomVisual(Game.rooms[roompos.roomName]).circle(spotx, spoty, { radius: 0.30, stroke: 'red' })
            if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                return room.getPositionAt(spotx, spoty)
            }
        }
        for (var j = 0; j < i + 1; j++) {
            spoty = spoty + my
            if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
            } else {
                new RoomVisual(Game.rooms[roompos.roomName]).circle(spotx, spoty, { radius: 0.30, stroke: 'blue' })
                if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                    return room.getPositionAt(spotx, spoty)
                }
            }
        }
        for (var j = 0; j < i + 1; j++) {
            spotx = spotx + mx
            if (spotx > boundo || spotx < boundw || spoty > bounds || spoty < boundn) {
            } else {
                new RoomVisual(Game.rooms[roompos.roomName]).circle(spotx, spoty, { radius: 0.30, stroke: 'green' })
                if (!iswall(room.getPositionAt(spotx, spoty), gx, gy)) {
                    return room.getPositionAt(spotx, spoty)
                }
            }
        }
        spotx = spotx - (i + 1) * mx
        spoty = spoty + (i + 1) * my * -1
    }
}

/**
 *  @param {*} anzahl Anzahl an Extensions
 *  @param {RoomPosition} centerpos Ausgangspunkt */
var buildbase = {

    run: function (centerpos, anzahl) {
        var room = centerpos.roomName
        var roomrcl = Game.rooms[room].controller.leve
        if (Memory.rooms[room].bigplot == undefined || Memory.rooms[room].bigplot === '') {
            console.log('bigroom')
            var bigplot = findplotuz(centerpos, 14, 14)
            if (bigplot) {
                Memory.rooms[room].bigplot = bigplot
            } else {
                Memory.rooms[room].bigplot = false
            }
        }
        if (Memory.rooms[room].nordplot == undefined || Memory.rooms[room].nordplot === '') {
            var npw = 5
            var nph = 5
            var nordplot = findplotou(centerpos, npw, nph, 'NW')
            if (nordplot) {
                console.log (nordplot)
                new RoomVisual(room).rect(nordplot.x - Math.ceil(npw / 2), nordplot.y - Math.ceil(nph / 2), npw, nph)
                /*
                Memory.rooms[room].nordplot = nordplot
                Memory.rooms[room].nordplot.top = nordplot.y + Math.ceil(nph / 2)
                Memory.rooms[room].nordplot.button = nordplot.y - Math.floor(nph / 2)
                Memory.rooms[room].nordplot.left = nordplot.x + Math.ceil(npw / 2)
                Memory.rooms[room].nordplot.right = nordplot.x - Math.floor(npw / 2)
                */
            } else {
                var nordplot = findplotou(centerpos, npw, nph, 'NO')
                if (nordplot) {
                    new RoomVisual(room).rect(nordplot.x - Math.ceil(npw / 2), nordplot.y - Math.ceil(nph / 2), npw, nph)
                    /*
                    Memory.rooms[room].nordplot = nordplot
                    Memory.rooms[room].nordplot.top = nordplot.y + Math.ceil(nph / 2)
                    Memory.rooms[room].nordplot.button = nordplot.y - Math.floor(nph / 2)
                    Memory.rooms[room].nordplot.left = nordplot.y + Math.ceil(npw / 2)
                    Memory.rooms[room].nordplot.right = nordplot.y - Math.floor(npw / 2)
                    */
                } else {
                    console.log ('kein plot')
                    //Memory.rooms[room].nordplot = false
                    
                }
            }
        }
        switch (true) {
            case (roomrcl > 0):

            case (roomrcl > 1):

            case (roomrcl > 2):

            case (roomrcl > 3):

            case (roomrcl > 4):

            case (roomrcl > 5):

            case (roomrcl > 6):

            case (roomrcl > 7):

            default:
                break;
        }
    }
}


module.exports = buildbase;

