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
                { id: 'fps-land', name: 'Heavy Land Impact', desc: 'Body impact sound on a solid surface' }
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
                { id: 'inv-fail', name: 'Action Failed', desc: 'Low dissonant buzz for invalid actions' }
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
                { id: 'save-error', name: 'Error Alert', desc: 'Low dissonant two-tone — operation failed' }
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
                { id: 'plat-death', name: 'Player Death', desc: 'Descending chromatic glide — classic game over cue' }
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
