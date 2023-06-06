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

    console.log(msg);
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

export function CreateBuffer(device, size, flags=GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, data=null) {
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

export function CreateTextureFromBitmap(device, img) {
  const textureDescriptor = {
    size: { width: img.width, height: img.height },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  };
  const texture = device.createTexture(textureDescriptor);
  device.queue.copyExternalImageToTexture({ source : img }, { texture : texture }, textureDescriptor.size);

  return texture;
}

export async function CreateTextureFromImg(device, img) {
  return CreateTextureFromBitmap(device, await createImageBitmap(img));
}
