const bcrypt = require("bcrypt");

const password = "123";

// Generar un nuevo hash de "123" para comparar
bcrypt.hash(password, 10).then((newHash) => {
    console.log("Nuevo hash generado:", newHash);

    // Comparar el nuevo hash con el que tienes en la base de datos
    bcrypt.compare(password, newHash).then((isMatch) => {
        console.log("¿Coincide la contraseña?", isMatch);
    });
});
