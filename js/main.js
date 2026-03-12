import { initDailyLoot, wirePinnedLoot, wireBackpack, renderBackpack } from './mouth.js';
import { initNavigation, initThemeSwitchboard, initGoblinFace } from './ui.js';
import { initAtmospherics } from './atmo.js';
import { initGoblinWhisperStone } from './whisper.js';
import { 
    initSparkMothWall, initRuneDrift, initSigilScriber, initInkblotMirror, 
    initCaveDrone, initLichenBloom, initCaveConstellations, initGeodeGrower, 
    initEchoTopography, initNeedleOfNoise, initSporeGarden, initVoidPebbles, initDataCrystals, initEchoLattice
} from './labs.js';
import { initChronicleTools, loadEntry } from './library.js';

// Mouth / UI
initDailyLoot();
wirePinnedLoot();
wireBackpack();
renderBackpack();
initNavigation();
initThemeSwitchboard();
initGoblinFace();
initAtmospherics();
initGoblinWhisperStone();

// Labs
initSparkMothWall();
initRuneDrift();
initSigilScriber();
initInkblotMirror();
initCaveDrone();
initLichenBloom();
initCaveConstellations();
initGeodeGrower();
initEchoTopography();
initNeedleOfNoise();
initSporeGarden();
initVoidPebbles();
initDataCrystals();
initEchoLattice();

// Library
initChronicleTools();
loadEntry();
