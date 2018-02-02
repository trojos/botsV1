function attacktarget(creep, target, hostileroom) {
    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        if (hostileroom) {
            //Setze Angriffspunkt alle 5 Ticks oder wenn keiner vorhanden ist
            //Damit der Path schon im Vorraum berrechnet werden kann und kein Stau bei Mauer entsteht
            //Angreifende Creeps verwenden ab Sammelpunkt dieses Ziel für den Weg in den Raum
            if (Memory.Attack[creep.memory.targetroom].Angriffspunkt.tick < Game.time - 5 || Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos == undefined) {
                Memory.Attack[creep.memory.targetroom].Angriffspunkt.tick = Game.time
                Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos = target.pos
            }

            var path = Room.deserializePath(creep.memory._move.path);
            var er = creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: true, maxRooms: 1 });
            //console.log (er)
            if (path.length && creep.pos.isNearTo(path[0].x, path[0].y)) {
                var targetwall = creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y);
                _.remove(targetwall, 'structureType', 'road')
                _.remove(targetwall, 'structureType', 'rampart')
                if (targetwall.length > 0) {
                    var nearstruc = creep.pos.findInRange(FIND_STRUCTURES, 2)
                    //console.log(JSON.stringify(nearstruc))
                    nearstruc.sort((a, b) => a.hits - b.hits);
                    //console.log(JSON.stringify(nearstruc[0]))
                    if (creep.attack(nearstruc[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nearstruc[0])
                    }
                }

            }
        } else {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
}

function attackt(creep) {
    //Überprüfen ob Creep in einem Feindraum. In Feindräumen werden strukturen die im Weg stehen angegriffen (Mauern)
    if (creep.room.controller == undefined) {
        var hostileroom = false
    } else {
        if (creep.room.controller.owner != undefined && creep.room.controller.my == false) {
            var hostileroom = true
        } else {
            var hostileroom = false
        }
    }

    //Definieren der Ziele nach Priorität
    var at = 0
    if (Game.flags['Attack']) {
        creep.moveTo(Game.flags['Attack'], { visualizePathStyle: { stroke: '#ff0000' } })
    }
    var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)
    if (targets.length > 0) {
        attacktarget(creep, targets[0], hostileroom)
        var at = 1
    }
    var targetst = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1, {
        filter: hc => hc.structureType != STRUCTURE_RAMPART
    })
    if (targetst.length > 0) {
        attacktarget(creep, targetst[0], hostileroom)
        var at = 1
    }
    var targetbody = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: sa => sa.getActiveBodyparts(ATTACK) != 0
    })
    var target = creep.pos.findClosestByRange(targetbody)
    if (target) {
        attacktarget(creep, target, hostileroom)
        var at = 2
    }

    var targettower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: tt => tt.structureType == STRUCTURE_TOWER
    })
    if (targettower && at == 0) {
        attacktarget(creep, targettower, hostileroom)
        var at = 3
    }
    var targetac = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if (targetac && at == 0) {
        attacktarget(creep, targetac, hostileroom)
        var at = 4
    }

    var targetstruc = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: tt => tt.structureType != STRUCTURE_CONTROLLER
    })
    if (targetstruc && at == 0) {
        attacktarget(creep, targetstruc, hostileroom)
        var at = 5
    }

    //Wenn Flagge gesetzt wird dorthingegangen, Flagge wird manuel gesetzt!
    if (Game.flags['Flee']) {
        creep.moveTo(Game.flags['Flee'], { visualizePathStyle: { stroke: '#ff0000' } })
    }
    return at
}

var roleNahDD = {

    /** @param {Creep} creep **/
    run: function (creep) {

        var targetroom = creep.memory.targetroom
        var at = attackt(creep)

        if (creep.hits < creep.hitsMax) {
            var healcreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: cr => cr.getActiveBodyparts(HEAL) > 0
            })
            creep.moveTo(healcreep)
        } else {
            if (creep.memory.status == 'attack') {
                if (at == 0 && creep.room.name != creep.memory.targetroom) {
                    //Wenn ein Angriffspunkt definiert wird der Pfad zu diesem gegangen, ansonsten kürzester Weg in den Raum
                    if (Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos == undefined) {
                        creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
                    } else {
                        var enterpos = Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos
                        const renterpos = new RoomPosition(enterpos.x, enterpos.y, enterpos.roomName)
                        walk = creep.moveTo(renterpos, { visualizePathStyle: { stroke: '#ff0000' }, maxRooms: 1 })
                    }
                }
                if (at == 0 && creep.room.name == creep.memory.targetroom) { //Wenn keine Angriffsmöglichkeiten im Targetroom geht Creep in die Mitte
                    creep.moveTo(25, 25)
                }
            }
        }


    }
};

module.exports = roleNahDD;
