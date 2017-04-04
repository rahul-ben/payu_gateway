var Client = require('node-rest-client').Client;
var client = new Client();
var reqUrl = "http://erishi.mdurtk.in:8000/sap/bc/srt/rfc/sap/zbank_ch_details/200/zbank_ch_details/zbank_ch_details";
var to_json = require('xmljson').to_json;





exports.getStudent = function(challanNo, callback) {
    var args = {
        data: "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'> <soap:Body><ZbankChDetails xmlns='urn:sap-com:document:sap:soap:functions:mc-style'><UniqueNumber xmlns=''>" + challanNo + "</UniqueNumber></ZbankChDetails></soap:Body></soap:Envelope>",
        headers: {
            "Content-Type": "text/xml",
            "AUTHORIZATION": "Basic UkZDLVBBWVU6cGF5dUAxMjM0",
            "SOAPAction": "urn:sap-com:document:sap:soap:functions:mc-style:ZBANK_CH_DETAILS:ZbankChDetailsRequest"
        }
    };

    client.post(reqUrl, args, function (data, response) {
        to_json(data, function (error, model) {

            var object1 = model['soap-env:Envelope'];
            var object2 = object1['soap-env:Body'];
            var object3 = object2['n0:ZbankChDetailsResponse'];
            if(object3.ReturnMessage == "Unique number exist at MDU") {
                var dataResponse = {
                    amount: object3.Amount,
                    dateOfBirth: object3.DateBirth,
                    studentName: object3.StudentName,
                    udf1: object3.StudentNumber,
                    returnMessage: object3.ReturnMessage,
                    txnid: challanNo,
                    status: object3.Status
                };
            } else return callback(object3.ReturnMessage);
            if(error) {
                return callback(error);
            }
            callback(null, dataResponse)
        });
    });
};
