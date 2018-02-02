var roledeliver = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var targetroom = creep.memory.targetroom
        var targetpos = new RoomPosition(25, 25, targetroom)
        if (creep.room.name == targetroom) {

            var tstore = false
            var tspawn = false
            var tconstr = false

            if (_.sum(creep.carry) > 0) {
                if (Game.rooms[targetroom].storage) { tstore = Game.rooms[targetroom].storage }
                if (tstore) {
                    if (creep.transfer(tstore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo2(tstore)
                    }
                } else { var gorecycle = true }
            } else { var gorecycle = true }

            if (gorecycle) {
                tspawn = Game.rooms[targetroom].find(FIND_MY_SPAWNS)[0]
                if (tspawn) {
                    if (creep.pos.isNearTo(tspawn)) {
                        tspawn.recycleCreep(creep)
                    } else { creep.moveTo2(tspawn) }
                } else {
                    tconstr = Game.rooms[targetroom].find(FIND_MY_CONSTRUCTION_SITES)[0]
                    if (tconstr) {
                        if (creep.pos.isNearTo(tconstr)) {
                            creep.suicide()
                        } else { creep.moveTo2(tconstr) }
                    } else {
                        var tcontroller = Game.rooms[targetroom].controller
                        if (creep.pos.isNearTo(tcontroller)) {
                            creep.suicide()
                        } else { creep.moveTo2(tcontroller) }
                    }
                }
            }
        } else if (creep.room.name == creep.memory.home) {
            var home = creep.memory.home
            if (_.sum(creep.carry) < creep.carryCapacity) {
                var hstore = Game.rooms[home].storage
                if (creep.withdraw(hstore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo2(hstore)
                }
            } else {
                creep.moveTo2(targetpos, { reusePath: 50 })
            }
        } else {
            creep.moveTo2(targetpos, { reusePath: 50 })
        }

    }
};

module.exports = roledeliver;
