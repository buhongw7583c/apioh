var documentClient = require('documentdb').DocumentClient;

if (process.env.DBENDPOINT==null) {
    require('env') // we are running locally load the environment variables
}

var config = {}
config.endpoint = process.env.DBENDPOINT;
config.primaryKey = process.env.DBKEY;

config.database = {
    "id": process.env.DBID
};

config.collection = {
    "id": process.env.DBCOL
};

var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;
var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

function stripInternalProperties(res) {

    // strip off the internal documentDB properties
    if(res.hasOwnProperty('_rid')){
        delete res['_rid'];
    }
    if(res.hasOwnProperty('_self')){
        delete res['_self'];
    }
    if(res.hasOwnProperty('_etag')){
        delete res['_etag'];
    }
    if(res.hasOwnProperty('_attachments')){
        delete res['_attachments'];
    }
    if(res.hasOwnProperty('_ts')){
        delete res['_ts'];
    }
    return res;
}

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.ratingId) {

        client.queryDocuments(
            collectionUrl,
            'SELECT * FROM c where c.id = "'+req.query.ratingId+'"'
            ).toArray((err, results) => {
                if (results.length==1){
                    // we found a matching review

                    context.res = {
                        // status: 200, /* Defaults to 200 */
                        body: JSON.stringify(stripInternalProperties(results[0]))
                    };
                    context.done();

                }
                else {
                    context.res = {
                        status: 404,
                        body: "No review is found with ratingId "+req.query.ratingId
                    };
                    context.done();
                }
            });
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a ratingId on the query string"
        };
        context.done();
    }
};