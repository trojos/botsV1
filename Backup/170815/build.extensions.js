/** @param {RoomPosition} roompos **/
function iswall(roompos) {
    var terr = Game.rooms[roompos.roomName].lookForAtArea(LOOK_TERRAIN, roompos.y - 1, roompos.x - 1, roompos.y + 1, roompos.x + 1, true)
    var istwall = false
    for (var i in terr) {
        var xroom = roompos.roomName
        //console.log(xpath.path[steps])
        if (terr[i].terrain == 'wall') {
            new RoomVisual(xroom).circle(terr[i].x, terr[i].y, { radius: 0.30, stroke: 'black' })
            istwall = true
        } else {
            new RoomVisual(xroom).circle(terr[i].x, terr[i].y, { radius: 0.30, stroke: 'red' })
        }
    }
    return istwall

}

/** @param {RoomPosition} roompos 
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

// ---------------- TODO: suche nach structuren wo nicht gebaut werden kann + definieren ob nach links oder rechts gesucht werden soll

/** @param {*} anzahl Anzahl an Extensions
 *  @param {RoomPosition} spawnpos Ausgangspunkt */
var buildextensions = {

    run: function (spawnpos, anzahl) {
        var expos = spawnpos
        switch (true) {
            case (anzahl > 4):
                expos.x = spawnpos.x - 1
                expos.y = spawnpos.y - 4
                findplot(expos, 'links')
            case (anzahl > 9):
                expos.x = spawnpos.x + 4
                expos.y = spawnpos.y
                findplot(expos, 'rechts')
            case (anzahl > 14):
                expos.x = spawnpos.x - 6
                expos.y = spawnpos.y - 2
                findplot(expos, 'links')
            case (anzahl > 19):
                expos.x = spawnpos.x + 4
                expos.y = spawnpos.y 
                findplot(expos, 'rechts')
            case (anzahl > 24):
                expos.x = spawnpos.x + 4
                expos.y = spawnpos.y 
                findplot(expos, 'rechts')
            case (anzahl > 29):

            case (anzahl > 34):

            case (anzahl > 39):

            case (anzahl > 44):

            case (anzahl > 49):

            case (anzahl > 54):

            case (anzahl > 59):

            default:
                break;
        }
    }
}

module.exports = buildextensions;