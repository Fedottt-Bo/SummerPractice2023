import { vec3, mat4 } from 'gl-matrix';

// Number clamp function
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

async function InitWebGPU() {
  if (!navigator.gpu) {
    let msg = 'Your current browser does not support WebGPU!';
    if (window.self !== window.top) msg += '\nThis page seems to be opened as embedded, which can block WebGPU access. Try to open it in separate tab.'

    console.log(msg);
    alert(msg);
    
    throw msg;
  }

  const canvas = document.getElementById('canvas-webgpu');
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');

  context.configure({
    device: device,
    format: "bgra8unorm",
    alphaMode: 'opaque'
  });

  return { gpu : navigator.gpu, canvas : canvas, adapter : adapter, device : device, context : context };
}

/* Figures coordinates
 * float3 - pos, float2 - tex0, float3 - color
 */
const figures_geometry = {
  tetrahedron: {vert: new Float32Array([
     0.66666666666666666, -0.33333333333333333, 0.66666666666666666,   -0.07735026918962584, 1.0,   1.0, 1.0, 0.0,
     0.24401693585629247, -0.33333333333333333, -0.91068360252295910,   1.07735026918962584, 1.0,   0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,                                                     0.5, 0.0,                   0.0, 1.0, 1.0,

    -0.91068360252295899, -0.33333333333333333, 0.24401693585629244,   -0.07735026918962584, 1.0,   1.0, 0.0, 1.0,
     0.66666666666666666, -0.33333333333333333, 0.66666666666666666,    1.07735026918962584, 1.0,   1.0, 1.0, 0.0,
     0.0, 1.0, 0.0,                                                     0.5, 0.0,                   0.0, 1.0, 1.0,

     0.24401693585629247, -0.33333333333333333, -0.91068360252295910,  -0.07735026918962584, 1.0,   0.0, 1.0, 0.0,
    -0.91068360252295899, -0.33333333333333333, 0.24401693585629244,    1.07735026918962584, 1.0,   1.0, 0.0, 1.0,
     0.0, 1.0, 0.0,                                                     0.5, 0.0,                   0.0, 1.0, 1.0,

    -0.91068360252295899, -0.33333333333333333, 0.24401693585629244,   -0.07735026918962584, 1.0,   1.0, 0.0, 1.0,
     0.24401693585629247, -0.33333333333333333, -0.91068360252295910,   1.07735026918962584, 1.0,   0.0, 1.0, 0.0,
     0.66666666666666666, -0.33333333333333333, 0.66666666666666666,    0.5, 0.0,                   1.0, 1.0, 0.0
  ])},
  cube: {
    vert: new Float32Array([
      -0.57735026919,  0.57735026919,  0.57735026919,  0.0, 0.0,  1.0, 0.0, 1.0,
      -0.57735026919, -0.57735026919,  0.57735026919,  0.0, 1.0,  0.5, 0.5, 0.5,
       0.57735026919,  0.57735026919,  0.57735026919,  1.0, 0.0,  1.0, 0.0, 0.0,
       0.57735026919, -0.57735026919,  0.57735026919,  1.0, 1.0,  1.0, 1.0, 0.0,

       0.57735026919,  0.57735026919,  0.57735026919,  0.0, 0.0,  1.0, 0.0, 0.0,
       0.57735026919, -0.57735026919,  0.57735026919,  0.0, 1.0,  1.0, 1.0, 0.0,
       0.57735026919,  0.57735026919, -0.57735026919,  1.0, 0.0,  0.5, 0.5, 0.5,
       0.57735026919, -0.57735026919, -0.57735026919,  1.0, 1.0,  0.0, 1.0, 1.0,

       0.57735026919,  0.57735026919, -0.57735026919,  0.0, 0.0,  0.5, 0.5, 0.5,
       0.57735026919, -0.57735026919, -0.57735026919,  0.0, 1.0,  0.0, 1.0, 1.0,
      -0.57735026919,  0.57735026919, -0.57735026919,  1.0, 0.0,  0.0, 0.0, 1.0,
      -0.57735026919, -0.57735026919, -0.57735026919,  1.0, 1.0,  0.0, 1.0, 0.0,

      -0.57735026919,  0.57735026919, -0.57735026919,  0.0, 0.0,  0.0, 0.0, 1.0,
      -0.57735026919, -0.57735026919, -0.57735026919,  0.0, 1.0,  0.0, 1.0, 0.0,
      -0.57735026919,  0.57735026919,  0.57735026919,  1.0, 0.0,  1.0, 0.0, 1.0,
      -0.57735026919, -0.57735026919,  0.57735026919,  1.0, 1.0,  0.5, 0.5, 0.5,

      -0.57735026919,  0.57735026919, -0.57735026919,  0.0, 0.0,  0.0, 0.0, 1.0,
      -0.57735026919,  0.57735026919,  0.57735026919,  0.0, 1.0,  1.0, 0.0, 1.0,
       0.57735026919,  0.57735026919, -0.57735026919,  1.0, 0.0,  0.5, 0.5, 0.5,
       0.57735026919,  0.57735026919,  0.57735026919,  1.0, 1.0,  1.0, 0.0, 0.0,

      -0.57735026919, -0.57735026919,  0.57735026919,  0.0, 0.0,  0.5, 0.5, 0.5,
      -0.57735026919, -0.57735026919, -0.57735026919,  0.0, 1.0,  0.0, 1.0, 0.0,
       0.57735026919, -0.57735026919,  0.57735026919,  1.0, 0.0,  1.0, 1.0, 0.0,
       0.57735026919, -0.57735026919, -0.57735026919,  1.0, 1.0,  0.0, 1.0, 1.0,
    ]),
    ind: new Uint16Array([
       0,  1,  2,  2,  1,  3,
       4,  5,  6,  6,  5,  7,
       8,  9, 10, 10,  9, 11,
      12, 13, 14, 14, 13, 15,
      16, 17, 18, 18, 17, 19,
      20, 21, 22, 22, 21, 23,
      24, 25, 26, 26, 25, 27,
      28, 29, 30, 30, 29, 31
    ]),
  },
  octahedron: {vert: new Float32Array([
       1.0,  0.0,  0.0,    1.07735026918962584, 1.0,   1.0, 0.0, 0.0,
       0.0,  1.0,  0.0,    0.5, 0.0,                   1.0, 0.0, 1.0,
       0.0,  0.0,  1.0,   -0.07735026918962584, 1.0,   1.0, 1.0, 0.0,

       0.0,  0.0,  1.0,    1.07735026918962584, 1.0,   1.0, 1.0, 0.0,
       0.0,  1.0,  0.0,    0.5, 0.0,                   1.0, 0.0, 1.0,
      -1.0,  0.0,  0.0,   -0.07735026918962584, 1.0,   1.0, 0.0, 1.0,

      -1.0,  0.0,  0.0,    1.07735026918962584, 1.0,   1.0, 0.0, 1.0,
       0.0,  1.0,  0.0,    0.5, 0.0,                   1.0, 0.0, 1.0,
       0.0,  0.0, -1.0,   -0.07735026918962584, 1.0,   0.0, 1.0, 1.0,

       0.0,  0.0, -1.0,    1.07735026918962584, 1.0,   0.0, 1.0, 1.0,
       0.0,  1.0,  0.0,    0.5, 0.0,                   1.0, 0.0, 1.0,
       1.0,  0.0,  0.0,   -0.07735026918962584, 1.0,   1.0, 0.0, 0.0,


       0.0,  0.0,  1.0,   -0.07735026918962584, 0.0,   1.0, 1.0, 0.0,
       0.0, -1.0,  0.0,    0.5, 1.0,                   0.0, 0.0, 1.0,
       1.0,  0.0,  0.0,    1.07735026918962584, 0.0,   1.0, 0.0, 0.0,

      -1.0,  0.0,  0.0,   -0.07735026918962584, 0.0,   1.0, 0.0, 1.0,
       0.0, -1.0,  0.0,    0.5, 1.0,                   0.0, 0.0, 1.0,
       0.0,  0.0,  1.0,    1.07735026918962584, 0.0,   1.0, 1.0, 0.0,

       0.0,  0.0, -1.0,   -0.07735026918962584, 0.0,   0.0, 1.0, 1.0,
       0.0, -1.0,  0.0,    0.5, 1.0,                   0.0, 0.0, 1.0,
      -1.0,  0.0,  0.0,    1.07735026918962584, 0.0,   1.0, 0.0, 1.0,

       1.0,  0.0,  0.0,   -0.07735026918962584, 0.0,   1.0, 0.0, 0.0,
       0.0, -1.0,  0.0,    0.5, 1.0,                   0.0, 0.0, 1.0,
       0.0,  0.0, -1.0,    1.07735026918962584, 0.0,   0.0, 1.0, 1.0,
    ])
  },
  dodecahedron: {
    vert: new Float32Array([
      0.000000000000000000,  0.934172358962715776, -0.356822089773089990,  0.824919696232906285,  0.000000000000000000,  0.5000,  0.5000,  0.0000,
      0.000000000000000000,  0.934172358962715776,  0.356822089773089990,  0.175080303767093715,  0.000000000000000000,  0.7500,  0.2500,  0.0000,
      0.577350269189625842,  0.577350269189625842,  0.577350269189625842, -0.025731112119133592,  0.618033988749894792,  1.0000,  0.0000,  0.0000,
      0.934172358962715776,  0.356822089773089990,  0.000000000000000000,  0.500000000000000000,  1.000000000000000000,  1.0000,  0.0000,  0.2500,
      0.577350269189625842,  0.577350269189625842, -0.577350269189625842,  1.025731112119133481,  0.618033988749894792,  0.7500,  0.5000,  0.2500,

      0.000000000000000000,  0.934172358962715776,  0.356822089773089990,  0.824919696232906285,  0.000000000000000000,  0.7500,  0.2500,  0.0000,
      0.000000000000000000,  0.934172358962715776, -0.356822089773089990,  0.175080303767093715,  0.000000000000000000,  0.5000,  0.5000,  0.0000,
     -0.577350269189625842,  0.577350269189625842, -0.577350269189625842, -0.025731112119133592,  0.618033988749894792,  0.2500,  0.7500,  0.2500,
     -0.934172358962715776,  0.356822089773089990,  0.000000000000000000,  0.500000000000000000,  1.000000000000000000,  0.0000,  1.0000,  0.0000,
     -0.577350269189625842,  0.577350269189625842,  0.577350269189625842,  1.025731112119133481,  0.618033988749894792,  1.0000,  0.5000,  0.0000,

      0.000000000000000000, -0.934172358962715776,  0.356822089773089990,  0.175080303767093715,  1.000000000000000000,  0.5000,  0.5000,  0.5000,
      0.000000000000000000, -0.934172358962715776, -0.356822089773089990,  0.824919696232906285,  1.000000000000000000,  0.0000,  0.7500,  0.7500,
      0.577350269189625842, -0.577350269189625842, -0.577350269189625842,  1.025731112119133481,  0.381966011250105208,  0.0000,  0.0000,  1.0000,
      0.934172358962715776, -0.356822089773089990,  0.000000000000000000,  0.500000000000000000,  0.000000000000000000,  0.5000,  0.0000,  1.0000,
      0.577350269189625842, -0.577350269189625842,  0.577350269189625842, -0.025731112119133592,  0.381966011250105208,  1.0000,  0.0000,  1.0000,
      
      0.000000000000000000, -0.934172358962715776, -0.356822089773089990,  0.175080303767093715,  1.000000000000000000,  0.0000,  0.7500,  0.7500,
      0.000000000000000000, -0.934172358962715776,  0.356822089773089990,  0.824919696232906285,  1.000000000000000000,  0.5000,  0.5000,  0.5000,
     -0.577350269189625842, -0.577350269189625842,  0.577350269189625842,  1.025731112119133481,  0.381966011250105208,  0.2500,  0.7500,  0.0000,
     -0.934172358962715776, -0.356822089773089990,  0.000000000000000000,  0.500000000000000000,  0.000000000000000000,  0.2500,  1.0000,  0.0000,
     -0.577350269189625842, -0.577350269189625842, -0.577350269189625842, -0.025731112119133592,  0.381966011250105208,  0.0000,  0.7500,  0.5000,

     -0.356822089773089990,  0.000000000000000000,  0.934172358962715776,  0.175080303767093715,  1.000000000000000000,  0.5000,  0.7500,  0.0000,
      0.356822089773089990,  0.000000000000000000,  0.934172358962715776,  0.824919696232906285,  1.000000000000000000,  1.0000,  0.0000,  0.2500,
      0.577350269189625842,  0.577350269189625842,  0.577350269189625842,  1.025731112119133481,  0.381966011250105208,  1.0000,  0.0000,  0.0000,
      0.000000000000000000,  0.934172358962715776,  0.356822089773089990,  0.500000000000000000,  0.000000000000000000,  0.7500,  0.2500,  0.0000,
     -0.577350269189625842,  0.577350269189625842,  0.577350269189625842, -0.025731112119133592,  0.381966011250105208,  1.0000,  0.5000,  0.0000,

      0.356822089773089990,  0.000000000000000000, -0.934172358962715776,  0.175080303767093715,  1.000000000000000000,  0.0000,  0.2500,  0.7500,
     -0.356822089773089990,  0.000000000000000000, -0.934172358962715776,  0.824919696232906285,  1.000000000000000000,  0.0000,  0.5000,  0.5000,
     -0.577350269189625842,  0.577350269189625842, -0.577350269189625842,  1.025731112119133481,  0.381966011250105208,  0.2500,  0.7500,  0.2500,
      0.000000000000000000,  0.934172358962715776, -0.356822089773089990,  0.500000000000000000,  0.000000000000000000,  0.5000,  0.5000,  0.0000,
      0.577350269189625842,  0.577350269189625842, -0.577350269189625842, -0.025731112119133592,  0.381966011250105208,  0.7500,  0.5000,  0.2500,

      0.356822089773089990,  0.000000000000000000,  0.934172358962715776,  0.824919696232906285,  0.000000000000000000,  1.0000,  0.0000,  0.2500,
     -0.356822089773089990,  0.000000000000000000,  0.934172358962715776,  0.175080303767093715,  0.000000000000000000,  0.5000,  0.7500,  0.0000,
     -0.577350269189625842, -0.577350269189625842,  0.577350269189625842, -0.025731112119133592,  0.618033988749894792,  0.2500,  0.7500,  0.0000,
      0.000000000000000000, -0.934172358962715776,  0.356822089773089990,  0.500000000000000000,  1.000000000000000000,  0.5000,  0.5000,  0.5000,
      0.577350269189625842, -0.577350269189625842,  0.577350269189625842,  1.025731112119133481,  0.618033988749894792,  1.0000,  0.0000,  1.0000,
      
     -0.356822089773089990,  0.000000000000000000, -0.934172358962715776,  0.824919696232906285,  0.000000000000000000,  0.0000,  0.5000,  0.5000,
      0.356822089773089990,  0.000000000000000000, -0.934172358962715776,  0.175080303767093715,  0.000000000000000000,  0.0000,  0.2500,  0.7500,
      0.577350269189625842, -0.577350269189625842, -0.577350269189625842, -0.025731112119133592,  0.618033988749894792,  0.0000,  0.0000,  1.0000,
      0.000000000000000000, -0.934172358962715776, -0.356822089773089990,  0.500000000000000000,  1.000000000000000000,  0.0000,  0.7500,  0.7500,
     -0.577350269189625842, -0.577350269189625842, -0.577350269189625842,  1.025731112119133481,  0.618033988749894792,  0.0000,  0.7500,  0.5000,

      0.934172358962715776, -0.356822089773089990,  0.000000000000000000,  1.000000000000000000,  0.824919696232906285,  0.5000,  0.0000,  1.0000,
      0.934172358962715776,  0.356822089773089990,  0.000000000000000000,  1.000000000000000000,  0.175080303767093715,  1.0000,  0.0000,  0.2500,
      0.577350269189625842,  0.577350269189625842,  0.577350269189625842,  0.381966011250105208, -0.025731112119133592,  1.0000,  0.0000,  0.0000,
      0.356822089773089990,  0.000000000000000000,  0.934172358962715776,  0.000000000000000000,  0.500000000000000000,  1.0000,  0.0000,  0.2500,
      0.577350269189625842, -0.577350269189625842,  0.577350269189625842,  0.381966011250105208,  1.025731112119133481,  1.0000,  0.0000,  1.0000,
      
      0.934172358962715776,  0.356822089773089990,  0.000000000000000000,  0.000000000000000000,  0.175080303767093715,  1.0000,  0.0000,  0.2500,
      0.934172358962715776, -0.356822089773089990,  0.000000000000000000,  0.000000000000000000,  0.824919696232906285,  0.5000,  0.0000,  1.0000,
      0.577350269189625842, -0.577350269189625842, -0.577350269189625842,  0.618033988749894792,  1.025731112119133481,  0.0000,  0.0000,  1.0000,
      0.356822089773089990,  0.000000000000000000, -0.934172358962715776,  1.000000000000000000,  0.500000000000000000,  0.0000,  0.2500,  0.7500,
      0.577350269189625842,  0.577350269189625842, -0.577350269189625842,  0.618033988749894792, -0.025731112119133592,  0.7500,  0.5000,  0.2500,

     -0.934172358962715776,  0.356822089773089990,  0.000000000000000000,  0.000000000000000000,  0.175080303767093715,  0.0000,  1.0000,  0.0000,
     -0.934172358962715776, -0.356822089773089990,  0.000000000000000000,  0.000000000000000000,  0.824919696232906285,  0.2500,  1.0000,  0.0000,
     -0.577350269189625842, -0.577350269189625842,  0.577350269189625842,  0.618033988749894792,  1.025731112119133481,  0.2500,  0.7500,  0.0000,
     -0.356822089773089990,  0.000000000000000000,  0.934172358962715776,  1.000000000000000000,  0.500000000000000000,  0.5000,  0.7500,  0.0000,
     -0.577350269189625842,  0.577350269189625842,  0.577350269189625842,  0.618033988749894792, -0.025731112119133592,  1.0000,  0.5000,  0.0000,

     -0.934172358962715776, -0.356822089773089990,  0.000000000000000000,  1.000000000000000000,  0.824919696232906285,  0.2500,  1.0000,  0.0000,
     -0.934172358962715776,  0.356822089773089990,  0.000000000000000000,  1.000000000000000000,  0.175080303767093715,  0.0000,  1.0000,  0.0000,
     -0.577350269189625842,  0.577350269189625842, -0.577350269189625842,  0.381966011250105208, -0.025731112119133592,  0.2500,  0.7500,  0.2500,
     -0.356822089773089990,  0.000000000000000000, -0.934172358962715776,  0.000000000000000000,  0.500000000000000000,  0.0000,  0.5000,  0.5000,
     -0.577350269189625842, -0.577350269189625842, -0.577350269189625842,  0.381966011250105208,  1.025731112119133481,  0.0000,  0.7500,  0.5000,
    ]),
    ind: new Uint16Array([
       0,  1,  2,   4,  0,  2,   3,  4,  2,
       5,  6,  7,   9,  5,  7,   8,  9,  7,
      10, 11, 12,  14, 10, 12,  13, 14, 12,
      15, 16, 17,  19, 15, 17,  18, 19, 17,
      20, 21, 22,  24, 20, 22,  23, 24, 22,
      25, 26, 27,  29, 25, 27,  28, 29, 27,
      30, 31, 32,  34, 30, 32,  33, 34, 32,
      35, 36, 37,  39, 35, 37,  38, 39, 37,
      40, 41, 42,  44, 40, 42,  43, 44, 42,
      45, 46, 47,  49, 45, 47,  48, 49, 47,
      50, 51, 52,  54, 50, 52,  53, 54, 52,
      55, 56, 57,  59, 55, 57,  58, 59, 57,
    ])
  },
  icosahedron: {vert: new Float32Array([
     0, 1.68, -1,    1.07, 0,    0.0, 1.0, 0.0,
     0, 1.68, 1,    -0.07, 0,    0.0, 1.0, 0.0,
     1.68, 1, 0,     0.5, 1,     0.0, 1.0, 0.0,

     0, 1.68, 1,     1.07, 0,    0.0, 1.0, 0.0,
     0, 1.68, -1,   -0.07, 0,    0.0, 1.0, 0.0,
    -1.68, 1,  0,    0.5, 1,     0.0, 1.0, 1.0,

     1, 0, 1.68,    1.07, 1,   0.0, 1.0, 0.0,
     0, 1.68, 1,    0.5, 0,    0.0, 1.0, 0.0,
    -1, 0, 1.68,   -0.07, 1,   0.0, 1.0, 0.0,

     0, 1.68, -1, 0.5, 0,     0.0, 1.0, 0.0,
     1, 0, -1.68, -0.07, 1,   0.0, 1.0, 0.0,
    -1, 0, -1.68, 1.07, 1,    0.0, 1.0, 0.0,


     0, -1.68, 1, -0.07, 1, 1.0, 0.0, 0.0,
     0, -1.68, -1, 1.07, 1, 0.0, 1.0, 0.0,
     1.68, -1, 0, 0.5, 0, 1.0, 1.0, 1.0,

     0, -1.68, -1,-0.07, 1, 0.0, 1.0, 0.0,
     0, -1.68, 1, 1.07, 1, 1.0, 0.0, 0.0,
    -1.68, -1, 0, 0.5, 0, 1.0, 1.0, 1.0,


     0, -1.68, 1, -0.07, 0, 1.0, 0.0, 0.0,
     1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     1, 0, 1.68, 0.5, 1, 1.0, 1.0, 0.0,

    -1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     0, -1.68, 1, -0.07, 0, 1.0, 0.0, 0.0,
    -1, 0, 1.68, 0.5, 1, 1.0, 1.0, 0.0,

     0, -1.68, 1, -0.07, 0, 1.0, 0.0, 0.0,
     1, 0, 1.68, 0.5, 1, 1.0, 1.0, 0.0,
    -1, 0, 1.68, 0.5, 1, 1.0, 1.0, 0.0,


     1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     0, -1.68, -1, -0.07, 0, 1.0, 0.0, 0.0,
     1, 0, -1.68, 0.5, 1, 1.0, 1.0, 0.0,

     0, -1.68, -1, -0.07, 0, 1.0, 0.0, 0.0,
    -1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
    -1, 0, -1.68, 0.5, 1, 1.0, 1.0, 0.0,
    
     1, 0, -1.68, 0.5, 1, 1.0, 1.0, 0.0,
     0, -1.68, -1, -0.07, 0, 1.0, 0.0, 0.0,
    -1, 0, -1.68, 0.5, 1, 1.0, 1.0, 0.0,


     1.68, 1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     1, 0, -1.68, 0.5, 1, 1.0, 1.0, 0.0,

     1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     1.68, 1, 0, 0.5, 1, 1.0, 1.0, 0.0,
     1, 0, 1.68, 0.5, 1, 1.0, 1.0, 0.0,

    -1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
    -1.68, 1, 0, 0.5, 1, 1.0, 1.0, 0.0,
    -1, 0, -1.68, 0.5, 1, 1.0, 1.0, 0.0,

    -1.68, 1, 0, 0.5, 1, 1.0, 1.0, 0.0,
    -1.68, -1, 0, 0.5, 1, 1.0, 1.0, 0.0,
    -1, 0, 1.68, 0.5, 1, 1.0, 1.0, 0.0,




    1.68, 1, 0,    1, 0.5,    1.0, 0.0, 0.0,
    0, 1.68, 1,    0, -0.07,  1.0, 0.0, 0.0,
    1, 0, 1.68,    0, 1.07,   1.0, 0.0, 0.0,

    0, 1.68, 1,    1, -0.07,   1.0, 0.0, 0.0,
   -1.68, 1, 0,    0, 0.5,     1.0, 0.0, 0.0,
   -1, 0, 1.68,    1, 1.07,    1.0, 0.0, 0.0,

    0, 1.68, -1,  -0.07, 0,   1.0, 0.0, 0.0,
    1.68, 1, 0,    0.5, 1,    1.0, 0.0, 0.0,
    1, 0, -1.68,   0.5, 1,    1.0, 0.0, 0.0,

   -1.68, 1, 0, 0.5, 1,    1.0, 0.0, 0.0,
    0, 1.68, -1, -0.07, 0, 1.0, 0.0, 0.0,
   -1, 0, -1.68, 0.5, 1,   1.0, 0.0, 0.0,
  ])}
}

