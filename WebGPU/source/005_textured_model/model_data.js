import { CreateBuffer, CreateTextureFromImg, surface_format, fetchBuffer, loadImage, EmptyTexture } from './helper.js';
import { zipObject, keys as objectKeys, values as objectValues } from 'lodash';
import { vec2, vec3, mat4 } from 'gl-matrix';

const promiseAllValues = async obj => zipObject(objectKeys(obj), await Promise.all(objectValues(obj).map(val => Promise.resolve(val))));
const assert = (condition, message=null) => { if (!condition) throw message || "Assertion failed"; }

function castArray(arr, type) {   
  return new type(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / type.BYTES_PER_ELEMENT));
}

const shaders = {
  default:
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
  @location(1) tex0 : vec2<f32>,
  @location(2) normal : vec3<f32>,
}

struct vs_to_fs {
  @builtin(position) pos : vec4<f32>,
  @location(0) base_pos : vec3<f32>,
  @location(1) tex0 : vec2<f32>,
  @location(2) normal : vec3<f32>,
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
  output.normal = normalize((uniforms.InvModelMatr * vec4<f32>(input.normal, 0.0)).xyz);
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
}`,
  normal_map:
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
@group(0) @binding(5) var normal_map_sampler : sampler;
@group(0) @binding(6) var normal_map_texture : texture_2d<f32>;

struct vs_in {
  @location(0) pos : vec3<f32>,
  @location(1) tex0 : vec2<f32>,
  @location(2) tangent : vec3<f32>,
  @location(3) bitangent : vec3<f32>,
  @location(4) facing : f32,
}

struct vs_to_fs {
  @builtin(position) pos : vec4<f32>,
  @location(0) base_pos : vec3<f32>,
  @location(1) tex0 : vec2<f32>,
  @location(2) normal : vec3<f32>,
  @location(3) tangent : vec3<f32>,
  @location(4) bitangent : vec3<f32>,
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

  output.tangent = normalize((uniforms.InvModelMatr * vec4<f32>(input.tangent, 0.0)).xyz);
  output.bitangent = normalize((uniforms.InvModelMatr * vec4<f32>(input.bitangent, 0.0)).xyz);
  output.tex0 = input.tex0;

  var normal = normalize(cross(input.tangent, input.bitangent) * input.facing);
  output.normal = normalize((uniforms.InvModelMatr * vec4<f32>(normal, 0.0)).xyz);  

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

  var tangent : vec3<f32> = normalize(input.tangent);
  var bitangent : vec3<f32> = normalize(input.bitangent);
  var normal : vec3<f32> = normalize(input.normal);
  
  var basis : mat3x3<f32> = mat3x3<f32>(tangent, bitangent, normal);
  var new_normal : vec3<f32> = textureSample(normal_map_texture, normal_map_sampler, input.tex0).xyz * 2.0 - 1.0;
  new_normal = new_normal.x * tangent + new_normal.y * bitangent + new_normal.z * normal;

  output.pos_met = vec4<f32>(input.base_pos, base_met);
  output.norm_rough = vec4<f32>(normalize(new_normal), base_rough);
  if (is_met_rough_tex) {
    var tmp : vec2<f32> = textureSample(material_texture, material_sampler, input.tex0).xy;
    output.pos_met.w *= tmp.x;
    output.norm_rough.w *= tmp.y;
  }

  return output;
}`,
}

function evalNormals(forEach, count, positions) {
  let normals = new Float32Array(count * 3);

  let update_normal = (i0, i1, i2) => {
    let add_normal = (ind, norm) => {
      normals[ind * 3] += norm[0];
      normals[ind * 3 + 1] += norm[1];
      normals[ind * 3 + 2] += norm[2];
    }
    
    let
      v0 = vec3.clone(positions.subarray(i0 * 3, i0 * 3 + 3)),
      v1 = vec3.clone(positions.subarray(i1 * 3, i1 * 3 + 3)),
      v2 = vec3.clone(positions.subarray(i2 * 3, i2 * 3 + 3));
    vec3.subtract(v0, v0, v1); vec3.subtract(v2, v2, v1);
    vec3.cross(v1, v2, v0);
    vec3.normalize(v1, v1);

    add_normal(i0, v1);
    add_normal(i1, v1);
    add_normal(i2, v1);
  }

  forEach((i0, i1, i2) => {
    update_normal(i0, i1, i2);
  })

  for (let i = 2; i < normals.length; i += 3) {
    let norm = normals.subarray(i - 2, i + 1);
    vec3.normalize(norm, norm);
  }

  return normals;
}

