// Import math module
const glMatrix = require('gl-matrix');
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// Import other files
import { createBuffer, InitWebGPU } from './helper.js';
import { loadglTF } from './model_data.js'
import { createAmbientLight, createDirectLight } from './lights.js'
import { createCopy } from './post_processing.js';

// Number clamp function
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Variables collections for rendering
var gpu = {}, render_targets = [];

// State control variables
var button_pressed = -1, mouse = { pos : {}, page_pos : {} };
var Time = Date.now() / 1000, PrevTime = Time, TimeMul = 1.0;
var camera = { XAngle : 0, YAngle : 0.30, origin : [0, 0, 0], dist : 8 };

let models_list = [];
let models_names = [
  {url: "Strawberry.gltf", name: "Strawberry"},
  {url: "Duck.gltf", name: "Duck"},
]

export function selectModel(ind) {
  if (models_list[ind] === undefined) {
    render_targets[0].models = [];
  } else {
    render_targets[0].models = [models_list[ind]];
  }
}

async function loadModel(ind) {
  function addModelToList(ind, model, name) {
    models_list[ind] = model;
  
    let element = document.createElement("option");
    element.value = ind;
    element.innerHTML = name.length < 30 ? name : name.slice(0, 28) + "...";
    document.getElementById("models_list").appendChild(element);
  }

  let val = models_names[ind];

  if (val !== undefined)
    loadglTF(gpu.device, val.url)
      .catch(_err => delete models_names[ind])
      .then(model => addModelToList(ind, model, val.name || val.url));
}

async function loadDefaultModels(device) {
  models_list[-1] = undefined;
  models_names.forEach((val, ind) => loadModel(ind))
}

export async function loadNewModel(url_str) {
  let name = '';
  try {
    let url = new URL(url_str);
    name = url.hostname + url.pathname;
  } catch (_err) {
    name = url_str;
  }

  models_names.push({url: url_str, name: name});
  loadModel(models_names.length - 1);
}

