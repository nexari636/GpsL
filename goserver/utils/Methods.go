package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"math/big"
	rnd "math/rand"
	"time"

	"github.com/google/uuid"
)

// Genera una Key unica para que cada usuario se comunique con el websocket
func GenerateKey() string {
	fmt.Println("Generando Clave....")
	var uuid = uuid.New().String()
	var number_crypto_ramdom = Generate_Crypto_Number_ramdom().String()
	var num_ramdom = string(Generate_Number_ramdom(1, 1000))
	var current_date_time = Current_date_format_key()
	var concat_data = uuid + SecretKey + number_crypto_ramdom + num_ramdom + current_date_time
	var uuidb64 = StringToBase64(concat_data)
	fmt.Println("Clave generada.")
	return uuidb64
}

func StringToBase64(data string) string {
	return base64.StdEncoding.EncodeToString([]byte(data))
}

func Base64ToString(data string) string {
	decoded, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		fmt.Println("Error:", err)
		return ""
	}
	return string(decoded)
}

func Generate_Crypto_Number_ramdom() *big.Int {
	RandomCrypto, _ := rand.Prime(rand.Reader, 2048) //numero de 256 bytes
	return RandomCrypto
}

func Generate_Number_ramdom(min int, max int) int {
	source := rnd.NewSource(time.Now().UnixNano())
	rng := rnd.New(source)
	var ramdom = rng.Intn(max-min) + min
	return ramdom
}

func Current_date() time.Time {
	var time = time.Now()
	return time
}

// Format DDMMYYYYhhmmss
func Current_date_format_key() string {
	return Current_date().Format("02012006150405")
}

// Format DD-MM-YYYY hh:mm:ss
func Current_date_format_data() string {
	return Current_date().Format("02-01-2006 15:04:05")
}
