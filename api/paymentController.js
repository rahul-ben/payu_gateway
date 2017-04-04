"use strict";
var async = require('async');
var path = require('path');
var config = require('../settings/routes');
var crypto = require('crypto');
var CryptoJS = require('crypto-js');
var moment = require('moment');
var _ = require('underscore');
var numeral = require('numeral');
var fs = require('fs');
var responseHelper = require('../helpers/response');
var salt = 'eCwWELxi';// appending SALT
var payuKey = 'gtKFFx'; //key;
var processInfo = 'E_payment';  // product info
var wsdl = require('./wsdl');

var calculateReturnHash = function(studentDetails, paymentDetails) {
    var number = numeral(studentDetails.amount);
    var hashVarsSeq = [];
    var formattedAmount = parseFloat(studentDetails.amount).toFixed(2);
    var status = paymentDetails.status;
    hashVarsSeq = '||||||||||udf1|email|firstname|productinfo|amount|txnid|key'.split('|');
    var hash_string = '';
    //hash_string += studentDetails.additionalCharges || '';
    //hash_string = hash_string + '|';
    hash_string += salt;// appending SALT
    hash_string = hash_string + '|';
    hash_string += status;
    _.each(hashVarsSeq, function (hash_var) {
        if (hash_var == "udf1") {
            hash_string = hash_string + studentDetails.udf1 + '|';
        }
        else if (hash_var == "email") {

            hash_string = hash_string + (studentDetails.email || '') + '|';
        }
        else if (hash_var == "firstname") {

            hash_string = hash_string + (studentDetails.firstname || '') + '|';
        }
        else if (hash_var == "productinfo") {
            hash_string = hash_string + processInfo + '|';
        }
        else if (hash_var == "amount") {
            hash_string = hash_string + formattedAmount + '|';
        }
        else if (hash_var == "txnid") {
            hash_string = hash_string + studentDetails.txnid + '|';
        }
        else if (hash_var == "key") {
            hash_string = hash_string + payuKey
        }
        else {
            hash_string = hash_string + ([hash_var] != null ? [hash_var] : "");// isset if else
            hash_string = hash_string + '|';
        }
    });
    var hash1 = hashingLogic(hash_string).toLowerCase();//generating hash
    var printData =  'userMakePaymentData : ' + hash_string + '\n' + 'hash of userMakePaymentData : ' + hash1 + '\n';
    fs.appendFile('myFile.txt', printData);
    return hash1
};

var encrypt = function(plaintText, base64Key) {
    var key = CryptoJS.enc.Latin1.parse(base64Key);
    var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return CryptoJS.enc.Hex.stringify(encryptedData.ciphertext);

};

var hashingLogic = function(txt) {
    var sha512 = crypto.createHash("sha512");
    sha512.update(txt, "utf8");
    return sha512.digest('hex');
};

var sendHash = function(details, callback) {
    var hashVarsSeq = [];
    var hash_string = '';
    var hash1 = '';
    var action1 = '';
    var strHash = hashingLogic("System.Random" + moment(new Date()).format('DD/MM/YYYY hh:mm:ss A'));   //for txnId//
    hashVarsSeq = 'key|txnid|amount|productinfo|firstname|email|udf1|||||||||'.split('|');
    _.each(hashVarsSeq, function (hash_var) {      //creating hashString with values//
        switch (hash_var) {
            case "key":
                hash_string = hash_string + payuKey + '|';
                break;
            case "txnid":
                hash_string = hash_string + details.challan + '|';
                break;
            case "amount":
                hash_string = hash_string + parseFloat(details.totalAmount).toFixed(1) + '|';
                break;
            case "productinfo":
                hash_string = hash_string + processInfo + '|';
                break;
            case "firstname":
                hash_string = hash_string + (details.firstName || '') + '|';
                break;
            case "email":
                hash_string = hash_string + (details.email || '') + '|';
                break;
            case "udf1":
                hash_string = hash_string + (details.studentId || '') + '|';
                break;
            default :
                hash_string = hash_string + ([hash_var] != null ? [hash_var] : "") + '|';// isset if else
        }
    });
    hash_string += salt;// appending SALT

    hash1 = hashingLogic(hash_string).toLowerCase();//generating hash
    var generatedData = '\n' + 'sending hash data' + ': ' +  hash_string + '\n' + 'sending hash' + ': ' +  hash1  + '\n\n';
    action1 = "https://test.payu.in/_payment";      // setting URL
    var obj = {
        hash:hash1,
        txnid: details.challan,
        key: payuKey,
        action: action1,
        hashSeq: hash_string,
        studentId : details.studentId,
        salt: salt,
        amount: parseFloat(details.totalAmount).toFixed(1),
        firstname: details.firstName|| '',
        email: details.email || '',
        phone: null,
        productinfo: processInfo,
        surl: 'http://mdu.m-sas.com/success/',
        furl: 'http://mdu.m-sas.com/failure/',
        service_provider: 'payu_paisa',
        payuBase: 'https://test.payu.in'
    };

    callback(generatedData, obj, hashVarsSeq);
};


exports.pay = function(req, res) {
    async.waterfall([
        function(cb) {
            wsdl.getStudent(req.query.challanId, function(err, studentDetails) {
                if(err) return cb(err);
                cb(null, studentDetails);
            })
        },
        function(studentDetails, cb) {
            var data = {
                totalAmount: studentDetails.amount,
                challan: req.query.challanId,
                studentId: studentDetails.udf1
            };
            sendHash(data, function(printGeneratedData, obj, hashVarsSeq) {
                fs.appendFile('myFile.txt', printGeneratedData, function(err) {
                    cb(null, obj);
                });
            });
        }
    ], function(err, obj) {
        var response = responseHelper(res);

        if (err) {
            res.render('error', {data: {
                message: err
            }});
        }
        return res.render('proceedPayment', {data:obj});

    })
};

exports.save = function(req, res) {
    var details = req.body;
    async.waterfall([
        function(cb) {
            sendHash(details, function(printGeneratedData, obj, hashVarsSeq) {
                fs.appendFile('myFile.txt', printGeneratedData, function(err) {
                    cb(null, obj);
                });
            });
        }
    ], function(err, obj) {
        var response = responseHelper(res);

        if (err) {
            return response.failure(err);
        }
        return res.render('proceedPayment', {data:obj});

    })
};

exports.success = function(req, res){
    var sentDetailsHash, receivedDetailsHash, payuReturnHash, receivedDetailsHashDetails;
    var paymentDetails = req.body;
    async.waterfall([
        function(cb) {
            wsdl.getStudent(paymentDetails.txnid, function(err, studentDetails) {
                if(err) {
                    return cb(err);
                }
                cb(null, studentDetails)
            })
        }, function (studentDetails, cb) {
            sentDetailsHash = calculateReturnHash(studentDetails, paymentDetails);
            receivedDetailsHashDetails = salt + '|' + paymentDetails.status + '||||||||||' + paymentDetails.udf1 + '|||' + processInfo + '|' + paymentDetails.amount + '|' + paymentDetails.txnid + '|' + payuKey;
            receivedDetailsHash = hashingLogic(receivedDetailsHashDetails).toLowerCase();//generating hash
            payuReturnHash = paymentDetails.hash;
            cb(null)
        }
    ],function(err) {
        if((paymentDetails.status != 'success') || (payuReturnHash != receivedDetailsHash)|| (sentDetailsHash != receivedDetailsHash))
            return res.render('failure', {data:paymentDetails});

        res.render('success', {data:paymentDetails});
    });
};

exports.failure = function(req, res){
    var obj = req.body;
    res.render('failure', {data:obj});
};
