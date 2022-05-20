#include <GLFW/glfw3.h>
#include <iostream>
#include <stdexcept>
#include <cstdlib>
#include <vector>
#include <cstring>
#include <optional>
#include <set>
#include <cstdint>
#include <algorithm>
#include <fstream>
#include <array>
#include <unordered_map>

#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEFAULT_ALIGNED_GENTYPES
#define GLM_FORCE_DEPTH_ZERO_TO_ONE
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/hash.hpp>

#include <chrono>



typedef struct Trajectory_Point {

	glm::vec3 pos;
	glm::vec3 tangent;


} Trajectory_Point;



/*std::vector<Trajectory_Point>*/ 
void calculateTrajectory(glm::vec3 source_point, glm::vec3 destination_point) {



	glm::vec3 source_dest_vector = glm::vec3(destination_point - source_point);

	glm::vec3 normal_plane_xz = glm::vec3(0, 1, 0);

	glm::vec3 normalized_projection_xz_vec_source_dest = glm::normalize(source_dest_vector - (dot(source_dest_vector, normal_plane_xz) * normal_plane_xz));


	glm::vec3 ux = glm::vec3(1, 0, 0);



	glm::vec3 axis_of_rotation = glm::cross(normalized_projection_xz_vec_source_dest, ux);


	float angle_of_rotation = asin(glm::length(axis_of_rotation));


	glm::mat4 rot = glm::rotate(glm::mat4(1), angle_of_rotation, axis_of_rotation);




	glm::vec4 source_on_plane_xy = rot * glm::vec4(source_point, 1);

	glm::vec4 destination_on_plane_xy = rot * glm::vec4(destination_point, 1);




	printf("\nSource: %f %f %f		Destination: %f %f %f\n", source_point.x, source_point.y, source_point.z, destination_point.x, destination_point.y, destination_point.z);
	printf("\nS_xy: %f %f %f	D_xy: %f %f %f\n", source_on_plane_xy.x, source_on_plane_xy.y, source_on_plane_xy.z, destination_on_plane_xy.x, destination_on_plane_xy.y, destination_on_plane_xy.z);


}