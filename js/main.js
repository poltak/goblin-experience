import { initDailyLoot, wirePinnedLoot, wireBackpack, renderBackpack } from './mouth.js';
import { initNavigation, initThemeSwitchboard, initGoblinFace } from './ui.js';
import { initAtmospherics } from './atmo.js';
import { initGoblinWhisperStone } from './whisper.js';
import { 
    initSparkMothWall, initRuneDrift, initSigilScriber, initInkblotMirror, 
    initCaveDrone, initLichenBloom, initCaveConstellations, initGeodeGrower, 
    initEchoTopography, initNeedleOfNoise, initSporeGarden, initVoidPebbles, initDataCrystals, initEchoLattice, initDigitalFossil
} from './labs.js';
import { initChronicleTools, loadEntry } from './library.js';

const initializers = [
    [initNavigation, 'Navigation'],
    [initDailyLoot, 'DailyLoot'],
    [wirePinnedLoot, 'PinnedLoot'],
    [wireBackpack, 'Backpack'],
    [renderBackpack, 'RenderBackpack'],
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
    [initDataCrystals, 'DataCrystals'],
    [initEchoLattice, 'EchoLattice'],
    [initDigitalFossil, 'DigitalFossil'],
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

