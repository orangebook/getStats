var nomore = false;

function getStatsLooper() {
    getStatsWrapper(function(results) {
        results.forEach(function(result) {
            Object.keys(getStatsParser).forEach(function(key) {
                if (typeof getStatsParser[key] === 'function') {
                    // dispatch item to all handler,just like router,
                    // but if need map, you show pre handle and write to result.internal[key] = map;
                    getStatsParser[key](result);
                }
            });

            if (result.type !== 'local-candidate' && result.type !== 'remote-candidate' && result.type !== 'candidate-pair') {
                // console.error('result', result);
            }
        });

        try {
            // failed|closed
            if (peer.iceConnectionState.search(/failed/gi) !== -1) {
                nomore = true;
            }
        } catch (e) {
            nomore = true;
        }

        if (nomore === true) {
            if (getStatsResult.datachannel) {
                getStatsResult.datachannel.state = 'close';
            }
            getStatsResult.ended = true;
        }

        // allow users to access native results
        getStatsResult.results = results;

        if (getStatsResult.audio && getStatsResult.video) {
            getStatsResult.bandwidth.speed = (getStatsResult.audio.bytesSent - getStatsResult.bandwidth.helper.audioBytesSent) + (getStatsResult.video.bytesSent - getStatsResult.bandwidth.helper.videoBytesSent);
            // getStatsResult.bandwidth.down = (getStatsResult.audio.bytesReceived - getStatsResult.bandwidth.helper.audioBytesSent) + (getStatsResult.video.bytesReceived - getStatsResult.bandwidth.helper.videoBytesSent);
            getStatsResult.bandwidth.helper.audioBytesSent = getStatsResult.audio.bytesSent;
            getStatsResult.bandwidth.helper.videoBytesSent = getStatsResult.video.bytesSent;
        }
        callback(getStatsResult);
        // second argument checks to see, if target-user is still connected.
        if (!nomore) {
            typeof interval != undefined && interval && setTimeout(getStatsLooper, interval || 1000);
        }
    });
}
