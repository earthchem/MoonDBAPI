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
  requestTimeout: 300000,
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

function parseSpecimenList(hits) {
  let results = []
  hits.forEach(function (hit) {
    specimen = {
      "specimenCode": hit._source.specimenCode,
      "specimenName": hit._source.specimenName,
      "parentSpecimen": hit._source.parentSpecimen,
      "childSpecimens": hit._source.childSpecimens,
      "specimenType": hit._source.specimenType,
      "samplingTechnique": hit._source.samplingTechnique,
      "mission": hit._source.mission,
      "landmark": hit._source.landmark.landmarkName,
      "lunarStation": hit._source.lunarStation,
      "returnContainer": hit._source.returnContainer,
      "weight": hit._source.weight,
      "pristinity": hit._source.pristinity,
      "pristinityDate": hit._source.pristinityDate,
      "description": hit._source.specimenDescription
    };
    results.push(specimen)
  })

  let specimens = {
    "count": hits.length,
    "results": results
  }
  return specimens
}


function parseSpecimeno(hits) {

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

function parseSpecimen(hits) {

  let specimen = {};
  hits.forEach(function (hit) {
    specimen = {
      "specimenCode": hit._source.specimenCode,
      "specimenName": hit._source.specimenName,
      "parentSpecimen": hit._source.parentSpecimen,
      "childSpecimens": hit._source.childSpecimens,
      "specimenType": hit._source.specimenType,
      "samplingTechnique": hit._source.samplingTechnique,
      "mission": hit._source.mission,
      "landmark": hit._source.landmark.landmarkName,
      "lunarStation": hit._source.lunarStation,
      "returnContainer": hit._source.returnContainer,
      "weight": hit._source.weight,
      "pristinity": hit._source.pristinity,
      "pristinityDate": hit._source.pristinityDate,
      "description": hit._source.specimenDescription      
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

function parseLandmarks(hits) {
  let results = [];
  hits.forEach(function (hit) {
    let result = {
      "name": hit.key,
      "GPNFID": hit.GPNFID.buckets[0].key,
      "GPNFURL": hit.GPNFURL.buckets[0].key,
      "latitude": hit.latitude.buckets[0].key.toFixed(2),
      "longitude": hit.longitude.buckets[0].key.toFixed(2)
    }
    results.push(result)
  })
  let CVList = {
    "count": hits.length,
    "result": results
  }
  return CVList
}

function parseCitations(hits) {
  let results = [];
  hits.forEach(function (hit) {
    let result = {
      "code": hit.key,
      "title": hit.title.buckets[0].key,
      "type": hit.type.buckets[0].key,
      "journal": hit.journal.buckets[0].key
    }
    results.push(result)
  })
  let CVList = {
    "count": hits.length,
    "result": results
  }
  return CVList
}

function parseDatasets(hits) {
  let results = [];
  hits.forEach(function (hit) {
    let result = {
      "code": hit.key,
      "title": hit.title.buckets[0].key
    }
    results.push(result)
  })
  let CVList = {
    "count": hits.length,
    "result": results
  }
  return CVList
}


router.get('/authorities/missions', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "missions": {
          "terms": {
            "field": "mission.keyword",
            "order": {"_term" : "asc"},
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


router.get('/authorities/landmarks', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "landmarks": {
          "terms": {
            "field": "landmark.landmarkName.keyword",
            "order": {"_term" : "asc"},
            "size": 1000
          },
	  "aggs": {
    	    "GPNFID": {
              "terms": {
                "field": "landmark.GPNFID"
              }
            },
            "GPNFURL": {
              "terms": {
                "field": "landmark.GPNFURL.keyword"
              }
            },
            "latitude": {
              "terms": {
                "field": "landmark.latitude"
              }
            },
            "longitude": {
              "terms": {
                "field": "landmark.longitude"
              }
            }       

          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.landmarks.buckets
      res.send(parseLandmarks(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})

router.get('/authorities/datasets', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "results": {
          "nested": {
            "path": "analysisResults"
          },
          "aggs": {
            "datasets": {
               "terms": {
                 "field": "analysisResults.datasetCode.keyword",
                 "order": {"_term" : "asc"},
                 "size": 9999
               },
               "aggs": {
                 "title": {
                   "terms": {
                     "field": "analysisResults.datasetTitle.keyword"
                   }
                 }
               }
            }
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.results.datasets.buckets
      res.send(parseDatasets(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})

router.get('/authorities/citations', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "results": {
          "nested": {
            "path": "analysisResults.citation"
          },
          "aggs": {
            "citations": {
               "terms": {
                 "field": "analysisResults.citation.citationCode.keyword",
                 "order": {"_term" : "asc"},
                 "size": 9999
               },
               "aggs": {
                 "title": {
                   "terms": {
                     "field": "analysisResults.citation.title.keyword"
                   }
                 },
                 "type": {
                   "terms": {
                     "field": "analysisResults.citation.type.keyword"
                   }
                 },
                 "journal": {
                   "terms": {
                     "field": "analysisResults.citation.journal.keyword"
                   }
                 }
               }
            }
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.results.citations.buckets
      res.send(parseCitations(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})


router.get('/authorities/people', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "results": {
          "nested": {
            "path": "analysisResults.citation.authors"
          },
          "aggs": {
            "people": {
               "terms": {
                 "field": "analysisResults.citation.authors.fullName.keyword",
                 "order": {"_term" : "asc"},
                 "size": 9999
               }
            }
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.results.people.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})

router.get('/cv/specimentypes', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "specimenTypes": {
          "terms": {
            "field": "specimenType.keyword",
            "order": {"_term" : "asc"},
            "size": 1000
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.specimenTypes.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})
router.get('/cv/samplingtechniques', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "samplingTechniques": {
          "terms": {
            "field": "samplingTechnique.keyword",
            "order": {"_term" : "asc"},
            "size": 1000
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.samplingTechniques.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})


router.get('/cv/analizedMaterials', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "results": {
          "nested": {
            "path": "analysisResults"
          },
          "aggs": {
            "analizedMaterials": {
               "terms": {
                 "field": "analysisResults.analizedMaterial.keyword",
                 "order": {"_term" : "asc"},
                 "size": 1000
               }
            }
          }
        } 
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.results.analizedMaterials.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})
router.get('/cv/analytes', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "results": {
          "nested": {
            "path": "analysisResults.dataResults"
          },
          "aggs": {
            "analytes": {
               "terms": {
                 "field": "analysisResults.dataResults.variable.keyword",
                 "order": {"_term" : "asc"},
                 "size": 9999
               }
            }
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.results.analytes.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})
router.get('/cv/analysismethods', function(req,res) {
  client.search({
    index: 'moondb_j',
    type: 'specimen',
    body: {
      "size": 0,
      "aggs": {
        "results": {
          "nested": {
            "path": "analysisResults.dataResults"
          },
          "aggs": {
            "analysisMethods": {
               "terms": {
                 "field": "analysisResults.dataResults.method.keyword",
                 "order": {"_term" : "asc"},
                 "size": 9999
               }
            }
          }
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.aggregations.results.analysisMethods.buckets
      res.send(parseCVList(hits))
    }, function (err) {
    console.trace(err.message)
    res.send(err.message)
   })

})


router.get('/specimenlist/mission/:missionName', function (req,res) {
  let missionName = req.params.missionName
  
  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['specimenCode','specimenName','parentSpecimen','childSpecimens','specimenType','samplingTechnique','mission','landmark.landmarkName','lunarStation','returnContainer','specimenDescription','weight','pristinity','pristinityDate'],
    body: {
      query: {
        term: {
          "mission.keyword": missionName
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'There is no specimen collected by mission <b>' + missionName + '</b>!'
      res.send(msg)
    } else {
	let hits = resp.hits.hits
        res.send(parseSpecimenList(hits))
    }  
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})


router.get('/specimenlist/landmark/:landmarkName', function (req,res) {
  let landmarkName = req.params.landmarkName

  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['specimenCode','specimenName','parentSpecimen','childSpecimens','specimenType','samplingTechnique','mission','landmark.landmarkName','lunarStation','returnContainer','specimenDescription','weight','pristinity','pristinityDate'],
    body: {
      query: {
        term: {
          "landmark.landmarkName.keyword": landmarkName
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'There is no specimen collected at landmark <b>' + landmarkName + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parseSpecimenList(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})

router.get('/specimenlist/specimentype/:specimenType', function (req,res) {
  let specimenType = '*' + req.params.specimenType + '*'

  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['specimenCode','specimenName','parentSpecimen','childSpecimens','specimenType','samplingTechnique','mission','landmark.landmarkName','lunarStation','returnContainer','specimenDescription','weight','pristinity','pristinityDate'],
    body: {
      query: {
        wildcard: {
          "specimenType.keyword": specimenType
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'There is no specimen assigned as <b>' + specimenType + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parseSpecimenList(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})

router.get('/specimenlist/samplingtechnique/:samplingTechnique', function (req,res) {
  let samplingTechnique = '*' + req.params.samplingTechnique + '*'

  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['specimenCode','specimenName','parentSpecimen','childSpecimens','specimenType','samplingTechnique','mission','landmark.landmarkName','lunarStation','returnContainer','specimenDescription','weight','pristinity','pristinityDate'],
    body: {
      query: {
        wildcard: {
          "samplingTechnique.keyword": samplingTechnique
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'There is no specimen collected with  <b>' + samplingTechnique + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parseSpecimenList(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})

router.get('/specimen/:specimenCode', function (req,res) {
  let specimenCode = req.params.specimenCode

  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['specimenCode','specimenName','parentSpecimen','childSpecimens','specimenType','samplingTechnique','mission','landmark.landmarkName','lunarStation','returnContainer','specimenDescription','weight','pristinity','pristinityDate'],
    body: {
      query: {
        term: {
          "specimenCode.keyword": specimenCode
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'Specimen <b>' + specimenCode + '</b> is not exisist in MoonDB!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parseSpecimen(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})


router.get('/specimens/:id', function (req, res) {

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
        res.send(parseSpecimeno(top_hits))
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
