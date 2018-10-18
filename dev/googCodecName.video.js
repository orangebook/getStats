var VIDEO_codecs = ['vp9', 'vp8', 'h264'];

getStatsParser.checkVideoTracks = function(result) {
    if (!result.googCodecName || result.mediaType !== 'video') return;

    if (VIDEO_codecs.indexOf(result.googCodecName.toLowerCase()) === -1) return;

    // googCurrentDelayMs, googRenderDelayMs, googTargetDelayMs
    // transportId === 'Channel-audio-1'
    var sendrecvType = result.id.split('_').pop();
    // check sendrecvType
    if (sendrecvType != 'recv' && sendrecvType != 'send') {
        sendrecvType = result.isRemote ? 'recv' : 'send';
    }
    if (getStatsResult.video[sendrecvType].codecs.indexOf(result.googCodecName) === -1) {
        getStatsResult.video[sendrecvType].codecs.push(result.googCodecName);
    }

    if (!!result.bytesSent) {
        var kilobytes = 0;
        // 若刷新呀SDP重新交换，需要重新计算
        if (!getStatsResult.internal.video[sendrecvType].prevBytesSent || getStatsResult.internal.video[sendrecvType].prevBytesSent > result.bytesSent) {
            getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
        }

        var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
        getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

        kilobytes = bytes / 1024;
    }

    if (!!result.bytesReceived) {
        var kilobytes = 0;
        if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived || getStatsResult.internal.video[sendrecvType].prevBytesReceived > result.bytesReceived) {
            getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
        }

        var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
        getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

        kilobytes = bytes / 1024;
    }

    getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);

    if (!!result.packetsLost) {
        var kilolostPackets = 0;

        if (!getStatsResult.internal.video[sendrecvType].prevLostPacket) {
            getStatsResult.internal.video[sendrecvType].prevLostPacket = result.packetsLost;
        }

        var packets = result.packetsLost - getStatsResult.internal.video[sendrecvType].prevLostPacket;
        kilolostPackets = packets / 1024;
        getStatsResult.video[sendrecvType].packetsLostRate = kilobytes != 0 ? Math.round((kilolostPackets / kilobytes) * 100) / 100 + "%" : '0.00%';
    }
    if (result.googFrameHeightReceived && result.googFrameWidthReceived) {
        getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthReceived;
        getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightReceived;
    }

    if (result.googFrameHeightSent && result.googFrameWidthSent) {
        getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthSent;
        getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightSent;
    }

    if (getStatsResult.video[sendrecvType].tracks.indexOf(result.googTrackId) === -1) {
        getStatsResult.video[sendrecvType].tracks.push(result.googTrackId);
    }
};
