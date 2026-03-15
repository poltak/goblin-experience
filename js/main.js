import { initDailyLoot, wirePinnedLoot, wireBackpack, renderBackpack, wireScraps } from './mouth.js';
import { initNavigation, initThemeSwitchboard, initGoblinFace } from './ui.js';
import { initAtmospherics } from './atmo.js';
import { initGoblinWhisperStone } from './whisper.js';
import { 
    initSparkMothWall, initRuneDrift, initSigilScriber, initInkblotMirror, 
    initCaveDrone, initLichenBloom, initCaveConstellations, initGeodeGrower, 
    initEchoTopography, initNeedleOfNoise, initSporeGarden, initVoidPebbles, initWarpLoom, initDataCrystals, initEchoLattice, initDigitalFossil, initStaticHum
} from './labs.js';
import { initChronicleTools, loadEntry } from './library.js';

const initializers = [
    [() => initNavigation(viewId => {
        if (viewId === 'lab') {
            [
                initSparkMothWall, initRuneDrift, initSigilScriber, initInkblotMirror, 
                initCaveDrone, initLichenBloom, initCaveConstellations, initGeodeGrower, 
                initEchoTopography, initNeedleOfNoise, initSporeGarden, initVoidPebbles, 
                initWarpLoom, initDataCrystals, initEchoLattice, initDigitalFossil, initStaticHum
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
    [initThemeSwitchboard, 'ThemeSwitchboard'],
    [initGoblinFace, 'GoblinFace'],
    [initAtmospherics, 'Atmospherics'],
    [initGoblinWhisperStone, 'WhisperStone'],
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

