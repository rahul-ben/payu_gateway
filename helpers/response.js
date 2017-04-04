'use strict';
module.exports = function (res) {
    return {
        success: function (message,code) {
            res.json({
                isSuccess: true,
                message: message,
                code:code
            });
        },
        failure: function (error,code, message) {
            res.json({
                isSuccess: false,
                message: message,
                error: error,
                code: code
            });
        },
        data: function (item, message,code) {
            res.json({
                isSuccess: true,
                message: message,
                data: item,
                code:code
            });
        },
        page: function(items, total, pageNo) {
            res.json({
                isSuccess: true,
                pageNo: pageNo || 1,
                items: items,
                total: total || items.length
            });
        }
    };
};

