var creepspawn = require('creepspawn')

//Costmatrix für Raum
function cmroomf(room) {
    var cmroom = new PathFinder.CostMatrix
    if (Game.rooms[room] == undefined) { } else {
        Game.rooms[room].find(FIND_STRUCTURES).forEach(function (struct) {
            if (struct.structureType === STRUCTURE_ROAD) {
                cmroom.set(struct.pos.x, struct.pos.y, 1);
            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                    !struct.my)) {
                cmroom.set(struct.pos.x, struct.pos.y, 255);
            }
        });
    }
    return cmroom
}


var subroom = {
    run: function (room, subroom, wait) {
        //Set Memory für Statistik
        if (Memory.Statistik == undefined) {
            Memory.Statistik = {}
        }
        if (Memory.Statistik[subroom] == undefined) {
            Memory.Statistik[subroom] = {}
            Memory.Statistik[subroom].aktuell = {}
            Memory.Statistik[subroom].aktuell.role = {}
            Memory.Statistik[subroom].aktuell.energy = 0
            Memory.Statistik[subroom].aktuell.start = 0
            Memory.Statistik[subroom].Ergebniss = []
        }
        //Statistik iteration
        if (Memory.Statistik[subroom].aktuell.start < Game.time - 5000) {
            Memory.Statistik[subroom].aktuell.Summe = Memory.Statistik[subroom].aktuell.energy - _.sum(Memory.Statistik[subroom].aktuell.role)

            Memory.Statistik[subroom].Ergebniss.push(Memory.Statistik[subroom].aktuell)
            Memory.Statistik[subroom].aktuell = {}
            Memory.Statistik[subroom].aktuell.role = {}
            var rolear = { 'scout': 0, 'miner': 0, 'carry': 0, 'bmstr': 0, 'claim': 0, 'defend': 0 }
            Memory.Statistik[subroom].aktuell.role = rolear
            Memory.Statistik[subroom].aktuell.energy = 0
            Memory.Statistik[subroom].aktuell.Summe = 0
            Memory.Statistik[subroom].aktuell.start = Game.time
        }

        //raumvariablen
        const xspawns = Game.rooms[room].find(FIND_MY_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_SPAWN
        });
        const xspawn = xspawns[0]
        const maxenergy = Game.rooms[room].energyCapacityAvailable
        const haveenergy = Game.rooms[room].energyAvailable
        if (Game.rooms[room].storage == undefined) {
            var havestore = false
            var reserve = 0
        } else {
            var havestore = true
            var reserve = Game.rooms[room].storage.store[RESOURCE_ENERGY]
        }
        var roomcontroll = false
        if (Game.rooms[subroom] == undefined) {
            var insight = false
        } else {
            var insight = true
            if (Game.rooms[subroom].controller.owner == undefined) {
                if (Game.rooms[subroom].controller.reservation == undefined) {
                    roomcontroll = true
                } else if (Game.rooms[subroom].controller.reservation.username == 'zapziodon') {
                    roomcontroll = true
                }
            } else if (Game.rooms[subroom].controller.owner.username != 'zapZiodon') {
                roomcontroll = false
            }
        }

        // Rep und Bauzeugs in Memory schreiben
        if (insight) {
            HomeRCL = Game.rooms[room].controller.level
            if (Memory.rooms[subroom] == undefined) { Memory.rooms[subroom] = {} }
            if (Memory.rooms[subroom].Bmstr == undefined) { Memory.rooms[subroom].Bmstr = {} }
            if (Memory.rooms[subroom].Bmstr.tick == undefined || Memory.rooms[subroom].Bmstr.tick < Game.time - 101) {
                Memory.Bmstr = {}
                Memory.rooms[subroom].Bmstr.tick = Game.time
                var bmstrsites = Game.rooms[subroom].find(FIND_MY_CONSTRUCTION_SITES)
                var bmstrsites2 = _.sum(bmstrsites, 'progressTotal') - _.sum(bmstrsites, 'progress')
                Memory.rooms[subroom].Bmstr.constructionsites = bmstrsites.length
                Memory.rooms[subroom].Bmstr.constructionprogress = bmstrsites2
                var bauBP = 0
                switch (true) {
                    case (bmstrsites2 > 10000):
                        bauBP = 8; break;// <---- work Bodyparts -- Anhand dieser Geschwindigkeit wird die benötigte Anzahl an Bmstr ermittelt
                    case (bmstrsites2 > 4000):
                        bauBP = 4; break;
                    case (bmstrsites2 > 300):
                        bauBP = 2; break;
                }
                var bauBPRCL = 8
                switch (true) {
                    case (HomeRCL == 2):
                        bauBPRCL = 2; break;
                    case (HomeRCL == 3):
                        bauBPRCL = 4; break;
                }
                if (bauBP > bauBPRCL) { bauBP = bauBPRCL }
                Memory.rooms[subroom].Bmstr.baubodyparts = bauBP

                var repstreets = _.sum(Game.rooms[subroom].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_ROAD
                }), 'hitsMax') / 5000
                var repcont = Game.rooms[subroom].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                })
                Memory.rooms[subroom].Bmstr.streets = repstreets
                Memory.rooms[subroom].Bmstr.cont = repcont.length
                var repamount = Math.ceil((repstreets * 0.1 + repcont.length * 50) / 100 * 3)  //hits die pro tick repariert werden müssen. 100hits = 1 energy * 3 für beschaffen und weg
                Memory.rooms[subroom].Bmstr.reppbodyparts = repamount
            }
        }
        //----------creeps------------------
        //size
        if (haveenergy + reserve < maxenergy) {
            var maxcreepsize = haveenergy + reserve
        } else {
            var maxcreepsize = maxenergy
        }
        if (maxcreepsize < (maxenergy / 2)) {
            maxcreepsize = maxenergy / 2
        }
        var creepsize
        var needminer = false
        var needcarry = false
        var needbmstr = false
        var needdef = false
        var creepcost = 0
        //---------- Scout -----------------
        if (!wait && (!insight || Game.rooms[subroom].controller.sign.text !== Memory.signtext)) {
            var cmem = { role: 'scout', home: room, targetroom: subroom }
            var cbody = [MOVE]
            if (maxcreepsize > 50) { creepsize = 50 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            if (ccreep.length < 0) {
                creepcost = creepspawn.newcreep(room, 'scout_' + subroom, creepsize, cbody, cmem)
                if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.scout = Memory.Statistik[subroom].aktuell.role.scout + creepcost, creepcost = 0 }
            }
        }

        //---------- bmstr Baumeister  ----------
        if (!insight && !wait) {
            var BPneed = Memory.rooms[subroom].Bmstr.baubodyparts + Memory.rooms[subroom].Bmstr.reppbodyparts
            var cmem = { role: 'bmstr', home: room, targetroom: subroom, working: false, onsite: false }
            var ccreep = _.filter(Game.creeps, (creep) =>
                creep.memory.role == cmem.role
                && creep.memory.home == cmem.home
                && creep.memory.targetroom == cmem.targetroom);
            var bodyparts = 0
            for (var i in ccreep) {
                bodyparts = bodyparts + ccreep[i].getActiveBodyparts(WORK)
            }
            Memory.rooms[subroom].Bmstr.bodypartshave = bodyparts
            if (bodyparts < BPneed) {
                needbmstr = true
                var cbody = [MOVE, MOVE, WORK, CARRY, CARRY]
                var cbodycost = 300
                var bodypartsneed = BPneed - bodyparts
                bodypartsneed = Math.ceil(bodypartsneed)
                var bodypartsneedcost = bodypartsneed * cbodycost
                if (bodypartsneedcost < maxcreepsize) { maxcreepsize = bodypartsneedcost }
                if (maxcreepsize > 1500) { creepsize = 1500 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                //console.log(maxcreepsize)
                creepcost = creepspawn.newcreep(room, 'bmstr_' + subroom, creepsize, cbody, cmem)
                if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.bmstr = Memory.Statistik[subroom].aktuell.role.bmstr + creepcost, creepcost = 0 }
            }

        }
        
        //defence
        if (insight) {
            var defender = 0
            var hostile = Game.rooms[subroom].find(FIND_HOSTILE_CREEPS)
            if (hostile.length > 0) {
                var defender = 0
            }

            if (defender > 0) {
                var cmem = { role: 'defend', home: room, targetroom: subroom }
                var cbody = [TOUGH, MOVE, MOVE, ATTACK]
                maxcreepsize = haveenergy
                if (maxcreepsize > 1200) { creepsize = 1200 } else { creepsize = maxcreepsize }    // Beschränkt maxcreepsize
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length < defender) {
                    needdef = true
                    creepcost = creepspawn.newcreep(room, 'def_' + subroom, creepsize, cbody, cmem)
                    if (creepcost > 0) { Memory.Statistik[subroom].aktuell.role.defend = Memory.Statistik[subroom].aktuell.role.defend + creepcost, creepcost = 0 }
                }

            }
            if (hostile.length < 1) {                //Wenn Bedrohung vorbei wird die Rolle der Defender auf destruct gesetzt
                var cmem = { role: 'defend', home: room, targetroom: subroom }
                var ccreep = _.filter(Game.creeps, (creep) =>
                    creep.memory.role == cmem.role
                    && creep.memory.home == cmem.home
                    && creep.memory.targetroom == cmem.targetroom);
                if (ccreep.length > defender) {
                    for (var i = 0; i < ccreep.length - 1; i++) {
                        //ccreep[i].memory.role = 'destruct'
                    }
                }
            }
        }

        if (needbmstr || needdef) {
            var wait = false
        } else { var wait = false }

        //subräume



        //build lager

        //build extensions

        //build wall

        //build road

        //build buildings


        return (wait)
    }



}

module.exports = subroom