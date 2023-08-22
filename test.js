let date = "2023-08-20T17:00:00.000Z"
console.log(new Date(date).toLocaleDateString() < new Date().toLocaleDateString())
console.log(new Date(date).toLocaleDateString(), new Date().toLocaleDateString())