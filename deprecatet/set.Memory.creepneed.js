var setMemorycreepneed = {

    run: function () {
        //Set Locations in Memory
        var storenergy = Game.getObjectById(Memory.Location.Room1.Lager).store[RESOURCE_ENERGY]
        Memory.Creepneed = {}
        Memory.Creepneed.Room1 = {}
        Memory.Creepneed.Room1.harvester = 1
        Memory.Creepneed.Room1.miner = 1
        Memory.Creepneed.Room1.carryer = 2
        if (storenergy == 0) {
            Memory.Creepneed.Room1.flag = 0
        } else {
            Memory.Creepneed.Room1.flag = 1
        }
        Memory.Creepneed.Room1.upgrader = 6
        Memory.Creepneed.Room1.repairer = 1
        Memory.Creepneed.Room1.attacker = 0

        if (storenergy >= 10000) {
            var upgrader = Math.ceil((storenergy - 10000) / 25000)
            Memory.Creepneed.Room1.upgraderstorage = upgrader
        } else {
            Memory.Creepneed.Room1.upgraderstorage = 0
        }


        Memory.Creepneed.Room2 = {}
        Memory.Creepneed.Room2.harvesterR = 2
        Memory.Creepneed.Room2.builderR = 0
        Memory.Creepneed.Room2.repairerR = 2

        Memory.Creepneed.Room3 = {}
        Memory.Creepneed.Room3.harvesterR = 4
        Memory.Creepneed.Room3.builderR = 0
        Memory.Creepneed.Room3.repairerR = 1
        Memory.Creepneed.Room3.claim = 1

        Memory.Creepneed.Room4 = {}
        Memory.Creepneed.Room4.repairerR = 1
        Memory.Creepneed.Room4.claim = 1
    }
}

module.exports = setMemorycreepneed;