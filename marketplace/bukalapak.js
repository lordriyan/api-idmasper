const config = require('../config')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin()) // To bypass captcha

module.exports = {
    /**
     * Get user information by username
     * @param {String} username You can get username a user by look at they profile url
     * @returns Detail from a user
     */
    getUserDetail: function(username){
        return new Promise((resolve, reject) => {
            (async () => {
                // Initializing browser
                const browser = await puppeteer.launch(config.browser)

                // Create new browser tab
                const page = await browser.newPage()

                // Dont load css, font, and image
                await page.setRequestInterception(true);

                page.on('request', (req) => {
                    if (req.resourceType() === 'document') req.continue()
                    else req.abort()
                });

                // Go to user page
                await page.goto("https://www.bukalapak.com/u/" + username, {
                    waitUntil: ['load', 'networkidle0', 'domcontentloaded']
                })

                await page.$eval('body', el => {
                    console.log(el)
                })

                // Check if user exist or not
                let url = await page.url();
                if (url.indexOf(".com/404?") !== -1) {
                    // Go to premium user page
                    await page.goto("https://www.bukalapak.com/" + username, {
                        waitUntil: ['load', 'networkidle0', 'domcontentloaded']
                    })

                    let url_premi = await page.url();
                    if (url_premi.indexOf(".com/404?") !== -1) {
                        // User tidak ditemukan
                        resolve({ status: 404, errorMessage: "User not found", data: {} })
                    }
                }

                // Get user detail

                    let data = {}

                    // Get user's id
                    data.id = await page.$eval('.js-start-chat', el => {
                        return el.getAttribute("data-user-id").trim()
                    })
                
                    // Get user's name
                    data.name = await page.$eval('.merchant-page__store-name', el => {
                        return el.textContent.trim()
                    })

                    // Get user's link
                    data.link = await page.url()

                    // Get user's avatar
                    data.avatar = await page.$eval('.merchant-page__avatar img', el => {
                        return el.getAttribute("src").trim()
                    })

                    // Get user's banner
                    data.banner = await page.$eval('.merchant-page__banner-img', el => {
                        return el.getAttribute("src").trim()
                    })

                    // Get user's deskription
                    data.desctiption = await page.$eval('.c-tab__content:nth-child(3) .c-tab__content__body', el => {
                        return el.innerHTML.trim()
                    })
                    
                    // Get user's satisfied_buyer
                    data.satisfied_buyer = await page.$eval('.ut-feedback-percentage:nth-child(2)', el => {
                        return el.textContent.trim()
                    })

                    // Get user's total_feedback
                    data.total_feedback = await page.$eval('.ut-total-feedback:nth-child(2)', el => {
                        return el.textContent.trim()
                    })

                    // Get user's average_delivery_time
                    data.average_delivery_time = await page.$eval('.ut-delivery-time:nth-child(4)', el => {
                        return el.textContent.trim()
                    })

                    // Get user's follower
                    data.follower = await page.$eval('.ut-subscriptions:nth-child(6)', el => {
                        return el.textContent.trim()
                    })

                    // Get user's join_date
                    data.join_date = await page.$eval('.ut-join:nth-child(6)', el => {
                        return el.textContent.trim()
                    })
                

                // Close all browser
                let pages = await browser.pages()
                await Promise.all(pages.map(page => page.close()))

                // Close the browser
                await browser.close()

                // Return the products list
                resolve({ status: 200, data: data })
            })()
        });
    },
    /**
     * Get list of all product sell by a user
     * @param {Integer} userid Get this userid by do getUserDetail first
     * @returns List of product that sell by the user
     */
    getProductsByUser: function(userid){
        return new Promise((resolve, reject) => {
            (async () => {
                // Initializing browser
                const browser = await puppeteer.launch(config.browser)

                // Create new browser tab
                const page = await browser.newPage()

                // Dont load css, font, and image
                await page.setRequestInterception(true);

                page.on('request', (req) => {
                    if (req.resourceType() === 'document') req.continue()
                    else req.abort()
                });
                
                // Get access_token
                let pref_start = '>'
                let pref_end = '</pre>'

                let access_token = await getToken()
                    access_token = access_token.substring(access_token.indexOf(pref_start) + pref_start.length, access_token.indexOf(pref_end))
                    access_token = JSON.parse(access_token).access_token

                // Go to user page
                await page.goto("https://api.bukalapak.com/stores/"+userid+"/products?offset=0&limit=0&sort=bestselling&access_token="+access_token, {
                    waitUntil: ['load', 'networkidle0', 'domcontentloaded']
                })

                let bodyHTML = await page.evaluate(() => document.body.innerHTML);
                    bodyHTML = bodyHTML.substring(bodyHTML.indexOf(pref_start) + pref_start.length, bodyHTML.indexOf(pref_end))
                    bodyHTML = JSON.parse(bodyHTML)
                let data = bodyHTML

                let pages = await browser.pages()
                await Promise.all(pages.map(page => page.close()))

                // Close the browser
                await browser.close()

                // Return the products list
                resolve(data)
            })()
        });
    },

    getProductByLink: function(url){

    },

}

/**
 * Post to a url by puppeteer
 * @param {*} page Puppeteer page / tab
 * @param {String} url An url to post
 * @param {Object} formData A json data to post
 */
const post = async (page, url, formData) => {
    let formHtml = '';
    Object.keys(formData).forEach(function (name) {
        value = formData[name]
        formHtml += `<input type='hidden' name='${name}' value='${value}' />`;
    });
    formHtml = `<form action='${url}' method='post'>${formHtml}<input type='submit'/></form>`;
    await page.setContent(formHtml);
    const inputElement = await page.$('input[type=submit]');
    await inputElement.click();
};

/**
 * Get a token to access Bukalapak API
 * @returns A token to access Bukalapak API
 */
function getToken() {
    return new Promise(function (resolve) {
    (async () => {
        formData = {'dummy': 0}
        const browser = await puppeteer.launch(config.browser);
        const page = await browser.newPage();
        await post(page, 'https://www.bukalapak.com/westeros_auth_proxies', formData);
        await page.waitForNavigation()
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);
        browser.close();
        resolve(bodyHTML);
    })();
    });
}