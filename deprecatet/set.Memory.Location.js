var setMemoryLocation = {

    run: function () {
        //Set Locations in Memory
        var room1spawn1 = 'Bichl'
        var poscontainer1 = Game.spawns[room1spawn1].room.getPositionAt(Game.spawns[room1spawn1].pos.x + 2, Game.spawns[room1spawn1].pos.y)
        Memory.Location = {}
        Memory.Location.Room1 = {}
        Memory.Location.Room1.name = Game.spawns[room1spawn1].room.name
        Memory.Location.Room1.Spawn1 = Game.spawns[room1spawn1].id
        Memory.Location.Room1.Controller = Game.spawns[room1spawn1].room.controller.id
        Memory.Location.Room1.Container = {}
        Memory.Location.Room1.Container.pos = poscontainer1
        var container1 = poscontainer1.lookFor(LOOK_STRUCTURES)
        for (i in container1) {
            if (container1[i].structureType = STRUCTURE_CONTAINER) {
                Memory.Location.Room1.Lager = container1[i].id
            }
        }
        var havestore = Game.rooms['E98S81'].find(FIND_STRUCTURES, {
            filter: struc => struc.structureType == STRUCTURE_STORAGE
        })
        
        if (havestore.length > 0) {
            Memory.Location.Room1.Lager = havestore[0].id
        }

        //Memory.Location.Room1.Lager = '596b433ee66047270687780c'   --> in build.struc.wall
        Memory.Location.Room1.sources = {}
        Memory.Location.Room1.sources.nearSpawn = {}
        Memory.Location.Room1.sources.nearSpawn.id = Game.spawns['Bichl'].pos.findClosestByRange(FIND_SOURCES).id
        Memory.Location.Room1.sources.nearSpawn.spots = 1
        Memory.Location.Room1.sources.second = {}
        Memory.Location.Room1.sources.second.id = Game.spawns['Bichl'].room.find(FIND_SOURCES, {
            filter: (sources) => sources.id != Memory.Location.Room1.sources.nearSpawn.id
        })[0].id;
        Memory.Location.Room1.sources.second.spots = 3

        Memory.Location.Room2 = {}
        Memory.Location.Room2.name = 'E98S82'
        Memory.Location.Room2.Spawn1 = ''
        Memory.Location.Room2.Controller = ''
        Memory.Location.Room2.sources = {}
        Memory.Location.Room2.sources.nearSpawn = {}
        Memory.Location.Room2.sources.nearSpawn.id = '58dbc6448283ff5308a41cbd'
        Memory.Location.Room2.sources.nearSpawn.spots = 3
        Memory.Location.Room2.sources.second = {}
        Memory.Location.Room2.sources.second.id = ''//Game.spawns['Bichl'].room.find(FIND_SOURCES, {
        //                           filter: (sources) => sources.id != Memory.Location.Room1.sources.nearSpawn.id
        //                           })[0].id;
        Memory.Location.Room2.sources.second.spots = ''

        Memory.Location.Room3 = {}
        Memory.Location.Room3.name = 'E99S81'
        Memory.Location.Room3.Spawn1 = ''
        Memory.Location.Room3.Controller = '58dbc6698283ff5308a41f3f'
        Memory.Location.Room3.sources = {}
        Memory.Location.Room3.sources.nearSpawn = {}
        Memory.Location.Room3.sources.nearSpawn.id = '58dbc6698283ff5308a41f40'
        Memory.Location.Room3.sources.nearSpawn.spots = 3
        Memory.Location.Room3.sources.second = {}
        Memory.Location.Room3.sources.second.id = '58dbc6698283ff5308a41f41'//Game.spawns['Bichl'].room.find(FIND_SOURCES, {
        //                           filter: (sources) => sources.id != Memory.Location.Room1.sources.nearSpawn.id
        //                           })[0].id;
        Memory.Location.Room3.sources.second.spots = 2

        Memory.Location.Room4 = {}
        Memory.Location.Room4.name = 'E99S82'
    }


}

module.exports = setMemoryLocation;