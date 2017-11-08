var express = require('express')
  , server = express()
  , router = express.Router()
  , port = process.env.PORT || 3000
  , host = process.env.HOST || '129.236.29.72'

server.use(express.static(__dirname + '/View'));
server.use(express.static(__dirname + '/Script'));

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: '129.236.29.72:9200',
  log: 'trace'
});

client.ping({
  requestTimeout: 30000,
}, function (error) {
  if (error) {
    console.error('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

function parseSpecimens(hits) {
  let results = []
  hits.forEach(function (hit) {
    specimen = {
      "specimenId": hit._source.sampling_feature_code,
      "specimenType": hit._source.sample_type,
      "materialClassifier": hit._source.material_classifier,
      "mission": hit._source.mission,
      "geographicFeature": hit._source.geographic_feature,
      "lunarStation": hit._source.lunar_station,
      "weight": hit._source.weight,
      "pristinity": hit._source.pristinity,
      "pristinityDate": hit._source.pristinity_date,
      "description": hit._source.sampling_feature_description
    };
    results.push(specimen)
  })
  
  let specimens = {
    "count": hits.length,
    "results": results
  }
  return specimens
}

function parseSpecimen(hits) {

  let specimen = {};
  hits.forEach(function (hit) {
    specimen = {
      "specimenId": hit._source.sampling_feature_code,
      "specimenType": hit._source.sample_type,
      "materialClassifier": hit._source.material_classifier,
      "mission": hit._source.mission,
      "geographicFeature": hit._source.geographic_feature,
      "lunarStation": hit._source.lunar_station,
      "weight": hit._source.weight,
      "pristinity": hit._source.pristinity,
      "pristinityDate": hit._source.pristinity_date,
      "description": hit._source.sampling_feature_description
    };

  });
  return specimen;
}

function parseSpecimenWithAnalysis(tophits,hits) {

  let specimen = {};
  
  tophits.forEach(function (tophit) {
    let analysises = [];
 
    hits.forEach(function (hit) {
      let citation = {
        "code": hit._source.dataset_code,
        "title": hit._source.citation_title,
        "Publisher": hit._source.citation_publisher,
        "publicationYear": hit._source.citation_publication_year,
        "journal": hit._source.citation_journal,
        "issue": hit._source.citation_issue,
        "volume": hit._source.citation_volume,
        "authors": (hit._source.citation_authors).split('/')
      };

      let dataset = {
        "code": hit._source.dataset_code,
        "title": hit._source.dataset_title,
        "citation": citation
       };    
      let analysis = {
        "spotId": hit._source.spot_id,
        "material": hit._source.material_code,
        "materialClassifier" : hit._source.material_classifier,
        "mineralSize" : hit._source.mineral_size,
        "grain": hit._source.grain,
        "calcAvge": hit._source.calc_avge,
        "methodCode": hit._source.method_code,
        "methodName": hit._source.method_name,
        "analyte": hit._source.variable_code,
        "analyteGroup": (hit._source.analyte_path).split('/')[1],
        "value": hit._source.value,
        "unit": hit._source.unit,
        "dataset": dataset
      }
      analysises.push(analysis);
    })
  
    specimen = {
      "specimenId": tophit._source.sampling_feature_code,
      "specimenType": tophit._source.sample_type,
      "materialClassifier": tophit._source.material_classifier,
      "mission": tophit._source.mission,
      "geographicFeature": tophit._source.geographic_feature,
      "lunarStation": tophit._source.lunar_station,
      "weight": tophit._source.weight,
      "pristinity": tophit._source.pristinity,
      "pristinityDate": tophit._source.pristinity_date,
      "description": tophit._source.sampling_feature_description,
      "analysises": analysises
    };
  });
  return specimen;
}

function parseCVList(hits) {
  let results = [];
  hits.forEach(function (hit) {
    let result = {
      "name": hit.key
    }
    results.push(result)
  })
  let CVList = {
    "count": hits.length,
    "result": results
  }
  return CVList
}


router.get('/missions', function(req,res) {
  client.search({
    index: 'moondb_v1',
    type: 'specimens',
    body: {
      "size": 0,
      "aggs": {
        "missions": {
          "terms": {
            "field": "mission.keyword",
            "size": 100
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.missions.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})


router.get('/geofeatures', function(req,res) {
  client.search({
    index: 'moondb_v1',
    type: 'specimens',
    body: {
      "size": 0,
      "aggs": {
        "geofeatures": {
          "terms": {
            "field": "geographic_feature.keyword",
            "size": 100
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.geofeatures.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})

router.get('/mission/:name', function (req,res) {
  let missionName = req.params.name
  
  client.search({
    size: 9999,
    index: 'moondb_v1',
    type: 'specimens',
    body: {
      query: {
        term: {
          "mission.keyword": missionName
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'There is no sample collected by mission <b>' + missionName + '</b>!'
      res.send(msg)
    } else {
	let hits = resp.hits.hits
        res.send(parseSpecimens(hits))
    }  
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})


router.get('/geofeature/:name', function (req,res) {
  let geofeatureName = req.params.name

  client.search({
    size: 9999,
    index: 'moondb_v1',
    type: 'specimens',
    body: {
      query: {
        term: {
          "geographic_feature.keyword": geofeatureName
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'There is no sample collected at geographic feature <b>' + geofeatureName + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parseSpecimens(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})


router.get('/specimen/:id', function (req, res) {

let sampling_feature_code = req.params.id

client.search({
  index: 'moondb_v1',
  type: 'specimens',
  body: {
    query: {
      term: {
        "sampling_feature_code.keyword": sampling_feature_code
      }
    }
  }
}).then(function (resp) {
    console.log(resp.hits.total)
    if (resp.hits.total == 0) {
      let msg = 'Sample <b>' + sampling_feature_code + '</b> is not exisist in MoonDB!'
      res.send(msg)
    } else {
      var top_hits = resp.hits.hits      
      client.search({
        size: 9999,
  	index: 'moondb_v1',
 	body: {
          query: {
            has_parent: {
	      parent_type : 'specimens',
              query: {
		match: {
		  sampling_feature_code: sampling_feature_code
                }
              }
            }
          }
        }
      }).then(function (resp) {
      console.log(resp.hits.total)
      if (resp.hits.total == 0) {
        res.send(parseSpecimen(top_hits))
      } else {

        var hits = resp.hits.hits
        console.log('Count of analysis hits ' + resp.hits.total);
       // res.send(hits)
        res.send(parseSpecimenWithAnalysis(top_hits,hits))
  
      }
    }, function (err) {
      console.trace(err.message)
      res.send(err.message)
   })
    }
}, function (err) {
    console.trace(err.message)
    res.send(err.message)
})
})

router.get("/",function(req,res){
  res.sendFile( "index.html");
});

server.use(router)
server.listen(port, host, function() {
  console.log(`Server running at http://${host}:${port}/`)
})