let figures_data, figures = [], cur_figure = 0;

function createFigure(device, data) {
  if (data.vert === undefined || data.vert.length % 8 !== 0) throw("Invalid vertex buffer");
  let count = data.vert.length / 8;

  let vert_buffer = device.createBuffer({
    size: count * 32,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });

  new Float32Array(vert_buffer.getMappedRange()).set(data.vert);
  vert_buffer.unmap();

  if (data.ind === undefined) return {
    vert_buffer,
    count,
    draw: function (rnd_pass, ind) {
      rnd_pass.setPipeline(figures_data.pipeline);
      rnd_pass.setBindGroup(0, figures_data.bind_groups[ind]);

      rnd_pass.setVertexBuffer(0, this.vert_buffer);

      rnd_pass.draw(this.count, 1, 0, 0);
    }
  }; else {
    if (data.ind.length % 3 !== 0) throw("Invalid index buffer");
    count = data.ind.length;

    let buf_size = (count + (count % 2)) * 2;
    let ind_buffer = device.createBuffer({
      size: buf_size,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });

    new Uint16Array(ind_buffer.getMappedRange(0, buf_size)).set(data.ind);
    ind_buffer.unmap();

    return {
      vert_buffer,
      ind_buffer,
      count,
      draw: function (rnd_pass, ind) {
        rnd_pass.setPipeline(figures_data.pipeline);
        rnd_pass.setBindGroup(0, figures_data.bind_groups[ind]);
  
        rnd_pass.setVertexBuffer(0, this.vert_buffer);
        rnd_pass.setIndexBuffer(this.ind_buffer, "uint16");
  
        rnd_pass.drawIndexed(this.count, 1, 0, 0);
      }
    }
  }
}

