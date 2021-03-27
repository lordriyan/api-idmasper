const puppeteer = require('puppeteer')
const config = require('../config')

module.exports = {
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
                    if (req.resourceType() === 'document') {
                        req.continue();
                    }
                    else {
                        req.abort();
                    }
                });

                // Go to user page
                await page.goto("https://www.bukalapak.com/u/" + username, {
                    waitUntil: ['load', 'networkidle0', 'domcontentloaded']
                })

                // let captcha = await page.$eval('iframe', el => {
                //     return el
                // })

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
    getProductsByUser: function(user){
        return new Promise((resolve, reject) => {
            (async () => {
                // Initializing browser
                const browser = await puppeteer.launch({
                    headless: false,    // true: Browser will run in background
                    args: ['--no-sandbox']  // Browser arguments
                })

                // Create new browser tab
                const page = await browser.newPage()

                // Dont load css, font, and image
                await page.setRequestInterception(true);

                page.on('request', (req) => {
                    if (req.resourceType() === 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                        req.abort();
                    }
                    else {
                        req.continue();
                    }
                });

                // Go to 
                await page.goto("https://www.bukalapak.com/u/"+user, {
                    waitUntil: ['load', 'networkidle0', 'domcontentloaded']
                })

                let link_products = []
                let first_mark = ""

                while (true) {
                    // Select all products
                    let el_products = await page.$$('.item-product .c-product-card-description a.js-tracker-product-link');

                    let link = await Promise.all(el_products.map(handle => handle.getProperty("href")));
                        link = await Promise.all(link.map(handle => handle.jsonValue()));

                    for (let i = 0; i < link.length; i++) {
                        const e = link[i].substring(0, link[0].indexOf("?"));
                        if (first_mark == e) {
                            continue;
                        }
                        if (i == 0) {
                            first_mark = e
                        }
                        link_products.push(e);
                        console.log(e)
                    }
                    
                    let button_next = await page.$('.c-pagination__item:nth-last-child(2) .c-pagination__btn:not([disabled])');
                    
                    if (button_next !== null) {
                        // Go to next page
                        await button_next.click();
                        await delay(1000)
                    } else {
                        break;
                    }
                }

                let pages = await browser.pages()
                await Promise.all(pages.map(page => page.close()))

                // Close the browser
                await browser.close()

                // Return the products list
                resolve({ status: link_products, length: link_products.length})
            })()
        });
    },
    getProductByLink: function(url){

    },

}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