export async function InitRender() {
  gpu = await InitWebGPU();
  let device = gpu.device;

  /***
   * Load default avalible models
   ***/
  loadDefaultModels(device);

  /***
   * Create first render pass
   * Geometry pass
   ***/
  render_targets.push({});

  render_targets[0].gbuffers = [
    device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1], format: "rgba8unorm-srgb",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    }),
    device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1], format: "rgba16float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    }),
    device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1], format: "rgba16float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    })
  ]

  render_targets[0].depth_tex = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });

  render_targets[0].render_pass_desc = {
    colorAttachments: [
      {view: render_targets[0].gbuffers[0].createView(), clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'},
      {view: render_targets[0].gbuffers[1].createView(), clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'},
      {view: render_targets[0].gbuffers[2].createView(), clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'}
    ],
    depthStencilAttachment: {
      view: (render_targets[0].depth_tex_view = render_targets[0].depth_tex.createView()),
      depthLoadValue: 1.0,
      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: "store",
    }
  };

  render_targets[0].vp = mat4.create();

  //render_targets[0].models = [await loadglTF(device, './Duck.gltf')];
  render_targets[0].models = [];

  /***
   * Create second render pass
   * Lighting pass
   ***/
  render_targets.push({});

  render_targets[1].gbuffers_bind_group_layout = device.createBindGroupLayout({
    entries: [
      {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {type: "uniform"}},
      {binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}},
      {binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}},
      {binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
    ]
  })

  render_targets[1].scene_uniform_buffer_size = 4 * (3 + 1 + 3 + 1);
  render_targets[1].scene_uniform_buffer = createBuffer(device, render_targets[1].scene_uniform_buffer_size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
  render_targets[1].gbuffers_bind_group = device.createBindGroup({
    layout: render_targets[1].gbuffers_bind_group_layout,
    entries: [
      {binding: 0, resource: {
        buffer: render_targets[1].scene_uniform_buffer,
        offset: 0,
        size: render_targets[1].scene_uniform_buffer_size
      }},
      {binding: 1, resource: render_targets[0].gbuffers[0].createView()},
      {binding: 2, resource: render_targets[0].gbuffers[1].createView()},
      {binding: 3, resource: render_targets[0].gbuffers[2].createView()}
    ]
  });

  render_targets[1].gbuffers = [
    device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1],
      format: "rgba16float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    })
  ]

  render_targets[1].render_pass_desc = {
    colorAttachments: [
      {view: render_targets[1].gbuffers[0].createView({baseMipLevel: 0, mipLevelCount: 1}), clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'},
    ]
  };

  render_targets[1].lights = []

  let dir0 = createDirectLight(device, render_targets[1].gbuffers_bind_group_layout);
  dir0.update(device, {pos: [1.0, 1.0, 1.0], color: [1.3, 0.13, 0.13, 1]});

  let dir1 = createDirectLight(device, render_targets[1].gbuffers_bind_group_layout);
  dir1.update(device, {pos: [1.0, 1.0, -1.0], color: [0.13, 1.3, 0.13, 1]});

  let dir2 = createDirectLight(device, render_targets[1].gbuffers_bind_group_layout);
  dir2.update(device, {pos: [-1.0, 1.0, 0], color: [0.13, 0.13, 1.3, 1]});

  let amb0 = createAmbientLight(device, render_targets[1].gbuffers_bind_group_layout);
  amb0.update(device, {color: [0.18, 0.18, 0.18, 1]});

  render_targets[1].lights.push(dir0, dir1, dir2, amb0);

  /***
   * Create third render pass
   * Post processing pass
   ***/
  render_targets.push({});

  render_targets[2].render_pass_desc = {
    colorAttachments: [
      {view: null, clearValue: {r: 0, g: 0, b: 0, a: 0}, loadOp: 'clear', storeOp: 'store'},
    ]
  };

  render_targets[2].gbuffers_bind_group_layout = device.createBindGroupLayout({
    entries: [
      {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {type: "uniform"}},
      {binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}},
    ]
  })

  render_targets[2].gbuffers_bind_group = device.createBindGroup({
    layout: render_targets[2].gbuffers_bind_group_layout,
    entries: [
      {binding: 0, resource: {
        buffer: render_targets[1].scene_uniform_buffer,
        offset: 0,
        size: render_targets[1].scene_uniform_buffer_size
      }},
      {binding: 1, resource: render_targets[1].gbuffers[0].createView()},
    ]
  })

  render_targets[2].modes = []
  render_targets[2].modes.push(createCopy(device, render_targets[2].gbuffers_bind_group_layout));

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

  gpu.canvas.oncontextmenu = (event) => { event.preventDefault(); event.stopPropagation(); };
  gpu.canvas.addEventListener("mousedown", (event) => { button_pressed = (button_pressed == -1) ? event.button : -1 });
  window.addEventListener("mouseup", (_event) => { button_pressed = -1 });
  gpu.canvas.addEventListener("wheel", (event) => { event.preventDefault(); camera.dist *= (1.0 + event.deltaY * 0.001); }, { capture : true, passive : false });

  /* Begin render main loop */
  Tick();
}

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

  let view = mat4.create();
  mat4.lookAt(view, cam_pos, camera.origin, [0, 1, 0]);

  let proj = mat4.create();
  mat4.frustum(proj, -0.1, 0.1, -0.1, 0.1, 0.1, 100);

  mat4.multiply(render_targets[0].vp, proj, view);

  let tmp = new Float32Array([].concat(cam_pos, gpu.canvas.width, eye_offset_dir.map(val => -val), gpu.canvas.height));
  gpu.device.queue.writeBuffer(render_targets[1].scene_uniform_buffer, 0, tmp, 0, 3 + 1 + 3 + 1);

  render_targets[1].lights[0].update(gpu.device, {pos: [Math.cos(Time * 1.0 + 0.47), 1.0, Math.sin(Time * 0.75 + 0.30)]});
  render_targets[1].lights[1].update(gpu.device, {pos: [Math.cos(Time * 1.3 + 0.8), 1.0, Math.sin(Time * 0.47 + 0.47)]});
  render_targets[1].lights[2].update(gpu.device, {pos: [Math.cos(Time * 0.666 + 1.8), 1.0, Math.sin(Time * 1.8 + 0.8)]});
}

function Render() {
  let commandEncoder = gpu.device.createCommandEncoder();

  {
    let renderPass = commandEncoder.beginRenderPass(render_targets[0].render_pass_desc);

    render_targets[0].models.forEach(model => model.draw(render_targets[0].vp, mat4.create(), renderPass));

    renderPass.end();
  }

  {
    let renderPass = commandEncoder.beginRenderPass(render_targets[1].render_pass_desc);

    render_targets[1].lights.forEach(light => light.draw(render_targets[1].gbuffers_bind_group, renderPass));

    renderPass.end();
  }

  {
    render_targets[2].render_pass_desc.colorAttachments[0].view = gpu.context.getCurrentTexture().createView();
    let renderPass = commandEncoder.beginRenderPass(render_targets[2].render_pass_desc);

    render_targets[2].modes[0].run(render_targets[2].gbuffers_bind_group, renderPass);

    renderPass.end();
  }
  
  gpu.device.queue.submit([commandEncoder.finish()]);  
}

function Tick() {
  window.requestAnimationFrame(Tick);

  Responce();
  Render();
}