function addFigure(figure, name) {
  let ind = figures.length;
  
  figures.push(figure);
  
  let element = document.createElement("option");
  element.value = ind;
  element.innerHTML = name.length < 30 ? name : name.slice(0, 28) + "...";
  document.getElementById("models_list").appendChild(element);
}

export function selectModel(ind) {
  cur_figure = ind;
}

function initFigures(device) {
  let bind_group_layout = device.createBindGroupLayout({
    entries: [
      {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {type: "uniform"}},
      {binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}},
      {binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {type: "filtering"}}
    ]
  })
  
  let pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({bindGroupLayouts: [bind_group_layout]}),
    vertex: {
      module: device.createShaderModule({ code:
`struct Uniforms {
  ModelMatr : mat4x4<f32>,
  VPMatr : mat4x4<f32>,
};
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct in {
  @location(0) pos : vec3<f32>,
  @location(1) tex0 : vec2<f32>,
  @location(2) color : vec3<f32>
}

struct out {
  @builtin(position) pos : vec4<f32>,
  @location(0) tex0 : vec2<f32>,
  @location(1) color : vec3<f32>  
}

@vertex
fn main(input : in) -> out {
  var output : out;

  output.pos = uniforms.VPMatr * (uniforms.ModelMatr * vec4<f32>(input.pos, 1.0));
  output.tex0 = input.tex0;
  output.color = input.color;

  return output;
}`      }),
      entryPoint: "main",
      buffers: [
        {arrayStride: 32, attributes: [
          {shaderLocation: 0, format: 'float32x3', offset: 0},
          {shaderLocation: 1, format: 'float32x2', offset: 12},
          {shaderLocation: 2, format: 'float32x3', offset: 20}
        ]},
      ],
    },
    fragment: {
      module: device.createShaderModule({ code:
`@group(0) @binding(1) var color_tex : texture_2d<f32>;
@group(0) @binding(2) var color_sampler : sampler;

struct in {
  @builtin(position) pos : vec4<f32>,
  @location(0) tex0 : vec2<f32>,
  @location(1) color : vec3<f32>
}

@fragment
fn main(input : in) -> @location(0) vec4<f32> {
  var color = textureSample(color_tex, color_sampler, input.tex0).rgba;

  return vec4<f32>(mix(input.color, color.rgb, color.a), 1.0);
}`      }),
      entryPoint: "main",
      targets: [
        {format: 'rgba8unorm'}
      ]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: 'back'
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less"
    }
  })

  let uniform_buffer_size = (4 * 16) * 2;
  let uniform_buffer = device.createBuffer({
    size: uniform_buffer_size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    mappedAtCreation: false
  });

  let bind_group_desc = {
    layout: bind_group_layout,
    entries: [
      {binding: 0, resource: {buffer: uniform_buffer, offset: 0, size: uniform_buffer_size}},
      {binding: 1, resource: null},
      {binding: 2, resource: device.createSampler({
        addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge",
        magFilter: "linear", minFilter: "linear", mipmapFilter: "linear"
      })}
    ]
  }

  figures_data = {
    bind_group_layout, pipeline,
    uniform_buffer_size, uniform_buffer,
    bind_group_desc, bind_groups: [null, null],
    createBindGroup: function (tex_view, ind) {
      let desc = {...this.bind_group_desc};
      desc.entries[1].resource = tex_view;

      this.bind_groups[ind] = device.createBindGroup(desc);
    }
  }

  addFigure(createFigure(device, figures_geometry.tetrahedron), "Tetrahedron");
  addFigure(createFigure(device, figures_geometry.cube), "Cube");
  addFigure(createFigure(device, figures_geometry.octahedron), "Octahedron");
  addFigure(createFigure(device, figures_geometry.dodecahedron), "Dodecahedron");
  //addFigure(createFigure(device, figures_geometry.icosahedron), "Icosahedron");
}