function evalTangentSpace(forEach, count, positions, texture0) {
  let tangents = new Float32Array(count * 3);
  let bitangents = new Float32Array(count * 3);
  let normals = new Float32Array(count * 3);

  let add_to_arr = (arr, ind, vec) => {
    arr[ind * 3] += vec[0];
    arr[ind * 3 + 1] += vec[1];
    arr[ind * 3 + 2] += vec[2];
  }

  let update_normal = (i0, i1, i2) => {
    let add_normal = (ind, norm) => {
      add_to_arr(normals, ind, norm);
    }
    
    let
      v0 = vec3.clone(positions.subarray(i0 * 3, i0 * 3 + 3)),
      v1 = vec3.clone(positions.subarray(i1 * 3, i1 * 3 + 3)),
      v2 = vec3.clone(positions.subarray(i2 * 3, i2 * 3 + 3));
    vec3.subtract(v0, v0, v1); vec3.subtract(v2, v2, v1);
    vec3.cross(v1, v2, v0);
    vec3.normalize(v1, v1);

    add_normal(i0, v1);
    add_normal(i1, v1);
    add_normal(i2, v1);
  }

  forEach((i0, i1, i2) => {
    update_normal(i0, i1, i2);

    let v0 = vec3.clone(positions.subarray(i0 * 3, i0 * 3 + 3));
    let v1 = vec3.clone(positions.subarray(i1 * 3, i1 * 3 + 3));
    let v2 = vec3.clone(positions.subarray(i2 * 3, i2 * 3 + 3));

    let w0 = vec2.clone(texture0.subarray(i0 * 2, i0 * 2 + 2));
    let w1 = vec2.clone(texture0.subarray(i1 * 2, i1 * 2 + 2));
    let w2 = vec2.clone(texture0.subarray(i2 * 2, i2 * 2 + 2));
    
    let e1 = vec3.create(), e2 = vec3.create();
    vec3.subtract(e1, v1, v0);
    vec3.subtract(e2, v2, v0);

    let x1 = w1[0] - w0[0], x2 = w2[0] - w0[0];
    let y1 = w1[1] - w0[1], y2 = w2[1] - w0[1];

    let r = 1.0 / (x1 * y2 - x2 * y1);

    let t = vec3.create(), tmp = vec3.create();
    vec3.multiply(t, e1, [y2, y2, y2]);
    vec3.multiply(tmp, e2, [y1, y1, y1]);
    vec3.subtract(t, t, tmp);
    vec3.multiply(t, t, [r, r, r]);

    let b = vec3.create();
    vec3.multiply(b, e2, [x1, x1, x1]);
    vec3.multiply(tmp, e1, [x2, x2, x2]);
    vec3.subtract(b, b, tmp);
    vec3.multiply(b, b, [r, r, r]);

    add_to_arr(tangents, i0, t);
    add_to_arr(tangents, i1, t);
    add_to_arr(tangents, i2, t);

    add_to_arr(bitangents, i0, b);
    add_to_arr(bitangents, i1, b);
    add_to_arr(bitangents, i2, b);
  })

  let tangent_space = new Float32Array(count * 7);

  for (let i = 0; i < count; i++) {
    let norm = normals.subarray(i * 3, i * 3 + 3);
    vec3.normalize(norm, norm);

    let t = vec3.clone(tangents.subarray(i * 3, i * 3 + 3));
    vec3.normalize(t, t);
    let b = vec3.clone(bitangents.subarray(i * 3, i * 3 + 3));
    vec3.normalize(b, b);

    let tmp = vec3.dot(t, norm); tmp = [tmp, tmp, tmp];
    vec3.multiply(tmp, tmp, norm);
    vec3.subtract(t, t, tmp);
    vec3.normalize(t, t);

    tmp = vec3.dot(b, norm); tmp = [tmp, tmp, tmp];
    vec3.multiply(tmp, tmp, norm);
    vec3.subtract(b, b, tmp);
    vec3.normalize(b, b);

    let test_norm = vec3.create();
    vec3.cross(test_norm, t, b);

    tangent_space.set(t, i * 7);
    tangent_space.set(b, i * 7 + 3);
    tangent_space[i * 7 + 6] = (vec3.dot(test_norm, norm) > 0) ? 1 : -1;
  }

  return tangent_space;
}

