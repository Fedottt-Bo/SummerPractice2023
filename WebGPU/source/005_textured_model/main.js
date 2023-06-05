// Import math module
const glMatrix = require('gl-matrix');
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// Import other files
import { InitWebGPU } from './web_gpu_helper.js';
import { LoadModel } from './model_data.js'

// Number clamp function
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Variables collections for rendering
var gpu = {}, model = {}, render_target = {};

// State control variables
var button_pressed = false, mouse = { pos : {}, page_pos : {} };
var Time = Date.now(), PrevTime = Time, TimeMul = 1.0;
var camera = { XAngle : 0, YAngle : 0.30, origin : [0, 0, 0], dist : 8 };

export async function InitRender() {
  gpu = await InitWebGPU();
  let device = gpu.device;

  model = await LoadModel(device);

  render_target.depth_tex = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });

  render_target.render_pass_desc = {
    colorAttachments: [{
      clearValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 },
      loadOp: 'clear',
      storeOp: 'store'
    }],
    depthStencilAttachment: {
      view: (render_target.depth_tex_view = render_target.depth_tex.createView()),
      depthLoadValue: 1.0,
      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: "store",
    }
  };

  model.uniform_buffer = device.createBuffer({
    size: 0x40,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  model.uniform_bind_group = device.createBindGroup({
    layout: model.pipeline.getBindGroupLayout(0),
    entries:
    [
      {
        binding: 0,
        resource:
        {
          buffer: model.uniform_buffer,
          offset: 0,
          size: 64
        }
      }
    ]
  });

  gpu.canvas.addEventListener("mousemove", (event) => {
    event.preventDefault();
    let new_pos = { x : event.clientX - gpu.canvas.offsetLeft, y : event.clientY - gpu.canvas.offsetTop };

    if (button_pressed)
    {
      camera.XAngle = (camera.XAngle + (new_pos.x - mouse.pos.x) * -0.01) % (Math.PI * 2);
      camera.YAngle = clamp(camera.YAngle + (new_pos.y - mouse.pos.y) * 0.01, -Math.PI * 0.5, Math.PI * 0.5);
    }

    mouse.pos = new_pos;
    mouse.page_pos = { x: new_pos.x / gpu.canvas.width, y: new_pos.y / gpu.canvas.height };
  });
  gpu.canvas.addEventListener("mousedown", (_event) => { button_pressed = true });
  gpu.canvas.addEventListener("mouseup", (_event) => { button_pressed = false });
  gpu.canvas.addEventListener("wheel", (event) => camera.dist *= (1.0 + event.deltaY * 0.001));

  Tick();
}

function Responce() {
  Time += (Date.now() - PrevTime) * TimeMul;
  PrevTime = Date.now();

  let eye_offset =
  [
    Math.sin(camera.XAngle) * Math.cos(camera.YAngle) * camera.dist,
    Math.sin(camera.YAngle) * camera.dist,
    Math.cos(camera.XAngle) * Math.cos(camera.YAngle) * camera.dist
  ]
  mat4.add(eye_offset, eye_offset, camera.origin);

  let view = mat4.create();
  mat4.lookAt(view, eye_offset, camera.origin, [0, 1, 0]);

  let proj = mat4.create();
  mat4.frustum(proj, -0.1, 0.1, -0.1, 0.1, 0.1, 100);

  let vp = mat4.create();
  mat4.multiply(vp, proj, view);

  gpu.device.queue.writeBuffer(model.uniform_buffer, 0, vp);
}

function Render() {
  const commandEncoder = gpu.device.createCommandEncoder();

  render_target.render_pass_desc.colorAttachments[0].view = gpu.context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass(render_target.render_pass_desc);

  model.draw(renderPass);

  renderPass.end();
  gpu.device.queue.submit([commandEncoder.finish()]);
}

function Tick() {
  window.requestAnimationFrame(Tick);

  Responce();
  Render();
}