let gpu, render_data = {};

function initRender() {
  let device = gpu.device;

  render_data.depth_tex = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });

  render_data.gbuffers = [
    device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1], format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    }),
    device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1], format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    })
  ]

  render_data.ind = 0;

  figures_data.createBindGroup(render_data.gbuffers[1].createView(), 0)
  figures_data.createBindGroup(render_data.gbuffers[0].createView(), 1)

  render_data.main_render_pass_descs = [
    {
      colorAttachments: [
        {view: render_data.gbuffers[0].createView(), clearValue: {r: 0.30, g: 0.47, b: 0.8, a: 0}, loadOp: 'clear', storeOp: 'store'}
      ],
      depthStencilAttachment: {
        view: render_data.depth_tex.createView(),
        depthLoadValue: 1.0,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: "store",
      }
    },
    {
      colorAttachments: [
        {view: render_data.gbuffers[1].createView(), clearValue: {r: 0.30, g: 0.47, b: 0.8, a: 0}, loadOp: 'clear', storeOp: 'store'}
      ],
      depthStencilAttachment: {
        view: render_data.depth_tex.createView(),
        depthLoadValue: 1.0,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: "store",
      }
    }
]

  render_data.gbuffer_bind_group_layout = device.createBindGroupLayout({
    entries: [
      {binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
    ]
  })

  render_data.gbuffer_bind_groups = [
    device.createBindGroup({
      layout: render_data.gbuffer_bind_group_layout,
      entries: [
        {binding: 0, resource: render_data.gbuffers[0].createView()}
      ]
    }),
    device.createBindGroup({
      layout: render_data.gbuffer_bind_group_layout,
      entries: [
        {binding: 0, resource: render_data.gbuffers[1].createView()}
      ]
    })
  ]

  render_data.copy_pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({bindGroupLayouts: [render_data.gbuffer_bind_group_layout]}),
    vertex: {
      module: device.createShaderModule({ code:
`@vertex
fn main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4<f32> {
var pos = array<vec2<f32>, 4>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0));
return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}`      }),
      entryPoint: "main"
    },
    fragment: {
      module: device.createShaderModule({ code:
`@group(0) @binding(0) var color_tex : texture_2d<f32>;

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
var icoord = vec2<i32>(floor(coord.xy));
var color : vec3<f32> = textureLoad(color_tex, icoord, 0).rgb;

return vec4<f32>(color, 1.0);
}`      }),
      entryPoint: "main",
      targets: [{
        format: "bgra8unorm",
        blend: {
          color: {dstFactor: "zero", operation: "add", srcFactor: "one"},
          alpha: {dstFactor: "zero", operation: "add", srcFactor: "one"}
        }
      }]
    },
    primitive: {
      topology: "triangle-strip",
      cullMode: 'none'
    },
  })

  render_data.copy_render_pass_desc = {
    colorAttachments: [
      {clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'}
    ]
  }
}

