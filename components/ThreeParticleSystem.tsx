import React, { useEffect, useRef, useState } from 'react';

// Declare global types for the CDN libraries
declare global {
    interface Window {
        THREE: any;
        gsap: any;
    }
}

const STATES = [
    { name: "IDLE", title: "", text: "", color: { x: 0.4, y: 0.4, z: 0.4 }, shape: 0.0 },
    { name: "FEED", title: "תאכיל אותי עוד", text: "על נשמה אפשר לקעקע המון, תן לי אוכל תאכיל אותי עוד", color: { x: 0.0, y: 1.0, z: 0.2 }, shape: 1.0 },
    { name: "FUELING", title: "בנזין", text: "אהבה זה משוגע אני ניצוץ ואת שלהבת", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 2.0 },
    { name: "CONNECTION", title: "עולם אלקטרוני", text: "בעולם אלקטרוני, עדיף לחיות הרמוני, לא כמו טיפוס כמוני, זז אנלוגי", color: { x: 0.9, y: 0.6, z: 0.1 }, shape: 3.0 },
    { name: "PACMAN", title: "המרוץ", text: "מדליית זהב שווה הרבה כסף, הרבה כסף לא מרגיש זהב, אולי עדיף לחזור לג'ונגל", color: { x: 1.0, y: 1.0, z: 1.0 }, shape: 4.0 },
    { name: "DAMAGE", title: "את הנזק סופרים במדרגות", text: "להיות או לא להיות את הנזק סופרים במדרגות", color: { x: 0.8, y: 0.9, z: 1.0 }, shape: 5.0 },
    { name: "HALLUCINATION", title: "להשתמש ולזרוק", text: "להשתמש ולזרוק, אני לא כזה, כי לכל שטר מקומט, יש פרצוף מעוות.", color: { x: 0.0, y: 1.0, z: 0.5 }, shape: 6.0 },
    { name: "PROCESSING", title: "אריה", text: "מאחוריי הרעמה הלילה, אם רק תוכלי להאזין, מתחת לשכבות גיטרה, אלו שאגות יללות ודמדומים", color: { x: 0.9, y: 0.9, z: 0.9 }, shape: 7.0 },
    { name: "NOSTALGIA", title: "נוסטלגיה", text: "מהסדקים ללחוש מתוך מחילה, שתעיר את הנוסטלגיה", color: { x: 1.0, y: 0.0, z: 0.8 }, shape: 8.0 },
    { name: "DIBUK", title: "נפלא הדיבוק קרוב למטה", text: "בלי ללכת לאיבוד אי אפשר למצוא", color: { x: 1.0, y: 1.0, z: 1.0 }, shape: 9.0 },
    { name: "TIME", title: "אני והזמן", text: "זאת מכונת שטיפת המוח בטיפול מיוחד כנגדי", color: { x: 0.8, y: 0.8, z: 1.0 }, shape: 10.0 },
    { name: "LOGO", title: "", text: "", color: { x: 1.0, y: 1.0, z: 1.0 }, shape: 11.0 }
];

const CONFIG = {
    particleCount: 100000, 
    bloomStrength: 0.8, 
    bloomRadius: 0.5,
    bloomThreshold: 0.1,
};

// --- GAME CONSTANTS ---
const GAME_WIDTH = 21;
const GAME_HEIGHT = 21;
const TEXTURE_SIZE = 32; 

// Map: 1=Wall, 2=Dot, 0=Empty
const PACMAN_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1,1],
    [0,2,2,2,2,2,0,0,1,0,0,0,1,0,0,2,2,2,2,2,0],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] // Padding
];

