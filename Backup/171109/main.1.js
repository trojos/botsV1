//var setMemoryLocation = require('set.Memory.Location')
//var setMemorycreepneed = require('set.Memory.creepneed')

var roleMiner = require('role.miner');
var roleUpgrader = require('role.upgrader');
var roleUpgraderStorage = require('role.upgraderstorage')

var rolecarry = require('role.carry');
var roleBmstr = require('role.bmstr');
var roledestruct = require('role.destruct');

var roledefend = require('role.defend')

var rolescout = require('role.scout')
var roleattack = require('role.NahDD')
var roleClaim = require('role.claim')

var buildstrucwall = require('build.struc.wall');
var buildroad = require('build.roads');

var towerattack = require('tower.attack')

var empireroom = require('empire.room')
var creepspawn = require('creepspawn')

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    //empireroom.run('E98S81', ['E99S81', 'E98S82', 'E99S82']){targetroom: 'E99S82', todo: 'claim'},
    empireroom.run('E98S81', [{ targetroom: 'E99S81', todo: 'harvest' }, { targetroom: 'E98S82', todo: 'harvest' }, { targetroom: 'E97S82', todo: 'claim' }, { targetroom: 'E97S81', todo: 'attack' }])
    empireroom.run('E97S82', [])

    const broom = 'Bichl'
    var spawnpos = Game.spawns[broom].pos
    var energy1pos = Game.spawns[broom].pos.findClosestByRange(FIND_SOURCES).pos
    var energy2pos = Game.spawns[broom].room.controller.pos.findClosestByRange(FIND_SOURCES).pos
    var controllerpos = Game.spawns[broom].room.controller.pos

    //recyle Creeps mit der role destruct in der Nähe von Spawn 'Bichl'
    var destr = Game.spawns[broom].pos.findInRange(FIND_CREEPS, 1, {
        filter: cr => cr.memory.role == 'destruct'
    })
    for (var c in destr) {
        Game.spawns[broom].recycleCreep(destr[c])
    }

    if (Game.time % 1 === 0) {
        //buildroad.run(Game.flags['Flag2'].pos,Game.flags['Flag1'].pos,1)
        //buildroad.run(spawnpos,Game.getObjectById(Memory.Location.Room3.Controller).pos)
        // buildroad.run(spawnpos,energy2pos)
        // buildroad.run(energy2pos,controllerpos)
        // buildroad.run(spawnpos, Game.getObjectById('58dbc6448283ff5308a41cbd').pos)
        //console.log(Game.getObjectById('58dbc6448283ff5308a41cbd'))
    }
    /*
    if (Game.time % 50 === 0) {
        buildstrucwall.run()
    }
    
    if (Game.time % 10 === 0) {
        buildharvester.run();
    }
    */
    towerattack.run()

    var nameminer = ''
    var namebuilder = ''
    var nameupgrader = ''
    var nameupgraderstor = ''
    var nameflag = ''
    var namerepair = ''
    var namecarry = ''
    var nameminernextroom = ''
    var namebuilderroom2 = ''
    var nameRepairR = ''
    var nameattacker = ''
    var nameclaim = ''
    var namescout = ''

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'destruct') {
            roledestruct.run(creep);

        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
            var nameminer = nameminer + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'carry') {
            rolecarry.run(creep);
            var namecarry = namecarry + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'bmstr') {
            roleBmstr.run(creep);
            var namerepair = namerepair + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
            var nameupgrader = nameupgrader + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'upgraderstorage') {
            roleUpgraderStorage.run(creep)
            var nameupgraderstor = nameupgraderstor + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'scout') {
            rolescout.run(creep)
            var namescout = namescout + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'defend') {
            roledefend.run(creep);
            var nameattacker = nameattacker + ' ' + name + ':' + creep.ticksToLive
        }
        if (creep.memory.role == 'claim') {
            roleClaim.run(creep);
            var nameclaim = nameclaim + ' ' + name + ':' + creep.ticksToLive
        }
    }


    //console.log('MINER: ' + nameminer)
    //console.log('CARRY: ' + namecarry)
    //console.log('HARV R:   ' + nameminernextroom + '     BUILDER R:  ' + namebuilderroom2 + '     REPAIR R:  ' + nameRepairR)
    //console.log('UPGRADER:  ' + nameupgrader + '   UPGRADERSTOR:  ' + nameupgraderstor + '     FLAG:   ' + nameflag)
    //console.log('REPAIR:    ' + namerepair + '     ATTACK:   ' + nameattacker + '     CLAIM:   ' + nameclaim)
    console.log('-----------  cpu used:  ' + Math.round(Game.cpu.getUsed() * 100) / 100 + '   cpu limit: ' + Game.cpu.limit + '     bucket: ' + Game.cpu.bucket + '  ----------')
    //console.log('-----------------------------------------------------------------')




























}
