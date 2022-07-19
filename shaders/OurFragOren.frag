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

	
	//uso Oren Nayar
	vec3 CompColor =  OrenNayarDiffuseAmbient(Norm, EyeDir, DifCol, DifCol, 1.2f);
	outColor = vec4(CompColor, 1.0f);
		
	
	
	
}