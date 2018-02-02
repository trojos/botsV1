var buildstrucwall = {

    run: function () {
        var spawnname = Game.spawns['Bichl']
        var spawnposx = spawnname.pos.x
        var spawnposy = spawnname.pos.y
        //console.log (spawnposx,spawnposy)

        var roomob = spawnname.room
        var roomname = spawnname.room.name
        // Road Spawn
        roomob.createConstructionSite(spawnposx - 1, spawnposy - 1, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx, spawnposy - 1, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx + 1, spawnposy - 1, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx - 1, spawnposy, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx + 1, spawnposy, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx - 1, spawnposy + 1, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx, spawnposy + 1, STRUCTURE_ROAD)
        roomob.createConstructionSite(spawnposx + 1, spawnposy + 1, STRUCTURE_ROAD)



        //Storage
        if (Game.rooms[Memory.Location.Room1.name].controller.level >= 4) {
            roomob.createConstructionSite(spawnposx + 4, spawnposy, STRUCTURE_STORAGE)
            roomob.createConstructionSite(spawnposx + 3, spawnposy, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 5, spawnposy, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 2, spawnposy - 1, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 3, spawnposy - 1, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 4, spawnposy - 1, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 5, spawnposy - 1, STRUCTURE_ROAD)
        } else {
            roomob.createConstructionSite(spawnposx + 2, spawnposy, STRUCTURE_CONTAINER)
        }


        // Expansion
        var colevel = roomob.controller.level
        const anzahlexte = (CONTROLLER_STRUCTURES['extension'])[colevel]
        console.log('level:' + colevel + 'anzahl:' + anzahlexte)
        var reihen = anzahlexte / 5
        if (reihen > 6) { reihen = 6}
        for (var j = 0; j < reihen; j++) {
            for (var i = 0; i < 5; i++) {
                var exposx = spawnposx + 2 + i + 2 * j
                var exposy = spawnposy + 2 + i
                roomob.createConstructionSite(exposx, exposy, STRUCTURE_EXTENSION)
                roomob.createConstructionSite(exposx + 1, exposy, STRUCTURE_ROAD)
                roomob.createConstructionSite(exposx - 1, exposy, STRUCTURE_ROAD)
            }
            roomob.createConstructionSite(spawnposx + 0 + 2 * j, spawnposy + 1, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 1 + 2 * j, spawnposy + 1, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 2 + 2 * j, spawnposy + 1, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 6 + 2 * j, spawnposy + 7, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 7 + 2 * j, spawnposy + 7, STRUCTURE_ROAD)
            roomob.createConstructionSite(spawnposx + 8 + 2 * j, spawnposy + 7, STRUCTURE_ROAD)

        }

        // West Seite
        for (var y = 0; y < 50; y++) {
            terr = Game.map.getTerrainAt(47, y, roomname)
            if (terr != 'wall') {
                if (y / 30 === parseInt(y / 30)) {
                    roomob.createConstructionSite(47, y, STRUCTURE_RAMPART)
                } else {
                    roomob.createConstructionSite(47, y, STRUCTURE_WALL)
                }
            }
            //console.log(x,'0',terr)
        }

        // Süd Seite
        for (var x = 0; x < 50; x++) {
            terr = Game.map.getTerrainAt(x, 47, roomname)
            if (terr != 'wall') {
                if (x / 30 === parseInt(x / 30)) {
                    roomob.createConstructionSite(x, 47, STRUCTURE_RAMPART)
                } else {
                    roomob.createConstructionSite(x, 47, STRUCTURE_WALL)
                }
            }
            //console.log(x,'0',terr)
        }
    }
};

module.exports = buildstrucwall;