export async function start() {
  gpu = await InitWebGPU();

  /* Create figures */
  initFigures(gpu.device);
  
  /* Create input callbacks */
  initInput(gpu.canvas, window);

  /* Init render */
  initRender();

  /* Run mainloop */
  Tick();
}

var button_pressed = -1, mouse = { pos : {}, page_pos : {} };

function initInput(canvas, window) {
  /***
   * Add input callbacks
   ***/
  window.addEventListener("mousemove", (event) => {
    let new_pos = { x : event.clientX - gpu.canvas.offsetLeft, y : event.clientY - gpu.canvas.offsetTop };

    switch (button_pressed)
    {
    case 0:
      camera.XAngle = (camera.XAngle + (new_pos.x - mouse.pos.x) * -0.01) % (Math.PI * 2);
      camera.YAngle = clamp(camera.YAngle + (new_pos.y - mouse.pos.y) * 0.01, -Math.PI * 0.5, Math.PI * 0.5);
      break;
    case 2:
      let offset = [
        -Math.cos(camera.XAngle),
        0,
        Math.sin(camera.XAngle)
      ];
      vec3.normalize(offset, offset);
      vec3.multiply(offset, offset, Array(3).fill((new_pos.x - mouse.pos.x) * 1 * camera.dist / (gpu.canvas.width)));
      vec3.add(camera.origin, camera.origin, offset);

      offset = [
        -Math.sin(camera.XAngle) * Math.sin(camera.YAngle),
        Math.cos(camera.YAngle),
        -Math.cos(camera.XAngle) * Math.sin(camera.YAngle)
      ]
      vec3.normalize(offset, offset);
      vec3.multiply(offset, offset, Array(3).fill((new_pos.y - mouse.pos.y) * 1 * camera.dist / (gpu.canvas.height)));
      vec3.add(camera.origin, camera.origin, offset);
      break;
    case -1:
    default:
      break;
    }

    mouse.pos = new_pos;
    mouse.page_pos = { x: new_pos.x / gpu.canvas.width, y: new_pos.y / gpu.canvas.height };
  });

  canvas.oncontextmenu = event => { event.preventDefault(); event.stopPropagation(); };
  canvas.addEventListener("mousedown", event => { button_pressed = (button_pressed == -1) ? event.button : -1 });
  window.addEventListener("mouseup", _event => { button_pressed = -1 });
  canvas.addEventListener("wheel", event => { event.preventDefault(); camera.dist *= (1.0 + event.deltaY * 0.001); }, { capture : true, passive : false });
}

