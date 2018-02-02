function getcarrypush2(creep, home) {
    var Aufträge = []
    var eneed = Memory.rooms[home].energy.need
    var eneedsize = _.size(eneed)
    var maxcount = 10
    var voll = false
    if (eneedsize > 0) {
        if (eneedsize == 1) {
            var Auftrag = eneed[Object.keys(eneed)[0]]
            if (Auftrag.amount - (_.sum(creep.carry)) <= 0) {
                delete Memory.rooms[home].energy.need[Auftrag.id]
            } else {
                Memory.rooms[home].energy.need[Auftrag.id].amount -= (_.sum(creep.carry))
            }
            Aufträge.push(Auftrag)
            return Aufträge
        } else {
            var crcarry = _.sum(creep.carry)
            var Auftrag = _.max(eneed, s => creep.pos.getRangeTo(s.pos.x, s.pos.y))
            var Lieferpfad = PathFinder.search(creep.pos, { pos: Auftrag.pos, range: 1 }, {
                maxRooms: 0, plainCost: 2, swampCost: 10,
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;
                    room.find(FIND_STRUCTURES).forEach(function (struct) {
                        if (struct.structureType === STRUCTURE_ROAD) {
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART ||
                                !struct.my)) {
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });
                    room.find(FIND_CREEPS).forEach(function (creep) {       // Avoid creeps in the room
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });
                    return costs;
                },
            })
            Lieferpfad = Lieferpfad.path
            if (Lieferpfad.length > 0) {
            } else { Lieferpfad.push(creep.pos) }
            for (const i in Lieferpfad) {
                creep.room.visual.circle(Lieferpfad[i].x, Lieferpfad[i].y, { fill: '#85e085', radius: 0.20 })
                var AufträgeinRange = _.filter(eneed, s => Lieferpfad[i].getRangeTo(s.pos.x, s.pos.y) <= 1)
                for (const j in AufträgeinRange) {
                    if (crcarry > 0 && eneedsize > 0 && maxcount > 0) {
                        if (AufträgeinRange[j].amount - (_.sum(creep.carry)) <= 0) {
                            delete Memory.rooms[home].energy.need[AufträgeinRange[j].id]
                        } else {
                            Memory.rooms[home].energy.need[AufträgeinRange[j].id].amount -= (_.sum(creep.carry))
                        }
                        Aufträge.push(AufträgeinRange[j])
                        crcarry -= AufträgeinRange[j].amount
                        eneedsize -= 1
                        maxcount -= 1
                    } else { voll = true; break }
                }
                if (voll) { break }
            }
            return Aufträge
        }
    } else {
        Auftrag = Memory.rooms[home].energy.Lager
        Auftrag.Art = 'push'
        Aufträge.push(Auftrag)
    }
    return Aufträge;
}

function getcarryget(creep, home) {
    var Aufträge = []
    var ehave = Memory.rooms[home].energy.have
    if (_.size(ehave) > 0) {
        Auftrag = _.min(ehave, s => creep.pos.getRangeTo(s.pos.x, s.pos.y))
        if (Auftrag.amount - (creep.carryCapacity - _.sum(creep.carry)) <= 0) {
            delete Memory.rooms[home].energy.have[Auftrag.id]
        } else {
            Memory.rooms[home].energy.have[Auftrag.id].amount -= (creep.carryCapacity - _.sum(creep.carry))
        }
    } else {
        var eneed = Memory.rooms[home].energy.need
        if (_.size(eneed) > 0) {
            Auftrag = Memory.rooms[home].energy.Lager
            Auftrag.Art = 'get'
        } else {
            Auftrag = { Art: 'wait' }
        }
    }
    Aufträge.push(Auftrag)
    return Aufträge
}


var rolecarry2 = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var testcarry = 'carry2_4669'
        if (creep.memory.Aufträge == undefined) { creep.memory.Aufträge = [] }

        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting && _.sum(creep.carry) == creep.carryCapacity) {

            creep.memory.harvesting = false;
        }

        //creep.memory.Auftrag = {}

        var Aufträge = creep.memory.Aufträge
        //creep.say(Auftrag.id)

        var home = creep.memory.home

        if (Memory.rooms[home].Lager == false) {
            var Lager = false
            var idle = Memory.rooms[home].Spawn
        } else {
            var Lager = true
            var idle = Memory.rooms[home].Lager
        }

        if (Aufträge.length > 0) {
            if (_.sum(creep.carry) == creep.carryCapacity && Aufträge[0].Art == 'get') {  //Zur Sicherheit. Wenn Voll aber trotzdem pull-Auftrag dann den Auftrag löschen
                creep.say('voll du deppp')
                Aufträge = []
            } else if (_.sum(creep.carry) == 0 && Aufträge[0].Art == 'push') {
                creep.say('leerer wirds nicht')
                Aufträge = []
            }
        }

        if (Aufträge.length == 0 || Aufträge[0].Art == 'wait') {
            if (creep.carry[RESOURCE_ENERGY] < 50) {
                Aufträge = getcarryget(creep, home)
            } else {
                Aufträge = getcarrypush2(creep, home)
            }

            // if (_.sum(creep.carry) < creep.carryCapacity) {
            //     Aufträge = getcarryget(creep, home)
            // } else {

            // }
            creep.memory.Aufträge = Aufträge
        }

        if (Aufträge.length > 0) {
            if (Aufträge[0].Art == 'push') {
                creep.room.visual.circle(creep.pos.x, creep.pos.y, { fill: '#85e085', radius: 0.55 })
                var zielpos = new RoomPosition(Aufträge[0].pos.x, Aufträge[0].pos.y, Aufträge[0].pos.roomName)
                if (creep.pos.isNearTo(zielpos)) {
                    var ziel = Game.getObjectById(Aufträge[0].id)
                    var erfolg = creep.transfer(ziel, Aufträge[0].res)
                    if (erfolg == 0 || erfolg == -8) {
                        Aufträge.splice(0, 1)
                    }
                    if (Aufträge.length < 1) {
                        if (_.sum(creep.carry) > 0) {
                            Aufträge = getcarrypush2(creep, home)
                        }
                    }
                } else {
                    creep.moveTo2(zielpos)
                }
            }
        }
        if (Aufträge.length > 0) {
            if (Aufträge[0].Art == 'get') {
                creep.room.visual.circle(creep.pos.x, creep.pos.y, { fill: '#ff8080', radius: 0.55 })
                var zielpos = new RoomPosition(Aufträge[0].pos.x, Aufträge[0].pos.y, Aufträge[0].pos.roomName)
                if (creep.pos.isNearTo(zielpos)) {
                    var ziel = Game.getObjectById(Aufträge[0].id)
                    if (Aufträge[0].type == 'drop') {
                        var erfolg = creep.pickup(ziel, Aufträge[0].res)
                        creep.say(erfolg)
                        if (erfolg == 0 || erfolg == -7) {
                            Aufträge.splice(0, 1)
                            creep.memory.Aufträge = Aufträge
                        }
                    } else {
                        var erfolg = creep.withdraw(ziel, Aufträge[0].res)
                        if (erfolg == 0 || erfolg == -6) {
                            Aufträge.splice(0, 1)
                            creep.memory.Aufträge = Aufträge
                        }
                    }
                } else {
                    creep.moveTo2(zielpos)
                }
            }
        }
    }
};

module.exports = rolecarry2;
