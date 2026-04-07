package main

import (
	"fmt"
	_ "fmt"
	"main/utils"
	"net/http"
	_ "net/http"

	"main/models"

	"github.com/gin-gonic/gin"
	_ "github.com/gin-gonic/gin"
)

var personas = []models.MPerson{
	{Id: "1", Nombre: "Jhon", Apellidos: "Leturne", Edad: 22, Correo: "ejemplo@gmail.com", Numero_telefono: "0999999999"},
	{Id: "2", Nombre: "dsfsd", Apellidos: "sdfsdfdfs", Edad: 22, Correo: "sdfsdf@gmail.com", Numero_telefono: "0945782563"},
}

func getPersons(c *gin.Context) {
	fmt.Println(personas)
	c.IndentedJSON(http.StatusOK, personas)
}

func postPersons(c *gin.Context) {
	var newPerson models.MPerson
	if err := c.BindJSON(&newPerson); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "error creating person"})
		return
	}
	personas = append(personas, newPerson)
	c.IndentedJSON(http.StatusCreated, newPerson)
}

func getPersonById(c *gin.Context) {
	id := c.Param("id")
	for _, a := range personas {
		if a.Id == id {
			c.IndentedJSON(http.StatusOK, a)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "person not found"})
}

func main() {
	fmt.Printf("La suma es: %0.f \n", utils.Fsuma(8, 8))
	fmt.Printf("La resta es: %0.f \n", utils.Fresta(8, 8))
	fmt.Printf("La multiplicacion es: %0.f \n", utils.Fmultiplicacion(8, 8))
	fmt.Printf("La division es: %0.f \n", utils.Fdivision(8, 8))
	fmt.Println("Hello World!")
	utils.InitWebSocket()
	router := gin.Default()
	router.GET("/persons", getPersons)
	router.POST("/persons", postPersons)
	router.GET("/persons/:id", getPersonById)
	router.Run("localhost:8080")
}