var Time = Date.now() / 1000, PrevTime = Time, TimeMul = 1.0;
var camera = {
  XAngle: 0, YAngle: 0.30,
  origin: [0, 0, 0],
  dist: 8,
  view: mat4.create(),
  proj: mat4.create(),
  vp: mat4.create()
};

function Responce() {
  let CurTime = Date.now() / 1000;
  Time += (CurTime - PrevTime) * TimeMul;
  PrevTime = CurTime;

  let eye_offset_dir = [
    Math.sin(camera.XAngle) * Math.cos(camera.YAngle),
    Math.sin(camera.YAngle),
    Math.cos(camera.XAngle) * Math.cos(camera.YAngle)
  ]
  let cam_pos = eye_offset_dir.map((val, ind) => camera.origin[ind] + val * camera.dist);

  mat4.lookAt(camera.view, cam_pos, camera.origin, [0, 1, 0]);

  let size = 0.01;
  let width = size * Math.max(1.0, gpu.canvas.width / gpu.canvas.height);
  let height = size * Math.max(1.0, gpu.canvas.height / gpu.canvas.width);
  mat4.frustum(camera.proj, -width, width, -height, height, size, 100);

  mat4.multiply(camera.vp, camera.proj, camera.view);

  let tmp = new Float32Array(32);
  tmp.set(mat4.identity(mat4.create()), 0);
  tmp.set(camera.vp, 16);

  gpu.device.queue.writeBuffer(figures_data.uniform_buffer, 0, tmp);
}

function Render() {
  let commandEncoder = gpu.device.createCommandEncoder();

  {
    let renderPass = commandEncoder.beginRenderPass(render_data.main_render_pass_descs[render_data.ind]);
    renderPass.setScissorRect(1, 1, gpu.canvas.width - 2, gpu.canvas.height - 2);
    figures[cur_figure].draw(renderPass, render_data.ind);
    renderPass.end();
  }
    
  {
    render_data.copy_render_pass_desc.colorAttachments[0].view = gpu.context.getCurrentTexture().createView();
    let renderPass = commandEncoder.beginRenderPass(render_data.copy_render_pass_desc);
    renderPass.setPipeline(render_data.copy_pipeline);
    renderPass.setBindGroup(0, render_data.gbuffer_bind_groups[render_data.ind]);

    renderPass.draw(4, 1, 0, 0);
    renderPass.end();
  }

  render_data.ind = (render_data.ind + 1) % 2;
  
  gpu.device.queue.submit([commandEncoder.finish()]);  
}

function Tick() {
  window.requestAnimationFrame(Tick);

  Responce();
  Render();
}
