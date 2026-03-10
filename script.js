// --- Preloader Logic ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Set a minimum time for the animation to be visible
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.add('loaded');
            
            // Wait for the fade-out transition to finish (500ms in CSS) before removing the element.
            // This is more reliable than using the 'transitionend' event.
            setTimeout(() => {
                if (preloader) {
                    preloader.remove();
                }
            }, 500); // This duration should match the CSS transition time.
        }, 2000); // Minimum 2 seconds for the preloader to be visible.
    }
});

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- State and Data ---
    let soundsReady = false;
    let synth;
    let activeShaderAnimation = null;
    let slideshowInterval = null;

    const codeCaseStudies = [
        {
            id: 'sfx-manager',
            title: 'Advanced SFX Manager',
            shortDescription: 'A C# system for playing varied, surface-based sounds in Unity.',
            demoHTML: `
                <p class="mb-4 text-center text-[var(--color-secondary)]">Click the buttons to simulate varied footstep sounds.</p>
                <div class="flex justify-center gap-4 flex-wrap">
                    <button class="corp-button px-6 py-2 sfx-demo-btn" data-sound="grass">Grass</button>
                    <button class="corp-button px-6 py-2 sfx-demo-btn" data-sound="wood">Wood</button>
                    <button class="corp-button px-6 py-2 sfx-demo-btn" data-sound="stone">Stone</button>
                </div>
            `,
            breakdown: `
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// The Problem</h5>
                <p class="mb-6">Basic footstep systems often sound repetitive and robotic. An advanced system needs to not only play the correct sound for the surface but also add subtle, natural variations in pitch and volume to enhance immersion.</p>
                
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// Key Concepts</h5>
                <ol class="list-decimal list-inside space-y-2 mb-6">
                    <li><strong>ScriptableObject Libraries:</strong> Using ScriptableObjects allows sound designers to create libraries of sounds (e.g., for grass, wood, stone) and define variation ranges (min/max pitch, min/max volume) directly in the Unity editor without touching code.</li>
                    <li><strong>AudioSource Pooling:</strong> Instead of creating a new AudioSource for every sound effect, which is inefficient, a pooling system pre-creates a number of AudioSources. When a sound needs to be played, an available AudioSource is taken from the pool, used, and then returned.</li>
                    <li><strong>Randomized Variation:</strong> When a sound is played, the manager script selects a random clip from the appropriate library and also randomizes its pitch and volume within the ranges defined in the ScriptableObject.</li>
                </ol>
            `,
            code: {
                language: 'csharp',
                snippet: `using UnityEngine;\n\n// Attach this to ground objects (e.g., Grass, Wood planes)\npublic class SurfaceType : MonoBehaviour {\n    public FootstepSoundData footstepSounds;\n}\n\n// Create multiple instances of this in the Project window\n[CreateAssetMenu(fileName = "FootstepData", menuName = "SFX/Footstep Sound Data")]\npublic class FootstepSoundData : ScriptableObject {\n    public AudioClip[] clips;\n    [Range(0.5f, 1.5f)] public float minPitch = 0.9f;\n    [Range(0.5f, 1.5f)] public float maxPitch = 1.1f;\n    [Range(0.1f, 1.0f)] public float minVolume = 0.8f;\n    [Range(0.1f, 1.0f)] public float maxVolume = 1.0f;\n}\n\n// Central manager on the player\npublic class FootstepManager : MonoBehaviour {\n    public AudioSource audioSource; // For simplicity; a real system would use a pool\n\n    // Called from an animation event\n    public void PlayFootstepSound() {\n        if (Physics.Raycast(transform.position, Vector3.down, out RaycastHit hit, 1.5f)) {\n            if (hit.collider.TryGetComponent<SurfaceType>(out var surface)) {\n                PlaySound(surface.footstepSounds);\n            }\n        }\n    }\n\n    private void PlaySound(FootstepSoundData data) {\n        if (data.clips.Length == 0) return;\n\n        AudioClip clip = data.clips[Random.Range(0, data.clips.Length)];\n        audioSource.pitch = Random.Range(data.minPitch, data.maxPitch);\n        audioSource.volume = Random.Range(data.minVolume, data.maxVolume);\n        audioSource.PlayOneShot(clip);\n    }\n}`
            }
        },
        {
            id: 'glsl-shader',
            title: 'Real-time Glitch Shader',
            shortDescription: 'A GLSL fragment shader for creating a screen-space distortion effect.',
            demoHTML: `
                <div id="shader-demo-container" class="relative">
                    <canvas id="shader-canvas"></canvas>
                </div>
                <div class="mt-4 text-center font-mono text-sm space-y-2">
                    <div>
                        <label for="glitch-intensity-slider">INTENSITY</label>
                        <input type="range" id="glitch-intensity-slider" min="0" max="1" step="0.01" value="0.1" class="w-full">
                    </div>
                    <div>
                        <label for="glitch-blockiness-slider">BLOCKINESS</label>
                        <input type="range" id="glitch-blockiness-slider" min="0" max="1" step="0.01" value="0.05" class="w-full">
                    </div>
                </div>
            `,
            breakdown: `
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// The Goal</h5>
                <p class="mb-6">Create a versatile, real-time "bad signal" effect. This is a common visual effect in sci-fi or horror games to imply technological malfunction. The effect should be controllable and combine multiple techniques for a rich result.</p>
                
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// Key Effects Combined</h5>
                <ol class="list-decimal list-inside space-y-2 mb-6">
                    <li><strong>Horizontal Displacement:</strong> The core of the effect. The texture coordinates are shifted horizontally using a sine wave based on time, creating a wave-like distortion that simulates a de-synced signal.</li>
                    <li><strong>Chromatic Aberration:</strong> The Red and Blue color channels are sampled with slight horizontal offsets from the Green channel. This mimics the color fringing seen on old CRT monitors and adds to the analog feel.</li>
                    <li><strong>Blocky Artifacts:</strong> A random function is used to occasionally replace horizontal strips of the image with a stretched, blocky version from a different part of the screen, simulating data corruption.</li>
                    <li><strong>Scan Lines:</strong> A faint, repeating dark line is overlaid on the final image to emulate the look of an old monitor display.</li>
                </ol>
            `,
            code: {
                language: 'glsl',
                snippet: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uIntensity;
uniform float uBlockiness;

// 2D Random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    
    // 1. Horizontal Displacement
    float displacement = sin(uv.y * 40.0 + uTime * 10.0) * 0.02 * uIntensity;
    displacement *= sin(uTime * 5.0);
    uv.x += displacement;
    
    // 2. Chromatic Aberration
    float r = texture2D(uTexture, uv + vec2(0.01 * uIntensity, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(0.01 * uIntensity, 0.0)).b;
    
    vec4 color = vec4(r, g, b, 1.0);
    
    // 3. Blocky Artifacts
    if (random(uv + uTime) > 0.99 - uBlockiness) {
        float blockY = floor(uv.y * (20.0 * (1.0 - uBlockiness) + 5.0)) / (20.0 * (1.0 - uBlockiness) + 5.0);
        float blockXOffset = random(vec2(blockY, uTime)) * 0.2 - 0.1;
        color.rgb = texture2D(uTexture, vec2(uv.x + blockXOffset, blockY)).rgb;
    }

    // 4. Scan Lines
    float scanLine = sin(vUv.y * 800.0) * 0.05 * uIntensity;
    color.rgb -= scanLine;
    
    gl_FragColor = color;
}`
            }
        },
        {
            id: 'name-generator',
            title: 'Procedural Name Generator',
            shortDescription: 'A JavaScript tool for generating fantasy names for world-building.',
            demoHTML: `
                <p class="mb-4 text-center text-[var(--color-secondary)]">Select a theme and generate a unique name.</p>
                <div class="bg-black/20 p-4 flex flex-col justify-center items-center font-mono">
                    <p id="generated-name-output" class="text-2xl text-[var(--color-accent)] h-10 flex items-center justify-center">Click Generate!</p>
                    <div class="flex items-center gap-4 mt-4">
                        <select id="name-theme-select" class="form-input bg-black/50 p-2 text-sm">
                            <option value="elven">Elven</option>
                            <option value="dwarven">Dwarven</option>
                            <option value="orcish">Orcish</option>
                        </select>
                        <button id="generate-name-btn" class="corp-button px-6 py-2">Generate</button>
                    </div>
                </div>
            `,
            breakdown: `
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// The Goal</h5>
                <p class="mb-6">Coming up with dozens of unique, thematic names for characters, cities, and locations is a common challenge in world-building. This tool automates the process by combining phonetic components to create plausible-sounding names based on selectable themes.</p>
                
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// The Logic</h5>
                <ol class="list-decimal list-inside space-y-2 mb-6">
                    <li><strong>Thematic Syllable Banks:</strong> The generator uses a main object where each key is a theme (e.g., "elven"). Each theme contains arrays of syllables (prefixes, middles, suffixes) that fit its phonetic style.</li>
                    <li><strong>Assembly Rules:</strong> A simple set of rules determines how these syllables are combined. For example, a name might be formed by [Prefix] + [Middle] + [Suffix], or just [Prefix] + [Suffix], with some randomness.</li>
                    <li><strong>User Selection:</strong> A dropdown menu allows the user to select the desired theme. The generation logic then pulls from the appropriate syllable bank.</li>
                </ol>
            `,
            code: {
                language: 'javascript',
                snippet: `const nameThemes = {
    elven: {
        prefixes: ["Ael", "Lael", "Cor", "El", "Fae", "Il"],
        middles: ["a", "ia", "ae", "io", "en", "ar"],
        suffixes: ["driel", "wyn", "lor", "mir", "thas", "ian"]
    },
    dwarven: {
        prefixes: ["Thor", "Bal", "Dur", "Gim", "Bof", "Gloin"],
        middles: ["in", "ur", "ok", "im", "li"],
        suffixes: ["in", "ur", "grim", "li", "din", "or"]
    },
    orcish: {
        prefixes: ["Grom", "Zog", "Urg", "Karg", "Mog"],
        middles: ["'a", "'u", "ro", "ka"],
        suffixes: ["k", "sh", "th", "gash", "rok"]
    }
};

function generateName(theme) {
    const bank = nameThemes[theme];
    const prefix = bank.prefixes[Math.floor(Math.random() * bank.prefixes.length)];
    const suffix = bank.suffixes[Math.floor(Math.random() * bank.suffixes.length)];
    
    if (Math.random() > 0.4 && bank.middles.length > 0) {
        const middle = bank.middles[Math.floor(Math.random() * bank.middles.length)];
        return prefix + middle + suffix;
    }
    return prefix + suffix;
}`
            }
        },
        {
            id: 'dialogue-editor',
            title: 'Interactive Dialogue Tree Editor',
            shortDescription: 'A node-based editor for creating branching dialogue for games.',
            demoHTML: `
                <p class="mb-4 text-center text-[var(--color-secondary)]">A functional demo of a branching dialogue system.</p>
                <div id="dialogue-container" class="border border-dashed border-[var(--border-color)] p-4 space-y-4 min-h-[200px] flex flex-col justify-between">
                    <div>
                        <p class="text-xs text-[var(--color-secondary)] font-mono mb-2">NODE: <span id="dialogue-node-id"></span></p>
                        <p id="dialogue-text" class="text-lg"></p>
                    </div>
                    <div id="dialogue-choices" class="space-y-2"></div>
                </div>
            `,
            breakdown: `
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// The Problem</h5>
                <p class="mb-6">Writing and managing complex branching dialogue in text files or spreadsheets is cumbersome and error-prone. A functional system requires a clear data structure and a way to traverse it based on player choice.</p>
                
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// Step-by-Step Plan</h5>
                <ol class="list-decimal list-inside space-y-2 mb-6">
                    <li><strong>Data Structure:</strong> Define a clear data structure for dialogue nodes. In this JavaScript example, an object is used where keys are node IDs. Each node object contains the dialogue text and an array of choices.</li>
                    <li><strong>State Management:</strong> Keep track of the current node the player is on. The initial state is always the "start" node.</li>
                    <li><strong>Rendering Logic:</strong> A function takes a node ID, finds the corresponding node in the data structure, and updates the UI to display its text and choices.</li>
                    <li><strong>Event Handling:</strong> When a player clicks a choice, the event handler gets the target node ID from that choice, updates the current state, and calls the rendering function again with the new node ID to advance the conversation.</li>
                </ol>
            `,
            code: {
                language: 'javascript',
                snippet: `// Data structure for the entire dialogue tree
const dialogueData = {
    start: {
        text: "You approach a strange, glowing pedestal. What do you do?",
        choices: [
            { text: "Touch the pedestal.", target: "touch" },
            { text: "Examine it from a distance.", target: "examine" },
            { text: "Leave.", target: "leave" }
        ]
    },
    touch: {
        text: "A shock of energy courses through you! You feel... different.",
        choices: [ { text: "Restart", target: "start" } ]
    },
    examine: {
        text: "You notice faint, shifting runes. They seem to react to your presence.",
        choices: [
            { text: "Touch it now.", target: "touch" },
            { text: "Try to read the runes.", target: "read_runes" },
            { text: "Leave it be.", target: "leave" }
        ]
    },
    read_runes: {
        text: "The runes burn brightly, searing an image into your mind: a forgotten kingdom, swallowed by the sea.",
        choices: [ { text: "Restart", target: "start" } ]
    },
    leave: {
        text: "You decide it's not worth the risk and walk away.",
        choices: [ { text: "Restart", target: "start" } ]
    }
};

let currentNodeId = 'start';

function showDialogueNode(nodeId) {
    const node = dialogueData[nodeId];
    // Update text and choices in the DOM
    // ...
}
`
            }
        },
        {
            id: 'jrpg-stats',
            title: 'JRPG Character & Class System',
            shortDescription: 'A C# data structure for managing complex JRPG character stats and class evolutions.',
            demoHTML: `
                <p class="mb-4 text-center text-[var(--color-secondary)]">Simulate leveling up and class evolution.</p>
                <div id="jrpg-demo-container" class="font-mono text-sm space-y-2">
                    <div class="grid grid-cols-2"><span>Name:</span><span id="jrpg-name" class="text-right">Kiefy</span></div>
                    <div class="grid grid-cols-2"><span>Class:</span><span id="jrpg-class" class="text-right"></span></div>
                    <div class="grid grid-cols-2"><span>Level:</span><span id="jrpg-level" class="text-right"></span></div>
                    <hr class="border-[var(--border-color)] opacity-50 my-2">
                    <div class="grid grid-cols-3 gap-x-4">
                        <span>HP</span><span id="jrpg-hp" class="text-right col-span-2"></span>
                        <span>MP</span><span id="jrpg-mp" class="text-right col-span-2"></span>
                        <span>Stamina</span><span id="jrpg-stam" class="text-right col-span-2"></span>
                    </div>
                    <hr class="border-[var(--border-color)] opacity-50 my-2">
                    <div class="grid grid-cols-2 gap-x-4">
                        <span>STR</span><span id="jrpg-str" class="text-right"></span>
                        <span>DEX</span><span id="jrpg-dex" class="text-right"></span>
                        <span>CON</span><span id="jrpg-con" class="text-right"></span>
                        <span>INT</span><span id="jrpg-int" class="text-right"></span>
                        <span>WIS</span><span id="jrpg-wis" class="text-right"></span>
                        <span>CHAR</span><span id="jrpg-char" class="text-right"></span>
                        <span>SOUL</span><span id="jrpg-soul" class="text-right"></span>
                    </div>
                     <hr class="border-[var(--border-color)] opacity-50 my-2">
                    <div>
                        <p class="text-[var(--color-secondary)] mb-1">// Skills</p>
                        <div id="jrpg-skills" class="text-xs space-y-1"></div>
                    </div>
                    <div id="jrpg-controls" class="flex justify-center gap-4 pt-4">
                        <button id="jrpg-lvl-btn" class="corp-button px-4 py-2 text-xs">Level Up</button>
                    </div>
                    <div id="jrpg-evolution" class="hidden text-center pt-2">
                        <p class="mb-2 text-[var(--color-secondary)]">Evolution Available!</p>
                        <div id="jrpg-evo-choices" class="flex justify-center gap-2"></div>
                    </div>
                </div>
            `,
            breakdown: `
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// The Goal</h5>
                <p class="mb-6">JRPGs are known for their deep character progression systems. This requires a flexible data structure that can handle base stats, stat growth per level, equipment, skills, and dramatic changes when a character evolves into a new class (e.g., Squire to Knight or Paladin).</p>
                
                <h5 class="font-bold text-lg text-[var(--color-foreground)] mb-2">// Key Concepts (Unity/C#)</h5>
                <ol class="list-decimal list-inside space-y-2 mb-6">
                    <li><strong>ScriptableObjects for Data:</strong> Classes, items, and skills are defined as ScriptableObjects. This allows designers to create and balance game data in the Unity editor without writing new code.</li>
                    <li><strong>Comprehensive Stat Structs:</strong> Separate C# structs are used for base stats (HP, MP, STR, etc.) and equipment slots (Head, Chest, etc.). This keeps data organized.</li>
                    <li><strong>Class Evolution Paths:</strong> Each JobClass ScriptableObject contains a list of possible "evolutions" it can transition into, each with its own level requirement.</li>
                    <li><strong>Stat Calculation:</strong> A character's final stats are a combination of their base stats (from level-ups) plus any bonuses from their equipped items.</li>
                </ol>
            `,
            code: {
                language: 'csharp',
                snippet: `using UnityEngine;
using System.Collections.Generic;

// Data for all character attributes
public struct Attributes {
    public int Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma, Soul;
}

// Data for a Job Class
[CreateAssetMenu(fileName = "NewJobClass", menuName = "JRPG/Job Class")]
public class JobClass : ScriptableObject {
    public string className;
    public Attributes statGrowthPerLevel;
    public List<Skill> skillsLearned;
    public List<EvolutionPath> evolutionPaths;
}

[System.Serializable]
public class EvolutionPath {
    public JobClass nextClass;
    public int levelRequired;
}

// Main character class
public class PlayerCharacter : MonoBehaviour {
    public string characterName = "Kiefy";
    public int level = 1;
    public Attributes baseAttributes;
    public JobClass currentClass;
    // public Dictionary<string, Item> equipment;
    // public List<Skill> skills;

    public void LevelUp() {
        level++;
        baseAttributes.Strength += currentClass.statGrowthPerLevel.Strength;
        // ... and so on for all other attributes
    }

    public void EvolveClass(JobClass newClass) {
        // Check if evolution is valid
        currentClass = newClass;
        // Optional: Add base stat bonuses for evolving
    }
}`
            }
        }
    ];

    const sfxData = {
        'cowsins-fps-engine': {
            title: "Cowsins FPS Engine",
            category: "FPS / Shooter",
            year: "2023",
            summary: "A comprehensive sound library for a Unity FPS engine, covering weapons, character foley, and environmental ambiances.",
            image: "https://assetstorev1-prd-cdn.unity3d.com/key-image/1170faf2-6566-4d2c-a7be-74cbaa58976d.webp",
            role: "As the SFX Designer, I created a wide range of audio assets including weapon sounds (gunshots, reloads, handling), character foley (footsteps, jumps, land impacts), and environmental ambiances to enhance player immersion. Every sound was mixed and mastered to work cleanly within Unity's audio mixer pipeline.",
            thoughtProcess: "The goal for the FPS engine was to deliver impactful, realistic, and satisfying weapon audio. Each gunshot is a multi-layered composition: a sharp transient 'crack' for the initial impact, a weighty low-frequency 'body' for the percussive punch, and a decaying tail that reflects the acoustic environment. Foley sounds like footsteps were designed to be subtle but informative—each surface material (concrete, grass, wood, metal, sand) has its own unique timbre and rhythm to provide tactical feedback without cluttering the soundscape. Empty magazine clicks and weapon handling sounds were crafted to feel mechanical and grounded, rewarding attentive players with detailed auditory cues.",
            technologies: ["Unity", "FMOD", "Audacity"],
            link: "https://assetstore.unity.com/packages/templates/systems/fps-engine-218594",
            stats: { assets: "60+", categories: "5", format: "WAV / 16-bit" },
            toolBreakdown: [
                { tool: "FMOD Studio", role: "Spatial Audio & Occlusion", notes: "All weapons and footsteps were bused through FMOD's 3D spatializer with per-weapon-class distance attenuation curves. Occlusion geometry was configured so gunshots audibly muffle when fired behind cover." },
                { tool: "Audacity", role: "Multi-Layer Alignment & Editing", notes: "Used for sample-precise editing — aligning multi-layer gunshot components (crack, body, tail) to sub-millisecond accuracy and trimming silence from raw foley takes." },
                { tool: "Unity Audio Mixer", role: "Four-Bus Mixer Architecture", notes: "Built a structured Weapons / Foley / Voice / Environment bus layout with parallel compression on the Weapons bus for consistent loudness even during rapid-fire sequences." }
            ],
            highlights: [
                "Multi-layered weapon audio: transient crack, weighted body, and environmental tail",
                "Surface-responsive footstep system across 5 distinct material types",
                "3D positional audio tuned for FMOD spatial blending and occlusion",
                "All assets delivered at 44.1 kHz / 16-bit WAV for maximum compatibility"
            ],
            samples: [
                { id: 'fps-shot', name: 'Assault Rifle Shot', desc: 'Multi-layer gunshot with crack, body, and tail' },
                { id: 'fps-reload', name: 'Pistol Reload', desc: 'Magazine eject and snap-in mechanics' },
                { id: 'fps-footstep', name: 'Footstep — Concrete', desc: 'Hard surface foley with subtle reverb' },
                { id: 'fps-empty', name: 'Empty Magazine Click', desc: 'Mechanical click on an empty chamber' },
                { id: 'fps-land', name: 'Heavy Land Impact', desc: 'Body impact sound on a solid surface' },
                { id: 'fps-handling', name: 'Weapon Handling', desc: 'Subtle grip creak and rattle — idle holding feedback' },
                { id: 'fps-hit-marker', name: 'Hit Confirmation', desc: 'Crisp high-frequency tick — target acknowledged' },
                { id: 'fps-ambient', name: 'Combat Zone Ambiance', desc: 'Distant battle texture for spatial situational awareness' }
            ]
        },
        'cowsins-inventory': {
            title: "Cowsins Inventory Add-on",
            category: "UI / Interface",
            year: "2023",
            summary: "A cohesive set of UI sound effects for a flexible inventory system, making every interaction feel tactile and responsive.",
            image: "https://assetstorev1-prd-cdn.unity3d.com/key-image/b73234ee-d3ed-478a-8bb4-563b8dc0b928.webp",
            role: "My role was to design intuitive sound effects for all inventory interactions—opening and closing the inventory panel, moving and stacking items, equipping and unequipping gear, and receiving failure feedback. The goal was to establish a clear audio language so players always understand the outcome of their actions.",
            thoughtProcess: "UI sound design is fundamentally about clarity and instant feedback. Every sound in the inventory system is short, distinct, and unobtrusive—nothing should pull the player out of the game. I built a consistent synthesized palette of clicks, chimes, and brief swooshes to differentiate actions by type. Positive actions (pickup, equip) use ascending pitch contours and bright tones, while negative feedback (drop, fail) dips lower and softer. This creates an intuitive audio language where players quickly learn the outcome of an interaction without reading any text on screen. File sizes are minimal because every asset is synthesized, keeping the add-on lightweight.",
            technologies: ["Unity", "Audacity"],
            link: "https://assetstore.unity.com/packages/templates/systems/inventory-pro-add-on-for-fps-engine-318131",
            stats: { assets: "25+", categories: "3", format: "WAV / 16-bit" },
            toolBreakdown: [
                { tool: "Audacity", role: "Synthesis & Design", notes: "All UI sounds were synthesized directly in Audacity using Generate > Tone and Generate > Chirp, then processed with equalization and normalization to achieve a consistent synthesized palette." },
                { tool: "Unity Audio Mixer", role: "Zero-Latency UI Bus", notes: "UI sounds were routed to a dedicated bus that bypasses spatial processing entirely — guaranteeing immediate, synchronous audio feedback on every click event regardless of scene state." }
            ],
            highlights: [
                "Consistent synthesized palette across all UI event types",
                "Ascending pitch language for positive actions; descending for negative feedback",
                "Zero-latency playback design optimized for frequent UI interactions",
                "Cohesive style that complements the FPS Engine audio palette"
            ],
            samples: [
                { id: 'inv-pickup', name: 'Item Pickup', desc: 'Bright ascending chime for positive feedback' },
                { id: 'inv-click', name: 'UI Click', desc: 'Crisp, short click for menu navigation' },
                { id: 'inv-drop', name: 'Item Drop', desc: 'Soft descending tone for item placement' },
                { id: 'inv-equip', name: 'Gear Equip', desc: 'Layered click-chime for equipping items' },
                { id: 'inv-fail', name: 'Action Failed', desc: 'Low dissonant buzz for invalid actions' },
                { id: 'inv-sort', name: 'Item Sort', desc: 'Rapid click sequence — items stacking in grid' },
                { id: 'inv-open', name: 'Panel Open', desc: 'Whoosh with metallic click — UI panel slide-in' },
                { id: 'inv-close', name: 'Panel Close', desc: 'Reverse click with soft decay — UI dismiss' }
            ]
        },
        'cowsins-save-load': {
            title: "Cowsins Save & Load",
            category: "System / UI",
            year: "2023",
            summary: "Purposeful audio cues for every state of the save and load process, giving players clear status feedback at all times.",
            image: "https://assetstorev1-prd-cdn.unity3d.com/key-image/28a45c15-0850-4758-b693-b7de90471d76.webp",
            role: "I created distinct audio cues for the saving and loading processes: initiating a save, confirming success, beginning a load, completing the transition, and signalling errors. Each sound needed to clearly communicate system state without relying on text, making the experience accessible and reassuring.",
            thoughtProcess: "For the save/load system, the primary design challenge was communicating information through sound alone. The 'save initiated' cue is a brief, ascending chime that feels proactive and reassuring—telling the player that something good is happening. The 'save success' resolves to a full, satisfying chord. The 'load' sequence uses a slightly longer, rising melodic arc to signal a world transition rather than just a file operation. The most critical sound was the 'error' state: it needed to be impossible to miss, yet not alarming—a low, dissonant descending two-tone that is neutral but clearly communicates failure. All sounds share a short reverb tail that gives the system a cohesive, slightly digital feel, matching the futuristic UI aesthetic.",
            technologies: ["Unity", "Audacity"],
            link: "https://assetstore.unity.com/packages/templates/systems/save-load-add-on-for-fps-engine-316848",
            stats: { assets: "15+", categories: "2", format: "WAV / 16-bit" },
            toolBreakdown: [
                { tool: "Audacity", role: "Synthesis & Reverb Shaping", notes: "All cues were synthesized using the Tone Generator, then shaped with a custom short-plate reverb effect to give every UI cue the same subtle digital resonance — auditory glue for the whole palette." },
                { tool: "Unity Audio Mixer", role: "Priority-Override System Bus", notes: "Save/Load cues are routed to a System Audio bus with priority override settings, ensuring they are never ducked or masked by combat or gameplay audio events." }
            ],
            highlights: [
                "Distinct audio states for initiate, success, loading, and error conditions",
                "Ascending chime language for positive feedback; dissonant tones for errors",
                "Shared short reverb tail ties all cues into one cohesive system palette",
                "Designed to work alongside FPS Engine audio without frequency clashes"
            ],
            samples: [
                { id: 'save-start', name: 'Save Initiated', desc: 'Ascending triad chime — save begins' },
                { id: 'save-success', name: 'Save Complete', desc: 'Full resolved chord — save confirmed' },
                { id: 'save-confirm', name: 'UI Confirm', desc: 'Sharp high note — generic UI confirmation' },
                { id: 'save-load', name: 'Load Begin', desc: 'Rising melodic arc — world transition start' },
                { id: 'save-error', name: 'Error Alert', desc: 'Low dissonant two-tone — operation failed' },
                { id: 'save-autosave', name: 'Auto-Save Tick', desc: 'Subtle soft tick — passive background activity' },
                { id: 'save-warning', name: 'Low Space Warning', desc: 'Repeating low pulse — persistent alert signal' },
                { id: 'save-transition', name: 'Scene Transition', desc: 'Rising tone sweep — world-space change indicator' }
            ]
        },
        'platformer-engine': {
            title: "2D Platformer Engine",
            category: "2D Platformer",
            year: "2022",
            summary: "A retro-inspired chiptune sound pack for a classic 2D platformer, evoking the golden age of 16-bit gaming.",
            image: "https://assetstorev1-prd-cdn.unity3d.com/key-image/5481b389-68ed-4eb0-aa57-6a44e4268ebb.webp",
            role: "As the SFX Designer, I produced a classic retro-style sound pack covering character movement (jump, land, run), item collection (coins, power-ups), combat (enemy hits, player damage), and game state events (death, level complete). The pack evokes a nostalgic platformer feel while remaining clean and modern enough for any 2D game.",
            thoughtProcess: "The inspiration was the 16-bit era—SNES and Mega Drive soundscapes. All sounds are synthesized using simple waveforms (sine, square, sawtooth, triangle) to stay true to the era's hardware constraints and create an unmistakable chiptune palette. The 'jump' is a quick, rising frequency sweep that gives a sense of lift, while the 'coin collect' is a bright two-note chime designed to be instantly satisfying and memorable. The 'enemy hit' uses a pink noise burst with a pitched element to feel impactful without being harsh. The 'player death' uses a descending chromatic glide—a beloved trope of classic games—giving it immediate emotional recognition. Every sound is short enough to loop or chain rapidly without fatigue, which is crucial in a fast-paced platformer.",
            technologies: ["Unity", "FMOD", "Audacity"],
            link: "https://assetstore.unity.com/packages/templates/systems/platformer-engine-2d-2-5d-266973",
            stats: { assets: "40+", categories: "6", format: "WAV / 16-bit" },
            toolBreakdown: [
                { tool: "FMOD Studio", role: "Pitch Randomization", notes: "Every high-repetition sound (footsteps, coin collect, jump) was wired to an FMOD pitch randomizer (±2 semitones) to prevent listener fatigue without sacrificing the chiptune character." },
                { tool: "Audacity", role: "Pure Waveform Synthesis", notes: "All chiptune sounds were built from raw waveforms (square, triangle, sawtooth) synthesized in Audacity — no hardware emulation plugins. Every sample is mathematically clean, true to 16-bit hardware constraints." },
                { tool: "Unity Audio Mixer", role: "Retro Processing Chain", notes: "Applied Unity's built-in Chorus and Distortion effects on the Chiptune bus to add subtle warmth and lo-fi character, reinforcing the retro aesthetic without deviating from the source material." }
            ],
            highlights: [
                "Pure chiptune synthesis — square, triangle, and sawtooth waveforms throughout",
                "Procedural pitch variation prevents listener fatigue on repeated sounds",
                "Covers all 6 event categories: movement, collection, combat, UI, world, state",
                "Instantly iconic design language inspired by SNES-era platformer classics"
            ],
            samples: [
                { id: 'plat-jump', name: 'Player Jump', desc: 'Rising frequency sweep giving a sense of lift' },
                { id: 'plat-coin', name: 'Coin Collect', desc: 'Bright two-note chime — immediately satisfying' },
                { id: 'plat-hit', name: 'Enemy Hit', desc: 'Pink noise burst with pitched impact punch' },
                { id: 'plat-powerup', name: 'Power-Up Collect', desc: 'Ascending arpeggio — reward confirmation' },
                { id: 'plat-death', name: 'Player Death', desc: 'Descending chromatic glide — classic game over cue' },
                { id: 'plat-level-complete', name: 'Level Complete', desc: 'Short melodic fanfare — celebratory stage clear' },
                { id: 'plat-run', name: 'Running Footstep', desc: 'Rapid chiptune percussion — rhythmic movement loop' },
                { id: 'plat-wall-jump', name: 'Wall Jump', desc: 'Quick ascending chip-tone with surface tap layer' }
            ]
        },
        'horror-atmosphere': {
            title: "Horror Atmosphere Pack",
            category: "Horror / Atmosphere",
            year: "2024",
            summary: "A spine-chilling collection of atmospheric dread, creature vocalizations, and cinematic jump-scare stings built for immersive horror game experiences.",
            image: "https://placehold.co/600x338/1a0000/cc2200?text=Horror+Atmosphere+Pack",
            role: "I crafted every element of the horror soundscape from scratch — from sustained infrasonic tension drones and granular-processed heartbeats to creature vocalizations built using layered synthesis and pitch-shifted source recordings. Each asset was engineered to trigger a primal response without overusing cheap shock tactics.",
            thoughtProcess: "Effective horror audio works on two levels: the conscious and the subconscious. Infrasonic content (below 20 Hz) creates physical unease that the player can't name — they just feel wrong. Layered above that, I used granular re-synthesis to produce organic, unpredictable textures that keep the listener permanently on edge — the brain is hard-wired to focus on irregular, evolving patterns as potential threats. The jump-scare sting was the most carefully engineered asset: it uses an intentional 300ms window of near-silence to lower the listener's guard, followed by a multi-layered impact — white noise burst, sub-frequency thump, and a dissonant high-frequency shriek — all timed to maximise the startle response. Every asset shares a large-stone-room reverb tail to enforce a consistent sense of vast, cold space.",
            technologies: ["Reaper", "iZotope RX", "FMOD", "Audacity"],
            link: "#",
            stats: { assets: "50+", categories: "6", format: "WAV / 24-bit" },
            toolBreakdown: [
                { tool: "Reaper", role: "DAW & Mastering Chain", notes: "Primary session host for all multi-track layering and automation. The mastering chain used a custom LUFS-targeted limiter to deliver assets at -14 LUFS — loud enough for impact but leaving headroom for game engine dynamics." },
                { tool: "iZotope RX 10", role: "Spectral Repair & Sound Design", notes: "Used Spectral Repair and the Spectral Editor to morph recorded source material into unrecognisable textures. The creature growl was sculpted from a combination of field recordings processed beyond recognition using spectral painting." },
                { tool: "FMOD Studio", role: "Adaptive Intensity Routing", notes: "Built a tension-level parameter tree — ambiance layers cross-fade based on a continuous 0–1 'dread' parameter driven by player proximity to scripted events. Jump-scare stings are triggered via FMOD command instruments for frame-accurate timing." },
                { tool: "Audacity", role: "Batch Export & Format Conversion", notes: "Fast batch-normalisation, sample-precise fade trimming, and final export pipeline for all 50+ assets to 24-bit WAV delivery format." }
            ],
            highlights: [
                "Infrasonic drone layers (sub-20 Hz) engineered for physical, subconscious unease",
                "Granular re-synthesis textures that evolve organically, defeating listener habituation",
                "Jump-scare architecture: 300ms pre-silence, multi-layer impact, controlled decay",
                "All assets tuned to a shared large-stone-room reverb tail for cohesive world acoustics"
            ],
            samples: [
                { id: 'horror-heartbeat', name: 'Dread Heartbeat', desc: 'Pitched-down pulse with sub-bass rumble layer' },
                { id: 'horror-creature', name: 'Creature Growl', desc: 'Layered synthesis vocalization — deep and inhuman' },
                { id: 'horror-jumpscare', name: 'Jump Scare Sting', desc: 'Pre-silence → noise burst → dissonant shriek' },
                { id: 'horror-drone', name: 'Dark Ambiance Drone', desc: 'Sustained infrasonic-layered tension atmosphere' },
                { id: 'horror-door', name: 'Creaking Door', desc: 'Metal resonance sweep with decaying reverb tail' },
                { id: 'horror-impact', name: 'Body Impact', desc: 'Low-frequency thud with layered metallic clang' },
                { id: 'horror-whisper', name: 'Whisper Layer', desc: 'Granular-processed vocal texture — barely intelligible' }
            ]
        },
        'rpg-character': {
            title: "RPG Character Sound Pack",
            category: "RPG / Adventure",
            year: "2024",
            summary: "A comprehensive RPG audio library covering spell casting, melee combat, character foley, and narrative reward cues for fantasy game worlds.",
            image: "https://placehold.co/600x338/0d0026/9b59b6?text=RPG+Character+Pack",
            role: "Designed and produced a full-spectrum RPG audio library with a consistent fantasy tone — magical but grounded. My approach centred on building a coherent audio language: spells share a harmonic signature, weapons have weight and material realism, and reward cues (level-up, quest complete) use memorable melodic hooks that players consciously associate with progression.",
            thoughtProcess: "RPG audio must balance fantasy and physicality. A fire spell should feel magical, but the whoosh, crackle, and energy charge that precede it are grounded in real-world physics — combustion, air displacement, electrostatic build-up. I achieved this by layering a synthesized 'magical shimmer' on top of physically accurate synthesis layers. For melee combat, I studied the acoustics of real metal-on-metal contact: steel swords produce a sharp, bright clang with a high-frequency ring that decays exponentially — I replicated this using FM synthesis with rapid attack and tuned resonance frequency. The 'level-up' fanfare was the most musically considered asset: it uses a rising perfect-fourth interval followed by a major chord resolution — the same intervallic pattern found in iconic RPG fanfares — hardwired into player memory as a reward cue.",
            technologies: ["Reaper", "FMOD", "Kontakt", "Audacity"],
            link: "#",
            stats: { assets: "80+", categories: "7", format: "WAV / 24-bit" },
            toolBreakdown: [
                { tool: "Reaper", role: "DAW & Session Management", notes: "All recording sessions, layer automation, send effects, and the full mastering chain were built in Reaper for maximum routing flexibility. Spell layers (charge, whoosh, release) were mixed as separate Reaper tracks with independent automation." },
                { tool: "Native Instruments Kontakt 7", role: "Orchestral & Foley Sampling", notes: "Used Kontakt's scripting engine to build a randomized sword-impact instrument — each hit triggers one of 8 round-robin samples at a randomized pitch offset, eliminating the machine-gun effect during rapid combat." },
                { tool: "FMOD Studio", role: "Interactive Audio Logic", notes: "Built real-time parameter logic for spell intensity scaling (weak/medium/strong cast variants), combo-count pitch variation for sword hits, and adaptive combat music layering tied to enemy proximity." },
                { tool: "Audacity", role: "Source Audio Pre-processing", notes: "Pre-processing pipeline for all foley source recordings — removing background noise, normalising transients, and trimming to loop-point before import into Reaper for final design." }
            ],
            highlights: [
                "Unified 'magical shimmer' harmonic signature across all spell-type assets for audio branding",
                "FM synthesis replication of metal-on-metal acoustics — realistic ring decay without physical sampling",
                "Level-up fanfare uses the perfect-fourth interval resolution pattern wired into gamer memory",
                "Round-robin Kontakt instrument for sword hits eliminates machine-gun repetition effect"
            ],
            samples: [
                { id: 'rpg-spell', name: 'Spell Cast', desc: 'Harmonic shimmer charge → whoosh → energy release' },
                { id: 'rpg-sword', name: 'Sword Clash', desc: 'FM-synthesized metal ring with exponential decay' },
                { id: 'rpg-levelup', name: 'Level Up Fanfare', desc: 'Perfect-fourth rising arc with major chord resolution' },
                { id: 'rpg-potion', name: 'Potion Use', desc: 'Liquid glug with ascending pitch-shift sparkle tail' },
                { id: 'rpg-footstep', name: 'Footstep (Grass)', desc: 'Soft layered crunch — organic and spatially grounded' },
                { id: 'rpg-chest', name: 'Chest Open', desc: 'Creak layer with reward chime — treasure discovered' },
                { id: 'rpg-quest', name: 'Quest Complete', desc: 'Triumphant arpeggio with orchestral chord swell' }
            ]
        },
        'vehicle-racing': {
            title: "Vehicle & Racing Sound Pack",
            category: "Racing / Action",
            year: "2023",
            summary: "A high-octane vehicle audio pack featuring seamlessly looping engine stems, doppler-tuned collision impacts, tire foley, and turbo boost cues built for Unity's audio system.",
            image: "https://placehold.co/600x338/001a33/f39c12?text=Vehicle+%26+Racing+Pack",
            role: "I produced a complete vehicle audio suite covering engine states (idle, mid-rev, full-throttle), tire physics (screech, roll, skid), collision impacts, and turbo boost effects. All engine assets were designed as seamless FMOD stems that blend in real time based on the game's RPM and speed parameters — the player hears a continuously evolving engine that responds to their exact throttle inputs.",
            thoughtProcess: "Vehicle audio is one of the most technically demanding areas of game sound design because the assets must be engineered for dynamic blending — the idle, mid-rev, and full-throttle sounds are separate stems that FMOD interpolates between based on a continuous RPM float parameter. I modelled each engine state as an independent synthesis patch: the idle uses a detuned sawtooth with low-frequency tremolo to simulate cylinder irregularity; the mid-rev tightens the harmonic content and increases the pulse rate; the full-throttle is a complex multi-oscillator patch with controlled distortion. For collision impacts, I applied layered physics: a low-frequency 'crunch' (metal bending), a mid-frequency 'crack' (fracture point), and a high-frequency 'ring' (surface resonance), all timed in rapid succession to simulate the acoustic reality of a high-speed impact.",
            technologies: ["Reaper", "FMOD", "Unity", "Audacity"],
            link: "#",
            stats: { assets: "45+", categories: "5", format: "WAV / 16-bit" },
            toolBreakdown: [
                { tool: "Reaper", role: "Loop Design & Analysis", notes: "All engine loops were built and loop-point perfected in Reaper. Used spectral analysis tools to identify and align zero-crossing points — ensuring completely click-free seamless looping at any tempo." },
                { tool: "FMOD Studio", role: "RPM Parameter Routing", notes: "Built the RPM-to-audio parameter tree that cross-fades engine idle, mid, and rev stems in real time. Unity sends a 0–1 normalised float from the vehicle physics component; FMOD translates this into the multi-stem blend." },
                { tool: "Unity Audio Mixer", role: "Doppler & Spatialization", notes: "Configured Unity's built-in Audio Source doppler effect, custom distance falloff curves, and reverb zone sends for tunnels and garages — each environment type has its own reverb zone preset." },
                { tool: "Audacity", role: "Distortion & Tonal EQ", notes: "Processing pipeline for adding controlled odd-harmonic distortion to raw engine tones and applying high-shelf boosts to emphasise the mechanical top-end character that makes game vehicle audio feel exciting." }
            ],
            highlights: [
                "Engine audio engineered as blendable FMOD stems — idle, mid-rev, and full-throttle seamlessly interpolated",
                "Collision impact layering: crunch (bend) + crack (fracture) + ring (resonance) — modelled on real impact physics",
                "Doppler parameters pre-tuned to Unity's built-in Audio Source spatial audio system",
                "All loops zero-crossing verified for click-free seamless playback at any RPM"
            ],
            samples: [
                { id: 'vehicle-idle', name: 'Engine Idle', desc: 'Detuned sawtooth with low-frequency tremolo — idle state' },
                { id: 'vehicle-rev', name: 'Engine Rev', desc: 'Multi-oscillator harmonic sweep — throttle response' },
                { id: 'vehicle-screech', name: 'Tire Screech', desc: 'Filtered noise sweep with pitch-bending arc' },
                { id: 'vehicle-collision', name: 'Vehicle Collision', desc: 'Layered crunch → crack → metallic ring impact' },
                { id: 'vehicle-turbo', name: 'Turbo Boost', desc: 'Rising frequency whistle with air-rush noise layer' },
                { id: 'vehicle-horn', name: 'Car Horn', desc: 'Detuned square-wave chord — harsh and immediate' },
                { id: 'vehicle-crash', name: 'Crash Impact', desc: 'High-energy full-frequency collision with debris scatter' }
            ]
        },
        'ambient-environment': {
            title: "Nature & Environment Pack",
            category: "Ambient / Environment",
            year: "2022",
            summary: "A rich library of natural ambiance loops — wind, rain, forest, cave, ocean — designed as seamless multi-stem Unity AudioSource layers for open-world and adventure games.",
            image: "https://placehold.co/600x338/001a0d/2ecc71?text=Nature+%26+Environment+Pack",
            role: "I produced a complete environmental audio library using a hybrid workflow: location sound captured on a portable field recorder, cleaned in iZotope RX, then blended with synthesized extension layers to go beyond the limitations of a single recording session. Each ambiance is a multi-stem composition — base atmosphere, mid-range detail, and foreground event layers — designed for adaptive blending in Unity via FMOD.",
            thoughtProcess: "Environmental ambiance is often the most underappreciated element of game audio, yet it does the heaviest lifting in world-building. My foundational principle is the 'figure-ground' model from music composition: the ambiance is the canvas, not the painting — it must never demand attention, only contextualise it. For the forest ambiance, I built three independent stems: a continuous low wind rustle (the 'ground'), randomized bird call one-shots triggered by FMOD's Scatterer module (the 'figure'), and a mid-range leaf movement layer (the 'texture'). Rain synthesis uses pink noise as its base — matching the spectral distribution of real rainfall — with a shaped LFO modulation layer simulating wind gusts. Cave drips use the acoustic principle of reflection delay: each drip has a subtle reverb tail sized to match the implied space of the game level.",
            technologies: ["Reaper", "iZotope RX", "FMOD", "Audacity"],
            link: "#",
            stats: { assets: "55+", categories: "8", format: "WAV / 24-bit" },
            toolBreakdown: [
                { tool: "Reaper", role: "Multi-Stem Session Mixing", notes: "Each environment is built as a 3–5 stem Reaper session. Loop points are defined by zero-crossing analysis — the result is ambiances that loop every 60–120 seconds with no perceptible seam." },
                { tool: "iZotope RX 10", role: "Field Recording Cleanup", notes: "Removed wind rumble, HVAC hum, and distant traffic from all field recordings. Spectral Repair was used to fill gaps where transient noise contaminated otherwise clean takes, preserving every usable second of location audio." },
                { tool: "FMOD Studio", role: "Scatterer & Zone Transitions", notes: "Used FMOD's Scatterer instrument for randomised bird calls, insect chirps, and weather events. Built smooth zone-transition logic — interior and exterior ambiance layers crossfade over 4 seconds when the player crosses a threshold trigger." },
                { tool: "Audacity", role: "LUFS Normalisation & Batch Export", notes: "Batch-applied loudness normalisation (targeting -23 LUFS for ambiances, -18 LUFS for event cues) and converted all 55+ source files to 24-bit WAV for delivery packaging." }
            ],
            highlights: [
                "Figure-ground design philosophy: ambiances contextualise the world without demanding attention",
                "Three-stem architecture per environment (base, texture, event) for fully adaptive FMOD mixing",
                "Rain synthesis uses spectrally-accurate pink noise with LFO gust modulation layer",
                "Cave reverb tails calibrated to implied room volume — separate presets for small, medium, and large spaces"
            ],
            samples: [
                { id: 'amb-wind', name: 'Wind Rustle', desc: 'Pink noise with gentle LFO frequency modulation' },
                { id: 'amb-rain', name: 'Rain on Leaves', desc: 'Spectrally-shaped pink noise with gust LFO layer' },
                { id: 'amb-forest', name: 'Forest Ambiance', desc: 'Three-stem blend: wind base, leaf texture, bird events' },
                { id: 'amb-cave', name: 'Cave Drips', desc: 'Pitched water drops with calibrated reflection delay' },
                { id: 'amb-thunder', name: 'Distant Thunder', desc: 'Low rumble sweep with long natural decay tail' },
                { id: 'amb-fire', name: 'Campfire Crackle', desc: 'Pink noise with random amplitude spikes — fire texture' },
                { id: 'amb-ocean', name: 'Ocean Waves', desc: 'Filtered noise swell with rhythmic amplitude envelope' }
            ]
        }
    };

    const projectsData = {
        'wreck-it-relph': {
            title: "Don't Wreck It Relph (2024)",
            summary: "A successful entry for the 2024 'Don't Wreck It Relph' game jam, securing #1 place overall. The game is a fast-paced arcade challenge where the player must make his way home without accidentally touching and destroying everything around him to avoid getting in debt.",
            image: "https://i.imgur.com/vvDQsvu.jpeg",
            role: "I took on the roles of SFX Designer and programmer, creating all audio assets and contributing to the core gameplay mechanics and enemy AI.",
            technologies: ["Unity", "C#", "Audacity"],
            link: "https://sirkiefy.itch.io/dont-wreck-it-relph",
            scores: [
                { rank: '#1', category: 'Overall', score: '4.094' },
                { rank: '#1', category: 'Presentation', score: '4.250' },
                { rank: '#1', category: 'Playability', score: '4.125' },
                { rank: '#1', category: 'Theme', score: '4.125' },
                { rank: '#1', category: 'Creativity', score: '3.875' },
            ]
        },
        'project-patched': {
            title: "Project Patched (2023)",
            summary: "A top-ranking entry for a 2023 game jam. 'Project Patched' is a first person shooter where the player must go through and fight off bugs in the game and make it to the server room to finish the game.",
            image: "https://i.imgur.com/7dxE1Tk.gif",
            role: "My primary contributions were in SFX design and 3D Modeling the weapons.",
            technologies: ["Unity", "C#", "FMOD"],
            link: "https://sirkiefy.itch.io/project-patched",
            scores: [
                { rank: '#1', category: 'Presentation', score: '4.111' },
                { rank: '#2', category: 'Team Comp', score: '4.444' },
                { rank: '#3', category: 'Overall', score: '3.244' },
                { rank: '#3', category: 'Playability', score: '3.000' },
            ]
        }
    };

    const artGalleries = {
        'pixel-art': {
            title: "Pixel Art Showcase",
            process: "A collection of various pixel art creations, including characters, environments, and animations, focusing on atmospheric storytelling.",
            images: [
                { id: 'px-standoff', src: 'https://i.imgur.com/H0fZ2Vi.png', title: 'Mythical Lands Icon', date: '2023', tools: 'Pyxel Edit', tags: 'Pixel Art', process: 'An icon with the mix of legendary items and dragon\'s blood, and a colour matching the border. I wanted it to look professional while using items from the mod so it has the same style.' },
                { id: 'px-guardian', src: 'https://i.imgur.com/i3c2kM0.png', title: 'Forest Guardian', date: '2024', tools: 'Aseprite', tags: 'Pixel Art, Fantasy, Creature', process: 'Concept for a mythical forest creature. Used a limited color palette to evoke a sense of ancient magic.' },
                { id: 'px-dusk', src: 'https://i.imgur.com/sA99nI4.png', title: 'City at Dusk', date: '2023', tools: 'Aseprite', tags: 'Pixel Art, Environment, Cityscape', process: 'A wide shot of a futuristic city as the sun sets. The goal was to create a sense of scale and wonder.' },
                { id: 'px-knight', src: 'https://i.imgur.com/yG3a2YF.gif', title: 'Wandering Knight (Animation)', date: '2023', tools: 'Aseprite', tags: 'Pixel Art, Animation, Character', process: 'A simple walk cycle animation for a fantasy knight. Each frame was drawn by hand to ensure fluid motion.' },
                { id: 'px-alley', src: 'https://i.imgur.com/Jq2k3vj.png', title: 'Cyberpunk Alley', date: '2022', tools: 'Pyxel Edit', tags: 'Pixel Art, Cyberpunk, Environment', process: 'An exercise in creating a detailed, cluttered environment with neon lighting effects.' },
                { id: 'px-vista', src: 'https://i.imgur.com/0aE2b1n.png', title: 'Mountain Vista', date: '2022', tools: 'Aseprite', tags: 'Pixel Art, Landscape, Nature', process: 'A peaceful mountain scene, focusing on parallax scrolling effects to create depth.' }
            ]
        }
    };

    const worldsData = {
        'everfield': {
            title: "Project Everfield",
            tagline: "Where forgotten science bleeds into new magic.",
            image: "https://placehold.co/600x800/5c00d9/1c1c1c?text=Everfield",
            overview: "A noble dark fantasy world echoing with loss and loneliness. Once a hyper-advanced technological civilization, a cataclysm shattered reality itself, ushering in an age of wild magic and terrifying monsters. Now, medieval kingdoms rise and fall among the ruins of chrome towers, and knights in plate armour might stumble upon ancient power cells they mistake for magical artifacts. The world's 'magic' is the chaotic, untamed energy leaking from the scars the Ancients left upon the fabric of the universe.",
            concepts: [
                { name: "Noble Dark Fantasy", description: "A genre that acknowledges the grim and brutal realities of its world but emphasizes that acts of hope, heroism, and sacrifice are still meaningful, even if they don't save the world." },
                { name: "Techno-Magic", description: "Magic is not an innate, mystical force but rather the chaotic, unpredictable energy leaking from decaying, hyper-advanced technology. A 'fireball' might be a malfunctioning plasma grenade; a 'healing potion' could be a nanite-infusion canister." },
            ],
            factions: [
                { name: "The Archivists of Aethelburg", description: "A monastic order dedicated to preserving the 'Old Tech'. They see the past not as a lost golden age, but as a library of dangerous knowledge that must be protected from those who would misuse it. They are reclusive, scholarly, and deeply suspicious of the new 'mages'." },
                { name: "The Wild Mages of the Scarred Lands", description: "Individuals who have learned to crudely channel the raw, chaotic magic that now permeates the world. Their power is immense but dangerously unstable, often coming at a great physical or mental cost. They are outcasts, revered and feared in equal measure." },
                { name: "The Iron Concord", description: "A league of city-states that have managed to reverse-engineer and maintain some of the Ancients' simpler technologies, like steam power and basic firearms. They represent order and progress, but their expansion often puts them in conflict with the more mystical elements of the world." }
            ],
            locations: [
                { name: "The Glass City of Aethelburg", description: "A city built within the crystalline shell of a crashed Ancient colony ship. It is the last bastion of true scientific knowledge and the headquarters of the Archivists." },
                { name: "The Whispering Peaks", description: "A mountain range where the cataclysm tore a permanent rift in spacetime. The peaks are haunted by temporal echoes, and the rocks themselves are said to whisper the final thoughts of those who died during the Fall." },
                { name: "The Sunken Metropolis", description: "The former capital of the Ancients, now submerged beneath the sea. Its towers are coral-encrusted tombs, and its automated defense systems still patrol the silent, watery streets, guarding secrets no one is left to understand." }
            ]
        },
        'echoes': {
            title: "Echoes of Light and Shadow",
            tagline: "Humanity's last embers in a cold, silent universe.",
            image: "https://placehold.co/600x800/0067d9/1c1c1c?text=Echoes",
            overview: "In the wake of a Golden Age's silent collapse, humanity clings to survival in isolated star-systems, connected only by treacherous 'light-lanes' through an unnervingly quiet cosmos. The great mystery is not one of alien empires, but of their complete absence. The universe is vast, ancient, and empty, and the pressing question is 'Why?'. This is a story of exploration, isolation, and the psychological toll of being utterly alone in the dark.",
            concepts: [
                { name: "The Great Silence", description: "The central mystery of the universe. Despite millennia of exploration, no signs of intelligent alien life, past or present, have ever been discovered, leading to widespread existential dread and dangerous philosophical movements." },
                { name: "Light-Lanes", description: "Stable, naturally occurring tunnels through hyperspace that are the only known method of faster-than-light travel. They are unpredictable and require skilled pilots, making interstellar trade and communication a high-risk endeavor." },
            ],
            factions: [
                { name: "The Lantern Bearers", description: "An almost religious guild of pilots and engineers who maintain the fragile light-lanes. They are the lifeline of scattered humanity, revered for their courage in facing the oppressive silence between stars. To be a Lantern Bearer is to accept a life of solitude and immense responsibility." },
                { name: "The Void-touched", description: "Groups of humans who have adapted to life in the 'Shadow', the dark spaces outside the light-lanes. Some have undergone genetic modification, while others have simply been driven mad by the silence. They are seen as boogeymen by the rest of humanity, raiding ships that stray too far from the path." },
                { name: "The Archivists of Sol", description: "The descendants of those who remained in humanity's home system. They control the flow of information from the Golden Age, believing that the knowledge of what caused the collapse is too dangerous to be released. They are seen as gatekeepers, hoarding the past for their own purposes." }
            ],
            locations: [
                { name: "The Beacon", description: "The central hub of the light-lane network, a massive space station built around a stable wormhole. It is the only place where all of humanity's scattered tribes can meet in relative safety." },
                { name: "The Graveyard of Giants", description: "A nebula filled with the colossal, derelict ships of an unknown, long-dead alien civilization—the only evidence that humanity was not the first. Scavengers risk their lives to explore these silent tombs, searching for answers or forgotten technology." },
                { name: "Ouroboros-7", description: "A 'rogue planet' that travels through the deep void. It is home to a secretive colony of Void-touched who claim to have found a way to 'listen' to the silence, and what they hear is driving them to unify the scattered remnants of their kind." }
            ]
        }
    };
    
    // --- Audio ---
    async function initializeAudio() {
        if (soundsReady || typeof Tone === 'undefined') return;
        try {
            await Tone.start();
            synth = new Tone.PolySynth(Tone.Synth).toDestination();
            soundsReady = true;
        } catch (e) {
            console.error("Could not initialize audio:", e);
        }
    }
    const playClickSound = () => { if (soundsReady) synth.triggerAttackRelease("C4", "8n", Tone.now()); };
    const playSecretSound = () => { if (soundsReady) synth.triggerAttackRelease(["C5", "E5"], "16n", Tone.now()); };
    const playSfxDemoSound = (soundType) => {
        if (!soundsReady) return;
        const now = Tone.now();
        switch(soundType) {
            case 'grass':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.05, sustain: 0 } }).toDestination().triggerAttackRelease("16n", now);
                break;
            case 'wood':
                synth.triggerAttackRelease("G3", "16n", now, 0.8);
                break;
            case 'stone':
                synth.triggerAttackRelease("C3", "16n", now, 1.0);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.08, sustain: 0 } }).toDestination().triggerAttackRelease("16n", now);
                break;
        }
    };
    const playSfxSample = (sampleId) => {
        if (!soundsReady) return;
        const now = Tone.now();
        switch(sampleId) {
            // FPS Engine
            case 'fps-shot':
                const noise = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).toDestination();
                noise.triggerAttackRelease("8n", now);
                const metal = new Tone.MetalSynth({ frequency: 150, envelope: { attack: 0.001, decay: 0.1, release: 0.05 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
                metal.triggerAttackRelease("C2", "8n", now + 0.01);
                break;
            case 'fps-reload':
                new Tone.MetalSynth({frequency: 400, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 12, resonance: 800, octaves: 0.5}).toDestination().triggerAttackRelease("C3", "32n", now);
                new Tone.MetalSynth({frequency: 400, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 12, resonance: 800, octaves: 0.5}).toDestination().triggerAttackRelease("C3", "32n", now + 0.1);
                break;
            case 'fps-footstep':
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.08, sustain: 0 } }).toDestination().triggerAttackRelease("16n", now);
                break;
            case 'fps-empty':
                new Tone.MetalSynth({ frequency: 600, envelope: { attack: 0.001, decay: 0.04, release: 0.01 }, harmonicity: 3.2, modulationIndex: 8, resonance: 400, octaves: 0.3 }).toDestination().triggerAttackRelease("A3", "32n", now);
                break;
            case 'fps-land':
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.005, decay: 0.18, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now);
                synth.triggerAttackRelease("C2", "16n", now, 0.4);
                break;
            // Inventory
            case 'inv-pickup':
                synth.triggerAttackRelease("C6", "16n", now);
                break;
            case 'inv-click':
                synth.triggerAttackRelease("A5", "32n", now);
                break;
            case 'inv-drop':
                synth.triggerAttackRelease("C4", "16n", now, 0.6);
                break;
            case 'inv-equip':
                synth.triggerAttackRelease("E5", "32n", now);
                new Tone.MetalSynth({ frequency: 300, envelope: { attack: 0.001, decay: 0.04, release: 0.01 }, harmonicity: 3, modulationIndex: 6, resonance: 600, octaves: 0.4 }).toDestination().triggerAttackRelease("A2", "32n", now + 0.03);
                break;
            case 'inv-fail':
                synth.triggerAttackRelease("A3", "16n", now, 0.7);
                synth.triggerAttackRelease("Ab3", "16n", now + 0.12, 0.7);
                break;
            // Save/Load
            case 'save-start':
                synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", now);
                break;
            case 'save-success':
                synth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "4n", now);
                break;
            case 'save-confirm':
                synth.triggerAttackRelease("G5", "16n", now);
                break;
            case 'save-load':
                synth.triggerAttackRelease("G4", "16n", now);
                synth.triggerAttackRelease("A4", "16n", now + 0.1);
                synth.triggerAttackRelease("B4", "16n", now + 0.2);
                synth.triggerAttackRelease("D5", "8n", now + 0.32);
                break;
            case 'save-error':
                synth.triggerAttackRelease("F3", "8n", now, 0.9);
                synth.triggerAttackRelease("B2", "8n", now + 0.18, 0.9);
                break;
            // Platformer
            case 'plat-jump':
                const jumpSynth = new Tone.Synth().toDestination();
                jumpSynth.triggerAttackRelease("C5", "16n", now);
                jumpSynth.frequency.rampTo("G5", 0.15, now);
                break;
            case 'plat-coin':
                const coinSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination();
                coinSynth.triggerAttackRelease("E6", "16n", now);
                break;
            case 'plat-hit':
                const hitNoise = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).toDestination();
                hitNoise.triggerAttackRelease("8n", now);
                break;
            case 'plat-powerup':
                const puSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.08, sustain: 0.05, release: 0.05 } }).toDestination();
                ['C5','E5','G5','C6','E6'].forEach((note, i) => puSynth.triggerAttackRelease(note, "32n", now + i * 0.07));
                break;
            case 'plat-death':
                const deathSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0 } }).toDestination();
                ['B4','Bb4','A4','Ab4','G4','F#4','F4','E4'].forEach((note, i) => deathSynth.triggerAttackRelease(note, "16n", now + i * 0.09));
                break;
            case 'plat-level-complete':
                const lvlSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.05, release: 0.05 } }).toDestination();
                ['C5','E5','G5','C6','E6','G6','C7'].forEach((note, i) => lvlSynth.triggerAttackRelease(note, "16n", now + i * 0.08));
                break;
            case 'plat-run':
                const runSynth = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.04, sustain: 0 } }).toDestination();
                [0, 0.1, 0.2, 0.3].forEach(t => runSynth.triggerAttackRelease("32n", now + t));
                break;
            case 'plat-wall-jump':
                const wjSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0 } }).toDestination();
                new Tone.MetalSynth({ frequency: 500, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 3, modulationIndex: 8, resonance: 600, octaves: 0.4 }).toDestination().triggerAttackRelease("A3", "32n", now);
                wjSynth.triggerAttackRelease("E5", "16n", now + 0.02);
                wjSynth.frequency.rampTo("B5", 0.12, now + 0.02);
                break;
            // FPS extended
            case 'fps-handling':
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.06, sustain: 0 } }).toDestination().triggerAttackRelease("32n", now, 0.3);
                new Tone.MetalSynth({ frequency: 800, envelope: { attack: 0.001, decay: 0.04, release: 0.01 }, harmonicity: 4, modulationIndex: 6, resonance: 1200, octaves: 0.3 }).toDestination().triggerAttackRelease("F4", "32n", now + 0.05, 0.4);
                break;
            case 'fps-hit-marker':
                new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0 } }).toDestination().triggerAttackRelease("C7", "64n", now, 0.9);
                break;
            case 'fps-ambient':
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.3, decay: 0.8, sustain: 0.05, release: 0.5 } }).toDestination().triggerAttackRelease("2n", now, 0.25);
                break;
            // Inventory extended
            case 'inv-sort':
                [0, 0.06, 0.12].forEach(t => new Tone.MetalSynth({ frequency: 350, envelope: { attack: 0.001, decay: 0.04, release: 0.01 }, harmonicity: 3, modulationIndex: 5, resonance: 500, octaves: 0.3 }).toDestination().triggerAttackRelease("A3", "32n", now + t, 0.7));
                break;
            case 'inv-open':
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.02, decay: 0.12, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now, 0.5);
                synth.triggerAttackRelease("G5", "32n", now + 0.1);
                break;
            case 'inv-close':
                synth.triggerAttackRelease("D5", "32n", now);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.08, sustain: 0 } }).toDestination().triggerAttackRelease("16n", now + 0.04, 0.35);
                break;
            // Save/Load extended
            case 'save-autosave':
                new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0 } }).toDestination().triggerAttackRelease("A6", "32n", now, 0.4);
                break;
            case 'save-warning':
                synth.triggerAttackRelease("D4", "16n", now, 0.8);
                synth.triggerAttackRelease("D4", "16n", now + 0.28, 0.8);
                break;
            case 'save-transition':
                const transSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.4, sustain: 0.1, release: 0.3 } }).toDestination();
                transSynth.triggerAttackRelease("C4", "4n", now, 0.7);
                transSynth.frequency.rampTo("C6", 0.5, now);
                break;
            // Horror
            case 'horror-heartbeat':
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now);
                synth.triggerAttackRelease("C1", "8n", now, 0.7);
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now + 0.36);
                synth.triggerAttackRelease("C1", "16n", now + 0.36, 0.5);
                break;
            case 'horror-creature':
                const grwlSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.12, decay: 0.5, sustain: 0.2, release: 0.4 } }).toDestination();
                grwlSynth.triggerAttackRelease("C2", "4n", now, 0.8);
                grwlSynth.frequency.rampTo("G1", 0.45, now);
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.1, decay: 0.5, sustain: 0.1, release: 0.3 } }).toDestination().triggerAttackRelease("4n", now, 0.4);
                break;
            case 'horror-jumpscare':
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.35, sustain: 0 } }).toDestination().triggerAttackRelease("4n", now + 0.1, 1.0);
                synth.triggerAttackRelease("C1", "4n", now + 0.1, 0.9);
                const shriekSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0 } }).toDestination();
                shriekSynth.triggerAttackRelease("B7", "4n", now + 0.12, 0.7);
                break;
            case 'horror-drone':
                const droneSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.4, decay: 0.5, sustain: 0.5, release: 0.8 } }).toDestination();
                droneSynth.triggerAttackRelease("C2", "2n", now, 0.6);
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.3, decay: 1.0, sustain: 0.2, release: 0.5 } }).toDestination().triggerAttackRelease("2n", now, 0.15);
                break;
            case 'horror-door':
                const doorSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.05, decay: 0.6, sustain: 0.1, release: 0.5 } }).toDestination();
                doorSynth.triggerAttackRelease("F2", "4n", now, 0.5);
                doorSynth.frequency.rampTo("C3", 0.4, now);
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.05, release: 0.3 } }).toDestination().triggerAttackRelease("4n", now, 0.3);
                break;
            case 'horror-impact':
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.001, decay: 0.35, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now, 0.9);
                synth.triggerAttackRelease("C1", "8n", now, 0.8);
                new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.25, release: 0.1 }, harmonicity: 4, modulationIndex: 16, resonance: 2000, octaves: 1.0 }).toDestination().triggerAttackRelease("G2", "8n", now + 0.02);
                break;
            case 'horror-whisper':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.2, decay: 0.6, sustain: 0.2, release: 0.5 } }).toDestination().triggerAttackRelease("4n", now, 0.2);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.05, decay: 0.4, sustain: 0.1, release: 0.3 } }).toDestination().triggerAttackRelease("4n", now, 0.08);
                break;
            // RPG
            case 'rpg-spell':
                const spellCharge = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.08, decay: 0.2, sustain: 0.3, release: 0.2 } }).toDestination();
                spellCharge.triggerAttackRelease("G4", "8n", now, 0.5);
                spellCharge.frequency.rampTo("E6", 0.18, now);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now + 0.22, 0.7);
                synth.triggerAttackRelease(["C5","E5","G5"], "8n", now + 0.26, 0.8);
                break;
            case 'rpg-sword':
                new Tone.MetalSynth({ frequency: 300, envelope: { attack: 0.001, decay: 0.35, release: 0.15 }, harmonicity: 5.5, modulationIndex: 24, resonance: 3500, octaves: 1.8 }).toDestination().triggerAttackRelease("D3", "8n", now);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.08, sustain: 0 } }).toDestination().triggerAttackRelease("16n", now, 0.6);
                break;
            case 'rpg-levelup':
                const lvlupSynth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0.05, release: 0.08 } }).toDestination();
                ['G4','C5','E5','G5','C6'].forEach((note, i) => lvlupSynth.triggerAttackRelease(note, "8n", now + i * 0.1));
                synth.triggerAttackRelease(["C5","E5","G5","C6"], "4n", now + 0.55, 0.9);
                break;
            case 'rpg-potion':
                const potSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.08, sustain: 0.05, release: 0.05 } }).toDestination();
                ['G5','A5','B5','D6','G6'].forEach((note, i) => potSynth.triggerAttackRelease(note, "32n", now + i * 0.055));
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.02, decay: 0.15, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now, 0.25);
                break;
            case 'rpg-footstep':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).toDestination().triggerAttackRelease("16n", now, 0.6);
                synth.triggerAttackRelease("E3", "32n", now, 0.3);
                break;
            case 'rpg-chest':
                const chestSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.02, decay: 0.2, sustain: 0.05, release: 0.1 } }).toDestination();
                chestSynth.triggerAttackRelease("C3", "8n", now, 0.5);
                new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.1, release: 0.05 }, harmonicity: 3, modulationIndex: 8, resonance: 800, octaves: 0.6 }).toDestination().triggerAttackRelease("G3", "8n", now + 0.08);
                synth.triggerAttackRelease(["E5","G5","B5"], "8n", now + 0.2, 0.7);
                break;
            case 'rpg-quest':
                const questSynth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.05, release: 0.06 } }).toDestination();
                ['C5','E5','G5','C6','E6','G6'].forEach((note, i) => questSynth.triggerAttackRelease(note, "16n", now + i * 0.09));
                synth.triggerAttackRelease(["C5","E5","G5","C6"], "2n", now + 0.6, 0.85);
                break;
            // Vehicle / Racing
            case 'vehicle-idle':
                const idleSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.4 } }).toDestination();
                idleSynth.triggerAttackRelease("A1", "4n", now, 0.7);
                const idleSynth2 = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.4 } }).toDestination();
                idleSynth2.triggerAttackRelease("A#1", "4n", now, 0.4);
                break;
            case 'vehicle-rev':
                const revSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.05, decay: 0.5, sustain: 0.3, release: 0.4 } }).toDestination();
                revSynth.triggerAttackRelease("A1", "4n", now, 0.8);
                revSynth.frequency.rampTo("A3", 0.4, now);
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.05, decay: 0.4, sustain: 0.1, release: 0.2 } }).toDestination().triggerAttackRelease("4n", now, 0.3);
                break;
            case 'vehicle-screech':
                const screechSynth = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.02, decay: 0.5, sustain: 0.1, release: 0.3 } }).toDestination();
                screechSynth.triggerAttackRelease("4n", now, 0.8);
                const scrPitch = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.05, release: 0.2 } }).toDestination();
                scrPitch.triggerAttackRelease("F4", "4n", now, 0.4);
                scrPitch.frequency.rampTo("C3", 0.35, now);
                break;
            case 'vehicle-collision':
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.001, decay: 0.4, sustain: 0 } }).toDestination().triggerAttackRelease("4n", now, 1.0);
                synth.triggerAttackRelease("C1", "8n", now, 0.9);
                new Tone.MetalSynth({ frequency: 180, envelope: { attack: 0.001, decay: 0.5, release: 0.2 }, harmonicity: 6, modulationIndex: 20, resonance: 2500, octaves: 1.5 }).toDestination().triggerAttackRelease("D2", "8n", now + 0.03);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination().triggerAttackRelease("8n", now + 0.04, 0.6);
                break;
            case 'vehicle-turbo':
                const turboSynth = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.06, decay: 0.5, sustain: 0.2, release: 0.3 } }).toDestination();
                turboSynth.triggerAttackRelease("C3", "4n", now, 0.7);
                turboSynth.frequency.rampTo("G5", 0.4, now);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.05, decay: 0.4, sustain: 0.05, release: 0.2 } }).toDestination().triggerAttackRelease("4n", now, 0.4);
                break;
            case 'vehicle-horn':
                const hornSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.15 } }).toDestination();
                hornSynth.triggerAttackRelease("Bb3", "8n", now, 0.9);
                const hornSynth2 = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.15 } }).toDestination();
                hornSynth2.triggerAttackRelease("F3", "8n", now, 0.7);
                break;
            case 'vehicle-crash':
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.6, sustain: 0 } }).toDestination().triggerAttackRelease("4n", now, 1.0);
                new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.001, decay: 0.7, sustain: 0 } }).toDestination().triggerAttackRelease("4n", now, 0.9);
                synth.triggerAttackRelease("C1", "4n", now, 1.0);
                new Tone.MetalSynth({ frequency: 120, envelope: { attack: 0.001, decay: 0.6, release: 0.3 }, harmonicity: 8, modulationIndex: 28, resonance: 3000, octaves: 2.0 }).toDestination().triggerAttackRelease("G1", "4n", now + 0.02);
                break;
            // Ambient / Environment
            case 'amb-wind':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.5, decay: 0.8, sustain: 0.3, release: 0.6 } }).toDestination().triggerAttackRelease("2n", now, 0.35);
                break;
            case 'amb-rain':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.2, decay: 1.0, sustain: 0.4, release: 0.5 } }).toDestination().triggerAttackRelease("2n", now, 0.5);
                new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.1, decay: 0.8, sustain: 0.15, release: 0.4 } }).toDestination().triggerAttackRelease("2n", now, 0.15);
                break;
            case 'amb-forest':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.3, decay: 0.8, sustain: 0.3, release: 0.5 } }).toDestination().triggerAttackRelease("2n", now, 0.2);
                const birdSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.02, decay: 0.08, sustain: 0.05, release: 0.06 } }).toDestination();
                ['G6','A6','G6','B6'].forEach((note, i) => birdSynth.triggerAttackRelease(note, "32n", now + 0.3 + i * 0.07));
                break;
            case 'amb-cave':
                const dripSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.2 } }).toDestination();
                dripSynth.triggerAttackRelease("G5", "8n", now, 0.6);
                dripSynth.triggerAttackRelease("D5", "8n", now + 0.6, 0.4);
                break;
            case 'amb-thunder':
                const thunderSynth = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.02, decay: 1.2, sustain: 0.05, release: 0.8 } }).toDestination();
                thunderSynth.triggerAttackRelease("1n", now, 0.7);
                synth.triggerAttackRelease("C1", "4n", now, 0.5);
                break;
            case 'amb-fire':
                new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.1, decay: 0.8, sustain: 0.3, release: 0.5 } }).toDestination().triggerAttackRelease("2n", now, 0.4);
                [0.1, 0.25, 0.42, 0.58, 0.71].forEach(t => new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).toDestination().triggerAttackRelease("32n", now + t, 0.3));
                break;
            case 'amb-ocean':
                const waveSynth = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.6, decay: 1.0, sustain: 0.2, release: 0.8 } }).toDestination();
                waveSynth.triggerAttackRelease("1n", now, 0.55);
                break;
        }
    };

    // --- Page Navigation ---
    function setupNavigation() {
        const pages = document.querySelectorAll('.page');
        const navLinks = document.querySelectorAll('.nav-link');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const showPage = (pageId) => {
            if (activeShaderAnimation) {
                cancelAnimationFrame(activeShaderAnimation);
                activeShaderAnimation = null;
            }
            if (slideshowInterval) {
                clearInterval(slideshowInterval);
                slideshowInterval = null;
            }

            pages.forEach(page => page.classList.toggle('active', page.id === `page-${pageId}`));
            navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === pageId));
            document.querySelectorAll('.page.active .content-section').forEach(section => {
                section.classList.remove('visible');
                observer.observe(section);
            });
            window.scrollTo(0, 0);

            if (pageId === 'code') {
                document.getElementById('code-case-study-list').classList.remove('hidden');
                document.getElementById('code-case-study-detail').classList.add('hidden');
                document.getElementById('code-case-study-detail').innerHTML = '';
            } else if (pageId === 'sfx') {
                document.getElementById('sfx-project-list').classList.remove('hidden');
                document.getElementById('sfx-project-detail').classList.add('hidden');
                document.getElementById('sfx-project-detail').innerHTML = '';
            } else if (pageId === 'art') {
                setupArtGallery(showPage);
            }
        };

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                initializeAudio();
                playClickSound();
                const pageId = link.dataset.page;
                if (pageId) showPage(pageId);
            });
        });

        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mainNav = document.getElementById('main-nav');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        if (mobileMenuToggle && mainNav) {
            const toggleMenu = () => {
                initializeAudio();
                playClickSound();
                const isMenuOpen = mainNav.classList.toggle('mobile-active');
                mainNav.classList.toggle('hidden');
                hamburgerIcon.classList.toggle('hidden', isMenuOpen);
                closeIcon.classList.toggle('hidden', !isMenuOpen);
                document.body.style.overflow = isMenuOpen ? 'hidden' : '';
            };
            mobileMenuToggle.addEventListener('click', toggleMenu);
            mainNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => { if (mainNav.classList.contains('mobile-active')) toggleMenu(); });
            });
        }
        return showPage;
    }

    // --- Interactive Elements ---
    function setupSecretPanels() {
        document.querySelectorAll('.secret-trigger').forEach(trigger => {
            // The panel is expected to be the next sibling of the trigger's PARENT element (e.g., the <p> tag).
            let panel = trigger.parentElement.nextElementSibling;

            // A special case for the pronoun trigger which is nested differently
            if (!panel || !panel.classList.contains('secret-panel')) {
                panel = trigger.parentElement.parentElement.querySelector('.secret-panel');
            }
            
            if (panel && panel.classList.contains('secret-panel')) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    initializeAudio();
                    playSecretSound();
                    panel.classList.toggle('visible');
                });
            } else {
                console.warn("Could not find a .secret-panel for trigger:", trigger);
            }
        });
    }

    function setupProjectsGallery(showPage) {
        const projectCards = document.querySelectorAll('#page-projects .project-card');
        if (projectCards.length === 0) return;

        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.secret-trigger')) return;
                initializeAudio(); playClickSound();
                const projectId = card.dataset.projectId;
                const data = projectsData[projectId];
                if (data) {
                    document.getElementById('project-detail-image').src = data.image;
                    document.getElementById('project-detail-title').textContent = data.title;
                    document.getElementById('project-detail-summary').textContent = data.summary;
                    document.getElementById('project-detail-role').textContent = data.role;
                    document.getElementById('project-detail-link').href = data.link;
                    const techContainer = document.getElementById('project-detail-tech');
                    techContainer.innerHTML = '';
                    data.technologies.forEach(tech => {
                        const techEl = document.createElement('span');
                        techEl.className = 'border border-[var(--border-color)] rounded-full px-3 py-1 text-sm';
                        techEl.textContent = tech;
                        techContainer.appendChild(techEl);
                    });
                    const scoresContainer = document.getElementById('project-detail-scores');
                    scoresContainer.innerHTML = '';
                    if (data.scores) {
                        data.scores.forEach(score => {
                            const scoreEl = document.createElement('div');
                            scoreEl.className = 'grid grid-cols-3 gap-2';
                            scoreEl.innerHTML = `<span>${score.rank}</span><span class="col-span-1">${score.category}:</span><span class="text-right text-[var(--color-foreground)]">${score.score}</span>`;
                            scoresContainer.appendChild(scoreEl);
                        });
                    }
                    showPage('project-detail');
                }
            });
        });
        document.getElementById('back-to-projects').addEventListener('click', () => showPage('projects'));
    }

    function setupSfxPage(showPage) {
        const listContainer = document.getElementById('sfx-project-list').querySelector('.sfx-gallery');
        const detailContainer = document.getElementById('sfx-project-detail');
        
        if (!listContainer || !detailContainer) return;

        const showListView = () => {
            detailContainer.innerHTML = '';
            detailContainer.classList.add('hidden');
            document.getElementById('sfx-project-list').classList.remove('hidden');
            document.getElementById('sfx-project-list').classList.add('fade-in-view');
        };

        const showDetailView = (sfxId) => {
            const project = sfxData[sfxId];
            if (!project) return;

            document.getElementById('sfx-project-list').classList.add('hidden');
            detailContainer.innerHTML = '';

            const techHtml = project.technologies.map(tech => `<span class="border border-[var(--border-color)] rounded-full px-3 py-1 text-sm">${tech}</span>`).join('');
            const toolBreakdownHtml = project.toolBreakdown ? `
                <h5 class="section-title text-sm">// Professional Toolchain</h5>
                <div class="sfx-tool-breakdown mb-6">
                    ${project.toolBreakdown.map(item => `
                        <div class="sfx-tool-item">
                            <div class="sfx-tool-header">
                                <span class="sfx-tool-name">${item.tool}</span>
                                <span class="sfx-tool-role">${item.role}</span>
                            </div>
                            <p class="sfx-tool-notes">${item.notes}</p>
                        </div>
                    `).join('')}
                </div>` : '';
            const samplesHtml = project.samples.map(sample => `
                <div class="sfx-sample-item">
                    <div class="sfx-sample-info">
                        <span class="font-mono text-sm">${sample.name}</span>
                        <span class="sfx-sample-desc">${sample.desc}</span>
                    </div>
                    <button class="sfx-sample-play-btn" data-sample-id="${sample.id}" title="Play sample">
                        <i data-lucide="play" class="w-5 h-5"></i>
                    </button>
                </div>
            `).join('');
            const statsHtml = Object.entries(project.stats).map(([label, value]) => `
                <div class="sfx-stat-item">
                    <span class="sfx-stat-value">${value}</span>
                    <span class="sfx-stat-label">${label}</span>
                </div>
            `).join('');
            const highlightsHtml = project.highlights.map(h => `<li class="sfx-highlight-item">${h}</li>`).join('');

            const detailContent = document.createElement('div');
            detailContent.className = 'fade-in-view';
            detailContent.innerHTML = `
                <button id="back-to-sfx-list" class="corp-button inline-flex items-center gap-2 px-4 py-2 mb-8"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back to SFX Projects</button>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div class="relative mb-8">
                            <img src="${project.image}" alt="${project.title}" class="w-full h-auto border-2 border-[var(--border-color)]">
                            <span class="sfx-card-badge">${project.category}</span>
                        </div>
                        <div class="sfx-stats-row mb-8">${statsHtml}</div>
                        <div class="prose-styles mb-8">
                            <h5 class="section-title">// Train of Thought</h5>
                            <p>${project.thoughtProcess}</p>
                        </div>
                        <div class="prose-styles">
                            <h5 class="section-title">// Key Highlights</h5>
                            <ul class="sfx-highlight-list">${highlightsHtml}</ul>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-baseline gap-4 mb-2">
                            <h3 class="page-title text-3xl font-bold uppercase tracking-widest font-mono">${project.title}</h3>
                            <span class="text-sm font-mono text-[var(--color-secondary)]">${project.year}</span>
                        </div>
                        <p class="text-[var(--color-secondary)] mb-6">${project.summary}</p>
                        <div class="prose-styles mb-8">
                            <h5 class="section-title text-sm">// My Role</h5>
                            <p>${project.role}</p>
                            <h5 class="section-title text-sm">// Technologies</h5>
                            <div class="flex flex-wrap gap-2 mb-6">${techHtml}</div>
                        </div>
                        ${toolBreakdownHtml}
                        <h5 class="section-title text-sm">// Samples <span class="text-xs font-normal text-[var(--color-secondary)] ml-1">(click to preview)</span></h5>
                        <div class="border border-[var(--border-color)] rounded-lg overflow-hidden bg-black/20">
                            ${samplesHtml}
                        </div>
                        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="corp-button inline-flex items-center gap-2 px-4 py-2 mt-6"><i data-lucide="external-link" class="w-4 h-4"></i> View on Asset Store</a>
                    </div>
                </div>
            `;
            detailContainer.appendChild(detailContent);
            detailContainer.classList.remove('hidden');

            detailContainer.querySelector('#back-to-sfx-list').addEventListener('click', showListView);
            detailContainer.querySelectorAll('.sfx-sample-play-btn').forEach(button => {
                button.addEventListener('click', () => {
                    initializeAudio();
                    playSfxSample(button.dataset.sampleId);
                });
            });
            lucide.createIcons();
        };

        listContainer.innerHTML = '';
        Object.keys(sfxData).forEach(key => {
            const project = sfxData[key];
            const card = document.createElement('div');
            card.className = 'sfx-card';
            card.dataset.sfxId = key;
            const techTagsHtml = project.technologies.map(t => `<span class="sfx-card-tag">${t}</span>`).join('');
            card.innerHTML = `
                <div class="relative">
                    <img src="${project.image}" alt="${project.title}" class="w-full h-auto aspect-video object-cover">
                    <span class="sfx-card-badge">${project.category}</span>
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h5 class="font-bold text-lg leading-tight">${project.title}</h5>
                        <span class="text-xs font-mono text-[var(--color-secondary)] ml-2 flex-shrink-0">${project.year}</span>
                    </div>
                    <p class="text-sm text-[var(--color-secondary)] mb-3">${project.summary}</p>
                    <div class="sfx-card-meta">
                        <span class="sfx-card-meta-item"><i data-lucide="music-2" class="w-3 h-3"></i> ${project.samples.length} samples</span>
                        <span class="sfx-card-meta-item"><i data-lucide="layers" class="w-3 h-3"></i> ${project.stats.assets} assets</span>
                    </div>
                    <div class="sfx-card-tags">${techTagsHtml}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                initializeAudio(); playClickSound();
                showDetailView(key);
            });
            listContainer.appendChild(card);
        });
    }
    
    // --- Art Slideshow Logic ---
    function setupArtGallery(showPage) {
        const artDataSource = document.getElementById('art-data-source');
        if (!artDataSource) return;

        const artItems = Array.from(artDataSource.querySelectorAll('.art-card')).map(card => card.dataset);
        if (artItems.length === 0) return;

        let currentArtIndex = 0;
        
        const slideshowImage = document.getElementById('slideshow-image');
        const slideshowTitle = document.getElementById('slideshow-title');
        const slideshowDate = document.getElementById('slideshow-date');
        const slideshowTools = document.getElementById('slideshow-tools');
        const slideshowTags = document.getElementById('slideshow-tags');
        const slideshowProcess = document.getElementById('slideshow-process');
        const slideshowDetailsContainer = document.getElementById('slideshow-details-container');
        const slideshowTagsContainer = document.getElementById('slideshow-tags-container');
        const galleryBtnContainer = document.getElementById('slideshow-view-gallery-btn-container');
        const dotsContainer = document.getElementById('slideshow-dots');
        const prevBtn = document.getElementById('slideshow-prev');
        const nextBtn = document.getElementById('slideshow-next');

        const updateDots = (activeIndex) => {
            dotsContainer.querySelectorAll('.slideshow-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        };

        const showArtSlide = (index) => {
            const item = artItems[index];
            
            slideshowImage.style.opacity = 0;
            setTimeout(() => {
                slideshowImage.src = item.src;
                slideshowImage.alt = item.title;
                slideshowTitle.textContent = item.title;
                slideshowProcess.textContent = item.process;
                
                // Handle items that are galleries vs single pieces
                if (item.gallery) {
                    slideshowDetailsContainer.style.display = 'none';
                    slideshowTagsContainer.style.display = 'none';
                    galleryBtnContainer.innerHTML = `<button class="corp-button w-full text-center py-2" data-gallery-id="${item.gallery}">View Gallery</button>`;
                    galleryBtnContainer.querySelector('button').addEventListener('click', (e) => {
                        openArtGallery(e.target.dataset.galleryId, showPage);
                    });
                } else {
                    slideshowDetailsContainer.style.display = 'block';
                    slideshowTagsContainer.style.display = 'block';
                    galleryBtnContainer.innerHTML = '';
                    slideshowDate.textContent = item.date;
                    slideshowTools.textContent = item.tools;
                    slideshowTags.innerHTML = '';
                    if (item.tags) {
                        item.tags.split(',').forEach(tag => {
                            const tagEl = document.createElement('span');
                            tagEl.className = 'text-xs font-mono border border-[var(--border-color)] px-2 py-1';
                            tagEl.textContent = tag.trim();
                            slideshowTags.appendChild(tagEl);
                        });
                    }
                }

                slideshowImage.onload = () => {
                    slideshowImage.style.opacity = 1;
                };
                slideshowImage.onerror = () => {
                    slideshowImage.src = `https://placehold.co/800x600/1c1c1c/bbbbbb?text=Image+Error`;
                    slideshowImage.style.opacity = 1;
                }
            }, 300);

            updateDots(index);
        };
        
        const changeSlide = (direction) => {
            currentArtIndex = (currentArtIndex + direction + artItems.length) % artItems.length;
            showArtSlide(currentArtIndex);
            resetInterval();
        };

        const resetInterval = () => {
            clearInterval(slideshowInterval);
            slideshowInterval = setInterval(() => changeSlide(1), 5000);
        };

        prevBtn.addEventListener('click', () => changeSlide(-1));
        nextBtn.addEventListener('click', () => changeSlide(1));

        // Create dots
        dotsContainer.innerHTML = '';
        artItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slideshow-dot';
            dot.addEventListener('click', () => {
                currentArtIndex = index;
                showArtSlide(currentArtIndex);
                resetInterval();
            });
            dotsContainer.appendChild(dot);
        });

        showArtSlide(0);
        resetInterval(); // Start the interval
    }

    function openArtGallery(galleryId, showPage) {
        const singleView = document.getElementById('art-detail-single-view');
        const galleryView = document.getElementById('art-detail-gallery-view');
        const backToArtBtn = document.getElementById('back-to-art');

        const populateSingleView = (data) => {
            document.getElementById('art-detail-image').src = data.src;
            document.getElementById('art-detail-title').textContent = data.title;
            document.getElementById('art-detail-process').innerHTML = data.process;
            document.getElementById('art-detail-date').textContent = data.date;
            document.getElementById('art-detail-tools').textContent = data.tools;
            const tagsContainer = document.getElementById('art-detail-tags');
            tagsContainer.innerHTML = '';
            if (data.tags) {
                data.tags.split(',').forEach(tag => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'text-xs font-mono border border-[var(--border-color)] px-2 py-1';
                    tagEl.textContent = tag.trim();
                    tagsContainer.appendChild(tagEl);
                });
            }
        };

        if (galleryId && artGalleries[galleryId]) {
            const galleryData = artGalleries[galleryId];
            document.getElementById('gallery-detail-title').textContent = galleryData.title;
            document.getElementById('gallery-detail-process').textContent = galleryData.process;
            const grid = document.getElementById('art-detail-gallery-grid');
            grid.innerHTML = '';
            galleryData.images.forEach(imgData => {
                const newCard = document.createElement('div');
                newCard.className = 'art-card cursor-pointer';
                newCard.innerHTML = `<img src="${imgData.src}" alt="${imgData.title}" class="w-full h-auto" onerror="this.onerror=null;this.src='https://placehold.co/600x400/1c1c1c/bbbbbb?text=Image+Error';"><div class="p-4"><h5 class="font-bold text-lg">${imgData.title}</h5></div>`;
                newCard.addEventListener('click', (e) => {
                    e.stopPropagation();
                    initializeAudio(); playClickSound();
                    populateSingleView(imgData);
                    galleryView.classList.add('hidden');
                    singleView.classList.remove('hidden');
                    backToArtBtn.dataset.returnTarget = 'pixel-gallery';
                });
                grid.appendChild(newCard);
            });
            singleView.classList.add('hidden');
            galleryView.classList.remove('hidden');
            showPage('art-detail');
        }

        // Setup back button logic if not already done
        if (!backToArtBtn.dataset.listenerAttached) {
            backToArtBtn.addEventListener('click', () => {
                initializeAudio(); playClickSound();
                if (backToArtBtn.dataset.returnTarget === 'pixel-gallery') {
                    singleView.classList.add('hidden');
                    galleryView.classList.remove('hidden');
                    backToArtBtn.dataset.returnTarget = '';
                } else {
                    showPage('art');
                }
            });
            backToArtBtn.dataset.listenerAttached = 'true';
        }
    }

    // --- REBUILT CODE PAGE ---
    function setupCodeCaseStudies() {
        const listContainer = document.getElementById('code-case-study-list');
        const detailContainer = document.getElementById('code-case-study-detail');
        if (!listContainer || !detailContainer) return;

        // Function to show the list and hide the detail view
        const showListView = () => {
            if (activeShaderAnimation) {
                cancelAnimationFrame(activeShaderAnimation);
                activeShaderAnimation = null;
            }
            detailContainer.innerHTML = '';
            detailContainer.classList.add('hidden');
            listContainer.classList.remove('hidden');
            listContainer.classList.add('fade-in-view');
        };

        // Function to show a specific case study
        const showDetailView = (studyId) => {
            const study = codeCaseStudies.find(s => s.id === studyId);
            if (!study) return;

            listContainer.classList.add('hidden');
            detailContainer.innerHTML = ''; // Clear previous detail
            
            const escapedSnippet = study.code.snippet.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            const detailContent = document.createElement('div');
            detailContent.className = 'fade-in-view';
            detailContent.innerHTML = `
                <button id="back-to-code-list" class="corp-button inline-flex items-center gap-2 px-4 py-2 mb-8"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Case Studies</button>
                
                <header class="mb-8">
                    <h4 class="text-2xl font-bold font-mono text-[var(--color-accent)]">${study.title}</h4>
                    <p class="text-lg text-[var(--color-secondary)] mt-2">${study.shortDescription}</p>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div class="lg:col-span-3 space-y-8 prose-styles">
                        <div>
                            <h5 class="section-title">// The Breakdown</h5>
                            <div class="prose-styles">${study.breakdown}</div>
                        </div>
                    </div>

                    <div class="lg:col-span-2 space-y-8">
                        <div>
                            <h5 class="section-title">// Live Demo</h5>
                            <div class="p-6 border border-[var(--border-color)] bg-black/20 rounded-lg">
                                ${study.demoHTML}
                            </div>
                        </div>
                        <div>
                            <h5 class="section-title">// The Code</h5>
                            <div class="terminal-window">
                                <div class="terminal-header">
                                    <span class="terminal-dot red"></span>
                                    <span class="terminal-dot yellow"></span>
                                    <span class="terminal-dot green"></span>
                                </div>
                                <pre><code class="language-${study.code.language}">${escapedSnippet}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            detailContainer.appendChild(detailContent);
            detailContainer.classList.remove('hidden');

            // Add event listener for the new back button
            detailContainer.querySelector('#back-to-code-list').addEventListener('click', showListView);

            // Re-initialize any necessary scripts for the new content
            if (study.id === 'sfx-manager') initSfxDemo();
            if (study.id === 'glsl-shader') initShaderDemo();
            if (study.id === 'dialogue-editor') initDialogueEditor();
            if (study.id === 'jrpg-stats') initJrpgDemo();
            if (study.id === 'name-generator') initNameGenerator();
            hljs.highlightAll();
            lucide.createIcons();
        };

        // Populate the list view
        listContainer.innerHTML = ''; // Clear previous list
        codeCaseStudies.forEach(study => {
            const card = document.createElement('div');
            card.className = 'code-study-card p-6 flex flex-col justify-between';
            card.innerHTML = `
                <div>
                    <h4 class="text-xl font-bold font-mono text-[var(--color-accent)]">${study.title}</h4>
                    <p class="text-[var(--color-secondary)] mt-2 mb-6">${study.shortDescription}</p>
                </div>
                <button class="corp-button self-start px-6 py-2 view-case-study-btn" data-study-id="${study.id}">View Details</button>
            `;
            listContainer.appendChild(card);
        });

        // Add event listeners to the new list items
        listContainer.querySelectorAll('.view-case-study-btn').forEach(button => {
            button.addEventListener('click', () => {
                initializeAudio(); playClickSound();
                showDetailView(button.dataset.studyId);
            });
        });
    }


    function initSfxDemo() {
        document.querySelectorAll('.sfx-demo-btn').forEach(btn => {
            // Remove old listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                initializeAudio();
                playSfxDemoSound(newBtn.dataset.sound);
            });
        });
    }

    function initShaderDemo() {
        if (activeShaderAnimation) {
            cancelAnimationFrame(activeShaderAnimation);
            activeShaderAnimation = null;
        }

        const canvas = document.getElementById('shader-canvas');
        if (!canvas || !canvas.isConnected) return;

        const renderer = new THREE.WebGLRenderer({ canvas });
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://placehold.co/800x450/1c1c1c/d9006c?text=SIGNAL', () => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        });

        const uniforms = {
            uTime: { value: 0.0 },
            uTexture: { value: texture },
            uIntensity: { value: 0.1 },
            uBlockiness: { value: 0.05 }
        };

        const fragmentShaderCode = codeCaseStudies.find(s => s.id === 'glsl-shader').code.snippet;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: fragmentShaderCode
        });

        const geometry = new THREE.PlaneBufferGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const intensitySlider = document.getElementById('glitch-intensity-slider');
        const blockinessSlider = document.getElementById('glitch-blockiness-slider');
        
        const newIntensitySlider = intensitySlider.cloneNode(true);
        intensitySlider.parentNode.replaceChild(newIntensitySlider, intensitySlider);
        newIntensitySlider.addEventListener('input', (e) => {
            uniforms.uIntensity.value = parseFloat(e.target.value);
        });
        uniforms.uIntensity.value = parseFloat(newIntensitySlider.value);

        const newBlockinessSlider = blockinessSlider.cloneNode(true);
        blockinessSlider.parentNode.replaceChild(newBlockinessSlider, blockinessSlider);
        newBlockinessSlider.addEventListener('input', (e) => {
            uniforms.uBlockiness.value = parseFloat(e.target.value);
        });
        uniforms.uBlockiness.value = parseFloat(newBlockinessSlider.value);

        function animate(time) {
            uniforms.uTime.value = time * 0.001;
            renderer.render(scene, camera);
            activeShaderAnimation = requestAnimationFrame(animate);
        }
        animate();
    }

    function initDialogueEditor() {
        const dialogueTextEl = document.getElementById('dialogue-text');
        const dialogueChoicesEl = document.getElementById('dialogue-choices');
        const nodeIdEl = document.getElementById('dialogue-node-id');
        if (!dialogueTextEl || !dialogueChoicesEl) return;

        const dialogueData = {
            start: {
                text: "You approach a strange, glowing pedestal. What do you do?",
                choices: [
                    { text: "Touch the pedestal.", target: "touch" },
                    { text: "Examine it from a distance.", target: "examine" },
                    { text: "Leave.", target: "leave" }
                ]
            },
            touch: {
                text: "A shock of energy courses through you! You feel... different.",
                choices: [ { text: "Restart", target: "start" } ]
            },
            examine: {
                text: "You notice faint, shifting runes carved into the stone. They seem to react to your presence.",
                choices: [
                    { text: "Touch it now.", target: "touch" },
                    { text: "Try to read the runes.", target: "read_runes" },
                    { text: "Leave it be.", target: "leave" }
                ]
            },
            read_runes: {
                text: "The runes burn brightly, searing an image into your mind: a forgotten kingdom, swallowed by the sea.",
                choices: [ { text: "Restart", target: "start" } ]
            },
            leave: {
                text: "You decide it's not worth the risk and walk away.",
                choices: [ { text: "Restart", target: "start" } ]
            }
        };

        function showDialogueNode(nodeId) {
            const node = dialogueData[nodeId];
            nodeIdEl.textContent = nodeId;
            dialogueTextEl.textContent = node.text;
            dialogueChoicesEl.innerHTML = '';

            node.choices.forEach(choice => {
                const button = document.createElement('button');
                button.className = 'corp-button block w-full text-left !normal-case px-4 py-2 text-sm';
                button.textContent = choice.text;
                button.addEventListener('click', () => {
                    initializeAudio(); playClickSound();
                    showDialogueNode(choice.target);
                });
                dialogueChoicesEl.appendChild(button);
            });
        }

        showDialogueNode('start');
    }

    function initJrpgDemo() {
        const elements = {
            level: document.getElementById('jrpg-level'), class: document.getElementById('jrpg-class'),
            hp: document.getElementById('jrpg-hp'), mp: document.getElementById('jrpg-mp'), stam: document.getElementById('jrpg-stam'),
            str: document.getElementById('jrpg-str'), dex: document.getElementById('jrpg-dex'), con: document.getElementById('jrpg-con'),
            int: document.getElementById('jrpg-int'), wis: document.getElementById('jrpg-wis'), char: document.getElementById('jrpg-char'),
            soul: document.getElementById('jrpg-soul'), lvlBtn: document.getElementById('jrpg-lvl-btn'),
            evolution: document.getElementById('jrpg-evolution'), evoChoices: document.getElementById('jrpg-evo-choices'),
            controls: document.getElementById('jrpg-controls'), skills: document.getElementById('jrpg-skills')
        };
        if (!elements.level) return;

        const classes = {
            squire: { name: 'Squire', skills: ["Slash", "Guard"], evolutions: [{ to: 'knight', level: 5 }, { to: 'paladin', level: 5 }], growth: { hp: 15, mp: 5, stam: 10, str: 3, dex: 2, con: 2, int: 1, wis: 1, char: 1, soul: 1 } },
            acolyte: { name: 'Acolyte', skills: ["Heal", "Smite"], evolutions: [{ to: 'priest', level: 5 }, { to: 'scholar', level: 5 }], growth: { hp: 10, mp: 15, stam: 5, str: 1, dex: 1, con: 1, int: 3, wis: 4, char: 2, soul: 3 } },
            knight: { name: 'Knight', skills: ["Slash", "Guard", "Power Strike"], evolutions: [], growth: { hp: 25, mp: 5, stam: 15, str: 5, dex: 3, con: 4, int: 1, wis: 1, char: 2, soul: 2 } },
            paladin: { name: 'Paladin', skills: ["Slash", "Guard", "Holy Strike", "Aegis"], evolutions: [], growth: { hp: 20, mp: 15, stam: 10, str: 4, dex: 2, con: 3, int: 3, wis: 4, char: 3, soul: 4 } },
            priest: { name: 'Priest', skills: ["Heal", "Smite", "Regen", "Blessing"], evolutions: [], growth: { hp: 15, mp: 25, stam: 8, str: 2, dex: 2, con: 2, int: 4, wis: 6, char: 4, soul: 5 } },
            scholar: { name: 'Scholar', skills: ["Heal", "Smite", "Analyze", "Fireball"], evolutions: [], growth: { hp: 12, mp: 20, stam: 10, str: 1, dex: 3, con: 2, int: 6, wis: 5, char: 3, soul: 4 } }
        };

        let character;

        function resetCharacter() {
            character = {
                level: 1, classId: 'squire',
                stats: { hp: 100, mp: 20, stam: 50, str: 10, dex: 8, con: 9, int: 5, wis: 6, char: 7, soul: 5 }
            };
        }

        function updateDisplay() {
            elements.level.textContent = character.level;
            const currentClass = classes[character.classId];
            elements.class.textContent = currentClass.name;

            for (const stat in character.stats) {
                elements[stat].textContent = character.stats[stat];
            }

            elements.skills.innerHTML = currentClass.skills.join(', ');

            const availableEvolutions = currentClass.evolutions.filter(evo => character.level >= evo.level);

            if (availableEvolutions.length > 0) {
                elements.evolution.classList.remove('hidden');
                elements.controls.classList.add('hidden');
                elements.evoChoices.innerHTML = '';
                availableEvolutions.forEach(evo => {
                    const button = document.createElement('button');
                    button.className = 'corp-button px-4 py-2 text-xs';
                    button.textContent = `Become ${classes[evo.to].name}`;
                    button.onclick = () => {
                        initializeAudio(); playSecretSound();
                        character.classId = evo.to;
                        // Add base stat bonus for evolving
                        character.stats.hp += 50; character.stats.mp += 30; character.stats.stam += 20;
                        character.stats.str += 5; character.stats.dex += 5; character.stats.con += 5;
                        elements.evolution.classList.add('hidden');
                        elements.controls.classList.remove('hidden');
                        updateDisplay();
                    };
                    elements.evoChoices.appendChild(button);
                });
            } else {
                elements.evolution.classList.add('hidden');
                elements.controls.classList.remove('hidden');
            }
        }

        elements.lvlBtn.addEventListener('click', () => {
            initializeAudio(); playClickSound();
            character.level++;
            const growth = classes[character.classId].growth;
            for (const stat in growth) {
                character.stats[stat] += growth[stat];
            }
            updateDisplay();
        });
        
        resetCharacter();
        updateDisplay();
    }

    function initNameGenerator() {
        const nameOutput = document.getElementById('generated-name-output');
        const generateBtn = document.getElementById('generate-name-btn');
        const themeSelect = document.getElementById('name-theme-select');
        if (!nameOutput || !generateBtn || !themeSelect) return;

        const nameThemes = {
            elven: {
                prefixes: ["Ael", "Lael", "Cor", "El", "Fae", "Il", "Nym", "Ara"],
                middles: ["a", "ia", "ae", "io", "en", "ar", "il", "or"],
                suffixes: ["driel", "wyn", "lor", "mir", "thas", "ian", "ael", "sil"]
            },
            dwarven: {
                prefixes: ["Thor", "Bal", "Dur", "Gim", "Bof", "Gloin", "Dwal", "Fim"],
                middles: ["in", "ur", "ok", "im", "li", "ar", "un"],
                suffixes: ["in", "ur", "grim", "li", "din", "or", "insson", "hild"]
            },
            orcish: {
                prefixes: ["Grom", "Zog", "Urg", "Karg", "Mog", "Grak", "Durg"],
                middles: ["'a", "'u", "ro", "ka", "ug"],
                suffixes: ["k", "sh", "th", "gash", "rok", "mak", "nar"]
            }
        };

        function generateName(theme) {
            const bank = nameThemes[theme];
            const prefix = bank.prefixes[Math.floor(Math.random() * bank.prefixes.length)];
            const suffix = bank.suffixes[Math.floor(Math.random() * bank.suffixes.length)];
            
            if (Math.random() > 0.4 && bank.middles.length > 0) {
                const middle = bank.middles[Math.floor(Math.random() * bank.middles.length)];
                return prefix + middle + suffix;
            }
            return prefix + suffix;
        }
        
        generateBtn.addEventListener('click', () => {
            initializeAudio(); playClickSound();
            const selectedTheme = themeSelect.value;
            nameOutput.textContent = generateName(selectedTheme);
        });
    }


    function setupWorldBuilding(showPage) {
        const worldCards = document.querySelectorAll('#page-worldbuilding .world-card');
        if (worldCards.length === 0) return;

        const detailImage = document.getElementById('world-detail-image');
        const detailTitle = document.getElementById('world-detail-title');
        const detailTagline = document.getElementById('world-detail-tagline');
        const detailOverview = document.getElementById('world-detail-overview');
        const detailFactions = document.getElementById('world-detail-factions');
        const detailLocations = document.getElementById('world-detail-locations');
        const detailConcepts = document.getElementById('world-detail-concepts');
        const detailConceptsContainer = document.getElementById('world-detail-concepts-container');
        const backToWorldsBtn = document.getElementById('back-to-worlds');

        worldCards.forEach(card => {
            card.addEventListener('click', () => {
                initializeAudio(); playClickSound();
                const worldId = card.dataset.worldId;
                const data = worldsData[worldId];
                if (data) {
                    detailImage.src = data.image;
                    detailTitle.textContent = data.title;
                    detailTagline.textContent = data.tagline;
                    detailOverview.textContent = data.overview;
                    
                    if (data.concepts && data.concepts.length > 0) {
                        detailConcepts.innerHTML = '';
                        data.concepts.forEach(concept => {
                            const el = document.createElement('div');
                            el.innerHTML = `<p class="font-bold text-[var(--color-foreground)]">${concept.name}</p><p class="text-sm text-[var(--color-secondary)]">${concept.description}</p>`;
                            detailConcepts.appendChild(el);
                        });
                        detailConceptsContainer.classList.remove('hidden');
                    } else {
                        detailConceptsContainer.classList.add('hidden');
                    }

                    detailFactions.innerHTML = '';
                    data.factions.forEach(faction => {
                        const factionEl = document.createElement('div');
                        factionEl.innerHTML = `<p class="font-bold text-[var(--color-foreground)]">${faction.name}</p><p class="text-sm text-[var(--color-secondary)]">${faction.description}</p>`;
                        detailFactions.appendChild(factionEl);
                    });
                    detailLocations.innerHTML = '';
                    data.locations.forEach(location => {
                        const locationEl = document.createElement('div');
                        locationEl.innerHTML = `<p class="font-bold text-[var(--color-foreground)]">${location.name}</p><p class="text-sm text-[var(--color-secondary)]">${location.description}</p>`;
                        detailLocations.appendChild(locationEl);
                    });
                    showPage('world-detail');
                }
            });
        });
        backToWorldsBtn.addEventListener('click', () => showPage('worldbuilding'));
    }

    function setupContactForm() {
        const form = document.getElementById('contact-form');
        const submitBtn = document.getElementById('contact-submit-btn');
        const submitText = document.getElementById('contact-submit-text');
        const statusEl = document.getElementById('contact-status');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitText.textContent = 'Sending...';
            
            setTimeout(() => {
                form.reset();
                statusEl.textContent = "Transmission successful. I'll be in touch shortly.";
                statusEl.style.color = 'var(--color-accent)';
                submitBtn.disabled = false;
                submitText.textContent = 'Send Message';
                setTimeout(() => statusEl.textContent = '', 5000);
            }, 2000);
        });
    }

    // --- UI Helpers ---
    function setupTheme() {
        const toggle = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('theme-sun-icon');
        const moonIcon = document.getElementById('theme-moon-icon');
        const docEl = document.documentElement;

        const setTheme = (theme) => {
            docEl.setAttribute('data-theme', theme);
            sunIcon.classList.toggle('hidden', theme === 'light');
            moonIcon.classList.toggle('hidden', theme !== 'light');
            localStorage.setItem('sirkiefy-theme', theme);
        };

        toggle.addEventListener('click', () => {
            initializeAudio(); playClickSound();
            const newTheme = docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        setTheme(localStorage.getItem('sirkiefy-theme') || 'dark');
    }

    function setupClock() {
        const timeEl = document.getElementById("current-time");
        if (!timeEl) return;
        const updateTime = () => {
            const now = new Date();
            const options = { timeZone: "Europe/London", hour12: true, hour: "numeric", minute: "numeric" };
            const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);
            timeEl.innerHTML = `UTC+1 ${parts.find(p=>p.type==="hour").value}<span class="time-blink">:</span>${parts.find(p=>p.type==="minute").value} ${parts.find(p=>p.type==="dayPeriod").value}`;
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    function setupDynamicInfo() {
        const panel = document.getElementById('pronoun-secret');
        if (!panel) return;
        panel.innerHTML = `<p>I'm a 20-year-old British uni student studying Game Design. I'm also autistic, but honestly? That's part of what makes me great at hyperfocusing on the tiny details that make games feel amazing!</p>`;
    }

    // --- Initialization ---
    function init() {
        const showPage = setupNavigation();
        setupSecretPanels();
        setupProjectsGallery(showPage);
        setupSfxPage(showPage);
        setupArtGallery(showPage);
        setupCodeCaseStudies();
        setupWorldBuilding(showPage);
        setupContactForm();
        setupTheme();
        setupClock();
        setupDynamicInfo();
        lucide.createIcons();
        hljs.highlightAll();
        showPage('home');
    }

    init();
});
