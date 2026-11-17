package main

import (
	"fmt"
	"main/utils"
)

func Test_convert_String() {
	var datab64 = utils.StringToBase64("hola")
	var data = utils.Base64ToString(datab64)
	var key = utils.GenerateKey()

	fmt.Printf("Data base64= %s\n", datab64)
	fmt.Printf("Data= %s\n", data)
	fmt.Printf("Key= %s\n", key)
}

func ramdom_Crypto() {
	var number = utils.Generate_Crypto_Number_ramdom()
	fmt.Println("Numero aletorio: ", number)
}

func ramdom() {
	var number = utils.Generate_Number_ramdom(1, 1000)
	fmt.Println("Numero aletorio: ", number)
}

func date() {
	var time = utils.Current_date()
	var time_key = utils.Current_date_format_key()
	var time_data = utils.Current_date_format_data()
	fmt.Println("time1: ", time)
	fmt.Println("time2: ", time_key)
	fmt.Println("time3: ", time_data)

}

func main() {
	fmt.Println("Hello World!!")
	Test_convert_String()
	ramdom_Crypto()
	ramdom()
	date()
}