const ThreeParticleSystem: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const materialRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const rendererRef = useRef<any>(null);
    const animationIdRef = useRef<number>(0);

    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
    
    // Start at LOGO state (11)
    const [currentStateIndex, setCurrentStateIndex] = useState(11);
    const stateIndexRef = useRef(11); // Ref for animation loop access

    const [narrativeOpacity, setNarrativeOpacity] = useState(1);
    const [showInteractionPrompt, setShowInteractionPrompt] = useState(false);
    const [showSocials, setShowSocials] = useState(true);
    const [playpenMode, setPlaypenMode] = useState(false);
    const [titleText, setTitleText] = useState("");
    const [descText, setDescText] = useState("");

    const gameStateRef = useRef({
        // PACMAN STATE
        map: JSON.parse(JSON.stringify(PACMAN_MAP)), 
        pacman: { x: 10, y: 15 },
        ghosts: [
            { x: 9, y: 8, color: 200 }, // Red
            { x: 10, y: 8, color: 210 }, // Pink
            { x: 11, y: 8, color: 220 }, // Cyan
            { x: 10, y: 7, color: 230 }  // Orange
        ],
        // ICY TOWER STATE
        icyTower: {
            player: { x: 16, y: 28, vx: 0, vy: 0 }, 
            platforms: [] as {x: number, y: number, w: number}[],
            score: 0
        },
        // SPACE INVADERS STATE
        spaceInvaders: {
            playerX: 16,
            invaders: [] as {x: number, y: number, alive: boolean}[],
            bullets: [] as {x: number, y: number, vy: number}[],
            invaderDir: 1,
            moveTimer: 0
        },
        // EQUALIZER STATE
        equalizer: {
            bars: new Array(32).fill(0).map(() => Math.random() * 32)
        },
        // PINBALL STATE
        pinball: {
            ball: { x: 16.0, y: 16.0, vx: 0.3, vy: -0.2 },
            bumpers: [
                { x: 10, y: 8, radius: 2, cooldown: 0 },
                { x: 22, y: 8, radius: 2, cooldown: 0 },
                { x: 16, y: 14, radius: 3, cooldown: 0 },
                { x: 8, y: 20, radius: 1, cooldown: 0 },
                { x: 24, y: 20, radius: 1, cooldown: 0 }
            ],
            flippers: { left: 0, right: 0 } // 0 = down, 1 = up
        },
        tick: 0,
        textureData: new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE)
    });
    const gameTextureRef = useRef<any>(null);

    // Initialize Games
    useEffect(() => {
        // Icy Tower Platforms
        const platforms = [];
        platforms.push({ x: 0, y: 31, w: 32 });
        for(let i=0; i<8; i++) {
            platforms.push({
                x: Math.floor(Math.random() * 20),
                y: 27 - (i * 4),
                w: 6 + Math.floor(Math.random() * 6)
            });
        }
        gameStateRef.current.icyTower.platforms = platforms;

        // Space Invaders
        const invaders = [];
        for(let y=0; y<5; y++) {
            for(let x=0; x<8; x++) {
                invaders.push({x: 4 + x*3, y: 2 + y*2, alive: true});
            }
        }
        gameStateRef.current.spaceInvaders.invaders = invaders;

    }, []);

    useEffect(() => {
        if (!window.THREE || !window.gsap) {
            console.error("Three.js or GSAP not loaded");
            return;
        }

        const THREE = window.THREE;
        
        // Setup Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.002);

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.z = 9;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: true });
        renderer.setClearColor(0x000000, 0); 
        rendererRef.current = renderer;
        
        if (canvasRef.current) {
            canvasRef.current.innerHTML = '';
            canvasRef.current.appendChild(renderer.domElement);
            const w = canvasRef.current.clientWidth;
            const h = canvasRef.current.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }

        // Initialize Game Data Texture
        const data = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE); 
        gameStateRef.current.textureData = data;
        
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

        // --- VERTEX SHADER ---
        const vertexShader = `
            uniform float uTime;
            uniform float uShape; 
            uniform float uDistortion;
            uniform vec2 uMouse;
            uniform sampler2D uGameTexture; 
            
            attribute float aRandom;
            attribute vec3 aRandomVec;
            attribute vec3 aLogoPosFinal;
            
            varying vec3 vColor;
            varying float vDist;
            
            // --- ROTATION HELPERS ---
            vec3 rotX(vec3 p, float a) {
                float s = sin(a); float c = cos(a);
                return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
            }
            vec3 rotY(vec3 p, float a) {
                float s = sin(a); float c = cos(a);
                return vec3(p.z * s + p.x * c, p.y, p.z * c - p.x * s);
            }
            vec3 rotZ(vec3 p, float a) {
                float s = sin(a); float c = cos(a);
                return vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
            }

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

            void main() {
                vec3 pos = position;
                vec3 posLogoFinal = aLogoPosFinal;
                vec3 finalColor = vec3(1.0);

                // --- 1. MATRIX RAIN (State 1) ---
                float colWidth = 0.4;
                float gridX = floor(position.x / colWidth) * colWidth;
                float mRandom = fract(sin(gridX * 123.45) * 43758.5453);
                float speed = 2.0 + mRandom * 4.0; 
                float yOffset = fract(sin(gridX * 543.21) * 10.0) * 10.0; 
                float fallY = 12.0 - mod(uTime * speed + yOffset - position.y * 2.0, 24.0);
                vec3 posMatrix = vec3(gridX * 3.0, fallY, (aRandom - 0.5));
                vec3 colorMatrix = vec3(0.0, 1.5, 0.3);
                if (step(0.95, fract(fallY * 0.5 + uTime * 2.0 + aRandom)) > 0.5) colorMatrix = vec3(0.8, 1.0, 0.8);

                // --- 2. COSMIC FREQUENCY WAVE (State 2) ---
                vec3 posFreq = pos * 1.5;
                posFreq.y = 0.0;
                float w = sin(posFreq.x * 0.8 + uTime * 1.5) 
                        + sin(posFreq.z * 0.5 + uTime * 1.2) 
                        + sin(length(posFreq.xz) * 1.5 - uTime * 2.0);
                w += sin(posFreq.x * 5.0 + uTime * 5.0) * 0.2;
                posFreq.y = w * 1.5;
                float hVal = smoothstep(-3.0, 3.0, w);
                vec3 colorFreq = mix(vec3(0.2, 0.0, 0.4), vec3(0.8, 0.0, 0.6), hVal);
                colorFreq = mix(colorFreq, vec3(0.0, 1.2, 1.5), pow(hVal, 3.0) * 1.5);

                // --- 3. COSMIC RUBIK'S CUBE (State 3) ---
                vec3 cellID = clamp(floor(pos / 2.5 + 0.5), -1.0, 1.0);
                vec3 cellCenter = cellID * 2.5;
                vec3 inner = (pos - cellCenter);
                vec3 posRubik = cellCenter + inner * 0.85; 
                float rSpeed = uTime * 0.8;
                if (cellID.x > 0.5) posRubik = rotX(posRubik, rSpeed);
                else if (cellID.x < -0.5) posRubik = rotX(posRubik, -rSpeed);
                if (abs(cellID.x) < 0.5) {
                    if (cellID.y > 0.5) posRubik = rotY(posRubik, rSpeed * 1.2);
                    else if (cellID.y < -0.5) posRubik = rotY(posRubik, -rSpeed * 1.2);
                }
                posRubik = rotZ(posRubik, uTime * 0.2);
                posRubik = rotY(posRubik, uTime * 0.3);
                vec3 colorRubik = vec3(0.05, 0.0, 0.2);
                if (max(max(abs(inner.x), abs(inner.y)), abs(inner.z)) > 1.0) {
                     float pulse = sin(uTime * 3.0 + length(cellID)) * 0.5 + 0.5;
                     colorRubik = mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 0.8), pulse);
                     colorRubik *= 2.0; 
                }

                // --- SHARED TEXTURE MAPPING (States 4-8) ---
                // We use UVs to sample the texture, but position calculation varies slightly
                float totalCells32 = 32.0 * 32.0;
                float cellIndex32 = floor(aRandom * totalCells32);
                float gx = mod(cellIndex32, 32.0);
                float gy = floor(cellIndex32 / 32.0);
                
                vec2 texUV = vec2((gx + 0.5) / 32.0, (31.0 - gy + 0.5) / 32.0);
                float gameVal = texture2D(uGameTexture, texUV).r;
                
                // --- 4. PAC-MAN ARCADE (State 4) ---
                float cellIndex21 = floor(aRandom * (21.0*21.0));
                float cx21 = mod(cellIndex21, 21.0);
                float cy21 = floor(cellIndex21 / 21.0);
                vec2 texUV21 = vec2((cx21 + 0.5) / 32.0, (20.0 - cy21 + 0.5) / 32.0);
                float valPac = texture2D(uGameTexture, texUV21).r;
                
                vec3 posPacman = vec3((cx21 - 10.0) * 0.6, (cy21 - 10.0) * 0.6, 0.0);
                posPacman += aRandomVec * 0.4;
                vec3 colorPacman = vec3(0.0);
                if (valPac < 0.1) posPacman.z -= 50.0; 
                else if (valPac < 0.3) colorPacman = vec3(0.1, 0.1, 1.5);
                else if (valPac < 0.5) { colorPacman = vec3(1.0, 0.8, 0.8); posPacman += aRandomVec * -0.2; }
                else if (valPac < 0.7) colorPacman = vec3(1.5, 1.5, 0.0);
                else {
                    if (valPac < 0.81) colorPacman = vec3(1.5, 0.0, 0.0);
                    else if (valPac < 0.85) colorPacman = vec3(1.5, 0.8, 1.5);
                    else if (valPac < 0.89) colorPacman = vec3(0.0, 1.5, 1.5);
                    else colorPacman = vec3(1.5, 0.8, 0.2);
                }
                
                // --- 5. ICY TOWER (State 5) ---
                vec3 posIcy = vec3((gx - 16.0) * 0.5, (gy - 16.0) * 0.5, 0.0);
                posIcy += aRandomVec * 0.1; 
                vec3 colorIcy = vec3(0.0);
                if (gameVal < 0.1) {
                    posIcy.z = -5.0 + aRandom * 2.0; colorIcy = vec3(0.5, 0.5, 0.7) * 0.1; 
                } else if (gameVal < 0.4) {
                    colorIcy = vec3(0.2, 0.8, 1.0) * 1.5; posIcy.z = 0.0; posIcy += aRandomVec * 0.2; 
                } else if (gameVal < 0.8) {
                    colorIcy = vec3(1.0, 0.2, 0.6) * 2.0; posIcy.z = 1.0;
                }

                // --- 6. SPACE INVADERS (State 6) ---
                vec3 posSpace = vec3((gx - 16.0) * 0.6, (gy - 16.0) * 0.6, 0.0);
                posSpace += aRandomVec * 0.1;
                vec3 colorSpace = vec3(0.0);
                
                if (gameVal < 0.1) {
                     // Empty - Stars
                     posSpace.z = -10.0; 
                     if (aRandom > 0.95) { posSpace.z = -2.0; colorSpace = vec3(1.0); }
                } else if (gameVal < 0.5) {
                     // Invader (Green Neon)
                     colorSpace = vec3(0.2, 1.0, 0.2) * 2.0;
                     posSpace.z = 0.0;
                } else if (gameVal < 0.8) {
                     // Player (Cyan Neon)
                     colorSpace = vec3(0.0, 1.0, 1.0) * 2.0;
                     posSpace.z = 0.0;
                } else {
                     // Bullet (White/Yellow)
                     colorSpace = vec3(1.0, 1.0, 0.5) * 3.0;
                     posSpace.z = 1.0;
                }
                
                // --- 7. RETRO EQUALIZER (State 7) ---
                vec3 posEqualizer = vec3((gx - 16.0) * 0.6, (gy - 16.0) * 0.6, 0.0);
                posEqualizer += aRandomVec * 0.02;
                
                vec3 colorEqualizer = vec3(0.0);
                if (gameVal > 0.1) {
                    posEqualizer.z = 0.0;
                    colorEqualizer = vec3(1.0, 1.0, 1.0);
                } else {
                    posEqualizer.z = -20.0;
                }

                // --- 8. PINBALL ARCADE (State 8) ---
                vec3 posPinball = vec3((gx - 16.0) * 0.6, (gy - 16.0) * 0.6, 0.0);
                posPinball += aRandomVec * 0.1;
                
                vec3 colorPinball = vec3(0.0);
                if (gameVal < 0.1) {
                    posPinball.z = -5.0;
                    if (mod(gx, 4.0) < 0.5 || mod(gy, 4.0) < 0.5) {
                         colorPinball = vec3(0.1, 0.0, 0.2);
                         posPinball.z = -4.0;
                    }
                } else if (gameVal < 0.4) {
                    colorPinball = vec3(0.0, 0.5, 1.0) * 1.5;
                    posPinball.z = 0.0;
                } else if (gameVal < 0.7) {
                    colorPinball = vec3(1.0, 0.0, 0.8) * 2.0;
                    posPinball.z = 0.5;
                    colorPinball *= (1.0 + sin(uTime * 10.0) * 0.3);
                } else if (gameVal < 0.9) {
                    colorPinball = vec3(0.0, 1.0, 1.0) * 2.0;
                    posPinball.z = 0.5;
                } else {
                    colorPinball = vec3(1.2, 1.2, 1.2);
                    posPinball.z = 1.0;
                }

                // --- 9. COSMIC GALAXY (State 9) ---
                vec3 posDibuk = vec3(0.0);
                vec3 colorDibuk = vec3(1.0);
                
                // Galaxy Spiral Structure
                float tGal = uTime * 0.1;
                float gAngle = aRandom * 15.0 + tGal;
                float gRadius = pow(aRandom, 0.8) * 9.0;
                float spiralOffset = gRadius * 0.8; 
                float finalGAngle = gAngle + spiralOffset;
                
                posDibuk.x = cos(finalGAngle) * gRadius;
                posDibuk.z = sin(finalGAngle) * gRadius;
                posDibuk.y = (aRandomVec.y) * 0.5 * (1.0 - gRadius/12.0);
                
                // Base Galactic Color (Blue/Purple Nebula)
                colorDibuk = mix(vec3(0.1, 0.0, 0.3), vec3(0.6, 0.2, 0.8), aRandom);
                if (gRadius < 2.0) colorDibuk = mix(vec3(1.0, 0.9, 0.6), colorDibuk, gRadius/2.0); // Core
                
                // Planets (Randomly selected particles)
                if (aRandom > 0.99) {
                     float pId = floor(aRandom * 1000.0);
                     float pOrb = 3.0 + mod(pId, 8.0);
                     float pSpd = (uTime * 0.5) / pOrb;
                     float pTheta = pId + pSpd;
                     
                     posDibuk.x = cos(pTheta) * pOrb;
                     posDibuk.z = sin(pTheta) * pOrb;
                     posDibuk.y = sin(pTheta * 2.0) * 1.0; // Inclined orbit
                     
                     float pCol = mod(pId, 3.0);
                     if (pCol < 1.0) colorDibuk = vec3(1.0, 0.3, 0.2); // Mars Red
                     else if (pCol < 2.0) colorDibuk = vec3(0.2, 1.0, 0.8); // Ice Cyan
                     else colorDibuk = vec3(1.0, 0.8, 0.2); // Gold
                }
                
                // Falling Stars / Comets
                if (aRandom < 0.015) {
                    float sSeed = aRandom * 100.0;
                    float sTime = uTime * 4.0 + sSeed;
                    float sProgress = fract(sTime * 0.1); 
                    
                    vec3 sStart = vec3(10.0 + aRandomVec.x * 5.0, 10.0, -10.0);
                    vec3 sEnd = vec3(-10.0, -5.0, 5.0);
                    
                    posDibuk = mix(sStart, sEnd, sProgress);
                    colorDibuk = vec3(1.0, 1.0, 1.0);
                }

                // --- 10. TIME HOURGLASS (State 10) ---
                vec3 posTime = vec3(0.0);
                vec3 colorTime = vec3(0.5);
                
                float hY = (aRandom - 0.5) * 12.0;
                float hRad = (abs(hY) * 0.8) + 0.5; // Hourglass profile
                float hAng = aRandom * 6.28 + uTime;
                
                posTime.x = cos(hAng) * hRad;
                posTime.z = sin(hAng) * hRad;
                posTime.y = hY;
                
                // Falling Sand effect
                if (aRandom < 0.1) {
                    float sandT = fract(uTime * 0.5 + aRandom * 10.0);
                    posTime.x = 0.0 + aRandomVec.x * 0.2;
                    posTime.z = 0.0 + aRandomVec.z * 0.2;
                    posTime.y = 6.0 - sandT * 12.0;
                    colorTime = vec3(1.0, 0.9, 0.6);
                } else {
                    colorTime = mix(vec3(0.6, 0.6, 0.7), vec3(0.3, 0.3, 0.4), abs(hY)/6.0);
                }

                // --- MORPH & STATE TRANSITION LOGIC ---
                vec3 finalPos = pos;
                float t = uShape;
                
                if (t >= 10.5) {
                    finalPos = posLogoFinal;
                    finalColor = vec3(1.0);
                } 
                else if (t < 1.0) {
                     // Logo -> Matrix
                     finalPos = mix(posLogoFinal, posMatrix, t);
                     finalColor = mix(vec3(1.0), colorMatrix, t);
                }
                else if (t < 2.0) {
                     // Matrix -> Frequency
                     float blend = t - 1.0;
                     finalPos = mix(posMatrix, posFreq, blend);
                     finalColor = mix(colorMatrix, colorFreq, blend);
                }
                else if (t < 3.0) {
                     // Frequency -> Rubik (Connection)
                     float blend = t - 2.0;
                     finalPos = mix(posFreq, posRubik, blend);
                     finalColor = mix(colorFreq, colorRubik, blend);
                }
                else if (t < 4.0) {
                     // Rubik -> Pacman (PACMAN)
                     float blend = t - 3.0;
                     finalPos = mix(posRubik, posPacman, blend);
                     finalColor = mix(colorRubik, colorPacman, blend);
                }
                else if (t < 5.0) {
                     // Pacman -> Icy Tower (Damage)
                     float blend = t - 4.0;
                     finalPos = mix(posPacman, posIcy, blend);
                     finalColor = mix(colorPacman, colorIcy, blend);
                }
                 else if (t < 6.0) {
                     // Icy Tower -> Space Invaders (Hallucination)
                     float blend = t - 5.0;
                     finalPos = mix(posIcy, posSpace, blend);
                     finalColor = mix(colorIcy, colorSpace, blend);
                }
                else if (t < 7.0) {
                     // Space Invaders -> Equalizer (Processing)
                     float blend = t - 6.0;
                     finalPos = mix(posSpace, posEqualizer, blend);
                     finalColor = mix(colorSpace, colorEqualizer, blend);
                }
                else if (t < 8.0) {
                     // Equalizer -> Pinball (Nostalgia)
                     float blend = t - 7.0;
                     finalPos = mix(posEqualizer, posPinball, blend);
                     finalColor = mix(colorEqualizer, colorPinball, blend);
                }
                else if (t < 9.0) {
                     // Pinball -> Dibuk (Cosmic)
                     float blend = t - 8.0;
                     finalPos = mix(posPinball, posDibuk, blend);
                     finalColor = mix(colorPinball, colorDibuk, blend);
                }
                else if (t < 10.0) {
                     // Dibuk -> Time (Hourglass)
                     float blend = t - 9.0;
                     finalPos = mix(posDibuk, posTime, blend);
                     finalColor = mix(colorDibuk, colorTime, blend);
                }
                else {
                     // Time -> Logo
                     float blend = t - 10.0;
                     finalPos = mix(posTime, posLogoFinal, blend);
                     finalColor = mix(colorTime, vec3(1.0), blend);
                }

                // Distortion (Noise)
                float noiseVal = snoise(finalPos * 0.5 + uTime * 0.2);
                finalPos += aRandomVec * noiseVal * uDistortion;

                vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                gl_PointSize = (6.0 * aRandom + 2.0) * (1.0 / -mvPosition.z);
                vColor = finalColor;
            }
        `;

        const fragmentShader = `
            uniform vec3 uColor;
            varying vec3 vColor;
            void main() {
                vec2 xy = gl_PointCoord.xy - vec2(0.5);
                if(length(xy) > 0.5) discard;
                gl_FragColor = vec4(uColor * vColor, 0.8);
            }
        `;

        const material = new THREE.ShaderMaterial({ 
            uniforms: {
                uTime: { value: 0 },
                uShape: { value: 11.0 },
                uDistortion: { value: 0.0 }, // Start with 0 distortion for clear reading
                uColor: { value: new THREE.Vector3(1, 1, 1) },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uGameTexture: { value: gameTexture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        materialRef.current = material;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const randoms = new Float32Array(CONFIG.particleCount);
        const randomVecs = new Float32Array(CONFIG.particleCount * 3);
        const logoPosFinal = new Float32Array(CONFIG.particleCount * 3);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            randoms[i] = Math.random();
            randomVecs[i * 3] = Math.random() - 0.5;
            randomVecs[i * 3 + 1] = Math.random() - 0.5;
            randomVecs[i * 3 + 2] = Math.random() - 0.5;
        }
        
        // Generate Text Particles
        const genText = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const w = 2048, h = 1024; 
            canvas.width = w; canvas.height = h;
            if (!ctx) return;
            
            ctx.fillStyle = 'black'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center'; 
            ctx.textBaseline = 'middle';
            
            // "RESHEF" Logo - Enlarged and Moved Up
            ctx.font = 'bold 600px "Karantina"'; 
            ctx.fillText("רשף", w / 2, h / 2 - 250);
            
            // "Counting Damage on Stairs" - Enlarged and Moved Up
            ctx.font = 'bold 180px "Karantina"'; 
            ctx.letterSpacing = "20px";
            ctx.fillText("את הנזק סופרים במדרגות", w / 2, h / 2 + 150);

            const data = ctx.getImageData(0, 0, w, h).data;
            const validPixels = [];
            for(let y = 0; y < h; y += 4) { 
                for(let x = 0; x < w; x += 4) {
                    if(data[(y * w + x) * 4] > 128) {
                        validPixels.push({
                            x: (x / w) * 2 - 1, 
                            y: -((y / h) * 2 - 1)
                        });
                    }
                }
            }
            
            // Map pixels to particles
            for(let i = 0; i < CONFIG.particleCount; i++) {
                if (validPixels.length > 0) {
                    const p = validPixels[i % validPixels.length];
                    // Scale to view - Enlarged significantly
                    // Remove random noise for clearer text
                    logoPosFinal[i * 3] = p.x * 12.0; 
                    logoPosFinal[i * 3 + 1] = p.y * 6.0;
                    logoPosFinal[i * 3 + 2] = 2.0;
                }
            }
        };
        genText();

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
        geometry.setAttribute('aRandomVec', new THREE.BufferAttribute(randomVecs, 3));
        geometry.setAttribute('aLogoPosFinal', new THREE.BufferAttribute(logoPosFinal, 3));

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // --- POST PROCESSING ---
        // Verify constructors exist to avoid runtime errors if script loading failed
        if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
            const renderScene = new THREE.RenderPass(scene, camera);
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                CONFIG.bloomStrength, CONFIG.bloomRadius, CONFIG.bloomThreshold
            );
            const composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);

            // Animate Loop
            const clock = new THREE.Clock();
            
            const animate = () => {
                animationIdRef.current = requestAnimationFrame(animate);
                const time = clock.getElapsedTime();

                material.uniforms.uTime.value = time;

                // --- GAME LOGIC UPDATE ---
                const gameRef = gameStateRef.current;
                
                // --- STATE 4: PACMAN ---
                if (stateIndexRef.current === 4) {
                    gameRef.tick++;
                    if (gameRef.tick % 15 === 0) { 
                        const possibleMoves = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
                        let bestMove = possibleMoves[Math.floor(Math.random()*4)];
                        const nextX = gameRef.pacman.x + bestMove.x;
                        const nextY = gameRef.pacman.y + bestMove.y;
                        if (gameRef.map[nextY] && gameRef.map[nextY][nextX] !== 1) {
                            gameRef.pacman.x = nextX;
                            gameRef.pacman.y = nextY;
                            if (gameRef.map[nextY][nextX] === 2) {
                                gameRef.map[nextY][nextX] = 0; 
                            }
                        }
                        gameRef.ghosts.forEach(ghost => {
                            const gm = possibleMoves[Math.floor(Math.random()*4)];
                            const gnx = ghost.x + gm.x;
                            const gny = ghost.y + gm.y;
                            if (gameRef.map[gny] && gameRef.map[gny][gnx] !== 1) {
                                ghost.x = gnx;
                                ghost.y = gny;
                            }
                        });
                        const texData = gameRef.textureData;
                        texData.fill(0); 
                        for(let y=0; y<21; y++) {
                            for(let x=0; x<21; x++) {
                                const val = gameRef.map[y][x];
                                const idx = y * 32 + x;
                                if (val === 1) texData[idx] = 50; 
                                if (val === 2) texData[idx] = 100;
                            }
                        }
                        texData[gameRef.pacman.y * 32 + gameRef.pacman.x] = 150;
                        gameRef.ghosts.forEach(g => { texData[g.y * 32 + g.x] = g.color; });
                        gameTextureRef.current.needsUpdate = true;
                    }
                } 
                // --- STATE 5: ICY TOWER ---
                else if (stateIndexRef.current === 5) {
                    const game = gameRef.icyTower;
                    const texData = gameRef.textureData;
                    
                    game.player.vy += 0.05;
                    game.player.y += game.player.vy;
                    game.player.x += game.player.vx;
                    if (Math.random() < 0.05) game.player.vx = (Math.random() - 0.5) * 0.5;
                    if (game.player.x < 0) { game.player.x = 0; game.player.vx *= -1; }
                    if (game.player.x > 31) { game.player.x = 31; game.player.vx *= -1; }
                    if (game.player.vy > 0) { 
                        for (let p of game.platforms) {
                            if (game.player.y >= p.y - 1 && game.player.y <= p.y + 1 &&
                                game.player.x >= p.x && game.player.x <= p.x + p.w) {
                                game.player.vy = -0.8;
                                game.player.y = p.y - 1;
                                break;
                            }
                        }
                    }
                    if (game.player.y > 32) { game.player.y = 31; game.player.vy = -1.2; }
                    if (game.player.y < 10) {
                        const diff = 10 - game.player.y;
                        game.player.y = 10;
                        game.platforms.forEach(p => p.y += diff);
                        game.platforms = game.platforms.filter(p => p.y < 35);
                        const topPlat = game.platforms.reduce((min, p) => p.y < min.y ? p : min, game.platforms[0]);
                        if (topPlat.y > 5) {
                             game.platforms.push({ x: Math.floor(Math.random() * 20), y: topPlat.y - 5 - Math.random() * 3, w: 6 + Math.floor(Math.random() * 6) });
                        }
                    }
                    texData.fill(0);
                    for (let p of game.platforms) {
                        const py = Math.floor(p.y);
                        if (py >= 0 && py < 32) {
                            for (let px = Math.floor(p.x); px < Math.floor(p.x + p.w); px++) {
                                if (px >= 0 && px < 32) texData[py * 32 + px] = 60; 
                            }
                        }
                    }
                    const ply = Math.floor(game.player.y);
                    const plx = Math.floor(game.player.x);
                    if (ply >= 0 && ply < 32 && plx >= 0 && plx < 32) texData[ply * 32 + plx] = 160;
                    gameTextureRef.current.needsUpdate = true;
                }
                // --- STATE 6: SPACE INVADERS ---
                else if (stateIndexRef.current === 6) {
                    const game = gameRef.spaceInvaders;
                    const texData = gameRef.textureData;
                    game.moveTimer++;
                    if (game.moveTimer > 20) {
                        let hitEdge = false;
                        for(let inv of game.invaders) {
                            if (!inv.alive) continue;
                            if ((inv.x <= 1 && game.invaderDir === -1) || (inv.x >= 30 && game.invaderDir === 1)) { hitEdge = true; }
                        }
                        if (hitEdge) { game.invaderDir *= -1; game.invaders.forEach(inv => inv.y += 1); } 
                        else { game.invaders.forEach(inv => inv.x += game.invaderDir); }
                        if (Math.random() < 0.3) {
                             const shooter = game.invaders[Math.floor(Math.random() * game.invaders.length)];
                             if (shooter.alive) game.bullets.push({x: shooter.x, y: shooter.y, vy: 1});
                        }
                        game.moveTimer = 0;
                    }
                    if (Math.random() < 0.1) {
                         if (Math.random() > 0.5) game.playerX++; else game.playerX--;
                         game.playerX = Math.max(1, Math.min(30, game.playerX));
                    }
                    if (Math.random() < 0.05) { game.bullets.push({x: game.playerX, y: 29, vy: -1}); }
                    for(let b of game.bullets) { b.y += b.vy; }
                    game.bullets = game.bullets.filter(b => b.y > 0 && b.y < 31);
                    texData.fill(0);
                    for(let inv of game.invaders) { if (inv.alive && inv.x >= 0 && inv.x < 32 && inv.y >= 0 && inv.y < 32) texData[inv.y * 32 + inv.x] = 100; }
                    if (game.playerX >= 0 && game.playerX < 32) {
                         texData[30 * 32 + game.playerX] = 200; texData[30 * 32 + game.playerX - 1] = 200; texData[30 * 32 + game.playerX + 1] = 200; texData[29 * 32 + game.playerX] = 200;
                    }
                    for(let b of game.bullets) {
                        const by = Math.floor(b.y); const bx = Math.floor(b.x);
                         if (by >= 0 && by < 32 && bx >= 0 && bx < 32) texData[by * 32 + bx] = 255;
                    }
                    gameTextureRef.current.needsUpdate = true;
                } 
                // --- STATE 7: EQUALIZER ---
                else if (stateIndexRef.current === 7) {
                    const game = gameRef.equalizer;
                    const texData = gameRef.textureData;
                    gameRef.tick++;
                    if (gameRef.tick % 4 === 0) {
                        for (let i = 0; i < 32; i++) {
                            const target = Math.random() * 32;
                            game.bars[i] += (target - game.bars[i]) * 0.3;
                        }
                        texData.fill(0);
                        for (let x = 0; x < 32; x++) {
                            const h = Math.floor(game.bars[x]);
                            for (let y = 31; y > 31 - h; y--) {
                                if (y >= 0) { texData[y * 32 + x] = 200; }
                            }
                        }
                        gameTextureRef.current.needsUpdate = true;
                    }
                }
                // --- STATE 8: PINBALL ARCADE ---
                else if (stateIndexRef.current === 8) {
                    const game = gameRef.pinball;
                    const texData = gameRef.textureData;
                    
                    // 1. Update Ball Physics
                    game.ball.x += game.ball.vx;
                    game.ball.y += game.ball.vy;
                    game.ball.vy += 0.05; // Gravity
                    
                    // Walls Collision
                    if (game.ball.x < 1 || game.ball.x > 30) {
                        game.ball.vx *= -0.9;
                        game.ball.x = Math.max(1, Math.min(30, game.ball.x));
                    }
                    if (game.ball.y < 1) {
                         game.ball.vy *= -0.8;
                         game.ball.y = 1;
                    }
                    
                    // Paddle/Flippers interaction (Simplified)
                    // Auto-flipper when near bottom
                    if (game.ball.y > 28) {
                        // Check if hitting flippers
                        if ((game.ball.x > 2 && game.ball.x < 12) || (game.ball.x > 20 && game.ball.x < 30)) {
                             game.ball.vy = -1.2 - Math.random() * 0.5; // Bounce up strong
                             game.ball.vx += (Math.random() - 0.5) * 1.0; // Random Chaos
                        } else if (game.ball.y > 32) {
                             // Reset
                             game.ball.x = 29;
                             game.ball.y = 10;
                             game.ball.vx = -0.5 - Math.random();
                             game.ball.vy = 0;
                        }
                    }

                    // Bumper Collision
                    game.bumpers.forEach(b => {
                        const dx = game.ball.x - b.x;
                        const dy = game.ball.y - b.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < b.radius) {
                            // Hit bumper
                            game.ball.vx = dx * 0.5;
                            game.ball.vy = dy * 0.5;
                            b.cooldown = 10; // Glow duration
                        }
                        if (b.cooldown > 0) b.cooldown--;
                    });

                    // 2. Render to Texture
                    texData.fill(0);
                    
                    // Draw Walls
                    for(let y=0; y<32; y++) {
                        texData[y * 32 + 0] = 80;
                        texData[y * 32 + 31] = 80;
                    }
                    for(let x=0; x<32; x++) texData[0 * 32 + x] = 80;

                    // Draw Bumpers
                    game.bumpers.forEach(b => {
                        const bx = Math.floor(b.x);
                        const by = Math.floor(b.y);
                        // Draw a small circle approximation
                        for(let y = by-2; y <= by+2; y++) {
                             for(let x = bx-2; x <= bx+2; x++) {
                                 if (x>=0 && x<32 && y>=0 && y<32) {
                                     // Center brightness high if cooldown
                                     if (Math.abs(x-bx) + Math.abs(y-by) <= b.radius) {
                                         texData[y*32 + x] = b.cooldown > 0 ? 180 : 150;
                                     }
                                 }
                             }
                        }
                    });

                    // Draw Flippers (Visuals only)
                    // Left
                    for(let x=2; x<12; x++) texData[30 * 32 + x] = 220;
                    // Right
                    for(let x=20; x<30; x++) texData[30 * 32 + x] = 220;

                    // Draw Ball
                    const bpx = Math.floor(game.ball.x);
                    const bpy = Math.floor(game.ball.y);
                    if (bpx>=0 && bpx<32 && bpy>=0 && bpy<32) {
                        texData[bpy * 32 + bpx] = 255;
                        texData[bpy * 32 + bpx+1] = 255;
                        texData[(bpy+1) * 32 + bpx] = 255;
                    }
                    
                    gameTextureRef.current.needsUpdate = true;
                }
                
                // Interaction Rotation
                if (cameraRef.current) {
                    const cx = cameraRef.current.position.x;
                    const cy = cameraRef.current.position.y;
                    const tx = mouseCoords.x * 2;
                    const ty = -mouseCoords.y * 2;
                    cameraRef.current.position.x += (tx - cx) * 0.05;
                    cameraRef.current.position.y += (ty - cy) * 0.05;
                    cameraRef.current.lookAt(scene.position);
                }

                composer.render();
            };
            animate();
        } else {
            console.warn("Post-processing scripts not loaded. Fallback to basic renderer.");
            // Fallback animation loop
            const clock = new THREE.Clock();
            const animate = () => {
                animationIdRef.current = requestAnimationFrame(animate);
                const time = clock.getElapsedTime();
                material.uniforms.uTime.value = time;
                renderer.render(scene, camera);
            }
            animate();
        }

        const handleResize = () => {
             if (canvasRef.current) {
                 const w = canvasRef.current.clientWidth;
                 const h = canvasRef.current.clientHeight;
                 renderer.setSize(w, h);
                 camera.aspect = w / h;
                 camera.updateProjectionMatrix();
             }
        };
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (event: MouseEvent) => {
            const tx = (event.clientX / window.innerWidth) * 2 - 1;
            const ty = -(event.clientY / window.innerHeight) * 2 + 1;
            setMouseCoords({ x: tx, y: ty });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationIdRef.current);
            renderer.dispose();
        };
    }, []); // Run once on mount

    // --- STATE MANAGEMENT & ANIMATION ---
    useEffect(() => {
        const state = STATES[currentStateIndex];
        const gsap = window.gsap;
        stateIndexRef.current = currentStateIndex; // Update ref for game loop
        
        // Update Narrative Text
        setNarrativeOpacity(0);
        setTimeout(() => {
            setTitleText(state.title);
            setDescText(state.text);
            setNarrativeOpacity(1);
        }, 300);

        // Update Shader Uniforms using GSAP
        if (materialRef.current && gsap) {
            // Animate Shape
            gsap.to(materialRef.current.uniforms.uShape, {
                value: state.shape,
                duration: 2.5,
                ease: "power2.inOut"
            });

            // Animate Color
            gsap.to(materialRef.current.uniforms.uColor.value, {
                x: state.color.x,
                y: state.color.y,
                z: state.color.z,
                duration: 2
            });

            // Trigger Distortion Pulse on change
            // But keep it 0 if going back to LOGO (11)
            const targetDistortion = currentStateIndex === 11 ? 0.0 : 0.5;
            
            gsap.to(materialRef.current.uniforms.uDistortion, {
                value: 3.0,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    if (materialRef.current) materialRef.current.uniforms.uDistortion.value = targetDistortion;
                }
            });

            // Camera Z-pulse
            if (cameraRef.current) {
                gsap.to(cameraRef.current.position, {
                    z: 12,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out",
                    onComplete: () => { 
                         if(cameraRef.current) cameraRef.current.position.z = 9; 
                    }
                });
            }
        }
        
    }, [currentStateIndex]);

    const handleInteraction = () => {
        const next = (currentStateIndex + 1) % STATES.length;
        setCurrentStateIndex(next);
    };

    return (
        <div className="w-full h-full relative" onClick={handleInteraction}>
            <div ref={canvasRef} className="w-full h-full" />
            
            {/* HUD Elements - Cleaned */}
            <div className="hud hud-br">
                STATE: <span>{STATES[currentStateIndex].name}</span>
            </div>

            {/* Main Title/Narrative */}
            <div className={`narrative-container ${playpenMode ? 'playpen-mode' : ''}`} style={{ opacity: narrativeOpacity }}>
                {titleText && <h1 className="glitch" data-text={titleText}>{titleText}</h1>}
                {descText && <p>{descText}</p>}
            </div>

            {/* Social Links */}
            <div id="social-links" className={showSocials ? 'visible' : ''}>
                 {/* Social icons SVG here */}
            </div>
            
            <div id="interaction-prompt" className={showInteractionPrompt ? '' : 'hidden'}>
                CLICK TO CYCLE // INTERACT
            </div>
        </div>
    );
};

export default ThreeParticleSystem;