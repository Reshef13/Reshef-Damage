/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Declare global types for the CDN libraries
declare global {
    interface Window {
        THREE: any;
        gsap: any;
    }
}

const STATES = [
    { name: "IDLE", title: "", text: "", color: { x: 0.4, y: 0.4, z: 0.4 }, shape: 0.0 },
    { name: "FEED", title: "תאכיל אותי עוד", text: "על נשמה אפשר לקעקע המון, תן לי אוכל תאכיל אותי עוד", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 1.0 },
    { name: "FUELING", title: "בנזין", text: "אהבה זה משוגע אני ניצוץ ואת שלהבת", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 2.0 },
    { name: "CONNECTION", title: "עולם אלקטרוני", text: "בעולם אלקטרוני, עדיף לחיות הרמוני, לא כמו טיפוס כמוני, זז אנלוגי", color: { x: 0.9, y: 0.6, z: 0.1 }, shape: 3.0 },
    { name: "IDLE", title: "המרוץ", text: "מדליית זהב שווה הרבה כסף, הרבה כסף לא מרגיש זהב, אולי עדיף לחזור לג'ונגל", color: { x: 0.8, y: 0.0, z: 0.0 }, shape: 4.0 },
    { name: "DAMAGE", title: "את הנזק סופרים במדרגות", text: "להיות או לא להיות את הנזק סופרים במדרגות", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 5.0 },
    { name: "HALLUCINATION", title: "להשתמש ולזרוק", text: "להשתמש ולזרוק, אני לא כזה, כי לכל שטר מקומט, יש פרצוף מעוות.", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 6.0 },
    { name: "PROCESSING", title: "אריה", text: "מאחוריי הרעמה הלילה, אם רק תוכלי להאזין, מתחת לשכבות גיטרה, אלו שאגות יללות ודמדומים", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 7.0 },
    { name: "NOSTALGIA", title: "נוסטלגיה", text: "מהסדקים ללחוש מתוך מחילה, שתעיר את הנוסטלגיה", color: { x: 1.0, y: 1.0, z: 1.0 }, shape: 8.0 },
    { name: "DIBUK", title: "נפלא הדיבוק קרוב למטה", text: "בלי ללכת לאיבוד אי אפשר למצוא", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 9.0 },
    { name: "TIME", title: "אני והזמן", text: "זאת מכונת שטיפת המוח בטיפול מיוחד כנגדי", color: { x: 0.5, y: 0.5, z: 0.5 }, shape: 10.0 },
    { name: "LOGO", title: "", text: "", color: { x: 1.0, y: 1.0, z: 1.0 }, shape: 11.0 }
];

const CONFIG = {
    particleCount: 150000,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.1,
};

// --- GAME CONSTANTS ---
const GAME_WIDTH = 21;
const GAME_HEIGHT = 21;
const TEXTURE_SIZE = 32; 

// --- PACMAN MAP ---
const PACMAN_MAP_TEMPLATE = [
    "111111111111111111111",
    "122222222212222222221",
    "121112111212111211121",
    "121112111212111211121",
    "122222222222222222221",
    "121112121111121211121",
    "122222122212221222221",
    "111112111010111211111",
    "000012100040001210000",
    "111112101101101211111",
    "022222001000100222220",
    "111112101111101211111",
    "000012100000001210000",
    "111112121111121211111",
    "122222222212222222221",
    "121112111212111211121",
    "122212222232222212221",
    "111212121111121212111",
    "122222122212221222221",
    "111111111111111111111",
    "000000000000000000000" 
];

