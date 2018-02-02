
function attackt(creep) {

    var at = 0

    var mycreeps = creep.room.find(FIND_MY_CREEPS, {
        filter: sa => sa.hits < sa.hitsMax
    })
    var target = creep.pos.findClosestByRange(mycreeps)
    if (!creep.pos.isNearTo(target) && target) {
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

        for (j in neartarget) {
            if (neartarget[j].type == 'creep' || neartarget[j].type == 'structure') {
                _.remove(neartarget, function (n) {
                    return n.y == neartarget[j].y && n.x == neartarget[j].x
                })
            }
        }
        //

        //_.remove(neartarget, 'type', 'creep')       //wird rausgefiltert, aber nur creep, wenn an selber stelle was anderes ist beleibts
        //_.remove(neartarget, 'type', 'structure')  //da hats was, wird nicht rausgefilter!

        var freepos = []
        var rp
        
        for (var i in neartarget) {
            rp = new RoomPosition(neartarget[i].x, neartarget[i].y, creep.room.name)
            freepos.push(rp)
        }

        var healtarget = creep.pos.findClosestByRange(freepos)

        creep.rangedHeal(target)
        creep.heal(target)
        creep.moveTo(healtarget, { visualizePathStyle: { stroke: '#ff0000' } })
        var at = 1
    }

    return at
}

var roleHeiler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var at = attackt(creep)
        if (creep.memory.status == 'attack') {
            if (at == 0 && creep.room.name != creep.memory.targetroom) {
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetroom)), { visualizePathStyle: { stroke: '#ff0000' } })
            }
        }


    }
};

module.exports = roleHeiler;
