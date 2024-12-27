var cheerio = require('cheerio');
module.exports = function(steamClient, RequestCommunity, RequestStore, SessionID, options, callback){
    var steamId = steamClient.steamID;
    RequestStore.get({uri: `https://store.steampowered.com/replay/${steamId}/2024`}, function(error, response, body) {
        try {
            var $ = cheerio.load(body);
            var accountEl = $("#application_config");
            var accountInfo = JSON.parse(accountEl.attr("data-yearinreview_"+steamClient.steamID.accountid+"_2024"));
            if(accountInfo.playtime_stats.game_summary?.length <= 0){ // steam sourceCode validation "!s.GetPlayTimeStats()?.game_summary?.length;"
                options.log("Sorry, this account does not have any playtime this year. ( so no free badge )");
            }else{
                options.log("Account shoud have got the badge");
            }
             
        } catch (error) {
            options.log("somefing whent wrong", error);
        }
        callback();
    })
};

/*
    steam own attr get build:
        const a = "yearinreview_" + new B.b(e).GetAccountID() + "_" + t; -- t = year ( it add the "data-" later)
        let n = (0, o.Tc)(a, "application_config");
        return this.ValidateYearInReview(n) ? n : null
*/