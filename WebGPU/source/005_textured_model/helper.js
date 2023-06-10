import { Buffer } from 'buffer';

export const surface_format = 'bgra8unorm';

export async function fetchBuffer(url) {
  if (url.startsWith('data:')) {
    return Buffer.from(url.split(",")[1], 'base64');
  } else {
    return Buffer.from(await fetch(url).then(data => data.arrayBuffer()));
  }
}

export function loadImage(url) {
  return new Promise(resolve => {
    let image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.src = url;
  });
}

export async function InitWebGPU() {
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
    format: surface_format,
    alphaMode: 'opaque'
  });

  return { gpu : navigator.gpu, canvas : canvas, adapter : adapter, device : device, context : context };
}

export function createBuffer(device, size, flags=GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, data=null) {
  const buffer = device.createBuffer({
    size: size,
    usage: flags,
    mappedAtCreation: data !== null
  });                 

  if (data !== null) {
    new data.constructor(buffer.getMappedRange()).set(data);
    buffer.unmap();
  }

  return buffer;
}

export function createTextureFromBitmap(device, img) {
  const textureDescriptor = {
    size: { width: img.width, height: img.height },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  };
  const texture = device.createTexture(textureDescriptor);
  device.queue.copyExternalImageToTexture({ source : img }, { texture : texture }, textureDescriptor.size);

  return texture;
}

export async function createTextureFromImg(device, img) {
  return createTextureFromBitmap(device, await createImageBitmap(img));
}

export function createCubeTextureFromBitmaps(device, images) {
  if (images.length !== 6) throw("invalid images amount");

  const w = images[0].width, h = images[0].height;
  if (w === undefined || h === undefined) throw("Invalid size");
  for (let i = 1; i < 6; i++) if (images[i].width !== w || images[i].height !== h) throw("Different size of images is not allowed");

  const textureDescriptor = {
    size: {width: w, height: h, depthOrArrayLayers: 6},
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  };
  const texture = device.createTexture(textureDescriptor);

  for (let i = 0; i < 6; i++)
    device.queue.copyExternalImageToTexture({source: images[i]}, {texture: texture, origin: [0, 0, i]}, {width: w, height: h, depthOrArrayLayers: 1});

  return texture;
}

export async function createCubeTextureFromImages(device, images) {
  return createCubeTextureFromBitmaps(device, await Promise.all(images.map(image => createImageBitmap(image))));
}

let EmptyTextureData = null;
export function EmptyTexture(device) {
  if (EmptyTextureData === null) {
    EmptyTextureData = {
      texture: device.createTexture({dimension: '2d', format: 'rgba8unorm', size: [16, 16], usage: GPUTextureUsage.TEXTURE_BINDING}),
      sampler: device.createSampler({}),
    }
  }

  return EmptyTextureData;
}
