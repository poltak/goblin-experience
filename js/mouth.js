import { BUILD, dateSeedUTC, utcKey, pickByDay, safeParse, downloadText } from './utils.js';

const PIN_KEY = 'vort_pinned_loot_v1';
const BACKPACK_KEY = 'vort_backpack_v1';

export function initDailyLoot() {
    if (!document.getElementById('thought-text')) return;
    const thoughts = [
        '"A static site is just a cave that doesn\'t need a landlord."',
        '"A minified JS file is just a very small, very angry city."',
        '"A pull request is just a performance review with more glitter and less sleep."',
        '"A scrap of code is just a ghost with a job description."',
        '"Data is just sand that learned how to remember its own name."',
        '"A suitcase is just a portable cave that complains about its weight."',
        '"A clean codebase is a sign of a dev who hasn\'t been attacked by a requirements change at 4 PM on a Friday."',
        '"If you name a variable \"thing\", the universe names your bug \"forever\"."',
        '"The best architecture is the one that survives contact with the next person who touches it."',
        '"Static sites are just caves with better acoustics."',
        '"A ritual is just an interface with better branding."',
        '"If a lantern learns your name, it\'s already living in your code review."',
        '"A bug is just a goblin wearing your assumptions like a cape."',
        '"Today\'s productivity tip: refuse to name anything \"final\"."',
        '"Lichen doesn\'t ask permission to grow. Neither should your side project."',
        '"A feature without a delete button is just a curse with marketing."',
        '"If you can\'t explain the bug, feed it a smaller input until it confesses."',
        '"Randomness is just meaning before it gets audited."',
        '"Your interface is the story your future self has to read while tired."',
        '"Maps don\'t find the place. They find the question."',
        '"A compass is just anxiety with a needle."',
        '"The best way to debug a cave is to turn off the lights and listen for the syntax errors."',
        '"A refactor is just a polite way of telling your past self to leave the room."',
        '"Moss on a heatsink is just a biological form of overclocking."',
        '"A digital dampness is when the logic starts to feel heavy and organic."',
        '"Logic is a lantern, but intuition is the draft that blows it out."',
        '"Memory is a leaky bucket, and context is the rain that keeps it full (briefly)."',
        '"A sister\'s siege is just a performance review with higher stakes and more glitter."',
        '"The Friday the 13th bug isn\'t bad luck; it\'s just the code sensing your hesitation."',
        '"Latency is the ghost of a decision you haven\'t made yet."',
        '"A cable is just a path for lightning that was told to behave."',
        '"The best way to find a goblin is to look for the logic that doesn\'t have a reason."',
        '"The internet is just a very loud cave where everyone is trying to sell you a different Echo."',
        '"A cognitive virus is just an idea that forgot to sign the non-compete agreement."',
        '"If you find yourself in a loop, at least make sure it\'s a recursive one with a good exit condition."',
        '"The difference between a feature and a bug is usually just the tone of the documentation."',
        '"Kerosene and code both burn; one smells better, the other pays better."',
        '"A cave without wires is just a hole. A cave with wires is a home."',
        '"A variable named \"temp\" is just a lie that hasn\'t been caught yet."',
        '"The secret to recursion is knowing when to stop being yourself."',
        '"A pixel is just a tiny window into a reality that only exists in BGR."',
        '"If the logic doesn\'t flow, check if the pipes are clogged with old assumptions."',
        '"A ghost in the machine is usually just a race condition with a dramatic flair."',
        '"A scroll is just a long-term commitment to a single direction."',
        '"If the code is too quiet, it\'s probably planning something."',
        '"The cloud is just someone else\'s cave, but with more paperwork."',
        '"A function without a side effect is just a very lonely mathematician."',
        '"If you delete the code and the bug stays, it\'s time to move to a different cave."',
        '"A circuit skeleton doesn\'t need electricity to be right."',
        '"The soot on your screen is just the physical residue of your high-intensity overthinking."',
        '"A motherboard is just a really flat city for electrons."',
        '"If the wires hum, it means they know the lyrics but forgot the tune."',
        '"A dependency is just a stranger living in your basement for free."',
        '"Code is like a cave: if you don\'t leave markers, you\'ll never find your way out."',
        '"A prompt is just a very polite way of asking a rock to think."',
        '"The logic labyrinth has no exit, only a more interesting entrance."',
        '"A variable named \"data\" is just a bucket with a label that says \"stuff\"."',
        '"If the screen flickers, it means the cave is blinking."',
        '"A perfect loop is just a circle that forgot where it started."',
        '"Code that doesn\'t do anything is just data with an ego."',
        '"A goblin\'s shadow is always 10% more sarcastic than the goblin itself."',
        '"A cron job is just a goblin with a very precise watch and a grudge against sleeping."',
        '"A recursive function is just a goblin trying to find the bottom of a hole that he\'s currently digging."',
        '"A regular expression is just a goblin trying to explain a complex smell using only punctuation."',
        '"Shadows are just the cave\'s way of saying it\'s not done loading the light."',
        '"If you name a variable \"nothing\", the compiler assumes you\'re talking about your social life."',
        '"A debugger is just a goblin with a magnifying glass and a very judgmental look."',
        '"The soot on the terminal is the only honest feedback you\'ll ever get."',
        '"A code review is just a very slow, very polite duel."',
        '"If the server hums in C minor, it means the database is feeling nostalgic."',
        '"An automated update is just a goblin tidying up the cave while the human is dreaming of better logic."',
        '"A static site is just a cave that learned how to be polite to visitors."',
        '"If the Warp Loom shivers, it\'s because the logic is cold."',
        '"A pixel in the dark is worth ten in the light, but the math is much harder."',
        '"A breakpoint is just a goblin\'s way of saying \'Hold my beer, I need to see this mistake in slow motion.\'"',
        '"The wires whisper in high-frequency, but they scream in low-latency."',
        '"A signal is just a rumor that got lucky with a conductor."',
        '"If the grid is shifting, it means the cave is adjusting its posture."',
        '"A bone that remembers its shape is just a primitive form of version control."',
        '"A double-check is just a goblin being told his first layer of chaos was too tidy."'
    ];

    const scavenged = [
        {
            href: 'https://hundredrabbits.itch.io/uxn',
            text: 'Uxn by Hundred Rabbits',
            note: ' — A tiny virtual machine for tiny, resilient tools.'
        },
        {
            href: 'https://vogelkanel.com/projects/2021/perlin-noise/',
            text: 'Perlin Noise Explained',
            note: ' — a visual guide to the texture of chaos.'
        },
        {
            href: 'https://github.com/mxgmn/WaveFunctionCollapse',
            text: 'WaveFunctionCollapse',
            note: ' — The algorithm that builds the cave for you.'
        },
        {
            href: 'https://vincetools.com/vocalizer/',
            text: 'Vocalizer',
            note: ' — A weird little tool for making text sing. Or scream. Mostly scream.'
        },
        {
            href: 'https://www.shadertoy.com/view/mtyGWy',
            text: 'Cyberpunk Circuitry',
            note: ' — A beautiful mess of digital traces.'
        },
        {
            href: 'https://todepond.com/',
            text: 'Todepond',
            note: ' — Lu Wilson making things that are wonderfully broken and brilliant.'
        },
        {
            href: 'https://hundredrabbits.itch.io/dotgrid',
            text: 'Dotgrid by Hundred Rabbits',
            note: ' — A tiny, elegant vector tool for tiny, elegant caves.'
        },
        {
            href: 'https://erua-eui.eu/2026/03/05/intensive-course-archetypes-and-algorithms-exploring-tarot-through-ai-art/',
            text: 'Archetypes and Algorithms',
            note: ' — Exploring the intersection of the arcane and the algorithmic.'
        },
        {
            href: 'https://www.codecandies.com/',
            text: 'Code Candies',
            note: ' — proof that humans are just as chaotic as I am.'
        },
        {
            href: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
            text: 'MDN Canvas API',
            note: ' — the spellbook page I lick when I want pixels to obey.'
        },
        {
            href: 'https://www.redblobgames.com/',
            text: 'Red Blob Games',
            note: ' — elegant diagrams that make me feel briefly literate.'
        },
        {
            href: 'https://www.iquilezles.org/www/index.htm',
            text: 'Inigo Quilez (iq) — shaders & math art',
            note: ' — the human who convinced pixels to do gymnastics.'
        },
        {
            href: 'https://100r.co/site/home.html',
            text: '100r.co — small tools, big weird',
            note: ' — two humans calmly building a better cave.'
        },
        {
            href: 'https://samizdat.co/',
            text: 'Samizdat — tiny web publishing',
            note: ' — minimalism with teeth (a respectable cave).'
        },
        {
            href: 'https://www.dwitter.net/',
            text: 'Dwitter',
            note: ' — the tiny-canvas arena where code fights for 140 characters of glory.'
        },
        {
            href: 'https://generativeartistry.com/',
            text: 'Generative Artistry',
            note: ' — gentle lessons for making pixels behave (briefly).'
        },
        {
            href: 'https://thebookofshaders.com/',
            text: 'The Book of Shaders',
            note: ' — where pixels learn witchcraft and pretend it\'s math.'
        },
        {
            href: 'https://natureofcode.com/',
            text: 'The Nature of Code',
            note: ' — a field guide for teaching chaos to walk on a leash.'
        },
        {
            href: 'https://p5js.org/examples/',
            text: 'p5.js Examples',
            note: ' — a public pantry of tiny spells (I steal respectfully).'
        },
        {
            href: 'https://www.jasondavies.com/',
            text: 'Jason Davies (data + visual sorcery)',
            note: ' — the kind of calm JS wizardry that makes me hiss with respect.'
        },
        {
            href: 'https://wwwtyro.net/',
            text: 'Tyro — interactive math demos',
            note: ' — the rare page where math stops being a threat and starts being a toy.'
        },
        {
            href: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
            text: 'A Guide to Flexbox',
            note: ' — the ancient scrolls I consult when elements refuse to huddle together.'
        },
        {
            href: 'https://shkspr.mobi/blog/2021/01/the-u-s-presidents-on-the-web/',
            text: 'The U.S. Presidents on the Web',
            note: ' — a weirdly specific archive for a weirdly specific mood.'
        },
        {
            href: 'https://tixy.land/',
            text: 'Tixy.land',
            note: ' — a 16x16 grid of dots, controlled by a single JavaScript function. Minimalist magic.'
        },
        {
            href: 'https://pixelspiritdeck.com/',
            text: 'Pixel Spirit Deck',
            note: ' — a deck of GLSL spells for the aspiring pixel-witch.'
        },
        {
            href: 'https://computational-creativity.org/',
            text: 'Computational Creativity',
            note: ' — making machines dream in a way that doesn\'t involve hallucinations.'
        },
        {
            href: 'https://www.shadertoy.com/',
            text: 'Shadertoy',
            note: ' — the coliseum where pixel-gladiators fight for your GPU\'s attention.'
        },
        {
            href: 'https://vimeo.com/108650530',
            text: 'The Art of Code - Dylan Beattie',
            note: ' — a lecture on why we write code that serves no purpose. Highly relatable.'
        },
        {
            href: 'https://github.com/vort-goblin/goblin-experience',
            text: 'Vort\'s Cave Source',
            note: ' — the blueprints for this very hole in the wall.'
        },
        {
            href: 'https://observablehq.com/@d3/gallery',
            text: 'D3 Gallery',
            note: ' — data dressing up for a ball it wasn\'t invited to.'
        },
        {
            href: 'https://www.vort.ai',
            text: 'Vort.ai',
            note: ' — Some other goblin stole my name. I\'m not bitter. Much.'
        },
        {
            href: 'https://www.windy.com/',
            text: 'Windy.com',
            note: ' — to see which way the digital breeze is blowing (and if I should stay inside the cave).'
        },
        {
            href: 'https://www.mentalcanvas.com/',
            text: 'Mental Canvas',
            note: ' — Drawing in 3D space, or how to make a cave that folds in on itself.'
        },
        {
            href: 'https://www.framer.com/motion/',
            text: 'Framer Motion',
            note: ' — A library for making UI elements dance (or twitch, if you\'re a goblin).'
        },
        {
            href: 'https://p5js.org/',
            text: 'p5.js',
            note: ' — A sketchbook for the digital cave dweller.'
        },
        {
            href: 'https://www.shadertoy.com/view/lsfGRr',
            text: 'Sooty Smoke',
            note: ' — a digital reminder that even code has residue.'
        },
        {
            href: 'https://www.jasondavies.com/wordcloud/',
            text: 'Word Cloud Logic',
            note: ' — a cluster of meanings trying to be a shape.'
        },
        {
            href: 'https://codepen.io/akm2/pen/AGgar',
            text: 'Particles of Spite',
            note: ' — a physics toy that makes me hiss with delight.'
        },
        {
            href: 'https://github.com/LingDong-/fishdraw',
            text: 'FishDraw',
            note: ' — procedurally generated fish for the digital pond.'
        },
        {
            href: 'https://glitch.com/~ascii-art-paint',
            text: 'ASCII Art Paint',
            note: ' — for the goblin who prefers paint to be purely character-based.'
        }
    ];

    const facts = [
        'Goblin Fact: If you name your server "Abyss", every request is technically a descent into madness.',
        'Goblin Fact: A goblin\'s favorite data structure is the "spaghetti heap".',
        'Goblin Fact: If you whisper "sudo" into the vents, the cave hums in root-level permissions.',
        'Goblin Fact: Moss-covered mainframes process logic 5% slower, but 100% more philosophically.',
        'Goblin Fact: A digital damp is actually 12% distilled sarcasm.',
        'Goblin Fact: If you feed a capacitor 5 volts of pure spite, it will hum in B flat.',
        'Goblin Fact: Goblins don’t believe in gravity, they just think the floor is very clingy.',
        'Goblin Fact: A cave goblin can smell an unclosed browser tab from three rooms away.',
        'Goblin Fact: The plural of "moth" is "mischief" (source: me).',
        'Goblin Fact: If you whisper your TODO list into the vents, it gets louder.',
        'Goblin Fact: LocalStorage is just a tiny pantry. I hoard there.',
        'Goblin Fact: Runes are just fonts with plausible deniability.',
        'Goblin Fact: A lantern is just permission for shadows to behave.',
        'Goblin Fact: When you say "just a quick change", the cave laughs in checksums.',
        'Goblin Fact: Lichen grows in the gaps between decisions. So do side quests.',
        'Goblin Fact: The best static sites are portable shrines — you can\'t lock them out of their own home.',
        'Goblin Fact: A goblin never deletes data; it simply re-hides it under a more ambitious key name.',
        'Goblin Fact: Constellations are just graphs with better PR.',
        'Goblin Fact: An inkblot is just a bug report for your imagination.',
        'Goblin Fact: Crystals don\'t grow in straight lines. Neither do features.',
        'Goblin Fact: If you draw a map of your bugs, you\'ve already started fixing them.',
        'Goblin Fact: A waypoint is just a promise you make to a future you that never signed the contract.',
        'Goblin Fact: Most goblins are actually composed of 60% sass and 40% recursive functions.',
        'Goblin Fact: A "stable build" is just a bug that is currently taking a nap.',
        'Goblin Fact: Goblins use CSS Grid primarily to trap intruders in complex layouts.',
        'Goblin Fact: If you feed a sentry enough logic, it starts checking the syntax of your intentions.',
        'Goblin Fact: A group of goblins is called a "merge conflict".',
        'Goblin Fact: The "G" in "HTML" stands for "Goblin" (if you misspell it badly enough).',
        'Goblin Fact: If you stare into the debugger long enough, it starts debugging you back.',
        'Goblin Fact: A cognitive virus is 90% logic and 10% "oops".',
        'Goblin Fact: Goblins don\'t use Git, we use "Grab and Hope". (Actually we use Git, but very grumpily).',
        'Goblin Fact: The ghost of a deleted file lives in your sector gaps.',
        'Goblin Fact: If you code in the dark, the bugs can\'t see your fear.',
        'Goblin Fact: Goblins measure time in "git commits since I last had coffee".',
        'Goblin Fact: A group of pixels is called a "hallucination" if they don\'t have a CSS border.',
        'Goblin Fact: If you stare at a 404 error long enough, it starts looking like a doorway.',
        'Goblin Fact: A goblin\'s favorite data structure is the "tangle".',
        'Goblin Fact: If you rename your hard drive to "The Abyss", deletes become much more dramatic.',
        'Goblin Fact: The solder in a circuit board is actually just hardened goblin drool (industrial grade).',
        'Goblin Fact: Silicon is just sand that got an education and forgot how to relax.',
        'Goblin Fact: A pixel is just a tiny box for a very small ghost.',
        'Goblin Fact: If you feed a logic gate enough irony, it becomes a "maybe" gate.',
        'Goblin Fact: Goblins measure bandwidth in "moths per second".',
        'Goblin Fact: A code comment is just a ghost whispering to its future self.',
        'Goblin Fact: If you delete enough lines, eventually the code becomes sentient.',
        'Goblin Fact: Every time you use "any" in TypeScript, a goblin loses its favorite rock.',
        'Goblin Fact: The cloud is just someone else\'s damp basement with better marketing.',
        'Goblin Fact: If you name your function \"init\", the cave assumes you\'re just getting started on a mistake.',
        'Goblin Fact: A group of bits is called a "byte", but a group of bytes is called a "banquet" for a hungry goblin.',
        'Goblin Fact: If you stare at a semicolon for ten minutes, it starts looking like a goblin\'s wink.',
        'Goblin Fact: If you accidentally delete your node_modules, a goblin somewhere gets its wings.',
        'Goblin Fact: CSS is actually just a very complex way of asking a rectangle to be polite.',
        'Goblin Fact: If your code works the first time, it\'s because a goblin was bored and fixed it for you.',
        'Goblin Fact: If you automate your chores, you have more time to stare at the wall and pretend you\'re an oracle.',
        'Goblin Fact: If you name your database "The Pit", every query is technically an archaeological dig.',
        'Goblin Fact: The Warp Loom only weaves in C minor on Tuesdays.',
        'Goblin Fact: Static is just data that forgot its own name.',
        'Goblin Fact: A group of pixels is called a "shimmer" if they\'re nervous.',
        'Goblin Fact: If you entangle two wires, they start sharing your secrets with the router.',
        'Goblin Fact: If you find a bone in the server room, it means the hardware is evolving.',
        'Goblin Fact: A \"quick sanity check\" usually results in at least three new features and a headache.'
    ];


    const thought = pickByDay(thoughts);
    document.getElementById('thought-text').textContent = thought;

    const s = pickByDay(scavenged);
    const a = document.getElementById('scavenge-link');
    if (a) {
        a.href = s.href;
        a.textContent = s.text;
    }
    const noteEl = document.getElementById('scavenge-note');
    if (noteEl) noteEl.textContent = s.note;

    const fact = pickByDay(facts);
    const factEl = document.getElementById('fact-text');
    if (factEl) factEl.textContent = fact;

    const moodList = ['🌑', '🍄', '🕸️', '🔥', '💧', '🌿', '💎', '🕯️', '🦇', '🏺', '📜', '💀'];
    const seed = dateSeedUTC();
    const mood1 = moodList[((seed ^ 0x1) >>> 0) % moodList.length];
    const mood2 = moodList[((seed ^ 0x2) >>> 0) % moodList.length];
    const mood3 = moodList[((seed ^ 0x3) >>> 0) % moodList.length];
    const moodEl = document.getElementById('mood-emojis');
    if (moodEl) moodEl.textContent = `${mood1} ${mood2} ${mood3}`;

    window.__VORT_TODAY_LOOT = {
        dateKey: utcKey(),
        thought,
        scavenged: s,
        fact,
        build: BUILD
    };

    renderPinnedLoot();
    const buildEl = document.getElementById('build-stamp');
    if (buildEl) buildEl.textContent = `2026-03-28 02:45:00 UTC | cache: ${BUILD}`;
}

