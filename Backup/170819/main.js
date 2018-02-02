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
const profiler = require('screeps-profiler');

//profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function () {

        Memory.Attack.E98S83.Sammelpunkt.roomName = 'E98S82'

        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

        if (Game.time % 1 === 0) {

        }

        towerattack.run()

        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role == 'destruct') {
                roledestruct.run(creep);
            }
            if (creep.memory.role == 'miner') {
                roleMiner.run(creep);
            }
            if (creep.memory.role == 'carry') {
                rolecarry.run(creep);
            }
            if (creep.memory.role == 'bmstr') {
                roleBmstr.run(creep);
            }
            if (creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if (creep.memory.role == 'upgraderstorage') {
                roleUpgraderStorage.run(creep)
            }
            if (creep.memory.role == 'scout') {
                rolescout.run(creep)
            }
            if (creep.memory.role == 'defend') {
                roledefend.run(creep);
            }
            if (creep.memory.role == 'claim') {
                roleClaim.run(creep);
            }
        }

        //empireroom.run('E98S81', ['E99S81', 'E98S82', 'E99S82']){targetroom: 'E99S82', todo: 'claim'},
        empireroom.run('E98S81', [{ targetroom: 'E99S81', todo: 'harvest' }, { targetroom: 'E98S82', todo: 'harvest' }, { targetroom: 'E98S83', todo: 'attac' }, { targetroom: 'E97S81', todo: '' }])
        empireroom.run('E97S82', [{ targetroom: 'E97S81', todo: 'harvest' }, { targetroom: 'E97S83', todo: 'harvest' }])


        console.log('-----------  cpu used:  ' + Math.round(Game.cpu.getUsed() * 100) / 100 + '   cpu limit: ' + Game.cpu.limit + '     bucket: ' + Game.cpu.bucket + '  ----------')





























    });
}
