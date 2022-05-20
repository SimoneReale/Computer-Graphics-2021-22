#include <glm/glm.hpp>
#include <math.h>
#include <glm/gtc/matrix_transform.hpp>
#define GLM_FORCE_DEFAULT_ALIGNED_GENTYPES
#define GLM_FORCE_DEPTH_ZERO_TO_ONE
#define GLM_FORCE_RADIANS




// Create a look in direction matrix
 // Pos    -> Position of the camera
 // Angs.x -> direction (alpha)
 // Angs.y -> elevation (beta)
 // Angs.z -> roll (rho)

//*************************************************
//ATTENZIONE! Angs.x e Angs.y sono invertiti nella rotate, l'ho fatto per mantenere 
//consistenti i comandi rispetto alle frecce direzionali della tastiera
glm::mat4 LookInDirMat(glm::vec3 Pos, glm::vec3 Angs) {
	glm::mat4 out =
		glm::rotate(glm::mat4(1.0), -Angs.z, glm::vec3(0, 0, 1)) *
		glm::rotate(glm::mat4(1.0), -Angs.x, glm::vec3(0, 1, 0)) *
		glm::rotate(glm::mat4(1.0), -Angs.y, glm::vec3(1, 0, 0)) *
		glm::translate(glm::mat4(1.0), -Pos);
	return out;
}

// Create a look at matrix
// Pos    -> Position of the camera (c)
// aim    -> Posizion of the target (a)
// Roll   -> roll (rho)
glm::mat4 LookAtMat(glm::vec3 Pos, glm::vec3 aim, float Roll) {
	glm::mat4 out =
		glm::rotate(glm::mat4(1.0), glm::radians(- Roll), glm::vec3(0, 0, 1)) *
		glm::lookAt(Pos, aim, glm::vec3(0, 1, 0));
	return out;
}



