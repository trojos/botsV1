function getspawn(room) {
    var xspawn = Game.rooms[room].find(FIND_MY_STRUCTURES, {
        filter: struc => struc.structureType == STRUCTURE_SPAWN && struc.spawning == null
    });
    return xspawn;
}
function getbodycost(cbody) {
    var cost = 0
    for (var part in cbody) {
        cost = cost + BODYPART_COST[cbody[part]]
    }
    return cost
}
function maxbody(cbody, maxcost) {
    var cost = getbodycost(cbody)
    var xbody = Math.floor(maxcost / cost)
    if (xbody > 1) {
        var newbody = cbody
        for (var i = 1; i < xbody; i++) {
            newbody = newbody.concat(cbody)
        }
    } else {
        var newbody = cbody
    }
    return newbody

}


var creepspawn = {
    newcreep: function (home, role, maxcost, cbody, cmem) {
        var ttick = Math.floor(Game.time / 10000)
        ttick = ttick * 10000
        var nametick = Game.time - ttick
        var cname = role + '_' + nametick
        if (getspawn(home).length > 0) {
            //console.log('newcreep: ' + getspawn(home) + ' ' + role + ' ' + maxbody(cbody, maxcost) + ' ' + cmem)
            var newname = getspawn(home)[0].createCreep(maxbody(cbody, maxcost), cname, cmem)
            console.log('new Spawn at ' + getspawn(home)[0] + ' :' + newname)
        } else {
            console.log('Kein Spawn frei in ' + home + ' für ' + cname)
        }
    }
}

module.exports = creepspawn;