export function loadglTF(device, url) {
  let model;

  function loadglTFMesh(mesh) {
    function readAccessor(ind, flags) {
      let accessor = model.accessors[ind];
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
      buffer.data = data;
      
      return buffer;
    }    

    function loadPrimitive(prim) {
      prim.vert_buffers = {}

      Object.entries(prim.attributes).forEach((elm) => {
        switch (elm[0]) {
          case 'POSITION':
            prim.vert_buffers.pos = readAccessor(elm[1], GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
            break;
          case 'TEXCOORD_0':
            prim.vert_buffers.tex0 = readAccessor(elm[1], GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
          default:
            // Just ignore other attributes
            break;
        }
      })

      // Validate vertex positions and texture coordinates buffers
      assert(prim.vert_buffers.pos !== undefined, "Missing vertex positions buffer");
      assert(prim.vert_buffers.tex0 !== undefined, "Missing texture coordinates buffer");
      assert((prim.elements = prim.vert_buffers.pos.count) == prim.vert_buffers.tex0.count, "Vertex position and texture coordinates buffers size dont't match");
      assert(prim.vert_buffers.pos.type == 'float32x3', "Incorrect vertex position type");
      assert(prim.vert_buffers.tex0.type == 'float32x2', "Incorrect texture coordinate type");

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
          entryPoint: 'vs_main',
          constants: {
          },
          buffers: [
            {arrayStride: 12, attributes: [{shaderLocation: 0, format: 'float32x3', offset: 0}]},
            {arrayStride: 8, attributes: [{shaderLocation: 1, format: 'float32x2', offset: 0}]},
          ],
        },
        fragment: {
          entryPoint: 'fs_main',
          constants: {
          },
          targets: [
            {format: 'rgba8unorm-srgb'},
            {format: 'rgba16float'},
            {format: 'rgba16float'},
          ]
        },
        primitive: {
          topology: (() => { switch (prim.mode) {
            case undefined: case 4: return "triangle-list";
            //case 0: return "point-list";
            //case 1: return "line-list"; 
            //case 3: return "line-strip";
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
        let material = model.materials[prim.material];

        if (material.normalTexture !== undefined) {
          let index = material.normalTexture.index;
          if (index === undefined) throw("Invalid texture descriptor");
          let tex = model.textures[index];
          
          bind_group_layout.entries.push(
            {binding: 5, visibility: GPUShaderStage.FRAGMENT, sampler: {type: "filtering"}},
            {binding: 6, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
          )
          prim.main_bind_group.entries.push({binding: 5, resource: model.samplers[tex.sampler]}, {binding: 6, resource: model.images[tex.source].createView()})
          prim.pipeline.vertex.buffers.push({arrayStride: 28, attributes: [{shaderLocation: 2, format: 'float32x3', offset: 0}, {shaderLocation: 3, format: 'float32x3', offset: 12}, {shaderLocation: 4, format: 'float32', offset: 24}]});
          prim.pipeline.fragment.module = prim.pipeline.vertex.module = device.createShaderModule({ code: shaders.normal_map });

          prim.normal_map = true;
        } else {
          prim.pipeline.vertex.buffers.push({arrayStride: 12, attributes: [{shaderLocation: 2, format: 'float32x3', offset: 0}]});
          prim.pipeline.fragment.module = prim.pipeline.vertex.module = device.createShaderModule({ code: shaders.default });

          prim.normal_map = false;
        }

        material = material.pbrMetallicRoughness;

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
          bind_group_layout.entries.push(
            {binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {type: "filtering"}},
            {binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
          )
          if (material.baseColorTexture !== undefined) {
            let index = material.baseColorTexture.index;
            if (index === undefined) throw("Invalid texture descriptor");
            let tex = model.textures[index];
            
            prim.pipeline.fragment.constants.is_color_tex = true;
            prim.main_bind_group.entries.push({binding: 1, resource: model.samplers[tex.sampler]}, {binding: 2, resource: model.images[tex.source].createView()})
          } else {
            let tmp = EmptyTexture(device);
            prim.main_bind_group.entries.push({binding: 1, resource: tmp.sampler}, {binding: 2, resource: tmp.texture.createView()})
          }
          
          bind_group_layout.entries.push(
            {binding: 3, visibility: GPUShaderStage.FRAGMENT, sampler: {type: "filtering"}},
            {binding: 4, visibility: GPUShaderStage.FRAGMENT, texture: {viewDimension: '2d'}}
          )
          if (material.metallicRoughnessTexture !== undefined) {
            let index = material.metallicRoughnessTexture.index;
            if (index === undefined) throw("Invalid texture descriptor");
            let tex = model.textures[index];
            
            prim.pipeline.fragment.constants.is_met_rough_tex = true;
            prim.main_bind_group.entries.push({binding: 3, resource: model.samplers[tex.sampler]}, {binding: 4, resource: model.images[tex.source].createView()})
          } else {
            let tmp = EmptyTexture(device);
            prim.main_bind_group.entries.push({binding: 3, resource: tmp.sampler}, {binding: 4, resource: tmp.texture.createView()})
          }
        }
      }

      let forEach;

      // Different behavior depending on indices existance
      if (prim.indices !== undefined) {
        prim.indices = readAccessor(prim.indices, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);
        prim.elements = prim.indices.count;

        assert(prim.indices.type == 'uint16' || prim.indices.type == 'uint32', "Invalid indices type");

        prim.draw = function (vp, trans, rnd_pass) {
          this.bind(vp, trans, rnd_pass);

          rnd_pass.setIndexBuffer(this.indices, prim.indices.type);
          rnd_pass.drawIndexed(this.elements, 1, 0, 0);
        }

        let indices = (prim.indices.type == 'uint16') ? castArray(prim.indices.data, Uint16Array) : castArray(prim.indices.data, Uint32Array);

        switch (prim.pipeline.primitive.topology) {
        case "triangle-list":
          forEach = func => {for (let i = 2; i < indices.length; i += 3) func(indices[i - 2], indices[i - 1], indices[i])}
          break;
        case "triangle-strip":
          forEach = func => {
            if (indices.length < 3) return;
            let i0 = indices[0], i1 = indices[1], i2 = indices[2], i = 2, flag = true;

            while (true) {
              func(i0, i1, i2)

              if (++i >= indices.length) break;
              if (indices[i] == -1) {
                i += 3;
                if (i >= indices.length) break;
                flag = true;

                i0 = indices[i - 2];
                i1 = indices[i - 1];
                i2 = indices[i];
              } else {
                if (flag) i0 = i2;
                else i1 = i2;
                
                i2 = indices[i];
                flag = !flag;
              }
            }
          }
          break;
        }
      } else {
        prim.draw = function (vp, trans, rnd_pass) {
          this.bind(vp, trans, rnd_pass);

          rnd_pass.draw(this.elements, 1, 0, 0);
        }

        switch (prim.pipeline.primitive.topology) {
          case "triangle-list":
            forEach = func => {for (let i = 2; i < prim.vert_buffers.pos.length; i += 3) func(i - 2, i - 1, i)}
            break;
          case "triangle-strip":
            forEach = func => {
              for (let i = 2, flag = true; i < prim.vert_buffers.pos.length; i += 3) {
                if (flag) func(i - 2, i - 1, i);
                else func(i - 1, i - 2, i);
                flag = !flag;
              }
            }
            break;
        }
      }

      if (prim.normal_map) {
        prim.vert_buffers.norm = evalTangentSpace(forEach, prim.vert_buffers.pos.count,
          castArray(prim.vert_buffers.pos.data, Float32Array), castArray(prim.vert_buffers.tex0.data, Float32Array));
      } else {
        prim.vert_buffers.norm = evalNormals(forEach, prim.vert_buffers.pos.count,
          castArray(prim.vert_buffers.pos.data, Float32Array));
      }

      prim.vert_buffers.norm = CreateBuffer(device, prim.vert_buffers.norm.length * 4, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, prim.vert_buffers.norm);
      /*delete prim.vert_buffers.pos.data;
      delete prim.vert_buffers.tex0.data;*/

      // Create bind group layout
      bind_group_layout = device.createBindGroupLayout(bind_group_layout);

      // Add pipaline layout
      prim.pipeline.layout = device.createPipelineLayout({bindGroupLayouts: [bind_group_layout]});

      // Create pipeline from final description
      //prim.pipeline.primitive.topology = "point-list";
      prim.pipeline = device.createRenderPipeline(prim.pipeline);

      // Create main bind group from final description
      prim.main_bind_group.layout = prim.pipeline.getBindGroupLayout(0);
      prim.main_bind_group = device.createBindGroup(prim.main_bind_group);

      prim.bind = function (vp, trans, rnd_pass) {
        let inv_vp = mat4.create(), inv_trans = mat4.create();
        mat4.invert(inv_vp, vp); mat4.invert(inv_trans, trans);
        mat4.transpose(inv_vp, inv_vp); mat4.transpose(inv_trans, inv_trans);

        let tmp = new Float32Array(this.uniform_buffer_size / 4);
        tmp.set(vp, 0); tmp.set(trans, 16); tmp.set(inv_vp, 32); tmp.set(inv_trans, 48);
        device.queue.writeBuffer(this.uniform_buffer, 0, tmp);

        rnd_pass.setPipeline(this.pipeline);
        rnd_pass.setBindGroup(0, this.main_bind_group);

        rnd_pass.setVertexBuffer(0, this.vert_buffers.pos);
        rnd_pass.setVertexBuffer(1, this.vert_buffers.tex0);
        rnd_pass.setVertexBuffer(2, this.vert_buffers.norm);
      }

      return prim;
    }

    mesh.primitives.forEach((val, ind, arr) => {
      arr[ind] = loadPrimitive(val);
    });

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

const light_shader_default =
`const PI = 3.141592653589793;

fn BRDF_PartialGeometry(cosThetaN : f32, alpha : f32) -> f32 {
  var cosTheta_sqr = clamp(cosThetaN * cosThetaN, 0.0, 1.0);
  var tan2 = (1 - cosTheta_sqr) / cosTheta_sqr;
  var GP = 2 / (1 + sqrt(1 + alpha * alpha * tan2));

  return GP;
}

fn BRDF_Distribution(cosThetaNH : f32, alpha : f32) -> f32 {
  var alpha2 = alpha * alpha;
  var NH_sqr = clamp(cosThetaNH * cosThetaNH, 0.0, 1.0);
  var den = NH_sqr * alpha2 + (1.0 - NH_sqr);
  
  return alpha2 / (PI * den * den);
}

fn BRDF_FresnelSchlick(F0 : vec3<f32>, cosTheta : f32) -> vec3<f32> {
  return F0 + (1.0 - F0) * pow(1.0 - clamp(cosTheta, 0.0, 1.0), 5.0);
}

fn BRDF_CookTorrance(norm : vec3<f32>, light_dir : vec3<f32>, view : vec3<f32>,
                     albedo : vec3<f32>, rough : f32, met : f32) ->vec3<f32> {
  var n = normalize(norm);
  var v = normalize(view);
  var l = normalize(light_dir);

  // Evaluate frenzel coefficient
  const dielectricSpecular = vec3<f32>(0.04, 0.04, 0.04);
  var f0 = mix(dielectricSpecular, albedo, met);

  var h = normalize(v + l);

  //precompute dots
  var NL = dot(n, l);
  if (NL <= 0.0) { return vec3<f32>(0.0, 0.0, 0.0); }

  var NV = dot(n, v);
  if (NV <= 0.0) { return vec3<f32>(0.0, 0.0, 0.0); }

  var NH = dot(n, h);
  var HV = dot(h, v);
  
  //precompute roughness square
  var roug_sqr = rough * rough;
  
  //calc coefficients
  var G = BRDF_PartialGeometry(NV, roug_sqr) * BRDF_PartialGeometry(NL, roug_sqr);
  var D = BRDF_Distribution(NH, roug_sqr);
  var F = BRDF_FresnelSchlick(f0, HV);

  //mix
  var specK = G * D * F * 0.25 / (NV + 0.001);    
  var diffK = clamp(vec3<f32>(1.0, 1.0, 1.0) - F, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));

  return max(vec3<f32>(0.0, 0.0, 0.0), albedo * diffK * NL / PI + specK);
}`;

export function createDirectLight(device, main_group_layout) {
  let uniform_bind_group_layout = device.createBindGroupLayout({
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {type: "uniform"},
    }]
  });

  let pipeline_desc = {
    layout: device.createPipelineLayout({bindGroupLayouts: [main_group_layout, uniform_bind_group_layout]}),
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
`struct scene_data {
  pos : vec3<f32>,
  width : f32,
  dir : vec3<f32>,
  height : f32
};
@group(0) @binding(0) var<uniform> sceneData : scene_data;

@group(0) @binding(1) var color_shade_tex : texture_2d<f32>;
@group(0) @binding(2) var pos_met_tex : texture_2d<f32>;
@group(0) @binding(3) var norm_rough_tex : texture_2d<f32>;

${light_shader_default}

struct light_data {
  color : vec4<f32>,
  dir : vec3<f32>,
};
@group(1) @binding(0) var<uniform> lightData : light_data;

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
  var icoord = vec2<i32>(floor(coord.xy));
  var color_shade : vec4<f32> = textureLoad(color_shade_tex, icoord, 0);
  var color = color_shade.rgb;
  var shade = color_shade.w;
  var pos_met : vec4<f32> = textureLoad(pos_met_tex, icoord, 0);
  var pos = pos_met.xyz;
  var met = pos_met.w;
  var norm_rough : vec4<f32> = textureLoad(norm_rough_tex, icoord, 0);
  var norm = norm_rough.xyz;
  var rough = norm_rough.w;
  
  //return vec4<f32>((color * max(0.13, dot(norm, lightData.dir))) * lightData.color.rgb, 1.0) * lightData.color.w;
  var shade_color = BRDF_CookTorrance(norm, lightData.dir, sceneData.pos - pos, color, rough, met);
  var res_color = vec4<f32>(shade_color * lightData.color.rgb * lightData.color.w, lightData.color.w);

  return res_color;
}`      }),
      entryPoint: "main",
      targets: [{
        format: surface_format,
        blend: {
          color: {dstFactor: "one", operation: "add", srcFactor: "one"},
          alpha: {dstFactor: "one", operation: "add", srcFactor: "one"}
        }
      }]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: 'none'
    },
  };

  let uniform_buffer_size = 32;
  let uniform_buffer = CreateBuffer(device, uniform_buffer_size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
  let uniform_bind_group = device.createBindGroup({
    layout: uniform_bind_group_layout,
    entries: [{
      binding: 0,
      resource: {
        buffer: uniform_buffer,
        offset: 0,
        size: uniform_buffer_size,
      }
    }]
  });

  return {
    pipeline: device.createRenderPipeline(pipeline_desc),
    uniform_buffer, uniform_bind_group, uniform_buffer_size,
    
    draw: function (bind_group, rnd_pass) {
      rnd_pass.setPipeline(this.pipeline);
      rnd_pass.setBindGroup(0, bind_group);
      rnd_pass.setBindGroup(1, this.uniform_bind_group);

      rnd_pass.draw(6, 1, 0, 0);
    },
    update: function (device, desc) {
      if (desc.color !== undefined) device.queue.writeBuffer(this.uniform_buffer, 0, new Float32Array(desc.color), 0, 4);
      if (desc.pos !== undefined) {
        let tmp = vec3.create();
        vec3.normalize(tmp, new Float32Array(desc.pos));                            

        device.queue.writeBuffer(this.uniform_buffer, 4 * 4, tmp, 0, 3);
      }
    }
  }
}

export function createAmbientLight(device, main_group_layout) {
  let uniform_bind_group_layout = device.createBindGroupLayout({
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {type: "uniform"},
    }]
  });

  let pipeline_desc = {
    layout: device.createPipelineLayout({bindGroupLayouts: [main_group_layout, uniform_bind_group_layout]}),
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
`@group(0) @binding(1) var color_shade_tex : texture_2d<f32>;

struct light_data {
  color : vec4<f32>
};
@group(1) @binding(0) var<uniform> lightData : light_data;

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
  var icoord = vec2<i32>(floor(coord.xy));
  var color_shade : vec4<f32> = textureLoad(color_shade_tex, icoord, 0);
  var color = color_shade.rgb;
  var shade = color_shade.w;
  
  return vec4<f32>(color * lightData.color.rgb, 1.0) * lightData.color.w;
}`      }),
      entryPoint: "main",
      targets: [{
        format: surface_format,
        blend: {
          color: {dstFactor: "one", operation: "add", srcFactor: "one"},
          alpha: {dstFactor: "one", operation: "add", srcFactor: "one"}
        }
      }]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: 'none'
    },
  };

  let uniform_buffer_size = 16;
  let uniform_buffer = CreateBuffer(device, uniform_buffer_size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
  let uniform_bind_group = device.createBindGroup({
    layout: uniform_bind_group_layout,
    entries: [{
      binding: 0,
      resource: {
        buffer: uniform_buffer,
        offset: 0,
        size: uniform_buffer_size,
      }
    }]
  });

  return {
    pipeline: device.createRenderPipeline(pipeline_desc),
    uniform_buffer, uniform_bind_group, uniform_buffer_size,
    
    draw: function (bind_group, rnd_pass) {
      rnd_pass.setPipeline(this.pipeline);
      rnd_pass.setBindGroup(0, bind_group);
      rnd_pass.setBindGroup(1, this.uniform_bind_group);

      rnd_pass.draw(6, 1, 0, 0);
    },
    update: function (device, desc) {
      if (desc.color !== undefined) device.queue.writeBuffer(this.uniform_buffer, 0, new Float32Array(desc.color), 0, 4);
    }
  }
}
