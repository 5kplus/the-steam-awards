var safeMode = true; // do only work, if running in Queue mode
module.exports = async function(steamClient, RequestCommunity, RequestStore, SessionID, options, callback){
	var log = options.log;
	var logError = options.logError;
    try {
        var requestMethodeName = "post";
        if(!safeMode){
            requestMethodeName = "postNoneQueue";
        }

        var apps = await getQueue();
        options.log(apps[0])
        //create promise list
        var prom = [];
        for (let i = 0; i < apps.length; i++) {
            const app = apps[i];
            prom.push(queueApp(app));
        }
        //run all at once
        Promise.all(prom)
        .then(function() {
            log("Queue done!")
            callback();
        }, function(reason) {
            logError('Bad: ' + reason);
            callback();
        });
        
    } catch (error) {
        logError('Error getting the queue. Reason: ' + error);
        callback();
    }

    function getQueue(loops = 0) {
        return new Promise(function (resolve, reject) {
            RequestStore[requestMethodeName]({
                url:'https://store.steampowered.com/explore/generatenewdiscoveryqueue',
                form:{
                    sessionid: SessionID,
                    queuetype: 0
                },
                json: true,
                headers: {
                    'Origin': 'https://store.steampowered.com',
                    'Accept': '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Referer': 'https://store.steampowered.com/explore/',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }, function (error, response, data) {
                try {
                    resolve(data.queue);
                } catch (e) {
                    logError("was not able to get new queue, will retry ( can end end loop, if never get a new queue )")
                    logError(body);
                    if(loops > 4){
                        reject();
                    }else{
                        getQueue(++loops).then(resolve).catch(reject);
                    }
                }
            });
        })
    }
    function queueApp(app) {
        return new Promise(function (resolve, reject) {
            RequestStore[requestMethodeName]({
                url:'https://store.steampowered.com/app/60',
                form:{
                    appid_to_clear_from_queue: app,
                    sessionid: SessionID
                },
            }, function (error, response, body) {
                if(error){
                    reject(error);
                }else
                {
                    resolve();
                }
            }); 
        })
    }
}

