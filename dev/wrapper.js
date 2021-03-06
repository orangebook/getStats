// a wrapper around getStats which hides the differences (where possible)
// following code-snippet is taken from somewhere on the github
function getStatsWrapper(cb) {
    if (!peer || peer.signalingState == 'closed') return;

    if (typeof window.InstallTrigger !== 'undefined') {
        peer.getStats(
            mediaStreamTrack,
            function(res) {
                var items = [];
                res.forEach(function(r) {
                    items.push(r);
                });
                cb(items);
            },
            cb
        );
    } else {
        // 注意点，peer.getStats仅支持callback方法调用。
        peer.getStats(function(res) {
            var items = [];
            var result = res.result();
            result.forEach(function(res) {
                var item = {};
                var names = null;
                try {
                    // 用于统计信息的地方，如果JsBridge没有Mock,统计将无法生效
                    names = res.names();
                    names.forEach(function(name) {
                        item[name] = res.stat(name);
                    });
                } catch (error) {
                    item = Object.assign(item, res);
                }
                item.id = res.id;
                item.type = res.type;
                item.timestamp = res.timestamp;
                items.push(item);
            });
            var items = preHandler(items);
            cb(items);
        });
    }
};
