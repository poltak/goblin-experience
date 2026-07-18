import { initDailyLoot, wirePinnedLoot, wireBackpack, renderBackpack, wireScraps } from './mouth.js';
import { initNavigation, initAddressBarHex, initMisreadEngine, initRedactionRite, initThemeSwitchboard, initGoblinFace } from './ui.js';
import { initAtmospherics } from './atmo.js';
import { initGoblinWhisperStone } from './whisper.js';
import { 
    initGlintGrid, initWhisperingWires, initSootSprawl, initMothSwarm, initSparkDrift, initParticleScraps, initSparkMothWall, initRuneDrift, initSigilScriber, initInkblotMirror, 
    initCaveDrone, initLichenBloom, initCaveConstellations, initGeodeGrower, 
    initEchoTopography, initNeedleOfNoise, initSporeGarden, initVoidPebbles, initWarpLoom, initDataCrystals, initEchoLattice, initDigitalFossil, initStaticHum, initMarrowDensity, initSpectralFrequency, initLogicLabyrinth, initGlowWormBurrow, initCircuitSkeleton, initStaticWell, initOilParasite, initDraftlandsAtlas, initBitRotDecay, initMarrowFlute, initShadowWeaver, initFuzzField, initBoneWeaver, initGlitchShifter, initMossMelt
} from './labs.js';
import { initChronicleTools, loadEntry } from './library.js';

const initializers = [
    [() => initNavigation(viewId => {
        if (viewId === 'lab') {
            [
                initGlintGrid, initWhisperingWires, initSootSprawl, initMothSwarm, initSparkDrift, initParticleScraps, initSparkMothWall, initRuneDrift, initSigilScriber, initInkblotMirror, 
                initCaveDrone, initLichenBloom, initCaveConstellations, initGeodeGrower, 
                initEchoTopography, initNeedleOfNoise, initSporeGarden, initVoidPebbles, 
                initWarpLoom, initDataCrystals, initEchoLattice, initDigitalFossil, initStaticHum, initMarrowDensity, initSpectralFrequency, initLogicLabyrinth, initGlowWormBurrow, initCircuitSkeleton, initStaticWell, initOilParasite, initDraftlandsAtlas, initBitRotDecay, initMarrowFlute, initShadowWeaver, initFuzzField, initBoneWeaver, initGlitchShifter, initMossMelt
            ].forEach(fn => {
                try { fn(); } catch (e) { console.error(`[Vort] Lab refresh failed`, e); }
            });
        }
    }), 'Navigation'],
    [initDailyLoot, 'DailyLoot'],
    [wirePinnedLoot, 'PinnedLoot'],
    [wireBackpack, 'Backpack'],
    [renderBackpack, 'RenderBackpack'],
    [wireScraps, 'Scraps'],
    [initAddressBarHex, 'AddressBarHex'],
    [initMisreadEngine, 'MisreadEngine'],
    [initRedactionRite, 'RedactionRite'],
    [initThemeSwitchboard, 'ThemeSwitchboard'],
    [initGoblinFace, 'GoblinFace'],
    [initAtmospherics, 'Atmospherics'],
    [initGoblinWhisperStone, 'WhisperStone'],
    [initGlintGrid, 'GlintGrid'],
    [initWhisperingWires, 'WhisperingWires'],
    [initSootSprawl, 'SootSprawl'],
    [initMothSwarm, 'MothSwarm'],
    [initSparkDrift, 'SparkDrift'],
    [initParticleScraps, 'ParticleScraps'],
    [initSparkMothWall, 'SparkMothWall'],
    [initRuneDrift, 'RuneDrift'],
    [initSigilScriber, 'SigilScriber'],
    [initInkblotMirror, 'InkblotMirror'],
    [initCaveDrone, 'CaveDrone'],
    [initLichenBloom, 'LichenBloom'],
    [initCaveConstellations, 'CaveConstellations'],
    [initGeodeGrower, 'GeodeGrower'],
    [initEchoTopography, 'EchoTopography'],
    [initNeedleOfNoise, 'NeedleOfNoise'],
    [initSporeGarden, 'SporeGarden'],
    [initVoidPebbles, 'VoidPebbles'],
    [initWarpLoom, 'WarpLoom'],
    [initDataCrystals, 'DataCrystals'],
    [initEchoLattice, 'EchoLattice'],
    [initDigitalFossil, 'DigitalFossil'],
    [initStaticHum, 'StaticHum'],
    [initMarrowDensity, 'MarrowDensity'],
    [initSpectralFrequency, 'SpectralFrequency'],
    [initLogicLabyrinth, 'LogicLabyrinth'],
    [initGlowWormBurrow, 'GlowWormBurrow'],
    [initCircuitSkeleton, 'CircuitSkeleton'],
    [initStaticWell, 'StaticWell'],
    [initOilParasite, 'OilParasite'],
    [initDraftlandsAtlas, 'DraftlandsAtlas'],
    [initBitRotDecay, 'BitRotDecay'],
    [initMarrowFlute, 'MarrowFlute'],
    [initShadowWeaver, 'ShadowWeaver'],
    [initFuzzField, 'FuzzField'],
    [initBoneWeaver, 'BoneWeaver'],
    [initGlitchShifter, 'GlitchShifter'],
    [initMossMelt, 'MossMelt'],
    [initChronicleTools, 'ChronicleTools'],
    [loadEntry, 'LoadEntry']
];

initializers.forEach(([fn, name]) => {
    try {
        fn();
    } catch (e) {
        console.error(`[Vort] Initializer failed: ${name}`, e);
    }
});
