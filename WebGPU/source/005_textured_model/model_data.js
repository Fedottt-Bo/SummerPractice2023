import { default_pipeline } from './pipeline_data.js';
import { CreateBuffer, CreateTextureFromImg } from './web_gpu_helper.js';
import { Buffer } from 'buffer';

var cubeData =
{
  vertices:
  [
    // position     // color
    // front
    -1,  1,  1,     0, 0, 1,
    -1, -1,  1,     0, 0, 1,
     1,  1,  1,     1, 1, 1,
     1, -1,  1,     0, 0, 1,

    // right
     1,  1,  1,     1, 1, 1,
     1, -1,  1,     0, 1, 0,
     1,  1, -1,     0, 1, 0,
     1, -1, -1,     0, 1, 0,

    // back
     1,  1, -1,     1, 0, 0,
     1, -1, -1,     1, 0, 0,
    -1,  1, -1,     1, 0, 0,
    -1, -1, -1,     0, 0, 0,

    // left
    -1, -1, -1,     0, 0, 0,
    -1, -1,  1,     1, 1, 0,
    -1,  1, -1,     1, 1, 0,
    -1,  1,  1,     1, 1, 0,

    // top
    -1,  1, -1,     1, 0, 1,
    -1,  1,  1,     1, 0, 1,
     1,  1, -1,     1, 0, 1,
     1,  1,  1,     1, 1, 1,

    // bottom
    -1, -1,  1,     0, 1, 1,
    -1, -1, -1,     0, 0, 0,
     1, -1,  1,     0, 1, 1,
     1, -1, -1,     0, 1, 1,
  ],
  indices:
  [
     0,  1,  2,  2,  1,  3,
     4,  5,  6,  6,  5,  7,
     8,  9, 10, 10,  9, 11,
    12, 13, 14, 14, 13, 15,
    16, 17, 18, 18, 17, 19,
    20, 21, 22, 22, 21, 23
  ]
};

async function fetch_buffer(url) {
  if (url.startsWith('data:')) {
    return Buffer.from(url.split(",")[1], 'base64');
  } else {
    return Buffer.from(await fetch(url).arrayBuffer());
  }
}

function loadImage(url) {
  return new Promise(resolve => {
      const image = new Image();
      image.addEventListener("load", () => {
          resolve(image);
      });
      image.src = url;
  });
}

async function loadglTF(device, url) {
  try {
    let model = await (await fetch(url)).text();
    let model_json = JSON.parse(model);
    
    // Load all buffers
    for (let i = 0; i < model_json.buffers.length; i++) {
      model_json.buffers[i] = await fetch_buffer(model_json.buffers[i].uri);
    }

    // Load all images
    for (let i = 0; i < model_json.images.length; i++) {
      let image_desc = model_json.images[i];
      let image = null;

      // Try to load image from URI
      if (image_desc.uri !== undefined) {
        image = await loadImage(image_desc.uri);      
      }

      // Try to read from buffer
      if (image === null && image_desc.mimeType !== undefined && image_desc.bufferView !== undefined) {
        let view = model_json.bufferViews[image_desc.bufferView];
        let type = image_desc.mimeType;
        let subbuf = model_json.buffers[view.buffer].subarray(view.byteOffset, view.byteOffset + view.byteLength);

        image = await loadImage('data:' + type + ';base64,' + subbuf.toString('base64'));
      }
      
      if (image === null) {
        throw("Incorrect image description");
      }

      model_json.images[i] = await CreateTextureFromImg(device, image);
    }

    console.log(model_json);

    return {};
  } catch (e) {
    console.error(`Failed to load model from ${url}`);

    return {};
  }
}

export async function LoadModel(device) {
  const vert_buffer = CreateBuffer(device, cubeData.vertices.length * 4, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, new Float32Array(cubeData.vertices));
  const ind_buffer = CreateBuffer(device, cubeData.indices.length * 4, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, new Uint32Array(cubeData.indices));

  let pipeline_desc = default_pipeline(device);
  pipeline_desc.depthStencil = {
    format: "depth24plus",
    depthWriteEnabled: true,
    depthCompare: "less"
  };

  return {
    ind : ind_buffer,
    vert : vert_buffer,
    cnt : cubeData.indices.length,
    pipeline : device.createRenderPipeline(pipeline_desc),
    draw : function (renderPass) {
      renderPass.setPipeline(this.pipeline);
      renderPass.setBindGroup(0, this.uniform_bind_group);

      renderPass.setVertexBuffer(0, this.vert);
      renderPass.setIndexBuffer(this.ind, "uint32");

      renderPass.drawIndexed(this.cnt, 1, 0, 0);
    }
  };
}
