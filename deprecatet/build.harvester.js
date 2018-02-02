var creepspawn = require('creepspawn')

var buildharvester = {

    run: function () {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

        var energycap = Game.spawns['Bichl'].room.energyCapacityAvailable
        var energyavail = Game.spawns['Bichl'].room.energyAvailable
        console.log('energy available:  ' + energyavail + '/' + energycap)

        var nametick = Game.time - 20320000

        //harvester
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var needharv = false
        var needcarry = false

        /*
        for (var name in harvesters) {
            var creep = harvesters[name];
            if (creep.ticksToLive < 50) {
                needharv = true
            }
        }

        //creepspawn.miner(Memory.Location.Room1.name, '', 'small')
        if (harvesters.length < Memory.Creepneed.Room1.harvester) {
            needharv = true
            switch (true) {
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, MOVE], 'harvester_' + nametick, { role: 'harvester' })
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], 'harvester_' + nametick, { role: 'harvester', spawn: '' });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE], 'harvester_' + nametick, { role: 'harvester', spawn: '' });
                    break
            }
            console.log('Spawning new harvester: ' + newName);
        }

        //carry
        var carrys = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
        var needcarry = false
        if (carrys.length < Memory.Creepneed.Room1.carryer) {
            needcarry = true
            switch (true) {
                case needharv:
                    var newName = 'Wait for Harvester-spawn'
                    break;
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'carry_' + nametick, { role: 'carry' });
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'carry_' + nametick, { role: 'carry' });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'carry_' + nametick, { role: 'carry' });
                    break
            }
            console.log('Spawning new carry: ' + newName);
        }

        //builder
        var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if (builder.length < 0) {
            var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, CARRY, MOVE, MOVE], undefined, { role: 'builder', building: false });
            console.log('Spawning new builder: ' + newName);
        }

        //upgrade    
        var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if (upgrader.length < Memory.Creepneed.Room1.upgrader) {
            switch (true) {
                case needharv:
                    var newName = 'Wait for Harvester-spawn'
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, CARRY, MOVE], 'upgrader_' + nametick, { role: 'upgrader' });
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'upgrader_' + nametick, { role: 'upgrader' });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'upgrader_' + nametick, { role: 'upgrader' });
                    break
            }
            console.log('Spawning new upgrader: ' + newName);
        }

        //upgraderstorage    
        var upgraderstorage = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgraderstorage');

        if (upgraderstorage.length < Memory.Creepneed.Room1.upgraderstorage) {
            switch (true) {
                case needharv:
                    var newName = 'Wait for Harvester-spawn'
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, CARRY, MOVE], 'upgrstore_' + nametick, { role: 'upgraderstorage' });
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'upgrstore_' + nametick, { role: 'upgraderstorage' });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'upgrstore_' + nametick, { role: 'upgraderstorage' });
                    break
            }
            console.log('Spawning new upgraderstorage: ' + newName);
        }

        //flag    
        var flager = _.filter(Game.creeps, (creep) => creep.memory.role == 'flag');

        if (flager.length < Memory.Creepneed.Room1.flag) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, CARRY, MOVE], 'flag_' + nametick, { role: 'flag', harvesting: true });
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'flag_' + nametick, { role: 'flag', harvesting: true });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'flag_' + nametick, { role: 'flag', harvesting: true });
                    break
            }
            console.log('Spawning new flager: ' + newName);
        }

        

        //repair   
        var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repair');

        if (repairer.length < Memory.Creepneed.Room1.repairer) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, CARRY, MOVE, MOVE], 'repair_' + nametick, { role: 'repair', repairing: false });
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'repair_' + nametick, { role: 'repair', repairing: false, onsite: false });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'repair_' + nametick, { role: 'repair', repairing: false, onsite: false });
                    break
            }
            console.log('Spawning new repairer: ' + newName);
        }

        //harvesterR2
        var harvesterR2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvesterR' && creep.memory.targetroom == 'Room2');

        if (harvesterR2.length < Memory.Creepneed.Room2.harvesterR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], 'harvR2_' + nametick, { role: 'harvesterR', targetroom: 'Room2', harvesting: true });
                    console.log('Spawning new harvesterR2: ' + newName);
                    break
            }

        }
        //harvesterR3
        var harvesterR3 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvesterR' && creep.memory.targetroom == 'Room3');

        if (harvesterR3.length < Memory.Creepneed.Room3.harvesterR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], 'harvR3_' + nametick, { role: 'harvesterR', targetroom: 'Room3', harvesting: true });
                    console.log('Spawning new harvesterR3: ' + newName);
                    break
            }

        }


        //builderroom2 
        var builderR2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'builderR' && creep.memory.targetroom == 'Room2');
        if (builderR2.length < Memory.Creepneed.Room2.builderR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'builderR2_' + nametick, { role: 'builderR', targetroom: 'Room2', harvesting: true });
                    break
            }
        }
        //builderroom3  
        var builderR3 = _.filter(Game.creeps, (creep) => creep.memory.role == 'builderR' && creep.memory.targetroom == 'Room3');

        if (builderR3.length < Memory.Creepneed.Room3.builderR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'builderR3_' + nametick, { role: 'builderR', targetroom: 'Room3', harvesting: true });
                    break
            }
        }

        //repairR room2 
        var repairR = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairR' && creep.memory.targetroom == 'Room2');
        if (repairR.length < Memory.Creepneed.Room2.repairerR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, CARRY, CARRY, MOVE, MOVE], 'repairR2_' + nametick, { role: 'repairR', targetroom: 'Room2', repairing: false, onsite: false });
                    break
            }
        }
        //repairR room3 
        var repairR = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairR' && creep.memory.targetroom == 'Room3');

        if (repairR.length < Memory.Creepneed.Room3.repairerR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, CARRY, CARRY, MOVE, MOVE], 'repairR3_' + nametick, { role: 'repairR', targetroom: 'Room3', repairing: false, onsite: false });
                    break
            }
        }
        //repairR room4 
        var repairR = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairR' && creep.memory.targetroom == 'Room4');

        if (repairR.length < Memory.Creepneed.Room4.repairerR) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([WORK, CARRY, CARRY, MOVE, MOVE], 'repairR4_' + nametick, { role: 'repairR', targetroom: 'Room4', repairing: false, onsite: false });
                    break
            }
        }


        //Reserver Room 3
        var claim = _.filter(Game.creeps, (creep) => creep.memory.role == 'claim' && creep.memory.targetroom == 'Room3');
        if (claim.length < Memory.Creepneed.Room3.claim) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE], 'ReserveR3_' + nametick, { role: 'claim', targetroom: 'Room3', controll: 'reserve' });
                    break
            }
            console.log('Spawning new claim: ' + newName);
        }
        //Reserver Room 4
        var claim = _.filter(Game.creeps, (creep) => creep.memory.role == 'claim' && creep.memory.targetroom == 'Room4');
        if (claim.length < Memory.Creepneed.Room4.claim) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE], 'ReserveR4_' + nametick, { role: 'claim', targetroom: 'Room4', controll: 'reserve' });
                    break
            }
            console.log('Spawning new claim: ' + newName);
        }
*/
        //attacker 
        var attacker = _.filter(Game.creeps, (creep) => creep.memory.role == 'attack');

        if (attacker.length < Memory.Creepneed.Room1.attacker) {
            switch (true) {
                case needharv:
                    break;
                case needcarry:
                    var newName = 'Wait for Carry-spawn'
                    break;
                case (energycap < 550):
                    var newName = Game.spawns['Bichl'].createCreep([ATTACK, ATTACK, MOVE, MOVE], 'attack_' + nametick, { role: 'attack' });
                    break
                case (energycap < 800):
                    var newName = Game.spawns['Bichl'].createCreep([ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'attack_' + nametick, { role: 'attack' });
                    break
                case (energycap >= 800):
                    var newName = Game.spawns['Bichl'].createCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], 'attack_' + nametick, { role: 'attack' });
                    break
            }
            console.log('Spawning new attacker: ' + newName);
        }


        if (Game.spawns['Bichl'].spawning) {
            var spawningCreep = Game.creeps[Game.spawns['Bichl'].spawning.name];
            Game.spawns['Bichl'].room.visual.text(
                '🛠️ ' + spawningCreep.name,
                Game.spawns['Bichl'].pos.x + 2,
                Game.spawns['Bichl'].pos.y,
                { align: 'left', opacity: 0.8 });
        }

    }
};

module.exports = buildharvester;
