
function attackt(creep) {

    var at = 0

    var mycreeps = creep.room.find(FIND_MY_CREEPS, {
        filter: sa => sa.hits < sa.hitsMax
    })
    var target = creep.pos.findClosestByRange(mycreeps)

    if (target) {       //Wenn aktuell kein target, aber im vorherigen Tick ein target geiheilt wurde, dann wird dieses jetzt auch geheilt (Damit )
        creep.memory.lasttarget = target.id
        creep.memory.lastheal = Game.time
    } else {
        //console.log(creep.memory.lasttarget, creep.memory.lastheal, Game.time)
        if (creep.memory.lasttarget && creep.memory.lastheal >= Game.time - 2) {
            target = Game.getObjectById(creep.memory.lasttarget)
        }
    }
    //target = Game.getObjectById('5a70a2f28368cd01d56d7d21')
    if (!creep.pos.isNearTo(target) && target || 1 == 2) {
        //Es wird eine Position rund ums target gesucht die frei ist und nicht auf einen ExitBereich liegt
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
            if (neartarget[j].type == 'creep' || (neartarget[j].type == 'terrain' && neartarget[j].terrain == 'wall') || (neartarget[j].type == 'structure' && neartarget[j].structure.structureType == 'constructedWall')) {
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

        var healtarget = creep.pos.findClosestByRange(freepos)
        //console.log('moveto: ' + healtarget + ' heal: ' + target)
        var er = creep.moveTo2(healtarget, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: false, ignoreCreeps: true, maxRooms: 1 })
        if (creep.memory._move) {
            var path = Room.deserializePath(creep.memory._move.path);
            if (path.length > 0) {
                var creeponpath = Game.rooms[creep.pos.roomName].lookForAt(LOOK_CREEPS, path[0].x, path[0].y, )
                if (creeponpath.length > 0) {
                    creep.room.visual.circle(path[0].x, path[0].y, { fill: '#ff0000', radius: .5 })
                    if (creeponpath[0].memory.role == 'FernDD' || creeponpath[0].memory.role == 'Dismantler..') {
                        creeponpath[0].moveTo(creep)
                    } else if (creeponpath[0].memory.role == 'Heiler') {
                        creeponpath[0].moveTo(healtarget)
                    }
                    // if (path.length > 1) {
                    //     var creeponpath2 = Game.rooms[creep.pos.roomName].lookForAt(LOOK_CREEPS, path[1].x, path[1].y, )
                    //     if (creeponpath2.length > 0) {
                    //         creep.room.visual.circle(path[1].x, path[1].y, { fill: '#ff0000', radius: .5 })
                    //         if (creeponpath2[0].memory.role == 'FernDD') {
                    //             creeponpath2[0].moveTo(creeponpath[0])
                    //         }
                    //     }
                    // }
                }
            }
        }


        //console.log('healtarget:',healtarget,er)
        creep.rangedHeal(target)
        creep.heal(target)
        var at = 1
    } else if (target) {
        creep.heal(target)
        var at = 1
    }

    return at
}

var roleHeiler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var at = 0
        at = attackt(creep)
        if (creep.memory.status == 'attack' && at == 0) {
            //if (at == 0 && creep.room.name != creep.memory.targetroom) {
            if (creep.room.name == creep.memory.targetroom) {   //Wenn im Targetraum keine Ziele zum Heilen gehe zu nächsten Fern oder NahDD
                var mycreep = creep.pos.findClosestByRange(Game.rooms[creep.memory.targetroom].find(FIND_MY_CREEPS, {
                    filter: cr => cr.memory.role == 'FernDD' || cr.memory.role == 'NahDD' || cr.memory.role == 'Dismantler'
                }))
                if (mycreep) {
                    creep.moveTo2(mycreep)
                } else {                                        // Wenn kein creep vorhanden, dann Flagge Attack oder Raummitte
                    var flag = Game.rooms[creep.memory.targetroom].find(FIND_FLAGS, { filter: { name: 'Attack' } })
                    if (flag.length > 0) {                                  //Wenn Flagge Attack dann wird zu dieser gegangen
                        creep.moveTo2(flag[0])
                    } else {
                        creep.moveTo2(25, 25)
                    }
                }
            } else {
                //creep.moveTo2(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
                //Wenn ein Angriffspunkt definiert wird der Pfad zu diesem gegangen, ansonsten kürzester Weg in den Raum
                if (Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos == undefined) {
                    creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
                } else {
                    var enterpos = Memory.Attack[creep.memory.targetroom].Angriffspunkt.pos
                    const renterpos = new RoomPosition(enterpos.x, enterpos.y, enterpos.roomName)
                    walk = creep.moveTo(renterpos, { visualizePathStyle: { stroke: '#ff0000' }, maxRooms: 1 })
                }

            }
        }


    }
};

module.exports = roleHeiler;
