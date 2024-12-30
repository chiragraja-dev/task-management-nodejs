const express = require('express');
const app = express();
const PORT = 5000
const taskRoute = require('./routes/taskRoutes')
app.use(express.json())

app.get('/', function (req, res) {
    res.send("getting api")
})
app.use('/', taskRoute);
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})