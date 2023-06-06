import { CreateBuffer, CreateTextureFromImg, surface_format, fetchBuffer, loadImage } from './helper.js';
import { zipObject, keys as objectKeys, values as objectValues } from 'lodash';
import { mat4 } from 'gl-matrix';

const promiseAllValues = async obj => zipObject(objectKeys(obj), await Promise.all(objectValues(obj).map(val => Promise.resolve(val))));

export function loadglTF(device, url) {
  let model;

  function loadglTFMesh(mesh) {
    function readAccessor(ind, flags) {
      let accessor = model.accessors[ind], view = model.bufferViews[accessor.bufferView];
      let [elm_size, type] = (() => {switch (accessor.componentType) {
        case 5120: return [1, accessor.normalized ? 'snorm8' : 'sint8'];
        case 5121: return [1, accessor.normalized ? 'unorm8' : 'uint8'];
        case 5122: return [2, accessor.normalized ? 'snorm16' : 'sint16'];
        case 5123: return [2, accessor.normalized ? 'unorm16' : 'uint16'];
        case 5125: return [4, 'uint32'];
        case 5126: return [4, 'float32'];
        default: throw("Unknown accessor component type");
      }})()

      switch (accessor.type) {
        case 'SCALAR': break;
        case 'VEC2': elm_size *= 2; type += 'x2'; break;
        case 'VEC3': elm_size *= 3; type += 'x3'; break;
        case 'VEC4': elm_size *= 4; type += 'x4'; break;
        default: throw("Unknown accessor type");
      }

      let size = accessor.count * elm_size;
      
      let data = null;
      if (accessor.bufferView !== undefined) {
        let view = model.bufferViews[accessor.bufferView];
        let offset = view.byteOffset;
        if (accessor.byteOffset) offset += accessor.byteOffset;

        data = model.buffers[view.buffer].subarray(offset, offset + size);
      }      

      let buffer = CreateBuffer(device, size, flags, data);
      buffer.count = accessor.count;
      buffer.elm_size = elm_size;
      buffer.type = type;
      
      return buffer;
    }    

    function loadPrimitive(prim) {
      prim.vert_buffers = {}
      Object.entries(prim.attributes).forEach((elm) => {
        switch (elm[0]) {
          case 'POSITION':
            prim.vert_buffers.pos = readAccessor(elm[1], GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
            prim.elements = (prim.elements !== undefined) ? Math.min(prim.elements, prim.vert_buffers.pos.count) : prim.vert_buffers.pos.count;
            break;
          case 'NORMAL':
            prim.vert_buffers.norm = readAccessor(elm[1], GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
            prim.elements = (prim.elements !== undefined) ? Math.min(prim.elements, prim.vert_buffers.norm.count) : prim.vert_buffers.norm.count;
            break;
          case 'TEXCOORD_0':
            prim.vert_buffers.tex0 = readAccessor(elm[1], GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
            prim.elements = (prim.elements !== undefined) ? Math.min(prim.elements, prim.vert_buffers.tex0.count) : prim.vert_buffers.tex0.count;
            break;
          default:
            // Just ignore other attributes
            break;
        }
      })

      if (Object.entries(prim.vert_buffers).length < 3) throw("Not enough vertex buffers");

      // Generate shader source
      let shader_module = device.createShaderModule({ code:
`struct Uniforms {
  VPMatr : mat4x4<f32>,
  ModelMatr : mat4x4<f32>,
  InvVPMatr : mat4x4<f32>,
  InvModelMatr : mat4x4<f32>,
};
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

// Base values and textures existance for color, metallic and roughness
override base_color_r : f32 = 1.0f;
override base_color_g : f32 = 1.0f;
override base_color_b : f32 = 1.0f;
override base_met : f32 = 1.0;
override base_rough : f32 = 1.0;
override is_color_tex : bool = false;
override is_met_rough_tex : bool = false;

// Textures and samplers
@group(0) @binding(1) var color_sampler : sampler;
@group(0) @binding(2) var color_texture : texture_2d<f32>;
@group(0) @binding(3) var material_sampler : sampler;
@group(0) @binding(4) var material_texture : texture_2d<f32>;

struct vs_in {
  @location(0) pos : vec3<f32>,
  @location(1) normal : vec3<f32>,
  @location(2) tex0 : vec2<f32>,
}

struct vs_to_fs {
  @builtin(position) pos : vec4<f32>,
  @location(0) base_pos : vec3<f32>,
  @location(1) normal : vec3<f32>,
  @location(2) tex0 : vec2<f32>,
};

struct fs_out {
  @location(0) color_shade : vec4<f32>,
  @location(1) pos_met : vec4<f32>,
  @location(2) norm_rough : vec4<f32>,
}

@vertex
fn vs_main(input : vs_in) -> vs_to_fs {
  var output : vs_to_fs;

  var pos : vec4<f32> = uniforms.ModelMatr * vec4<f32>(input.pos, 1.0);
  output.pos = uniforms.VPMatr * pos;
  output.base_pos = pos.xyz;
  output.normal = normalize((uniforms.InvVPMatr * uniforms.InvModelMatr * vec4<f32>(input.normal, 0.0)).xyz);
  output.tex0 = input.tex0;

  return output;
}

@fragment
fn fs_main(input : vs_to_fs) -> fs_out
{
  var output : fs_out;
  
  output.color_shade = vec4<f32>(base_color_r, base_color_g, base_color_b, 1.0);
  if (is_color_tex) {
    output.color_shade = vec4<f32>(output.color_shade.xyz * textureSample(color_texture, color_sampler, input.tex0).xyz, 1.0);
  }

  output.pos_met = vec4<f32>(input.base_pos, base_met);
  output.norm_rough = vec4<f32>(normalize(input.normal), base_rough);
  if (is_met_rough_tex) {
    var tmp : vec2<f32> = textureSample(material_texture, material_sampler, input.tex0).xy;
    output.pos_met.w *= tmp.x;
    output.norm_rough.w *= tmp.y;
  }

  return output;
}`})

      prim.uniform_buffer_size = (4 * 16) * 4;
      prim.uniform_buffer = device.createBuffer({
        size: prim.uniform_buffer_size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      
      let bind_group_layout = {
        entries: [{
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {type: "uniform"},
        }]
      }

      // Prepare main bind group description
      prim.main_bind_group = {
        entries: [{
            binding: 0,
            resource: {
              buffer: prim.uniform_buffer,
              offset: 0,
              size: prim.uniform_buffer_size,
            }
          }
        ]
      };

      // Prepare pipeline description
      prim.pipeline = {
        vertex: {
          module: shader_module,
          entryPoint: 'vs_main',
          constants: {
          },
          buffers: [
            {arrayStride: prim.vert_buffers.pos.elm_size, attributes: [{shaderLocation: 0, format: prim.vert_buffers.pos.type, offset: 0}]},
            {arrayStride: prim.vert_buffers.norm.elm_size, attributes: [{shaderLocation: 1, format: prim.vert_buffers.norm.type, offset: 0}]},
            {arrayStride: prim.vert_buffers.tex0.elm_size, attributes: [{shaderLocation: 2, format: prim.vert_buffers.tex0.type, offset: 0}]}
          ],
        },
        fragment: {
          module: shader_module,
          entryPoint: 'fs_main',
          constants: {
          },
          targets: [
            {format: 'rgba8unorm'},
            {format: 'rgba8unorm'},
            {format: 'rgba8unorm'},
          ]
        },
        primitive: {
          topology: (() => { switch (prim.mode) {
            case undefined: case 4: return "triangle-list";
            case 0: return "point-list";
            case 1: return "line-list"; 
            case 3: return "line-strip";
            case 5: return "triangle-strip";
            default: throw("unsupported primitive topology");
          }})(),
          cullMode: 'none',
          frontFace: 'ccw',
        },
        depthStencil: {
          format: "depth24plus",
          depthWriteEnabled: true,
          depthCompare: "less"
        },
      }

      // Read material
      if (prim.material !== undefined) {
        let material = model.materials[prim.material].pbrMetallicRoughness;

        if (material !== undefined) {
          // Read constants
          if (material.baseColorFactor !== undefined) {
            prim.pipeline.fragment.constants.base_color_r = material.baseColorFactor[0];
            prim.pipeline.fragment.constants.base_color_g = material.baseColorFactor[1];
            prim.pipeline.fragment.constants.base_color_b = material.baseColorFactor[2];
          }
          if (material.metallicFactor !== undefined) prim.pipeline.fragment.constants.base_met = material.metallicFactor;
          if (material.roughnessFactor !== undefined) prim.pipeline.fragment.constants.base_rough = material.roughnessFactor;

          // Read textures
          if (material.baseColorTexture !== undefined) {
            let index = material.baseColorTexture.index;
            if (index === undefined) throw("Invalid texture descriptor");
            let tex = model.textures[index];
            
            prim.pipeline.fragment.constants.is_color_tex = true;
            bind_group_layout.entries.push(
              {binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {type: "filtering"}},
              {binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
            )
            prim.main_bind_group.entries.push({binding: 1, resource: model.samplers[tex.sampler]}, {binding: 2, resource: model.images[tex.source].createView()})
          }
          if (material.metallicRoughnessTexture !== undefined) {
            let index = material.metallicRoughnessTexture.index;
            if (index === undefined) throw("Invalid texture descriptor");
            let tex = model.textures[index];
            
            prim.pipeline.fragment.constants.is_met_rough_tex = true;
            bind_group_layout.entries.push(
              {binding: 3, visibility: GPUShaderStage.FRAGMENT, sampler: {type: "filtering"}},
              {binding: 4, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
            )
            prim.main_bind_group.entries.push({binding: 3, resource: model.samplers[tex.sampler]}, {binding: 4, resource: model.images[tex.source].createView()})
          }
        }
      }

      // Create bind group layout
      bind_group_layout = device.createBindGroupLayout(bind_group_layout);

      // Add pipaline layout
      prim.pipeline.layout = device.createPipelineLayout({bindGroupLayouts: [bind_group_layout]});

      // Create pipeline from final description
      prim.pipeline = device.createRenderPipeline(prim.pipeline);

      // Create main bind group from final description
      prim.main_bind_group.layout = prim.pipeline.getBindGroupLayout(0);
      prim.main_bind_group = device.createBindGroup(prim.main_bind_group);

      prim.bind = function (vp, trans, rnd_pass) {
        let inv_vp = mat4.create(), inv_trans = mat4.create();
        mat4.invert(inv_vp, vp); mat4.invert(inv_trans, trans);

        let tmp = new Float32Array(this.uniform_buffer_size / 4);
        tmp.set(vp, 0); tmp.set(trans, 16); tmp.set(inv_vp, 32); tmp.set(inv_trans, 48);
        device.queue.writeBuffer(this.uniform_buffer, 0, tmp);

        rnd_pass.setPipeline(this.pipeline);
        rnd_pass.setBindGroup(0, this.main_bind_group);

        rnd_pass.setVertexBuffer(0, this.vert_buffers.pos);
        rnd_pass.setVertexBuffer(1, this.vert_buffers.norm);
        rnd_pass.setVertexBuffer(2, this.vert_buffers.tex0);
      }

      if (prim.indices !== undefined) {
        prim.indices = readAccessor(prim.indices, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);
        prim.elements = prim.indices.count;

        prim.draw = function (vp, trans, rnd_pass) {
          this.bind(vp, trans, rnd_pass);

          rnd_pass.setIndexBuffer(this.indices, prim.indices.type);
          rnd_pass.drawIndexed(this.elements, 1, 0, 0);
        }
      } else {
        prim.draw = function (vp, trans, rnd_pass) {
          this.bind(vp, trans, rnd_pass);

          rnd_pass.draw(this.elements, 1, 0, 0);
        }
      }

      return prim;
    }

    mesh.primitives.forEach(val => loadPrimitive(val));

    mesh.draw = function (vp, trans, rnd_pass) {
      mesh.primitives.forEach(val => val.draw(vp, trans, rnd_pass));
    }

    return mesh;
  }

  return fetch(url)
    .then(responce => {
      // Validate responce status
      if (!responce.ok) throw(`Failed to load model file.\nURL: ${responce.url}\nError code: ${responce.status}`);

      // Get JSON from model source
      return responce.json();
    })
    .then(model_json => {
      model = model_json;

      // Load all buffers to memory
      return Promise.all(model.buffers.map(val => fetchBuffer(val.uri)));
    })
    .then(buffers => {
      model.buffers = buffers;

      // Load all images to GPU
      return Promise.all(model.images.map(val => {
        let uri;
  
        if (val.uri !== undefined) {
          uri = val.uri;
        } else if (val.mimeType !== undefined && val.bufferView !== undefined) {
          let view = model.bufferViews[val.bufferView];
          let subbuf = model.buffers[view.buffer].subarray(view.byteOffset, view.byteOffset + view.byteLength);
  
          uri = `data:${val.mimeType};base64,${subbuf.toString('base64')}`;
        } else {
          throw ("Incorrect image description");
        }
  
        return loadImage(uri).then(val => CreateTextureFromImg(device, val));
      }));
    })
    .then(images => {
      model.images = images;

      // Create all samplers
      model.samplers.forEach((val, ind, arr) => {
        arr[ind] = {
          addressModeU: (() => {switch (val.wrapS) {
            case 33071: return "clamp-to-edge";
            case undefined: case 10497: return "repeat";
            case 33648: return "mirror-repeat";
            default: throw("Unknown addressing mode");
          }})(),
          addressModeV: (() => {switch (val.wrapT) {
            case 33071: return "clamp-to-edge";
            case undefined: case 10497: return "repeat";
            case 33648: return "mirror-repeat";
            default: throw("Unknown addressing mode");
          }})(),
          magFilter: (() => {switch (val.magFilter) {
            case 9728: return "nearest";
            case undefined: case 9729: return "linear";
            default: throw("Unknown mag filter");
          }})(),
        }

        switch (val.minFilter) {
          case undefined: case 9987: case 9729: arr[ind].minFilter = "linear"; arr[ind].mipmapFilter = "linear"; break;
          case 9986: case 9728: arr[ind].minFilter = "nearest"; arr[ind].mipmapFilter = "nearest"; break;
          case 9984: arr[ind].minFilter = "nearest"; arr[ind].mipmapFilter = "nearest"; break;
          case 9985: arr[ind].minFilter = "linear"; arr[ind].mipmapFilter = "nearest"; break;
          default: throw("Unknown min filter");
        }

        arr[ind] = device.createSampler(arr[ind]);
      })

      // Recursive function
      function processNode (node) {
        let new_node = {};

        // Process mesh
        if (node.mesh !== undefined) new_node.mesh = loadglTFMesh(model.meshes[node.mesh])

        // Process transform
        new_node.transform = mat4.create();
        
        if (node.matrix !== undefined) {
          // Just set transposed matrix from model
          mat4.transpose(new_node.transform, node.matrix)
        } else {
          // Set initial identity
          mat4.identity(new_node.transform);
          
          // Read exisiting partial transforms from node in following order: Transpose -> Rotation -> Scale
          if (node.translate !== undefined) mat4.translate(new_node.transform, new_node.transform, node.translate);
          if (node.rotation !== undefined) {
            let tmp = mat4.create();
            mat4.fromQuat(tmp, node.rotation);
            mat4.multiply(new_node.transform, tmp, new_node.transform);
          }
          if (node.scale !== undefined) mat4.scale(new_node.transform, new_node.transform, node.scale);
        }

        // Process child nodes
        if (node.children !== undefined) new_node.children = Promise.all(node.children.map(val => processNode(model.nodes[val])))

        new_node.draw = function (vp, trans, rnd_pass) {
          let new_trans = mat4.create();
          mat4.multiply(new_trans, this.transform, trans);

          if (this.mesh !== undefined) this.mesh.draw(vp, new_trans, rnd_pass);
          if (this.children !== undefined) this.children.forEach(val => val.draw(vp, new_trans, rnd_pass));
        }
      
        return promiseAllValues(new_node)
      }

      // Process all nodes
      return Promise.all(model.scenes[model.scene].nodes.map(node => processNode(model.nodes[node]))); 
    })
    .then(nodes => {
      model.nodes = nodes;

      model.draw = function(vp, trans, rnd_pass) {
        this.scenes[this.scene].nodes.forEach(val => this.nodes[val].draw(vp, trans, rnd_pass));
      }

      // Return complete model
      return model;
    })
    // Validation for returning empty object when error
    .catch(error => {
      console.error(error);
      return {}; 
    });
}

export function CreateDefaultLight(device, gbuffers_group_layout) {
  let pipeline_desc = {
    layout: device.createPipelineLayout({bindGroupLayouts: [gbuffers_group_layout]}),
    vertex: {
      module: device.createShaderModule({ code:
`@vertex
fn main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 6>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 1.0));
  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}`      }),
      entryPoint: "main"
    },
    fragment: {
      module: device.createShaderModule({ code:
`@group(0) @binding(0) var color_shade_tex : texture_2d<f32>;
@group(0) @binding(1) var pos_met_tex : texture_2d<f32>;
@group(0) @binding(2) var norm_rough_tex : texture_2d<f32>;

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(textureLoad(color_shade_tex, vec2<i32>(floor(coord.xy)), 0).rgb, 1.0);
}`      }),
      entryPoint: "main",
      targets: [{ format: surface_format }]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: 'none'
    },
  };

  return {
    pipeline: device.createRenderPipeline(pipeline_desc),
    draw: function (bind_group, rnd_pass) {
      rnd_pass.setPipeline(this.pipeline);
      rnd_pass.setBindGroup(0, bind_group);

      rnd_pass.draw(6, 1, 0, 0);
    }
  }
}
