var mineralrezepte = {
    run: function () {
        var rezepte = {}
        rezepte = {
            G: {
                name: 'G', prod: 7, rezept: {
                    A: { type: 'prod', mineral: 'ZK', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'Z' },
                    A2: { type: 'source', mineral: 'K' },
                    B: { type: 'prod', mineral: 'UL', source1: 'B1', source2: 'B2' },
                    B1: { type: 'source', mineral: 'U' },
                    B2: { type: 'source', mineral: 'L' },
                    C: { type: 'prod', mineral: 'G', source1: 'A', source2: 'B' },
                }
            },
            LHO2: {
                name: 'LHO2', prod: 6, rezept: {
                    A: { type: 'prod', mineral: 'LO', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'L' },
                    A2: { type: 'source', mineral: 'O' },
                    B: { type: 'prod', mineral: 'OH', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'H' },
                    C: { type: 'prod', mineral: 'LHO2', source1: 'A', source2: 'B' },
                }
            },
            KHO2: {
                name: 'KHO2', prod: 6, rezept: {
                    A: { type: 'prod', mineral: 'KO', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'K' },
                    A2: { type: 'source', mineral: 'O' },
                    B: { type: 'prod', mineral: 'OH', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'H' },
                    C: { type: 'prod', mineral: 'KHO2', source1: 'A', source2: 'B' },
                }
            },
            GHO2: {
                name: 'GHO2', prod: 6, rezept: {
                    A: { type: 'prod', mineral: 'GO', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'G' },
                    A2: { type: 'source', mineral: 'O' },
                    B: { type: 'prod', mineral: 'OH', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'H' },
                    C: { type: 'prod', mineral: 'GHO2', source1: 'A', source2: 'B' },
                }
            },
            GH2O: {
                name: 'GH2O', prod: 6, rezept: {
                    A: { type: 'prod', mineral: 'GH', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'G' },
                    A2: { type: 'source', mineral: 'H' },
                    B: { type: 'prod', mineral: 'OH', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'O' },
                    C: { type: 'prod', mineral: 'GH2O', source1: 'A', source2: 'B' },
                }
            },
            XLHO2_XKHO2: {
                name: 'XLHO2_XKHO2', prod: 5, rezept: {
                    A: { type: 'prod', mineral: 'XLHO2', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'LHO2' },
                    A2: { type: 'source', mineral: 'X' },
                    B: { type: 'prod', mineral: 'XKHO2', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'KHO2' },
                }
            },
            XGH2O_XGHO2: {
                name: 'XGH2O_XGHO2', prod: 5, rezept: {
                    A: { type: 'prod', mineral: 'XGH2O', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'GH2O' },
                    A2: { type: 'source', mineral: 'X' },
                    B: { type: 'prod', mineral: 'XGHO2', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'GHO2' },
                }
            },
            ZweixXGH2O: {
                name: 'ZweixXGH2O', prod: 5, rezept: {
                    A: { type: 'prod', mineral: 'XGH2O', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'GH2O' },
                    A2: { type: 'source', mineral: 'X' },
                    B: { type: 'prod', mineral: 'XGH2O', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'GH2O' },
                }
            },
            XZHO2_XZH2O: {
                name: 'XZHO2_XZH2O', prod: 5, rezept: {
                    A: { type: 'prod', mineral: 'XZHO2', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'ZHO2' },
                    A2: { type: 'source', mineral: 'X' },
                    B: { type: 'prod', mineral: 'XZH2O', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'ZH2O' },
                }
            },
            ZHO2: {
                name: 'ZHO2', prod: 6, rezept: {
                    A: { type: 'prod', mineral: 'ZO', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'Z' },
                    A2: { type: 'source', mineral: 'O' },
                    B: { type: 'prod', mineral: 'OH', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'H' },
                    C: { type: 'prod', mineral: 'ZHO2', source1: 'A', source2: 'B' },
                }
            },
            ZH2O: {
                name: 'ZH2O', prod: 6, rezept: {
                    A: { type: 'prod', mineral: 'ZH', source1: 'A1', source2: 'A2' },
                    A1: { type: 'source', mineral: 'Z' },
                    A2: { type: 'source', mineral: 'H' },
                    B: { type: 'prod', mineral: 'OH', source1: 'B1', source2: 'A2' },
                    B1: { type: 'source', mineral: 'O' },
                    C: { type: 'prod', mineral: 'ZH2O', source1: 'A', source2: 'B' },
                }
            },
        }

        Memory.rezepte = rezepte
    }
}


module.exports = mineralrezepte;

