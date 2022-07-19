#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) in vec3 fragPos;
layout(location = 1) in vec3 fragNorm;
layout(location = 2) in vec2 fragTexCoord;

layout(location = 0) out vec4 outColor;

layout(binding = 1) uniform sampler2D texSampler;

layout(binding = 2) uniform GlobalUniformBufferObject {
	
	vec3 eyePos;

	vec3 lightDir_directional;
	vec3 lightColor_directional;

	vec3 lightDir_spotlight;
	vec3 lightColor_spotlight;
	vec3 lightPos_spotlight;
	vec4 coneInOutDecayExp_spotlight;


	vec3 lightDir_pointlight;
	vec3 lightColor_pointlight;
	vec3 lightPos_pointlight;
	vec4 coneInOutDecayExp_pointlight;

	vec4 selector;

} gubo;



vec3 direct_light_dir(vec3 pos) {
	// Directional light direction
	return vec3(gubo.lightDir_directional.x, gubo.lightDir_directional.y, gubo.lightDir_directional.z);
}

vec3 direct_light_color(vec3 pos) {
	// Directional light color
	return vec3(gubo.lightColor_directional.x, gubo.lightColor_directional.y, gubo.lightColor_directional.z);
}

vec3 point_light_dir(vec3 pos) {
	// Point light direction


	vec3 dir = normalize(gubo.lightPos_pointlight - pos);

	return dir;
}

vec3 point_light_color(vec3 pos) {
	// Point light color


	float mod_distance = length(gubo.lightPos_pointlight - pos);
	
	float decay = pow( (gubo.coneInOutDecayExp_pointlight.z / mod_distance), gubo.coneInOutDecayExp_pointlight.w);



	return gubo.lightColor_pointlight * decay;
}




vec3 spot_light_dir(vec3 pos) {
	// Spot light direction
	
	vec3 dir = normalize(gubo.lightPos_pointlight - pos);

	return dir;
}

vec3 spot_light_color(vec3 pos) {
	// Spot light color

	vec3 normalized_vector_p_to_l = normalize(gubo.lightPos_spotlight - pos);

	float mod_distance = length(gubo.lightPos_spotlight - pos);
	
	float decay = pow( (gubo.coneInOutDecayExp_spotlight.z / mod_distance), gubo.coneInOutDecayExp_spotlight.w);

	float cos_light_spot = dot(normalized_vector_p_to_l, gubo.lightDir_spotlight);

	//nella clamp ci vogliono tre argomenti: il valore da clampare, min e max!
	float clamp_function = clamp( (cos_light_spot - gubo.coneInOutDecayExp_spotlight.x) / (gubo.coneInOutDecayExp_spotlight.y - gubo.coneInOutDecayExp_spotlight.x), 0, 1);

	return gubo.lightColor_spotlight * decay * clamp_function;
}






void main() {
	vec3 Norm = normalize(fragNorm);
	vec3 EyeDir = normalize(gubo.eyePos - fragPos);

	vec3 DifCol = texture(texSampler, fragTexCoord).rgb;

	vec3 spotLightColor = spot_light_color(fragPos);
	vec3 spotLightDir = spot_light_dir(fragPos);


	//lambert
	vec3 Diffuse_spotlight = DifCol * (max(dot(Norm, gubo.lightDir_spotlight),0.0f) * 0.9f + 0.1f);
	

	//lambert
	vec3 Diffuse = DifCol * (max(dot(Norm, gubo.lightDir_directional),0.0f) * 0.9f + 0.1f);
	//vec3 Specular = vec3(pow(max(dot(EyeDir, -reflect(gubo.lightDir_directional, Norm)),0.0f), 64.0f));

	outColor = vec4((Diffuse /*+ Specular*/) * gubo.lightColor_directional.rgb, 1.0f);
	outColor += vec4((Diffuse_spotlight /*+ Specular_spotlight*/) * spotLightColor, 1.0f);
		
	


}