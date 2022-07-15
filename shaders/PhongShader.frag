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


vec3 OrenNayarDiffuseAmbient(vec3 N, vec3 V, vec3 Cd, vec3 Ca, float sigma) {
	// Oren Nayar Diffuse + Ambient
	// No Specular
	// One directional light (lightDir0 and lightColor0)
	//
	// Parameters are:
	//
	// vec3 N : normal vector
	// vec3 V : view direction
	// vec3 Cd : main color (diffuse color)
	// vec3 Ca : ambient color
	// float sigma : roughness of the material

	float theta_i = acos(dot(gubo.lightDir_directional, N));
	float theta_r = acos(dot(V, N));
	float alfa = max(theta_i, theta_r);
	float beta = min(theta_i, theta_r);

	float A = 1 - (0.5 * (pow(sigma, 2) / pow(sigma, 2) + 0.33));
	float B = 0.45 * (pow(sigma, 2) / pow(sigma, 2) + 0.09);


	vec3 vi = normalize(gubo.lightDir_directional - (dot(gubo.lightDir_directional, N) * N));
	vec3 vr = normalize(V - (dot(V, N) * N));

	float G = max(0, dot(vi,vr));

	vec3 ambient_contribution = Ca * Cd;

	vec3 newColor = (Cd * clamp(dot(gubo.lightDir_directional, N), 0, 1) * (A + (B * G * sin(alfa) * tan(beta)))) + ambient_contribution;
	
	return newColor;
}



void main() {
	vec3 Norm = normalize(fragNorm);
	vec3 EyeDir = normalize(gubo.eyePos - fragPos);

	float AmbFact = 0.025;
	vec3 DifCol = texture(texSampler, fragTexCoord).rgb;

	vec3 spotLightColor = spot_light_color(fragPos);
	vec3 spotLightDir = spot_light_dir(fragPos);

	vec3 Specular_spotlight = vec3(pow(max(dot(EyeDir, -reflect(spotLightDir, Norm)),0.0f), 64.0f));
	vec3 Diffuse_spotlight = DifCol * (max(dot(Norm, gubo.lightDir_spotlight),0.0f) * 0.9f + 0.1f);
	



	if(gubo.selector.x == 1){

		//uso Oren Nayar
		vec3 CompColor =  OrenNayarDiffuseAmbient(Norm, EyeDir, DifCol, vec3(1,0,0), 1.2f);
		outColor = vec4(CompColor, 1.0f);
		
	}

	else if(gubo.selector.x == 0){
	//uso Phong
		vec3 Diffuse = DifCol * (max(dot(Norm, gubo.lightDir_directional),0.0f) * 0.9f + 0.1f);
		vec3 Specular = vec3(pow(max(dot(EyeDir, -reflect(gubo.lightDir_directional, Norm)),0.0f), 64.0f));

		outColor = vec4((Diffuse /*+ Specular*/) * gubo.lightColor_directional.rgb, 1.0f);
		outColor += vec4((Diffuse_spotlight /*+ Specular_spotlight*/) * spotLightColor, 1.0f);
		
	}else{
	
		outColor = vec4(1,0,0,1);
	
	}
}