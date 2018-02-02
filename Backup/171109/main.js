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

var roleMinHarv = require('role.MinHarv')

var buildstrucwall = require('build.struc.wall');
var buildroad = require('build.roads');

var towerattack = require('tower.attack')

var empireroom = require('empire.room')
var creepspawn = require('creepspawn')
const profiler = require('screeps-profiler');

profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function () {
        Memory.CPUMove2 = 0
        Creep.prototype.moveTo2 = function (target, opts) {

            this.moveTo(target, { reusePath: 100, ignoreCreeps: true });
            var cpuvor = Game.cpu.getUsed()
            if (this.memory._move == undefined) {
            } else {
                if (this.memory._move.tile == undefined) {
                    this.memory._move.tile = this.pos
                    this.memory._move.ontile = 0
                } else {
                    if (this.pos.isEqualTo(new RoomPosition(this.memory._move.tile.x, this.memory._move.tile.y, this.memory._move.tile.roomName))) {
                        this.memory._move.ontile += 1
                        //this.say('ontile ' + this.memory._move.ontile)
                    } else {
                        this.memory._move.ontile = 0
                    }
                    if (this.memory._move.ontile >= 3) {
                        this.memory._move = {}
                        this.moveTo(target, { reusePath: 5 });
                    } else {
                        this.memory._move.tile = this.pos
                    }
                }
            }
            var cpunach = Game.cpu.getUsed()
            //console.log (cpunach)
            Memory.CPUMove2 += cpunach - cpuvor
        }

        Memory.signtext = "Hallo"

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
            if (creep.memory.role == 'min_harv') {
                roleMinHarv.run(creep);
            }

        }
        //console.log('cpu used befor rooms: ' + Math.round(Game.cpu.getUsed() * 100) / 100)
        //empireroom.run('E98S81', ['E99S81', 'E98S82', 'E99S82']){targetroom: 'E99S82', todo: 'claim'},

        empireroom.run('W2S18', [
            //{ targetroom: 'W1S17', todo: 'clai' },
            { targetroom: 'W1S18', todo: 'harvest' },
            //{ targetroom: 'E98S82', todo: 'harves:' },
            { targetroom: 'W2S18', todo: 'mineral' }
        ])
        empireroom.run('W2S19', [
            { targetroom: 'W3S19', todo: 'harvest' },
            { targetroom: 'W1S19', todo: 'harvest' },
            //{ targetroom: 'W4S17', todo: 'clai' },
            { targetroom: 'W2S19', todo: 'mineral' }
        ])
        empireroom.run('W1S17', [
            { targetroom: 'W1S16', todo: 'harvest' },
            { targetroom: 'W2S17', todo: 'harvest' },
            { targetroom: 'W2S16', todo: 'harvest' },
            { targetroom: 'W1S17', todo: 'mineral' }
        ])
        empireroom.run('W4S17', [
            { targetroom: 'W3S17', todo: 'harvest' },
            { targetroom: 'W4S18', todo: 'harvest' },
            { targetroom: 'W5S17', todo: 'harvest' },
            { targetroom: 'W4S16', todo: 'keeper' },
            { targetroom: 'W4S17', todo: 'mineral' }
        ])
        //empireroom.run('E97S84', [{ targetroom: 'E97S85', todo: 'harvest' }, {}, { targetroom: 'E97S84', todo: 'mineral' }])
        //empireroom.run('E96S83', [{ targetroom: 'E94S81', todo: 'attac' }, { targetroom: 'E96S82', todo: 'harvest' }, { targetroom: 'E96S83', todo: 'mineral' }])
        //console.log(Game.rooms['W1S17'].controller.progress + ' / ' + Game.rooms['W1S17'].controller.progressTotal + ' --> ' + (Game.rooms['W1S17'].controller.progressTotal - Game.rooms['W1S17'].controller.progress) + ' left')
        var GCLvor = Memory.GCL
        var GCLnach = Math.ceil(Game.gcl.progress)
        var GCLdif = GCLnach - GCLvor
        Memory.GCL = GCLnach

        var tt = Game.time - (Math.floor(Game.time / 100) * 100)
        if (Memory.CPU == undefined) { Memory.CPU = {} }
        Memory.CPU[tt] = Game.cpu.getUsed()
        var cpusumme = _.sum(Memory.CPU) / 100

        console.log('-----------  tick:  ' + Game.time + '   cpu d100:  ' + Math.floor(cpusumme * 100) / 100 + '   cpu limit: ' + Game.cpu.limit + '   bucket: ' + Game.cpu.bucket + '   GCLGain: ' + GCLdif + '  ----------')

























    });
}
