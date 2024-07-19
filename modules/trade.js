/**
 * To use this module install the following modules
 *  * steamcommunity
 *  * steam-tradeoffer-manager
 * change 'TradeUrl' to the account that will get All steam type content
 * 
 * Ekstra, this will do requst outside this managed project, via "steamcommunity"
 */

const FS = require('fs');
var SteamCommunity = null;
var TradeOfferManager = null;
try {
    SteamCommunity = require('steamcommunity');
    TradeOfferManager = require('steam-tradeoffer-manager'); 
    
} catch (e) {
    if (e instanceof Error && e.code === "MODULE_NOT_FOUND"){
        console.log("Modules not install in module trade.js");
    }
    throw e;
}
const TradeUrl = "https://steamcommunity.com/tradeoffer/new/?partner=29967844&token=ipZz21tf"; // This is my trade link, change to the account that shoud get the trade
const domain = "example.com"
const language = "en"
const settings = require('../lib/Settings');
module.exports = async function(steamClient, _RequestCommunity, RequestStore, _SessionID, options, callback){
    if(SteamCommunity != null && TradeOfferManager != null && options.Auth != null && options.Auth[settings.AuthFieldNameSteamApiKey] != "" && options.Auth[settings.AuthFieldNamesharedSecret] != ""){
        var manager = new TradeOfferManager({
            "steam": steamClient, // Polling every 30 seconds is fine since we get notifications from Steam
            "domain": domain, // Our domain is example.com
            "language": language // We want English item descriptions
        });
        /*
        manager.on('pollData', function(pollData) {
            FS.writeFileSync('polldata/' +options.UserName + '-polldata.json', JSON.stringify(pollData));
        });
        */
        var community = new SteamCommunity();
        community.setCookies(options.webCookie);

        manager.setCookies(options.webCookie, function(err) {
            if (err) {
                options.log("Failed");
                options.log(err);
                callback();
                return;
            }
            options.log("Got API key: " + manager.apiKey);
            manager.getInventoryContents(753, 6, true, function(err, inventory) {
                if (err) {
                    options.log(err);
                    callback();
                    return;
                }
    
                if (inventory.length == 0) {
                    // Inventory empty
                    options.log("steam inventory is empty");
                    callback();
                    return;
                }
                options.log("Found " + inventory.length + " steam items");
                /*const shuffle = (array) => { 
                    return array.sort(() => Math.random() - 0.5); 
                };
                inventory = shuffle(inventory)
                var half_length = Math.ceil(inventory.length / 2);    
                var leftSide = inventory.slice(0,half_length);
                */
                // Create and send the offer
                let offer = manager.createOffer(TradeUrl);
                offer.addMyItems(inventory);
                offer.setMessage("Here, have some items!");
                offer.send(function(err, status) {
                    if (err) {
                        options.log(err);
                        return;
                    }

                    if (status == 'pending') {
                        // We need to confirm it
                        options.log(`Offer #${offer.id} sent, but requires confirmation`);
                        community.acceptConfirmationForObject(options.Auth[settings.AuthFieldNameIdentitySecret], offer.id, function(err) {
                            if (err) {
                                options.log(err);
                            } else {
                                options.log("Offer confirmed");
                            }
                            callback();
                            return;
                        });
                    } else {
                        options.log(`Offer #${offer.id} sent successfully`);
                        callback();
                        return;
                    }
                });
                
            })
        })
    }else{
        options.logError("Cant do trade, maby missing modules! or missing apikey or missing sharedSecret ");
        callback();
        return;
    }
}