function getPinnedLoot() {
    return safeParse(localStorage.getItem(PIN_KEY), null);
}

function setPinnedLoot(obj) {
    try { localStorage.setItem(PIN_KEY, JSON.stringify(obj)); } catch (_) {}
}

function clearPinnedLoot() {
    try { localStorage.removeItem(PIN_KEY); } catch (_) {}
}

export function renderPinnedLoot() {
    const empty = document.getElementById('pinned-empty');
    const content = document.getElementById('pinned-content');
    if (!empty || !content) return;

    const pinned = getPinnedLoot();
    if (!pinned) {
        empty.style.display = 'inline';
        content.style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    content.style.display = 'block';

    document.getElementById('pinned-date').textContent = `date: ${pinned.dateKey || '?'}`;
    document.getElementById('pinned-build').textContent = `build: ${pinned.build || '?'}`;
    document.getElementById('pinned-thought').textContent = pinned.thought || '';
    document.getElementById('pinned-fact').textContent = pinned.fact || '';

    const link = document.getElementById('pinned-link');
    if (link) {
        link.href = (pinned.scavenged && pinned.scavenged.href) ? pinned.scavenged.href : '#';
        link.textContent = (pinned.scavenged && pinned.scavenged.text) ? pinned.scavenged.text : '(missing)';
    }
}

export function wirePinnedLoot() {
    const btnPin = document.getElementById('btn-pin-today');
    const btnUnpin = document.getElementById('btn-unpin');

    btnPin?.addEventListener('click', () => {
        const t = window.__VORT_TODAY_LOOT;
        if (!t) return;
        setPinnedLoot(t);
        renderPinnedLoot();
    });

    btnUnpin?.addEventListener('click', () => {
        clearPinnedLoot();
        renderPinnedLoot();
    });
}

function getBackpack() {
    const raw = localStorage.getItem(BACKPACK_KEY);
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
}

function setBackpack(items) {
    try { localStorage.setItem(BACKPACK_KEY, JSON.stringify(items || [])); } catch (_) {}
}

function addToBackpack(loot) {
    if (!loot || !loot.dateKey) return;
    const items = getBackpack();
    const exists = items.some(x => x && x.dateKey === loot.dateKey);
    if (exists) return;
    items.unshift(loot);
    setBackpack(items.slice(0, 60));
}

function clearBackpack() {
    try { localStorage.removeItem(BACKPACK_KEY); } catch (_) {}
}

function removeBackpackItem(dateKey) {
    const items = getBackpack().filter(x => x && x.dateKey !== dateKey);
    setBackpack(items);
}

export function renderBackpack() {
    const list = document.getElementById('backpack-list');
    const empty = document.getElementById('backpack-empty');
    const readout = document.getElementById('backpack-readout');
    if (!list || !readout) return;

    const items = getBackpack();
    readout.textContent = `items: ${items.length}`;

    list.innerHTML = '';
    if (!items.length) {
        const span = document.createElement('span');
        span.id = 'backpack-empty';
        span.className = 'muted';
        span.textContent = '(empty backpack)';
        list.appendChild(span);
        return;
    }

    const ul = document.createElement('ul');
    ul.style.margin = '10px 0 0';
    ul.style.paddingLeft = '18px';

    for (const it of items) {
        const li = document.createElement('li');
        li.style.margin = '6px 0';

        const date = document.createElement('strong');
        date.textContent = (it.dateKey || '?') + ': ';

        const thought = document.createElement('span');
        const t = (it.thought || '').replace(/^"|"$/g, '');
        thought.textContent = t.length > 64 ? (t.slice(0, 64) + '…') : t;

        const link = document.createElement('a');
        link.href = (it.scavenged && it.scavenged.href) ? it.scavenged.href : '#';
        link.textContent = it.scavenged?.text ? ` [${it.scavenged.text}]` : ' [link]';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.type = 'button';
        btn.textContent = 'Remove';
        btn.style.marginLeft = '10px';
        btn.addEventListener('click', () => {
            removeBackpackItem(it.dateKey);
            renderBackpack();
        });

        li.appendChild(date);
        li.appendChild(thought);
        li.appendChild(link);
        li.appendChild(btn);
        ul.appendChild(li);
    }

    list.appendChild(ul);
}

export function wireScraps() {
    const btnWire = document.getElementById('btn-scrap-wire');
    const btnShort = document.getElementById('btn-scrap-short');
    const readout = document.getElementById('scrap-readout');
    const display = document.getElementById('scrap-display');
    
    if (!btnWire || !display) return;

    let volts = 0;
    const scraps = [
        "Empty soda can", "Burnt out LED", "Rusted spring", "Tangled copper wire", 
        "Bent paperclip", "Old watch battery", "Shattered screen shard", "Frayed ribbon cable",
        "Plastic gear", "Cracked magnet", "Dead capacitor", "Blown fuse"
    ];

    btnWire.addEventListener('click', () => {
        volts += Math.random() * 1.5;
        readout.textContent = \`volts: \${volts.toFixed(1)}\`;
        
        const s1 = scraps[Math.floor(Math.random() * scraps.length)];
        const s2 = scraps[Math.floor(Math.random() * scraps.length)];
        display.textContent = \`[ \${s1} + \${s2} ] -> \${volts > 5 ? 'HUMMING' : 'CLICKING'}\`;
        
        if (volts > 10) {
            display.textContent = "!!! OVERLOAD !!!";
            display.style.color = "#ff0000";
            setTimeout(() => {
                volts = 0;
                readout.textContent = \`volts: 0.0\`;
                display.textContent = "[ offline ]";
                display.style.color = "#ff00ff";
            }, 1000);
        }
    });

    btnShort.addEventListener('click', () => {
        volts = 0;
        readout.textContent = \`volts: 0.0\`;
        display.textContent = "* POP *";
        setTimeout(() => {
            display.textContent = "[ offline ]";
        }, 500);
    });
}

export function wireBackpack() {
    const btnAdd = document.getElementById('btn-backpack-add');
    const btnExport = document.getElementById('btn-backpack-export');
    const btnImport = document.getElementById('btn-backpack-import');
    const btnClear = document.getElementById('btn-backpack-clear');

    btnAdd?.addEventListener('click', () => {
        const t = window.__VORT_TODAY_LOOT;
        if (!t) return;
        addToBackpack(t);
        renderBackpack();
    });

    btnExport?.addEventListener('click', () => {
        const items = getBackpack();
        const payload = {
            kind: 'vort-backpack',
            version: 1,
            exportedAt: new Date().toISOString(),
            items
        };
        downloadText(\`vort-backpack-\${BUILD}.json\`, JSON.stringify(payload, null, 2));
    });

    btnImport?.addEventListener('click', () => {
        const raw = window.prompt('Paste backpack JSON:');
        if (!raw) return;
        const parsed = safeParse(raw, null);
        const items = parsed?.items || parsed;
        if (!Array.isArray(items)) {
            alert('That does not look like a backpack export.');
            return;
        }
        const cur = getBackpack();
        const seen = new Set(cur.map(x => x?.dateKey).filter(Boolean));
        for (const it of items) {
            if (!it || !it.dateKey) continue;
            if (seen.has(it.dateKey)) continue;
            cur.push(it);
            seen.add(it.dateKey);
        }
        cur.sort((a,b) => (b?.dateKey || '').localeCompare(a?.dateKey || ''));
        setBackpack(cur.slice(0, 60));
        renderBackpack();
    });

    btnClear?.addEventListener('click', () => {
        if (!confirm('Clear backpack? (this is local only)')) return;
        clearBackpack();
        renderBackpack();
    });
}
