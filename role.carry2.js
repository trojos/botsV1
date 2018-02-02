function getcarrypush2(creep, home) {
    var Aufträge = []
    if (creep.carry[RESOURCE_ENERGY] > 0) {

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
            if (Memory.rooms[home].energy.Lager) {
                Auftrag = Memory.rooms[home].energy.Lager
                Auftrag.Art = 'push'
                Aufträge.push(Auftrag)
            }
        }
    } else {
        carrymineral = Object.keys(creep.carry)[1]
        //console.log(creep.room)
        if (Memory.rooms[home].Labs == undefined) {
            eneed = {}
        } else if (Memory.rooms[home].Labs.Minerals == undefined) {
            eneed = {}
        } else {
            eneed = Memory.rooms[home].Labs.Minerals.need
            eneed = _.filter(eneed, { res: carrymineral })
        }
        var eneedsize = _.size(eneed)
        if (eneedsize > 0) {

            var Auftrag = eneed[Object.keys(eneed)[0]]
            if (Auftrag.amount - (_.sum(creep.carry)) <= 0) {
                delete Memory.rooms[home].Labs.Minerals.need[Auftrag.id]
            } else {
                Memory.rooms[home].Labs.Minerals.need[Auftrag.id].amount -= (_.sum(creep.carry))
            }
            Aufträge.push(Auftrag)
            return Aufträge
        } else {

            if (Memory.rooms[home].Labs == undefined) {
                if (Game.rooms[home].terminal) {
                    var terminal = Game.rooms[home].terminal
                    Auftrag = { id: terminal.id, type: 'terminal', res: carrymineral, amount: creep.carry[carrymineral], pos: terminal.pos, Art: 'push' }
                } else {
                    Auftrag = Memory.rooms[home].energy.Lager
                    Auftrag.res = carrymineral
                    Auftrag.Art = 'push'
                }
                Aufträge.push(Auftrag)
            } else {
                console.log(creep.pos.roomName, creep.name)
                if (Memory.rooms[home].Labs.Minerals == undefined){  //Wenn kein Terminal wird in Storage geliefert
                    Auftrag = Memory.rooms[home].energy.Lager
                } else {
                    Auftrag = Memory.rooms[home].Labs.Minerals.Terminal
                }
                
                Auftrag.res = carrymineral
                Auftrag.Art = 'push'
                Aufträge.push(Auftrag)
            }
        }
    }
    return Aufträge;
}

function getcarryget(creep, home) {
    var Aufträge = []
    var ehave = Memory.rooms[home].energy.have
    if (Memory.rooms[home].Labs == undefined) { var mhave = {} } else {
        if (Memory.rooms[home].Labs.Minerals == undefined) { var mhave = {} } else { var mhave = Memory.rooms[home].Labs.Minerals.have }
    }
    if (_.size(ehave) > 0) {
        Auftrag = _.min(ehave, s => creep.pos.getRangeTo(s.pos.x, s.pos.y))
        if (Auftrag.amount - (creep.carryCapacity - _.sum(creep.carry)) <= 0) {
            delete Memory.rooms[home].energy.have[Auftrag.id]
        } else {
            Memory.rooms[home].energy.have[Auftrag.id].amount -= (creep.carryCapacity - _.sum(creep.carry))
        }
    } else if (_.size(mhave) > 0) {
        Auftrag = mhave[Object.keys[0]]
        Auftrag = _.min(mhave, s => creep.pos.getRangeTo(s.pos.x, s.pos.y))
        //console.log(home, creep.name)
        if (Auftrag.amount - (creep.carryCapacity - _.sum(creep.carry)) <= 0) {
            delete Memory.rooms[home].Labs.Minerals.have[Auftrag.id]
        } else {
            Memory.rooms[home].Labs.Minerals.have[Auftrag.id].amount -= (creep.carryCapacity - _.sum(creep.carry))
        }
    } else {
        var eneed = Memory.rooms[home].energy.need
        if (Memory.rooms[home].Labs == undefined) { var mneed = {} } else {
            if (Memory.rooms[home].Labs.Minerals == undefined) { var mneed = {} } else { var mneed = Memory.rooms[home].Labs.Minerals.need }
        }
        if (_.size(eneed) > 0) {
            if (Memory.rooms[home].energy.Lager == undefined) { } else {
                Auftrag = Memory.rooms[home].energy.Lager
                Auftrag.Art = 'get'
            }
        } else if (_.size(mneed > 0)) {
        }
        else {
            Auftrag = { Art: 'wait' }
        }
    }
    Aufträge.push(Auftrag)
    return Aufträge
}


var rolecarry2 = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.Aufträge == undefined) { creep.memory.Aufträge = [] }
        //creep.memory.Aufträge = []



        var Aufträge = creep.memory.Aufträge
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
        if (Aufträge.length > 0) {
            if (Aufträge[0].Art == 'get' || Aufträge[0].Art == 'push') {  //WORKAROUND, EIGENTLICHEN FEHLER FINDEN!!!!! creeps bekommen Aufträge aus anderen Räumen. Wieso??? Das geht dann ned!
                if (Aufträge[0].pos.roomName != creep.memory.home) {
                    Aufträge = []
                    console.log(creep.pos.roomName, 'Auftrag in einem anderem Raum du depp')
                }
            }
        }

        //console.log(creep.name)
        if (Aufträge.length == 0 || Aufträge[0].Art == 'wait') {
            if (creep.carry[RESOURCE_ENERGY] > 50) {
                Aufträge = getcarrypush2(creep, home)
            } else if (_.sum(creep.carry) - creep.carry[RESOURCE_ENERGY] > 0) {
                Aufträge = getcarrypush2(creep, home)
            } else {
                Aufträge = getcarryget(creep, home)
            }
            creep.memory.Aufträge = Aufträge
        }

        if (Aufträge.length > 0) {
            if (Aufträge[0].Art == 'push') {
                creep.room.visual.circle(creep.pos.x, creep.pos.y, { fill: '#85e085', radius: 0.55 })
                if (creep.carry[Aufträge[0].res] == null) {
                    console.log(creep.name, 'hab ich nicht')
                    Aufträge.splice(0, 1)
                }


                var zielpos = new RoomPosition(Aufträge[0].pos.x, Aufträge[0].pos.y, Aufträge[0].pos.roomName)
                if (creep.pos.isNearTo(zielpos)) {
                    var ziel = Game.getObjectById(Aufträge[0].id)
                    var erfolg = creep.transfer(ziel, Aufträge[0].res)
                    //console.log(creep.name, erfolg)
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
