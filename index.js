const express = require('express')
const app = express()
const port = process.env.PORT || 3131
const bukalapak = require('./marketplace/bukalapak')

console.clear()

app.get('/', (req, res) => res.status(200).json({ status: 'ok', author: 'LordRiyan (lordriyan.github.io)' }))
app.get('/bukalapak/product/:userid', async (req, res) => {
    // let data = await bukalapak.getProductsByUser("zainizubair");
    res.status(200).json(data);
})
app.get('/bukalapak/user/:username', async (req, res) => {
    let data = await bukalapak.getUserDetail(req.params.username);

    res.header("Content-Type", 'application/json')
       .send(JSON.stringify(data, null, 4));
})

app.listen(port, () => console.log(`App listening on http://localhost:${port} !`))
