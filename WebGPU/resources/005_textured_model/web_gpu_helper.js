export const surface_format = 'bgra8unorm';

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


