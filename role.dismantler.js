function getfreepos(creep, target) {
    if (target.pos.y - 1 < 0) { var ltop = 0 } else { var ltop = target.pos.y - 1 }
    if (target.pos.y + 1 > 49) { var lbottom = 49 } else { var lbottom = target.pos.y + 1 }
    if (target.pos.x - 1 < 0) { var lleft = 0 } else { var lleft = target.pos.x - 1 }
    if (target.pos.x + 1 > 49) { var lright = 49 } else { var lright = target.pos.x + 1 }
    var neartarget = target.room.lookAtArea(ltop, lleft, lbottom, lright, true)
    //
    _.remove(neartarget, 'x', 49)
    _.remove(neartarget, 'x', 0)
    _.remove(neartarget, 'y', 49)
    _.remove(neartarget, 'y', 0)

    var neartarget2 = []            //Array kopieren da sonst die remove schleife nicht funktioniert das während der schleife elemente rausgelöscht werden und daher nicht durchläuft
    for (o in neartarget) {
        neartarget2.push(neartarget[o])
    }

    for (j in neartarget) {
        if (neartarget[j].type == 'creep' || (neartarget[j].type == 'terrain' && neartarget[j].terrain == 'wall') || (neartarget[j].type == 'structure' && (neartarget[j].structure.structureType == STRUCTURE_WALL || neartarget[j].structure.structureType == STRUCTURE_RAMPART))) {
            var rt = true
            if (neartarget[j].type == 'creep' && neartarget[j].creep.my) {
                //console.log(neartarget[j].creep.my)
                var hcreep = Game.getObjectById(neartarget[j].creep.id)
                if (hcreep.memory.role == 'FernDD') {
                    rt = false
                }
            }
            if (rt) {
                _.remove(neartarget2, function (n) {
                    return n.y == neartarget[j].y && n.x == neartarget[j].x
                })
            }
        }
    }

    var freepos = []; var rp

    for (var i in neartarget2) {
        rp = new RoomPosition(neartarget2[i].x, neartarget2[i].y, creep.room.name)
        freepos.push(rp)
        creep.room.visual.circle(rp.x, rp.y, { fill: '#8FBC8F', radius: .5 })
    }

    return freepos
}