function App() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fps, setFps] = useState(0);
    const [tokenCount, setTokenCount] = useState(0);
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
    const [memoryLoad, setMemoryLoad] = useState(0);
    const [currentStateName, setCurrentStateName] = useState("רשף");
    
    const [currentStateIndex, setCurrentStateIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(0);
    const [bgTextOpacity, setBgTextOpacity] = useState(1);
    const [narrativeOpacity, setNarrativeOpacity] = useState(1);
    const [showInteractionPrompt, setShowInteractionPrompt] = useState(true);
    const [showSocials, setShowSocials] = useState(false);
    const [playpenMode, setPlaypenMode] = useState(false);
    const [titleText, setTitleText] = useState("");
    const [descText, setDescText] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // GAME STATE
    const [isGameActive, setIsGameActive] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    
    const gameStateRef = useRef({
        type: 'NONE', // 'PACMAN' | 'SNAKE' | 'FIREWORK'
        map: [] as number[][],
        // Pacman Data
        pacman: { x: 10, y: 16, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 },
        ghost: { x: 10, y: 8, dirX: 0, dirY: 0, moveCounter: 0 },
        // Snake Data
        snake: {
            body: [] as {x: number, y: number}[],
            dir: {x: 0, y: -1},
            nextDir: {x: 0, y: -1},
            food: {x: 10, y: 5},
            growPending: 0
        },
        // Firework Data
        firework: {
            launcherX: 10,
            colorIndex: 0,
            projectiles: [] as {x: number, y: number, colorId: number}[],
            particles: [] as {x: number, y: number, colorId: number, life: number}[]
        },
        tick: 0,
        textureData: new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE)
    });
    const gameTextureRef = useRef<any>(null);

    const audioInitializedRef = useRef(false);
    const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

    useEffect(() => {
        if (!window.THREE || !window.gsap) {
            console.error("Three.js or GSAP not loaded from CDN");
            return;
        }

        const THREE = window.THREE;
        const gsap = window.gsap;
        
        // Initial transition for loader
        setTimeout(() => {
            setIsLoading(false);
        }, 500);

        let scene: any, camera: any, renderer: any, composer: any, particles: any, material: any;
        let animationId: number;
        let lastTime = 0;
        let frameCount = 0;
        let tokenCounter = 0;

        const clock = new THREE.Clock();
        const mouse = new THREE.Vector2();
        const targetMouse = new THREE.Vector2();

        // Scene Setup
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.002);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 9;

        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        const size = Math.min(window.innerWidth, window.innerHeight);
        renderer.setSize(size, size);
        
        if (canvasRef.current) {
            canvasRef.current.innerHTML = '';
            canvasRef.current.appendChild(renderer.domElement);
        }

        // Initialize Game Data Texture
        const data = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE); 
        gameStateRef.current.textureData = data;
        
        // Using LuminanceFormat for better compatibility across devices than RedFormat
        const gameTexture = new THREE.DataTexture(
            data, 
            TEXTURE_SIZE, 
            TEXTURE_SIZE, 
            THREE.LuminanceFormat, 
            THREE.UnsignedByteType
        );
        gameTexture.magFilter = THREE.NearestFilter;
        gameTexture.minFilter = THREE.NearestFilter;
        gameTexture.needsUpdate = true;
        gameTextureRef.current = gameTexture;


        // Shaders
        const vertexShader = `
            uniform float uTime;
            uniform float uShape; 
            uniform float uDistortion;
            uniform vec2 uMouse;
            uniform sampler2D uGameTexture; 
            
            attribute float aRandom;
            attribute vec3 aRandomVec;
            attribute vec3 aLogoPos; 
            attribute vec3 aLogoPosFinal;
            
            varying vec3 vColor;
            varying float vDist;
            
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute( permute( permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }

            mat3 rotateZ(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
            }

            mat3 rotateX(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
            }

            void main() {
                vec3 pos = position;
                vec3 posLogo = aLogoPos;
                if (aLogoPos.y > 0.15) {
                    posLogo.y += sin(uTime * 0.5 + aRandom * 10.0) * 0.1;
                }
                
                // GAME LOGIC POSITIONING
                vec3 posGame = vec3(0.0);
                vec3 colorGame = vec3(0.0);
                float isGameParticle = 0.0;
                
                // Texture Size is 32x32. We map particles to a grid cell.
                float totalCells = 32.0 * 32.0; // 1024
                float cellIndex = floor(aRandom * totalCells);
                float gridX = mod(cellIndex, 32.0);
                float gridY = floor(cellIndex / 32.0);
                
                vec2 uv = vec2((gridX + 0.5) / 32.0, (gridY + 0.5) / 32.0);
                
                // LuminanceFormat returns value in r, g, b
                float tileVal = texture2D(uGameTexture, uv).r; 
                int tileType = int(floor(tileVal * 255.0 + 0.5));
                
                if (tileType > 0) {
                     float worldX = (gridX - 10.5) * 0.6; 
                     float worldY = (gridY - 10.5) * 0.6;
                     
                     isGameParticle = 1.0;
                     
                     // ASCII ANIMATION PIXELS: Form shapes using particles
                     vec3 shapeOffset = vec3(0.0);
                     float subRand = fract(aRandom * 567.89);
                     
                     if (tileType == 1) { // Wall (#)
                        // Grid pattern
                        if (subRand < 0.25) shapeOffset = vec3(-0.15 + aRandomVec.x * 0.05, aRandomVec.y * 0.4, 0.0); // V1
                        else if (subRand < 0.5) shapeOffset = vec3(0.15 + aRandomVec.x * 0.05, aRandomVec.y * 0.4, 0.0); // V2
                        else if (subRand < 0.75) shapeOffset = vec3(aRandomVec.x * 0.4, 0.15 + aRandomVec.y * 0.05, 0.0); // H1
                        else shapeOffset = vec3(aRandomVec.x * 0.4, -0.15 + aRandomVec.y * 0.05, 0.0); // H2
                        colorGame = vec3(0.1, 0.3, 1.0);
                     }
                     else if (tileType == 2) { // Dot (.)
                        shapeOffset = aRandomVec * 0.15; 
                        colorGame = vec3(1.0, 1.0, 1.0);
                     }
                     else if (tileType == 3) { // Pacman (C)
                        float angle = (subRand * 0.8 + 0.1) * 6.28; 
                        float r = 0.2;
                        shapeOffset = vec3(cos(angle)*r + aRandomVec.x*0.05, sin(angle)*r + aRandomVec.y*0.05, 0.0);
                        colorGame = vec3(1.0, 1.0, 0.0);
                     }
                     else if (tileType == 4) { // Ghost (Arch)
                        if (subRand < 0.6) {
                           float angle = subRand / 0.6 * 3.14; 
                           shapeOffset = vec3(cos(angle)*0.2 + aRandomVec.x*0.05, sin(angle)*0.2 + aRandomVec.y*0.05 - 0.05, 0.0);
                        } else {
                           float lx = (subRand - 0.6) / 0.4 * 0.4 - 0.2;
                           shapeOffset = vec3(lx, -0.2 + aRandomVec.y*0.05, 0.0);
                        }
                        colorGame = vec3(1.0, 0.0, 0.0);
                     }
                     else if (tileType == 5) { // Snake (O)
                        if (subRand < 0.25) shapeOffset = vec3(-0.2 + aRandomVec.x*0.05, aRandomVec.y*0.4, 0.0);
                        else if (subRand < 0.5) shapeOffset = vec3(0.2 + aRandomVec.x*0.05, aRandomVec.y*0.4, 0.0);
                        else if (subRand < 0.75) shapeOffset = vec3(aRandomVec.x*0.4, 0.2 + aRandomVec.y*0.05, 0.0);
                        else shapeOffset = vec3(aRandomVec.x*0.4, -0.2 + aRandomVec.y*0.05, 0.0);
                        colorGame = vec3(0.0, 1.0, 0.0);
                     }
                     else if (tileType == 6) { // Food (X)
                        if (subRand < 0.5) shapeOffset = vec3(aRandomVec.x*0.4, aRandomVec.x*0.4, 0.0);
                        else shapeOffset = vec3(aRandomVec.x*0.4, -aRandomVec.x*0.4, 0.0);
                        colorGame = vec3(1.0, 0.0, 1.0);
                     }
                     // FIREWORK TYPES
                     else if (tileType >= 10 && tileType < 20) { // Rockets
                        // Arrow up shape
                        if (subRand < 0.3) shapeOffset = vec3(0.0, 0.2, 0.0); // Tip
                        else if (subRand < 0.6) shapeOffset = vec3(-0.1, 0.0, 0.0); // Left wing
                        else if (subRand < 0.9) shapeOffset = vec3(0.1, 0.0, 0.0); // Right wing
                        else shapeOffset = vec3(0.0, -0.2, 0.0); // Base
                        
                        int cIdx = tileType - 10;
                        if (cIdx == 0) colorGame = vec3(0.1, 0.3, 1.0); // Blue
                        else if (cIdx == 1) colorGame = vec3(1.0, 1.0, 0.0); // Yellow
                        else if (cIdx == 2) colorGame = vec3(1.0, 0.0, 0.0); // Red
                        else if (cIdx == 3) colorGame = vec3(0.0, 1.0, 0.0); // Green
                        else if (cIdx == 4) colorGame = vec3(1.0, 0.0, 1.0); // Magenta
                     }
                     else if (tileType >= 20 && tileType < 30) { // Particles
                        shapeOffset = aRandomVec * 0.3; // Explosion spread
                        int cIdx = tileType - 20;
                        if (cIdx == 0) colorGame = vec3(0.1, 0.3, 1.0); 
                        else if (cIdx == 1) colorGame = vec3(1.0, 1.0, 0.0); 
                        else if (cIdx == 2) colorGame = vec3(1.0, 0.0, 0.0); 
                        else if (cIdx == 3) colorGame = vec3(0.0, 1.0, 0.0); 
                        else if (cIdx == 4) colorGame = vec3(1.0, 0.0, 1.0); 
                     }
                     
                     posGame = vec3(worldX, -worldY, 0.0) + shapeOffset;

                } else {
                     posGame = vec3(0.0, 0.0, -100.0);
                }

                vec3 posLogoFinal = vec3(0.0);
                if (aRandom < 0.3) {
                    if (aLogoPos.y > 0.15) {
                         vec3 p = aLogoPos;
                         p *= 1.5; p += vec3(0.0, 0.0, -2.0); posLogoFinal = p;
                    } else {
                         posLogoFinal = vec3(0.0, -100.0, 0.0);
                    }
                } 
                else if (aRandom < 0.45) {
                    vec3 center = vec3(0.0, 0.0, -4.0); 
                    float radius = 1.2;
                    vec3 spherePoint = normalize(aRandomVec) * (radius + aRandom * 0.5);
                    spherePoint.z *= 0.2;
                    posLogoFinal = center + spherePoint;
                }
                else if (aRandom < 0.65) {
                    float fallSpeed = 3.0 + aRandom * 5.0;
                    float spreadX = (aRandom - 0.55) * 4.0;
                    float spreadZ = aRandomVec.z * 1.5;
                    float startY = 0.0;
                    float currentY = startY - mod(uTime * fallSpeed, 5.0);
                    posLogoFinal = vec3(spreadX * 0.5, currentY, -3.0 + spreadZ);
                }
                else {
                    float tSpiral = (aRandom - 0.65) / 0.35; 
                    float turns = 3.0;
                    float angle = tSpiral * 6.28 * turns;
                    float radius = 2.0 + tSpiral * 1.0; 
                    float x = cos(angle) * radius;
                    float z = sin(angle) * radius;
                    float y = -5.0 + tSpiral * 4.0; 
                    posLogoFinal = vec3(x, y, z);
                }

                vec3 posFinishLine;
                if (aRandom < 0.15) { posFinishLine = vec3(-3.0, (aRandomVec.y * 4.0) - 1.0, aRandomVec.z * 0.5); } 
                else if (aRandom < 0.30) { posFinishLine = vec3(3.0, (aRandomVec.y * 4.0) - 1.0, aRandomVec.z * 0.5); } 
                else if (aRandom < 0.6) { posFinishLine = vec3(aRandomVec.x * 3.5, 2.5 + aRandomVec.y * 0.8, aRandomVec.z * 0.5); } 
                else { posFinishLine = vec3(pos.x, -3.0, pos.z * 0.2); }
                
                float stepLength = 2.0; float stepHeight = 1.0; float treadRatio = 0.8;
                float stepIndex = floor(pos.x / stepLength);
                float treadX = pos.x; float treadY = stepIndex * stepHeight; float treadZ = pos.z * 2.0;
                vec3 posTread = vec3(treadX, treadY, treadZ);
                float riserX = (stepIndex + 1.0) * stepLength; float riserY = (stepIndex * stepHeight) + ((aRandomVec.y + 0.5)) * stepHeight; float riserZ = pos.z * 2.0;
                vec3 posRiser = vec3(riserX, riserY, riserZ);
                float onRiser = step(treadRatio, aRandom);
                vec3 posStairs = mix(posTread, posRiser, onRiser);
                posStairs -= vec3(0.0, 5.0, 0.0); posStairs *= 0.7;
                
                vec3 posCube = floor(pos * 1.5) + 0.5;

                vec3 posFuel;
                float starSpeed = 8.0; float pathPos = mod(uTime * starSpeed, 40.0) - 20.0;
                vec3 dir = normalize(vec3(1.5, -0.8, 0.5));
                vec3 headPos = dir * pathPos;
                if (aRandom < 0.05) { vec3 local = normalize(aRandomVec) * (aRandom * 0.5); posFuel = headPos + local; } 
                else { float t = (aRandom - 0.05) / 0.95; t = pow(t, 0.5); float tailLen = 15.0; vec3 tailBase = headPos - (dir * t * tailLen); float spread = t * 1.5; vec3 noise = aRandomVec; noise.y += sin(t * 10.0 - uTime * 5.0) * 0.5; posFuel = tailBase + noise * spread; }

                vec3 posPlate; // Unused
                posPlate = pos;

                vec3 posNote = pos; posNote.y *= 0.05; posNote.x *= 1.2;
                float crumpleCycle = (sin(uTime * 1.0) + 1.0) * 0.5; float noteNoise = snoise(pos * 0.8);
                vec3 crumpledState = normalize(posNote) * (length(posNote) * 0.2) + vec3(noteNoise * 0.5);
                posNote = mix(posNote, crumpledState, crumpleCycle * 0.9);
                posNote = rotateZ(uTime * 0.1) * rotateX(0.5) * posNote;

                vec3 posEqualizer;
                float numBars = 20.0; float barIndex = floor(aRandom * numBars);
                float xPos = (barIndex / (numBars - 1.0)) * 10.0 - 5.0;
                float timeFactor = uTime * 5.0 + barIndex * 0.5;
                float barHeight = max(abs(sin(timeFactor) * 2.0 + sin(timeFactor * 2.3) * 1.0), 0.2);
                posEqualizer = vec3(xPos, -2.0 + (aRandomVec.y + 0.5) * barHeight * 2.0, aRandomVec.z * 0.5);
                posEqualizer = rotateX(-0.2) * posEqualizer;
                
                vec3 posTree = pos;
                if (aRandom < 0.2) { posTree.x = (aRandomVec.x * 0.5); posTree.z = (aRandomVec.z * 0.5); posTree.y = (aRandom * 6.0) - 3.0; } 
                else { vec3 spherePos = normalize(aRandomVec) * 2.5; posTree = spherePos + vec3(0.0, 2.0, 0.0); }

                vec3 posHourglass = pos;
                float hgH = pos.y * 2.0; float hgR = abs(hgH) * 0.8 + 0.2; float hgAngle = atan(pos.z, pos.x);
                posHourglass.x = hgR * cos(hgAngle); posHourglass.z = hgR * sin(hgAngle);
                if (aRandom < 0.1) { posHourglass.x = aRandomVec.x * 0.1; posHourglass.z = aRandomVec.z * 0.1; float sandFall = fract(uTime * 0.5 + aRandom); posHourglass.y = 3.0 - (sandFall * 6.0); }

                vec3 posBlackHole;
                float bhRadius = length(pos.xz) * 2.0 + 1.5; float bhAngle = atan(pos.z, pos.x) + (5.0 / bhRadius) * 2.0 + uTime * 0.5;
                posBlackHole.x = bhRadius * cos(bhAngle); posBlackHole.z = bhRadius * sin(bhAngle); posBlackHole.y = -2.0 / bhRadius; posBlackHole = rotateX(1.0) * posBlackHole;

                vec3 posFireworks = posGame; // Mapped in Game Logic
                // vec3 posFireworks = pos; // Old mapping

                vec3 posSnake = pos;

                // COMPOSITE SHAPE FOR SLIDE 0
                vec3 posComposite;
                if (aRandom > 0.7) { 
                    vec3 p = posLogo; if (p.y < 0.15) p *= 1.2; 
                    posComposite = p * 1.4; posComposite.y += 0.5; posComposite = rotateX(-0.1) * posComposite;
                } else { posComposite = posStairs; posComposite.y -= 1.0; }

                // MORPHING LOGIC
                vec3 finalPos = pos;
                float t = uShape;
                
                // --- STATE 1: PACMAN GAME (1.0) | STATE 4: SNAKE GAME (4.0) | STATE 6: FIREWORKS (6.0) ---
                if (t < 1.0) finalPos = mix(posComposite, posGame, t);
                else if (t < 2.0) finalPos = mix(posGame, posFuel, t - 1.0);
                else if (t < 3.0) finalPos = mix(posFuel, posCube, t - 2.0);
                else if (t < 4.0) finalPos = mix(posCube, posGame, t - 3.0); 
                else if (t < 5.0) finalPos = mix(posGame, posStairs, t - 4.0);
                else if (t < 6.0) finalPos = mix(posStairs, posGame, t - 5.0); // 5.0 -> 6.0 (Fireworks use posGame)
                else if (t < 7.0) finalPos = mix(posGame, posEqualizer, t - 6.0); // 6.0 -> 7.0
                else if (t < 8.0) finalPos = mix(posEqualizer, posBlackHole, t - 7.0);
                else if (t < 9.0) finalPos = mix(posBlackHole, posTree, t - 8.0);
                else if (t < 10.0) finalPos = mix(posTree, posHourglass, t - 9.0);
                else if (t < 11.0) {
                    float p = t - 10.0;
                    if (p < 0.5) {
                        float prog = p / 0.5; float easeIn = prog * prog * prog; 
                        vec3 centerSwirl = vec3(cos(prog*20.0)*5.0*(1.0-easeIn), 0.0, sin(prog*20.0)*5.0*(1.0-easeIn));
                        finalPos = mix(posHourglass, centerSwirl, easeIn);
                    } else {
                        float prog = (p - 0.5) / 0.5; float easeOut = 1.0 - pow(1.0 - prog, 5.0);
                        finalPos = mix(vec3(0.0), posLogoFinal, easeOut);
                    }
                }
                else finalPos = mix(posLogoFinal, posComposite, t - 11.0);

                float noiseVal = snoise(finalPos * 0.5 + uTime * 0.2);
                float currentDistortion = uDistortion;
                
                // Reduce distortion for Game Boards
                if (abs(t - 1.0) < 0.4 || abs(t - 4.0) < 0.4 || abs(t - 6.0) < 0.4) {
                    currentDistortion *= 0.01; 
                }
                bool isSlideZero = (uShape < 0.5 || uShape > 11.5);
                if (isSlideZero && aRandom > 0.7 && aLogoPos.y < 0.15) {
                     currentDistortion *= 0.2; 
                }

                finalPos += normal * noiseVal * currentDistortion;
                float d = distance(finalPos.xy, uMouse * 10.0);
                if(d < 3.0) {
                    finalPos += normal * (3.0 - d) * 0.5 * sin(uTime * 10.0);
                }

                vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = (10.0 * aRandom + 2.0) * (1.0 / -mvPosition.z);
                
                vDist = distance(finalPos, vec3(0.0));
                vec3 cVar = mix(vec3(0.2), vec3(1.0), aRandom);

                if (isSlideZero && aRandom > 0.7) {
                   cVar = vec3(0.15); 
                }
                if (isSlideZero && aRandom <= 0.7) {
                     cVar = vec3(0.8); 
                }
                
                // Color override for Game
                if ((abs(t - 1.0) < 0.5 || abs(t - 4.0) < 0.5 || abs(t - 6.0) < 0.5) && isGameParticle > 0.5) {
                    cVar = colorGame;
                }
                
                bool isSlideEleven = (uShape > 10.5 && uShape < 11.5);
                if (isSlideEleven) {
                     if (aRandom < 0.3) cVar = vec3(0.3);
                     else if (aRandom < 0.45) cVar = vec3(2.0); 
                     else if (aRandom < 0.65) cVar = vec3(0.5, 0.8, 1.0);
                     else cVar = vec3(0.2);
                }

                vColor = cVar;
                
                if (isSlideZero) {
                    if (aRandom > 0.7 && aLogoPos.y < 0.15) {
                        float cycleT = mod(uTime, 5.0);
                        if (cycleT <= 1.0) {
                             float noise = fract(sin(dot(vec2(aRandom, uTime * 15.0), vec2(12.9898, 78.233))) * 43758.5453);
                             float burst = sin(uTime * 2.0);
                             if (burst > 0.0 && noise < 0.2) gl_PointSize = 0.0;
                             vColor = vec3(2.0);
                        }
                    }
                }
            }
        `;

        const fragmentShader = `
            uniform vec3 uColor;
            uniform float uTime;
            
            varying vec3 vColor;
            varying float vDist;

            void main() {
                vec2 xy = gl_PointCoord.xy - vec2(0.5);
                float ll = length(xy);
                if(ll > 0.5) discard;

                float alpha = 1.0 - smoothstep(0.3, 0.5, ll);
                vec3 finalColor = uColor * vColor;
                gl_FragColor = vec4(finalColor, alpha * 0.8);
            }
        `;

        // Particles
        const geometry = new THREE.BufferGeometry();
        material = new THREE.ShaderMaterial({ 
            uniforms: {
                uTime: { value: 0 },
                uShape: { value: 0 },
                uDistortion: { value: 0.5 },
                uColor: { value: new THREE.Vector3(STATES[0].color.x, STATES[0].color.y, STATES[0].color.z) },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uGameTexture: { value: gameTexture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(CONFIG.particleCount * 3);
        const randoms = new Float32Array(CONFIG.particleCount);
        const randomVecs = new Float32Array(CONFIG.particleCount * 3);
        const logoPositions = new Float32Array(CONFIG.particleCount * 3); 
        const logoPositionsFinal = new Float32Array(CONFIG.particleCount * 3);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            randoms[i] = Math.random();
            randomVecs[i * 3] = (Math.random() - 0.5);
            randomVecs[i * 3 + 1] = (Math.random() - 0.5);
            randomVecs[i * 3 + 2] = (Math.random() - 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
        geometry.setAttribute('aRandomVec', new THREE.BufferAttribute(randomVecs, 3));
        geometry.setAttribute('aLogoPos', new THREE.BufferAttribute(logoPositions, 3));
        geometry.setAttribute('aLogoPosFinal', new THREE.BufferAttribute(logoPositionsFinal, 3));

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Canvas Text Gen (Keep existing logic)
        const genText = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const w = 4096, h = 2048; 
            canvas.width = w; canvas.height = h;
            if (!ctx) return;
            // ... (Layout 1 & 2 gen - kept same)
            ctx.fillStyle = 'black'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = 'bold 500px "Rubik Dirt", cursive'; ctx.fillText("רשף", w / 2, h / 2 - 500); 
            ctx.font = 'bold 160px "Rubik Dirt", cursive'; ctx.letterSpacing = "100px";
            ctx.fillText("את הנזק", w / 2, h / 2 + 50); 
            ctx.fillText("סופרים", w / 2, h / 2 + 250); 
            ctx.fillText("במדרגות", w / 2, h / 2 + 450); 
            const data = ctx.getImageData(0, 0, w, h).data;
            const validPixels0 = [];
            for(let y = 0; y < h; y += 2) { 
                for(let x = 0; x < w; x += 2) {
                    if(data[(y * w + x) * 4] > 128) validPixels0.push({x: (x / w) * 2 - 1, y: -((y / h) * 2 - 1)});
                }
            }
            ctx.fillStyle = 'black'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 500px "Rubik Gemstones", cursive'; ctx.fillText("רשף", w / 2, h / 2 - 100);
            ctx.font = 'bold 160px "Rubik Wet Paint", cursive'; ctx.letterSpacing = "80px";
            ctx.fillText("את הנזק", w / 2, h / 2 + 200);
            ctx.fillText("סופרים במדרגות", w / 2, h / 2 + 440);
            const data11 = ctx.getImageData(0, 0, w, h).data;
            const validPixels11 = [];
            for(let y = 0; y < h; y += 2) { 
                for(let x = 0; x < w; x += 2) {
                    if(data11[(y * w + x) * 4] > 128) validPixels11.push({x: (x / w) * 2 - 1, y: -((y / h) * 2 - 1)});
                }
            }
            for(let i = 0; i < CONFIG.particleCount; i++) {
                const scatter = 0.05;
                if (validPixels0.length > 0) {
                    const p0 = validPixels0[i % validPixels0.length];
                    logoPositions[i * 3] = p0.x * 6.5 + (Math.random() - 0.5) * scatter; 
                    logoPositions[i * 3 + 1] = p0.y * 3.5 + (Math.random() - 0.5) * scatter; 
                }
                if (validPixels11.length > 0) {
                    const p11 = validPixels11[i % validPixels11.length];
                    logoPositionsFinal[i * 3] = p11.x * 6.5 + (Math.random() - 0.5) * scatter; 
                    logoPositionsFinal[i * 3 + 1] = p11.y * 3.5 + (Math.random() - 0.5) * scatter; 
                }
            }
            geometry.attributes.aLogoPos.needsUpdate = true;
            geometry.attributes.aLogoPosFinal.needsUpdate = true;
        }
        genText();

        const renderScene = new THREE.RenderPass(scene, camera);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            CONFIG.bloomStrength, CONFIG.bloomRadius, CONFIG.bloomThreshold
        );
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            
            // --- GAME LOOP ---
            if ((window as any).isGameRunning && !(window as any).isGamePaused) {
                const state = gameStateRef.current;
                state.tick++;
                const texData = state.textureData;

                if (state.type === 'PACMAN') {
                    // Update Pacman every 10 frames
                    if (state.tick % 10 === 0) {
                        let nx = state.pacman.x + state.pacman.nextDirX;
                        let ny = state.pacman.y + state.pacman.nextDirY;
                        
                        if (state.map[ny] && state.map[ny][nx] !== 1) {
                            state.pacman.dirX = state.pacman.nextDirX;
                            state.pacman.dirY = state.pacman.nextDirY;
                        }

                        nx = state.pacman.x + state.pacman.dirX;
                        ny = state.pacman.y + state.pacman.dirY;

                        if (state.map[ny] && state.map[ny][nx] !== 1) {
                             state.pacman.x = nx;
                             state.pacman.y = ny;
                             if (state.map[ny][nx] === 2) state.map[ny][nx] = 0;
                        } else {
                            if (nx < 0) state.pacman.x = GAME_WIDTH - 1;
                            if (nx >= GAME_WIDTH) state.pacman.x = 0;
                        }
                        
                        // Ghost Move
                        state.ghost.moveCounter++;
                        if (state.ghost.moveCounter > 1) {
                            const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
                            let possible = dirs.filter(d => {
                                 let gx = state.ghost.x + d.x;
                                 let gy = state.ghost.y + d.y;
                                 return state.map[gy] && state.map[gy][gx] !== 1;
                            });
                            if (possible.length > 0) {
                                const choice = possible[Math.floor(Math.random() * possible.length)];
                                state.ghost.x += choice.x;
                                state.ghost.y += choice.y;
                            }
                            state.ghost.moveCounter = 0;
                        }

                        // Update Texture
                        texData.fill(0); 
                        for (let y = 0; y < GAME_HEIGHT; y++) {
                            for (let x = 0; x < GAME_WIDTH; x++) {
                                const val = state.map[y][x];
                                if (val > 0) texData[y * TEXTURE_SIZE + x] = val;
                            }
                        }
                        texData[state.pacman.y * TEXTURE_SIZE + state.pacman.x] = 3;
                        texData[state.ghost.y * TEXTURE_SIZE + state.ghost.x] = 4;
                        if (gameTextureRef.current) gameTextureRef.current.needsUpdate = true;
                    }
                } else if (state.type === 'SNAKE') {
                     // Update Snake every 8 frames (slightly faster)
                    if (state.tick % 8 === 0) {
                        // Apply next dir if valid (no 180 turn)
                        if (state.snake.nextDir.x !== -state.snake.dir.x && state.snake.nextDir.y !== -state.snake.dir.y) {
                            state.snake.dir = {...state.snake.nextDir};
                        }

                        const head = state.snake.body[0];
                        const nextX = head.x + state.snake.dir.x;
                        const nextY = head.y + state.snake.dir.y;

                        // Check Collision (Walls or Self)
                        let collision = false;
                        if (nextX < 0 || nextX >= GAME_WIDTH || nextY < 0 || nextY >= GAME_HEIGHT) collision = true; // Walls are implicit edges in this mode if not mapped
                        if (state.map[nextY] && state.map[nextY][nextX] === 1) collision = true;
                        
                        // Self collision
                        for (let i = 0; i < state.snake.body.length - 1; i++) { // -1 to ignore tail if moving away
                            if (state.snake.body[i].x === nextX && state.snake.body[i].y === nextY) collision = true;
                        }

                        if (collision) {
                            initGame('SNAKE');
                        } else {
                            // Move
                            const newHead = { x: nextX, y: nextY };
                            state.snake.body.unshift(newHead);
                            
                            // Check Food
                            if (nextX === state.snake.food.x && nextY === state.snake.food.y) {
                                // Eat & Respawn food
                                let valid = false;
                                while(!valid) {
                                    const fx = Math.floor(Math.random() * (GAME_WIDTH - 2)) + 1;
                                    const fy = Math.floor(Math.random() * (GAME_HEIGHT - 2)) + 1;
                                    // Check if on snake or wall
                                    let onSnake = false;
                                    if (state.map[fy][fx] === 1) onSnake = true;
                                    for(const p of state.snake.body) if (p.x === fx && p.y === fy) onSnake = true;
                                    if (!onSnake) {
                                        state.snake.food = {x: fx, y: fy};
                                        valid = true;
                                    }
                                }
                            } else {
                                state.snake.body.pop();
                            }

                            // Render Snake
                            texData.fill(0);
                            for (let y = 0; y < GAME_HEIGHT; y++) {
                                for (let x = 0; x < GAME_WIDTH; x++) {
                                    if (state.map[y][x] === 1) texData[y * TEXTURE_SIZE + x] = 1;
                                }
                            }
                            for (const p of state.snake.body) texData[p.y * TEXTURE_SIZE + p.x] = 5;
                            texData[state.snake.food.y * TEXTURE_SIZE + state.snake.food.x] = 6;
                            
                            if (gameTextureRef.current) gameTextureRef.current.needsUpdate = true;
                        }
                    }
                } else if (state.type === 'FIREWORK') {
                    // Update Firework Logic every 5 frames for smoothness
                    if (state.tick % 5 === 0) {
                        texData.fill(0);
                        
                        // Spawn Projectile logic (Auto fire every 30 frames ~0.5s)
                        if (state.tick % 30 === 0) {
                            state.firework.projectiles.push({
                                x: state.firework.launcherX,
                                y: 20, // Start at bottom
                                colorId: state.firework.colorIndex // 0-4
                            });
                        }

                        // Update Projectiles
                        for (let i = state.firework.projectiles.length - 1; i >= 0; i--) {
                            const p = state.firework.projectiles[i];
                            p.y -= 1; // Move up
                            
                            // Explode height (random between 2 and 10)
                            if (p.y < 5 + Math.random() * 5) {
                                // Explode!
                                for (let j=0; j<8; j++) {
                                    state.firework.particles.push({
                                        x: p.x,
                                        y: p.y,
                                        colorId: p.colorId,
                                        life: 10 + Math.random() * 10
                                    });
                                }
                                state.firework.projectiles.splice(i, 1);
                            } else if (p.y < 0) {
                                state.firework.projectiles.splice(i, 1);
                            }
                        }

                        // Update Particles
                        for (let i = state.firework.particles.length - 1; i >= 0; i--) {
                            const p = state.firework.particles[i];
                            p.life--;
                            // Simple spread logic
                            if (Math.random() < 0.5) p.x += (Math.random() - 0.5) * 2;
                            if (Math.random() < 0.5) p.y += (Math.random() - 0.5) * 2;
                            
                            if (p.life <= 0) {
                                state.firework.particles.splice(i, 1);
                            }
                        }

                        // RENDER
                        // Launcher (Tile 10-14)
                        texData[20 * TEXTURE_SIZE + state.firework.launcherX] = 10 + state.firework.colorIndex;
                        
                        // Projectiles (Tile 10-14)
                        state.firework.projectiles.forEach(p => {
                            if (p.x >= 0 && p.x < GAME_WIDTH && p.y >= 0 && p.y < GAME_HEIGHT) {
                                texData[Math.floor(p.y) * TEXTURE_SIZE + Math.floor(p.x)] = 10 + p.colorId;
                            }
                        });

                        // Particles (Tile 20-24)
                        state.firework.particles.forEach(p => {
                             if (p.x >= 0 && p.x < GAME_WIDTH && p.y >= 0 && p.y < GAME_HEIGHT) {
                                texData[Math.floor(p.y) * TEXTURE_SIZE + Math.floor(p.x)] = 20 + p.colorId;
                            }
                        });

                        if (gameTextureRef.current) gameTextureRef.current.needsUpdate = true;
                    }
                }
            }
            
            // Standard Animation Logic
            targetMouse.x += (mouse.x - targetMouse.x) * 0.05;
            targetMouse.y += (mouse.y - targetMouse.y) * 0.05;

            const currentShape = material.uniforms.uShape.value;
            // Prevent rotation in Game Modes (State 1, 4, 6)
            if (Math.abs(currentShape - 1.0) < 0.2 || Math.abs(currentShape - 4.0) < 0.2 || Math.abs(currentShape - 6.0) < 0.2) {
                 particles.rotation.y = THREE.MathUtils.lerp(particles.rotation.y, 0, 0.1);
                 particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, 0, 0.1);
                 particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, 0, 0.1);
            } else if (currentShape < 0.5 || currentShape > 11.5) {
               let current = particles.rotation.y % (Math.PI * 2);
               if (current > Math.PI) current -= Math.PI * 2;
               if (current < -Math.PI) current += Math.PI * 2;
               particles.rotation.y = THREE.MathUtils.lerp(current, 0, 0.05);
               particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, 0, 0.05);
            } else {
               particles.rotation.y += 0.002;
               particles.rotation.z = targetMouse.x * 0.2;
            }

            material.uniforms.uTime.value = time;
            material.uniforms.uMouse.value = targetMouse;
            camera.position.x += (targetMouse.x * 2 - camera.position.x) * 0.02;
            camera.position.y += (-targetMouse.y * 2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            tokenCounter++; frameCount++;
            if (time - lastTime >= 1) { setFps(frameCount); frameCount = 0; lastTime = time; }
            setTokenCount(tokenCounter); setMouseCoords({ x: targetMouse.x, y: targetMouse.y });
            setMemoryLoad((Math.sin(time) + 1) * 50);

            composer.render();
        };
        animate();

        const handleResize = () => {
             const size = Math.min(window.innerWidth, window.innerHeight);
             renderer.setSize(size, size);
             composer.setSize(size, size);
             camera.aspect = 1;
             camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (event: MouseEvent) => {
            const windowHalfX = window.innerWidth / 2;
            const windowHalfY = window.innerHeight / 2;
            mouse.x = (event.clientX - windowHalfX) / windowHalfX;
            mouse.y = (event.clientY - windowHalfY) / windowHalfY;
        };
        document.addEventListener('mousemove', handleMouseMove);

        (window as any).change3DState = (index: number) => {
             const state = STATES[index];
             if (index === 0 && (material.uniforms.uShape.value > 10.5)) {
                 gsap.to(material.uniforms.uShape, { value: 12.0, duration: 3, ease: "power2.inOut", onComplete: () => { material.uniforms.uShape.value = 0.0; } });
             } else {
                 gsap.to(material.uniforms.uShape, { value: state.shape, duration: 3, ease: "power2.inOut" });
             }
             gsap.to(material.uniforms.uColor.value, { x: state.color.x, y: state.color.y, z: state.color.z, duration: 2 });
             gsap.to(camera.position, { z: 9, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.in" });
             gsap.to(material.uniforms.uDistortion, { value: 3.0, duration: 0.2, yoyo: true, repeat: 1, onComplete: () => { material.uniforms.uDistortion.value = 0.5; } });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            renderer.dispose();
        };
    }, []);

    // INIT GAME FUNCTION
    const initGame = (type?: string) => {
        const gameType = type || gameStateRef.current.type;
        
        if (gameType === 'PACMAN') {
            const map = PACMAN_MAP_TEMPLATE.map(row => row.split('').map(Number));
            gameStateRef.current.map = map;
            gameStateRef.current.pacman = { x: 10, y: 15, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 };
            gameStateRef.current.ghost = { x: 10, y: 8, dirX: 0, dirY: 0, moveCounter: 0 };
        } else if (gameType === 'SNAKE') {
            const map = Array(GAME_HEIGHT).fill(0).map(() => Array(GAME_WIDTH).fill(0));
            for(let i=0; i<GAME_WIDTH; i++) { map[0][i]=1; map[GAME_HEIGHT-1][i]=1; }
            for(let i=0; i<GAME_HEIGHT; i++) { map[i][0]=1; map[i][GAME_WIDTH-1]=1; }
            
            gameStateRef.current.map = map;
            gameStateRef.current.snake = {
                body: [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}],
                dir: {x: 0, y: -1},
                nextDir: {x: 0, y: -1},
                food: {x: 10, y: 5},
                growPending: 0
            };
        } else if (gameType === 'FIREWORK') {
            gameStateRef.current.firework = {
                launcherX: 10,
                colorIndex: 0,
                projectiles: [],
                particles: []
            };
        }
        
        gameStateRef.current.type = gameType;
        setGamePaused(false);
    };

    // State Management Effect
    useEffect(() => {
        const state = STATES[currentStateIndex];
        
        // Handle Audio
        if (!audioInitializedRef.current && currentStateIndex !== 0) {
             const audio = audioRefs.current[currentStateIndex];
             if (audio) {
                 audio.play().then(() => audioInitializedRef.current = true).catch(() => {});
             }
        } else if (audioInitializedRef.current) {
            const prevAudio = audioRefs.current[prevIndex];
            if (prevAudio) {
                prevAudio.pause();
                prevAudio.currentTime = 0;
            }
            if (currentStateIndex !== 0 && currentStateIndex !== 11) {
                const newAudio = audioRefs.current[currentStateIndex];
                if (newAudio) newAudio.play().catch(() => {});
            }
        }

        // Handle UI
        setShowSocials(currentStateIndex === 11);
        setShowInteractionPrompt(currentStateIndex === 0);
        setBgTextOpacity(currentStateIndex === 0 ? 1 : 0);
        setCurrentStateName(STATES[currentStateIndex].title || "רשף");
        setPlaypenMode(currentStateIndex > 0 && currentStateIndex < 11);

        // GAME STATE CHECK
        if (currentStateIndex === 1) { // FEED -> PACMAN
            gameStateRef.current.type = 'PACMAN';
            setIsGameActive(true);
            (window as any).isGameRunning = true;
            (window as any).isGamePaused = false;
            initGame('PACMAN');
        } else if (currentStateIndex === 4) { // IDLE -> SNAKE
            gameStateRef.current.type = 'SNAKE';
            setIsGameActive(true);
            (window as any).isGameRunning = true;
            (window as any).isGamePaused = false;
            initGame('SNAKE');
        } else if (currentStateIndex === 6) { // HALLUCINATION -> FIREWORKS
            gameStateRef.current.type = 'FIREWORK';
            setIsGameActive(true);
            (window as any).isGameRunning = true;
            (window as any).isGamePaused = false;
            initGame('FIREWORK');
        } else {
            gameStateRef.current.type = 'NONE';
            setIsGameActive(false);
            (window as any).isGameRunning = false;
        }

        // Text Animation
        setNarrativeOpacity(0);
        setTimeout(() => {
            setTitleText(state.title);
            setDescText(state.text);
            setNarrativeOpacity(1);
        }, 500);

        if ((window as any).change3DState) {
            (window as any).change3DState(currentStateIndex);
        }

        setPrevIndex(currentStateIndex);
    }, [currentStateIndex]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        // GAME KEYBOARD CONTROLS
        const handleKeyDown = (e: KeyboardEvent) => {
            const state = gameStateRef.current;
            if (currentStateIndex === 1) { // Pacman
                if (e.key === "ArrowUp") { state.pacman.nextDirX = 0; state.pacman.nextDirY = -1; }
                if (e.key === "ArrowDown") { state.pacman.nextDirX = 0; state.pacman.nextDirY = 1; }
                if (e.key === "ArrowLeft") { state.pacman.nextDirX = -1; state.pacman.nextDirY = 0; }
                if (e.key === "ArrowRight") { state.pacman.nextDirX = 1; state.pacman.nextDirY = 0; }
            } else if (currentStateIndex === 4) { // Snake
                if (e.key === "ArrowUp") { state.snake.nextDir = {x: 0, y: -1}; }
                if (e.key === "ArrowDown") { state.snake.nextDir = {x: 0, y: 1}; }
                if (e.key === "ArrowLeft") { state.snake.nextDir = {x: -1, y: 0}; }
                if (e.key === "ArrowRight") { state.snake.nextDir = {x: 1, y: 0}; }
            } else if (currentStateIndex === 6) { // Firework
                if (e.key === "ArrowLeft") { 
                    state.firework.launcherX = Math.max(0, state.firework.launcherX - 1);
                }
                if (e.key === "ArrowRight") { 
                    state.firework.launcherX = Math.min(GAME_WIDTH - 1, state.firework.launcherX + 1);
                }
                if (e.key === "ArrowUp") {
                    state.firework.colorIndex = (state.firework.colorIndex + 1) % 5;
                }
                if (e.key === "ArrowDown") {
                    state.firework.colorIndex = (state.firework.colorIndex - 1 + 5) % 5;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentStateIndex]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleInteraction = () => {
        // If game is active, clicking skips it.
        if (isGameActive) {
            setIsGameActive(false);
        }

        if (!audioInitializedRef.current) {
            const audio = audioRefs.current[currentStateIndex];
            if(audio) audio.play().then(() => audioInitializedRef.current = true).catch(() => {});
        }
        const nextIndex = (currentStateIndex + 1) % STATES.length;
        setCurrentStateIndex(nextIndex);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (isGameActive) return; // Disable scroll nav during game
        if (e.deltaY > 0) {
             const next = (currentStateIndex + 1) % STATES.length;
             if(next !== currentStateIndex) setCurrentStateIndex(next);
        } else {
             const next = (currentStateIndex - 1 + STATES.length) % STATES.length;
             if(next !== currentStateIndex) setCurrentStateIndex(next);
        }
    };
    
    const lastWheelTime = useRef(0);
    const throttledWheel = (e: React.WheelEvent) => {
        const now = Date.now();
        if (now - lastWheelTime.current > 1000) {
            lastWheelTime.current = now;
            handleWheel(e);
        }
    };

    // Mobile Control Handlers
    const handleGameInput = (dx: number, dy: number) => {
        const state = gameStateRef.current;
        if (state.type === 'PACMAN') {
             state.pacman.nextDirX = dx;
             state.pacman.nextDirY = dy;
        } else if (state.type === 'SNAKE') {
             state.snake.nextDir = {x: dx, y: dy};
        } else if (state.type === 'FIREWORK') {
            if (dx !== 0) {
                 state.firework.launcherX = Math.max(0, Math.min(GAME_WIDTH - 1, state.firework.launcherX + dx));
            }
            if (dy !== 0) {
                 if (dy > 0) state.firework.colorIndex = (state.firework.colorIndex - 1 + 5) % 5; // Down
                 else state.firework.colorIndex = (state.firework.colorIndex + 1) % 5; // Up
            }
        }
    };
    
    const togglePause = () => {
        const newVal = !gamePaused;
        setGamePaused(newVal);
        (window as any).isGamePaused = newVal;
    };
    
    const restartGame = () => {
        initGame();
    };

    return (
        <>
            <div id="loader" style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'all' : 'none' }}>
                מתדלק 95 בנזין...
            </div>

            <div id="app-container" onClick={handleInteraction} onWheel={throttledWheel}>
                
                <button 
                    className="fullscreen-btn" 
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    aria-label="Toggle Fullscreen"
                >
                    {isFullscreen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    )}
                </button>

                {isGameActive && (
                    <div id="game-ui">
                        <div className="game-header">
                            <button className="game-btn" onClick={(e) => { e.stopPropagation(); togglePause(); }}>
                                {gamePaused ? "RESUME" : "PAUSE"}
                            </button>
                            <button className="game-btn" onClick={(e) => { e.stopPropagation(); restartGame(); }}>
                                RESTART
                            </button>
                        </div>
                        <div className="game-controls-mobile" onClick={(e) => e.stopPropagation()}>
                            <div className="dpad-btn dpad-up" onClick={() => handleGameInput(0, -1)}>
                                <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
                            </div>
                            <div className="dpad-btn dpad-left" onClick={() => handleGameInput(-1, 0)}>
                                <svg viewBox="0 0 24 24"><path d="M14 7l-5 5 5 5z"/></svg>
                            </div>
                            <div className="dpad-btn dpad-down" onClick={() => handleGameInput(0, 1)}>
                                <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                            </div>
                            <div className="dpad-btn dpad-right" onClick={() => handleGameInput(1, 0)}>
                                <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5z"/></svg>
                            </div>
                        </div>
                    </div>
                )}

                <div id="background-text" style={{ opacity: bgTextOpacity }}>
                    <span>את הנזק</span>
                    <span>סופרים</span>
                    <span>במדרגות</span>
                </div>

                <div id="canvas-container" ref={canvasRef} />

                <div id="ui-layer" style={{ pointerEvents: 'none' }}>
                    <div 
                        className={`narrative-container ${playpenMode ? 'playpen-mode' : ''}`}
                        style={{ 
                            opacity: isGameActive ? 0 : narrativeOpacity, 
                            transform: narrativeOpacity ? 'translateY(0)' : 'translateY(-20px)' 
                        }}
                    >
                        <h1 className="glitch" data-text={titleText}>{titleText}</h1>
                        <p>{descText}</p>
                    </div>
                </div>

                <div id="social-links" className={showSocials ? 'visible' : ''}>
                    <a href="https://open.spotify.com/artist/1AY806UcdOkF9pizbtZ1BM?si=GYdvWezBTi21zAsGovT4rQ" target="_blank" className="social-icon" title="Spotify" rel="noreferrer">
                        <svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.4-1.02 15.96 1.681.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    </a>
                    <a href="https://www.youtube.com/@resheftr" target="_blank" className="social-icon" title="YouTube" rel="noreferrer">
                        <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                    <a href="https://music.apple.com/us/artist/%D7%A8%D7%A9%D7%A3/1818649072" target="_blank" className="social-icon" title="iTunes" rel="noreferrer">
                        <svg viewBox="0 0 24 24"><path d="M19.5,4H19l-7.3,1.5C11.3,5.6,11,6,11,6.4v9.8c-0.5-0.3-1-0.4-1.6-0.4c-1.9,0-3.4,1.5-3.4,3.4S7.5,22.6,9.4,22.6 s3.4-1.5,3.4-3.4V9.3l5.5-1.1v7.6c-0.5-0.3-1-0.4-1.6-0.4c-1.9,0-3.4,1.5-3.4,3.4s1.5,3.4,3.4,3.4s3.4-1.5,3.4-3.4V4.4 C20.1,4.2,19.8,4,19.5,4z"/></svg>
                    </a>
                </div>

                <div className="hud hud-tl">
                    SYS.METRIC: <span id="fps">{fps}</span> FPS<br />
                    TOKENS: <span id="token-count">{tokenCount}</span>
                </div>
                <div className="hud hud-tr">
                    LATENT SPACE COORDINATES<br />
                    X: <span id="coord-x">{mouseCoords.x.toFixed(2)}</span> Y: <span id="coord-y">{mouseCoords.y.toFixed(2)}</span>
                </div>
                <div className="hud hud-bl">
                    MEMORY_ALLOCATION<br />
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${memoryLoad}%` }}></div></div>
                </div>
                <div className="hud hud-br">
                    STATE: <span id="system-state">{currentStateName}</span>
                </div>

                <div id="interaction-prompt" className={showInteractionPrompt ? '' : 'hidden'}>
                    הקלק להחלפה | הטה ימינה או שמאלה
                </div>
            </div>

            {/* Audio Elements */}
            {[...Array(11)].map((_, i) => (
                <audio 
                    key={i} 
                    id={`audio-state-${i}`} 
                    ref={(el) => { audioRefs.current[i] = el; }}
                    src={[
                        'audio_feed.mp3', // 0 (using feed logic placeholder or empty)
                        'audio_feed.mp3', // 1
                        'audio_portrait.mp3', // 2
                        'audio_connection.mp3', // 3
                        'audio_idle.mp3', // 4
                        'audio_damage.mp3', // 5
                        'audio_hallucination.mp3', // 6
                        'audio_processing.mp3', // 7
                        'audio_nostalgia.mp3', // 8
                        'audio_dibuk.mp3', // 9
                        'audio_time.mp3' // 10
                    ][i] || ''} 
                    loop 
                    preload="auto" 
                />
            ))}
        </>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}