import { createBuffer } from "./helper";
import { vec3 } from "gl-matrix";

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

export const light_target_format = "rgba16float";

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
  var pos = array<vec2<f32>, 4>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0));
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
        format: light_target_format,
        blend: {
          color: {dstFactor: "one", operation: "add", srcFactor: "one"},
          alpha: {dstFactor: "one", operation: "add", srcFactor: "one"}
        }
      }]
    },
    primitive: {
      topology: "triangle-strip",
      cullMode: 'none'
    },
  };

  let uniform_buffer_size = 32;
  let uniform_buffer = createBuffer(device, uniform_buffer_size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
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

      rnd_pass.draw(4, 1, 0, 0);
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
  var pos = array<vec2<f32>, 4>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0));
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
  var color_shade : vec4<f32> = textureLoad(color_shade_tex, icoord, 0).xyzw;
  var color = color_shade.rgb;
  var shade = color_shade.w;
  
  return vec4<f32>(mix(color, color * lightData.color.rgb, shade), 1.0) * lightData.color.w;
}`      }),
      entryPoint: "main",
      targets: [{
        format: light_target_format,
        blend: {
          color: {dstFactor: "one", operation: "add", srcFactor: "one"},
          alpha: {dstFactor: "one", operation: "add", srcFactor: "one"}
        }
      }]
    },
    primitive: {
      topology: "triangle-strip",
      cullMode: 'none'
    },
  };

  let uniform_buffer_size = 16;
  let uniform_buffer = createBuffer(device, uniform_buffer_size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
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

      rnd_pass.draw(4, 1, 0, 0);
    },
    update: function (device, desc) {
      if (desc.color !== undefined) device.queue.writeBuffer(this.uniform_buffer, 0, new Float32Array(desc.color), 0, 4);
    }
  }
}