function attacktarget(creep, target, hostileroom) {
    if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
        if (hostileroom) {
            //Setze Angriffspunkt alle 5 Ticks oder wenn keiner vorhanden ist
            //Damit der Path schon im Vorraum berrechnet werden kann und kein Stau bei Mauer entsteht
            //Angreifende Creeps verwenden ab Sammelpunkt dieses Ziel für den Weg in den Raum
            if (Memory.Attack[creep.memory.targetroom].Angriffspunkt.tick < Game.time - 5 || Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos == undefined) {
                Memory.Attack[creep.memory.targetroom].Angriffspunkt.tick = Game.time
                var flag = Game.rooms[creep.memory.targetroom].find(FIND_FLAGS, { filter: { name: 'Attack' } })
                if (flag.length > 0) {                                  //Wenn Flagge Attack dann wird zu dieser gegangen
                    Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos = flag[0].pos
                } else {
                    Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos = target.pos
                }
            }

            //var spotsinRange = Game.rooms[creep.pos.roomName].lookAtArea(target.pos.y - 1, target.pos.x - 1, target.pos.y + 1, target.pos.x + 1)

            var freepos = creep.pos.findClosestByRange(getfreepos(creep, target))
            if (freepos) { } else { freepos == target }

            if (creep.memory._move == undefined) {
                creep.moveTo(freepos, { visualizePathStyle: { stroke: '#ff0000' } });
            } else {
                if (creep.memory._move.path == undefined) {
                    creep.moveTo(freepos, { visualizePathStyle: { stroke: '#ff0000' } });
                } else {
                    var path = Room.deserializePath(creep.memory._move.path);
                    var er = creep.moveTo(freepos, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: false, ignoreCreeps: true, maxRooms: 1 });
                    //console.log (er)
                    if (path.length > 1) {
                        var creeponpath = Game.rooms[creep.pos.roomName].lookForAt(LOOK_CREEPS, path[0].x, path[0].y, { filter: cr => cr.my == true })
                        if (creeponpath.length > 0) {
                            //console.log(creep.name, 'hinderniss')
                            creep.room.visual.circle(path[0].x, path[0].y, { fill: '#ff0000', radius: .5 })
                            if (creeponpath[0].my) {
                                if (creeponpath[0].memory.role == 'Heiler' || creeponpath[0].memory.role == 'FernDD' || creeponpath[0].memory.role == 'NahDD') {
                                    creeponpath[0].moveTo(creep)
                                } else if (creeponpath[0].memory.role == 'Dismantler') {
                                    creeponpath[0].moveTo(freepos, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: false, ignoreCreeps: false, maxRooms: 1 });
                                    //console.log(creeponpath[0].memory.role)
                                }
                            }
                        }
                    }
                    if (path.length && creep.pos.isNearTo(path[0].x, path[0].y)) {
                        var targetwall = creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y);
                        _.remove(targetwall, 'structureType', 'road')
                        //_.remove(targetwall, 'structureType', 'rampart')
                        //console.log('on path', targetwall)
                        if (targetwall.length > 0) {
                            //var nearstruc = creep.pos.findInRange(FIND_STRUCTURES, 2)
                            //console.log(JSON.stringify(nearstruc))
                            //nearstruc.sort((a, b) => a.hits - b.hits);
                            //console.log(JSON.stringify(nearstruc[0]))
                            if (creep.dismantle(targetwall[0]) == ERR_NOT_IN_RANGE) {
                                //creep.moveTo(nearstruc[0])
                            }
                        }
                    }
                }
            }
        } else {
            creep.moveTo2(target, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
    if (target.hits != undefined) {
        if (creep.memory.dismantle == undefined) { creep.memory.dismantle = 0 }
        console.log('Dismantle hits verbeliebend:', target.hits, 'abgebaut:', creep.memory.dismantle - target.hits, ' noch', Math.round((target.hits / (creep.memory.dismantle - target.hits) * 3 / 60 / 60) * 100) / 100, 'Stunden')
        creep.memory.dismantle = target.hits
    }
}

// function attackt(creep) {
//     //Überprüfen ob Creep in einem Feindraum. In Feindräumen werden strukturen die im Weg stehen angegriffen (Mauern)
//     if (creep.room.controller == undefined) {
//         var hostileroom = false
//     } else {
//         if (creep.room.controller.owner != undefined && creep.room.controller.my == false) {
//             var hostileroom = true
//         } else {
//             var hostileroom = false
//         }
//     }
//     //Definieren der Ziele nach Priorität
//     var at = 0
//     if (Game.flags['Attack']) {
//         creep.moveTo(Game.flags['Attack'], { visualizePathStyle: { stroke: '#ff0000' } })
//     }
//     var target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)
//     if (target.length > 0) {
//         attacktarget(creep, target[0], hostileroom)
//         var at = 1
//     }
//     var targetac = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
//     if (targetac && at == 0) {
//         attacktarget(creep, targetac, hostileroom)
//         var at = 4
//     }
//     return at

// }

var roleDismantler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var at = 0
        var targetroom = creep.memory.targetroom
        if (creep.room.name == creep.memory.targetroom) {
            if (Memory.Attack[targetroom].target) {
                target = Game.getObjectById(Memory.Attack[targetroom].target)
                if (target.structureType == undefined || target.structureType == STRUCTURE_ROAD) {        // Prüft ob target eine Struktur ist
                    var nostruc = true
                } else {
                    attacktarget(creep, target, true)
                    at = 1
                }
            } else {
                var nostruc = true
            }
            if (nostruc) {
                console.log(creep.room.name, ' Dismantler kann nur Strukturen angreifen! - Diese müssen mit Flagge "Attack" markiert sein!')
                target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                    filter: struc => struc.structureType != STRUCTURE_CONTROLLER
                })

                if (!target) {
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: struc => struc.structureType == STRUCTURE_WALL || struc.structureType == STRUCTURE_RAMPART
                    })
                }
                if (target) {
                    attacktarget(creep, target, true)
                    at = 1
                }
            }
        }

        if (creep.hits < creep.hitsMax - 1000) {
            var healcreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: cr => cr.getActiveBodyparts(HEAL) > 0
            })
            if (healcreep) { var gotoheal = true }
        }
        if (gotoheal) {
            creep.moveTo2(healcreep)
        } else {
            if (creep.memory.status == 'attack') {
                if (creep.room.name != creep.memory.targetroom) {
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
                    var flag = Game.rooms[creep.memory.targetroom].find(FIND_FLAGS, { filter: { name: 'Attack' } })
                    if (flag.length > 0) {                                  //Wenn Flagge Attack dann wird zu dieser gegangen
                        creep.moveTo2(flag[0])
                    } else {
                        creep.moveTo2(25, 25)
                    }
                }
            }
        }
        //Wenn Flagge gesetzt wird dorthingegangen, Flagge wird manuell gesetzt!
        if (Game.flags['Flee']) {
            creep.moveTo2(Game.flags['Flee'], { visualizePathStyle: { stroke: '#ff0000' } })
        }
        return at

    }
};

module.exports = roleDismantler;
