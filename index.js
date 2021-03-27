/**
 *  Library and Modules Section
 */

    const express = require('express')
    const app = express()
    const port = process.env.PORT || 3131
    const bukalapak = require('./marketplace/bukalapak')

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

    console.clear()

/**
 * Index page
 */

    app.get('/', (req, res) => { 
        let data = {
            status: 'alive',
            author: {
                name: 'LordRiyan',
                website: 'https://lordriyan.github.io/'
            }
        }
        
        res.header("Content-Type", 'application/json').send(JSON.stringify(data, null, 4))
    })

/**
 * Bukalapak (https://www.bukalapak.com/)
 */

    app.get('/bukalapak/user/:username', async (req, res) => {
        let data = await bukalapak.getUserDetail(req.params.username);
        res.header("Content-Type", 'application/json').send(JSON.stringify(data, null, 4))
    })
    app.get('/bukalapak/products/:userid', async (req, res) => {
        let data = await bukalapak.getProductsByUser(req.params.userid);
        res.header("Content-Type", 'application/json').send(JSON.stringify(data, null, 4))
    })

/**
 * Tokopedia (https://www.tokopedia.com/)
 */


/**
 * Debug page
 */

    app.get('/debug', async (req, res) => {
        let data = req.headers

        res.send(JSON.stringify(data, null, 4));
    })






/**
 * Express listen to request
 */

    app.listen(port, () => console.log(`App listening on http://localhost:${port} !`))
