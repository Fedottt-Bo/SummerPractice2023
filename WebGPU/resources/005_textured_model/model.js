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

export async function LoadModel(device) {
  const vert_buffer = device.createBuffer({
    size: cubeData.vertices.length * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });
  new Float32Array(vert_buffer.getMappedRange()).set(new Float32Array(cubeData.vertices));
  vert_buffer.unmap();

  const ind_buffer = device.createBuffer({
    size: cubeData.indices.length * 4,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });
  new Uint32Array(ind_buffer.getMappedRange()).set(new Uint32Array(cubeData.indices));
  ind_buffer.unmap();

  return { ind : ind_buffer, vert : vert_buffer, cnt : cubeData.indices.length };
}
