function attacktarget(creep, target, hostileroom) {
    if (creep.memory.role == 'NahDD') {
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
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

                if (creep.memory._move == undefined) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                } else {
                    if (creep.memory._move.path == undefined) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                    } else {
                        var path = Room.deserializePath(creep.memory._move.path);
                        var er = creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: true, ignoreCreeps: true, maxRooms: 1 });
                        //console.log (er)
                        if (path.length > 1) {
                            var creeponpath = Game.rooms[creep.pos.roomName].lookForAt(LOOK_CREEPS, path[0].x, path[0].y, )
                            if (creeponpath.length > 0) {
                                //console.log(creep.name, 'hinderniss')
                                creep.room.visual.circle(path[0].x, path[0].y, { fill: '#ff0000', radius: .5 })
                                if (creeponpath[0].memory.role == 'Heiler' || creeponpath[0].memory.role == 'FernDD') {
                                    creeponpath[0].moveTo(creep)
                                } else if (creeponpath[0].memory.role == 'NahDD') {
                                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: true, ignoreCreeps: false, maxRooms: 1 });
                                    console.log(creeponpath[0].memory.role)
                                }

                            }
                        }
                        // if (path.length && creep.pos.isNearTo(path[0].x, path[0].y)) {

                        //     var targetwall = creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y);
                        //     _.remove(targetwall, 'structureType', 'road')
                        //     _.remove(targetwall, 'structureType', 'rampart')
                        //     if (targetwall.length > 0) {
                        //         var nearstruc = creep.pos.findInRange(FIND_STRUCTURES, 2)
                        //         //console.log(JSON.stringify(nearstruc))
                        //         nearstruc.sort((a, b) => a.hits - b.hits);
                        //         //console.log(JSON.stringify(nearstruc[0]))
                        //         if (creep.attack(nearstruc[0]) == ERR_NOT_IN_RANGE) {
                        //             creep.moveTo(nearstruc[0])
                        //         }
                        //     }
                        // }
                    }
                }
            } else {
                creep.moveTo2(target, { visualizePathStyle: { stroke: '#ff0000' } });
            }
        }
    } else if (creep.memory.role == 'FernDD') {
        var rangeto = creep.pos.getRangeTo(target)
        if (rangeto > 3) {
            if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                if (hostileroom) {
                    //Setze Angriffspunkt alle 5 Ticks oder wenn keiner vorhanden ist
                    //Damit der Path schon im Vorraum berrechnet werden kann und kein Stau bei Mauer entsteht
                    //Angreifende Creeps verwenden ab Sammelpunkt dieses Ziel für den Weg in den Raum
                    if (Memory.Attack[creep.memory.targetroom].Angriffspunkt.tick < Game.time - 5 || Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos == undefined) {
                        Memory.Attack[creep.memory.targetroom].Angriffspunkt.tick = Game.time
                        Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos = target.pos
                    }
                    if (creep.memory._move == undefined) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                    } else {
                        if (creep.memory._move.path == undefined) {
                            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                        } else {
                            var path = Room.deserializePath(creep.memory._move.path);
                            var er = creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: false, ignoreCreeps: true, maxRooms: 1 });
                            //console.log (er)
                            if (path.length > 1) {
                                var creeponpath = Game.rooms[creep.pos.roomName].lookForAt(LOOK_CREEPS, path[0].x, path[0].y, )
                                if (creeponpath.length > 0) {
                                    //console.log(creep.name, 'hinderniss')
                                    creep.room.visual.circle(path[0].x, path[0].y, { fill: '#ff0000', radius: .5 })
                                    if (creeponpath[0].memory.role == 'Heiler') {
                                        creeponpath[0].moveTo(creep)
                                    } else if (creeponpath[0].memory.role == 'FernDD') {
                                        creeponpath[0].moveTo(target)
                                    }
                                }
                            }
                            if (path.length && creep.pos.isNearTo(path[0].x, path[0].y)) {
                                var targetwall = creep.room.lookForAt(LOOK_STRUCTURES, path[0].x, path[0].y);
                                _.remove(targetwall, 'structureType', 'road')
                                _.remove(targetwall, 'structureType', 'rampart')
                                if (targetwall.length > 0) {
                                    var nearstruc = creep.pos.findInRange(FIND_STRUCTURES, 2)
                                    //console.log(JSON.stringify(nearstruc))
                                    nearstruc.sort((a, b) => a.hits - b.hits);
                                    //console.log(JSON.stringify(nearstruc[0]))
                                    if (creep.rangedAttack(nearstruc[0]) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(nearstruc[0])
                                    }
                                }
                            }
                        }
                    }
                } else {
                    creep.moveTo2(target, { visualizePathStyle: { stroke: '#ff0000' } });
                }
            }

            var creepsiR = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3)   //Wenn außer Reichweite des Hauptzieles wird auf erstbestes Ziel in Reichweite geschossen
            if (creepsiR.length > 0) {
                creep.rangedAttack(creepsiR[0])
            } else {
                var struciR = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3)
                if (struciR.length > 0) {
                    creep.rangedAttack(struciR[0])
                }
            }

        } else if (rangeto == 3) {
            creep.rangedAttack(target)

            //creep.moveTo2(target)
        } else {
            creep.rangedAttack(target)

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
    var target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1)
    if (target.length > 0) {
        attacktarget(creep, target[0], hostileroom)
        var at = 1
    }
    var targetac = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if (targetac && at == 0) {
        attacktarget(creep, targetac, hostileroom)
        var at = 4
    }
    return at

}

var roleNahDD = {

    /** @param {Creep} creep **/
    run: function (creep) {


        var at = 0
        var targetroom = creep.memory.targetroom
        if (creep.room.name == creep.memory.targetroom) {
            if (!Memory.Attack[targetroom].target) {
                at = 0
            } else {
                target = Game.getObjectById(Memory.Attack[targetroom].target)
                attacktarget(creep, target, true)
                at = 1
            }
        } else {
            var at = attackt(creep)
        }
        if (creep.hits < creep.hitsMax - 1000) {
            var healcreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: cr => cr.getActiveBodyparts(HEAL) > 0
            })
            creep.moveTo2(healcreep)
        } else {

            if (creep.memory.status == 'attack') {
                if (at == 0 && creep.room.name != creep.memory.targetroom) {
                    //Wenn ein Angriffspunkt definiert wird der Pfad zu diesem gegangen, ansonsten kürzester Weg in den Raum
                    if (Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos == undefined) {
                        creep.moveTo2(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
                    } else {
                        var enterpos = Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos
                        const renterpos = new RoomPosition(enterpos.x, enterpos.y, enterpos.roomName)
                        walk = creep.moveTo2(renterpos, { visualizePathStyle: { stroke: '#ff0000' }, maxRooms: 1 })
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
        //Wenn Flagge gesetzt wird dorthingegangen, Flagge wird manuel gesetzt!
        if (Game.flags['Flee']) {
            creep.moveTo2(Game.flags['Flee'], { visualizePathStyle: { stroke: '#ff0000' } })
        }

        return at

    }
};

module.exports = roleNahDD;
