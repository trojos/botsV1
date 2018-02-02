function attacktarget(creep, target, hostileroom) {
    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        if (hostileroom) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, ignoreDestructibleStructures: false, maxRooms: 1 });
        } else {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' }, maxRooms: 1 });
        }
    }
}

function attackt(creep) {
    if (creep.room.controller) {
        if (creep.room.controller.owner != undefined && creep.room.controller.my == false) {
            var hostileroom = true
        } else {
            var hostileroom = false
        }
    }

    var at = 0
    var targetbody = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: sa => sa.getActiveBodyparts(ATTACK) != 0 && sa.owner.username != 'SteveTrov'
    })
    var target = creep.pos.findClosestByRange(targetbody)
    if (target) {
        attacktarget(creep, target, hostileroom)
        var at = 1
        console.log(creep.room, target)
    }

    var targettower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: tt => tt.structureType == STRUCTURE_TOWER
    })
    if (targettower && at == 0) {
        attacktarget(creep, targettower, hostileroom)
        var at = 2
    }

    var targetstruc = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: tt => tt.structureType != STRUCTURE_CONTROLLER
    })
    if (targetstruc && at == 0) {
        attacktarget(creep, targetstruc, hostileroom)
        var at = 3
    }

    var targetac = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: sa => sa.owner.username != 'SteveTrov'
    })

    if (targetac && at == 0) {
        attacktarget(creep, targetac, hostileroom)
        var at = 4
    }

    var dflag = creep.room.find(FIND_FLAGS, {
        filter: fl => fl.name == 'dismantle'
    })
    if (dflag.length > 0) {
        var dstruc = dflag[0].pos.lookFor(LOOK_STRUCTURES)
        if (dstruc.length > 0) {
            console.log(creep.name + ' dismantle: ' + dstruc[0])
            attacktarget(creep, dstruc[0], hostileroom)
            var at = 5
        }
    }

    /*
        if (Game.flags['Attack'] && at < 1) {
            creep.moveTo(Game.flags['Attack'], { visualizePathStyle: { stroke: '#ff0000' } })
    
        }
        */
    return at
}

var roledefend = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var at = attackt(creep)

        if (at == 0) {
            targetpos = new RoomPosition(25, 24, targetroom)
            creep.moveTo2(targetpos, { reusePath: 50 })
        }
        if (at == 0 && creep.room.name == creep.memory.targetroom) {
            creep.moveTo2(25, 24)
        }
    }
};

module.exports = roledefend;
