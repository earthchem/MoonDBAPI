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

var parser = require("./modules/parser.js");


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
      res.send(parser.parseCVList(hits))
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
      res.send(parser.parseLandmarks(hits))
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
      res.send(parser.parseDatasets(hits))
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
      res.send(parser.parseCitations(hits))
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
      res.send(parser.parseCVList(hits))
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
      res.send(parser.parseCVList(hits))
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
      res.send(parser.parseCVList(hits))
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
      res.send(parser.parseCVList(hits))
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
      res.send(parser.parseCVList(hits))
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
      res.send(parser.parseCVList(hits))
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
        res.send(parser.parseSpecimenList(hits))
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
        res.send(parser.parseSpecimenList(hits))
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
        res.send(parser.parseSpecimenList(hits))
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
        res.send(parser.parseSpecimenList(hits))
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
        res.send(parser.parseSpecimen(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})

router.get('/data/specimen/:specimenCode', function (req,res) {
  let specimenCode = req.params.specimenCode

  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['analysisResults.citation.citationCode','analysisResults.datasetCode','analysisResults.analysisComment','analysisResults.analysisCode','analysisResults.analizedMaterial','analysisResults.dataResults'],
    body: {
      query: {
        bool: {
          must: {
            term: {
              "specimenCode.keyword": specimenCode
            }
          }
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'Data not exist in MoonDB for <b>' + specimenCode + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parser.parseDataWithSpecimen(hits))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})

router.get('/data/analizedmaterial/:analizedMaterial', function (req,res) {
  let analizedMaterial = '*' + req.params.analizedMaterial + '*'
  let material = req.params.analizedMaterial
  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['analysisResults.citation.citationCode','analysisResults.datasetCode','analysisResults.analysisComment','analysisResults.analysisCode','analysisResults.analizedMaterial','analysisResults.dataResults'],
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                "parentSpecimen.keyword": "NULL"
              }
            },
            {
              nested: {
                path: "analysisResults",
                query: {
                  wildcard: {
                    "analysisResults.analizedMaterial.keyword": analizedMaterial
                  }
                }
              }
            } 
          ]
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total === 0) {
      let msg = 'Data not exisist in MoonDB for <b>' + analizedMaterial + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parser.parseDataWitham(hits,material))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})

router.get('/data/citation/:citationCode', function (req,res) {
  let citationCode = req.params.citationCode
  client.search({
    size: 9999,
    index: 'moondb_j',
    type: 'specimen',
    _source: ['analysisResults.citation.citationCode','analysisResults.datasetCode','analysisResults.analysisComment','analysisResults.analysisCode','analysisResults.analizedMaterial','analysisResults.dataResults'],
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                "parentSpecimen.keyword": "NULL"
              }
            },
            {
              nested: {
                path: "analysisResults.citation",
                query: {
                  term: {
                    "analysisResults.citation.citationCode.keyword": citationCode
                  }
                }
              }
            }
          ]
        }
      }
    }
  }).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'Data not exisist in MoonDB for <b>' +citationCode + '</b>!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parser.parseDataWithCitation(hits,citationCode))
    }
  },function (err) {
    console.trace(err.message)
    res.send(err.message)
  })
})



//{"mission":[],"landmark":[],"specimenType":[],"samplingTechnique":[],"analizedMaterial":[],"analyte":[],"analysisMethod":[]}

router.get("/data/:queryParam",function(req,res){
  let json = JSON.parse(req.params.queryParam)
  let mission = json.mission
  let landmark = json.landmark
  let specimenType = json.specimenType
  let samplingTechnique = json.samplingTechnique
  let analizedMaterial = json.analizedMaterial
  let analyte = json.analyte
  let analysisMethod = json.analysisMethod
  
  let topParamCount = [mission.length,landmark.length,specimenType.length,samplingTechnique.length]  
  let nest2ParamCount = [analyte.length,analysisMethod.length]

  let missionQuery ={terms:{"mission.keyword": mission}}
  let landmarkQuery ={terms:{"landmark.landmarkName.keyword": landmark}} 
  
  let q = ""
  for(j=0; j<specimenType.length; j++) {
     let sType = '*' + specimenType[j] + '*'
     let qw = {wildcard:{"specimenType.keyword":sType}}
     q = q + "," + JSON.stringify(qw)
  }
  q = q.slice(1)
  let specimenTypeQuery = {bool:{should:[JSON.parse(q)]}}
  //let specimenTypeQuery = JSON.parse(specimenTypeQ)
 
  let samplingTechniqueQuery ={terms:{"samplingTechnique.keyword": samplingTechnique}} 
  let topQuery = [missionQuery,landmarkQuery,specimenTypeQuery,samplingTechniqueQuery]
 
  let topFilter = ""
  for(i=0; i< topParamCount.length; i++){
    console.log(topQuery[i])
    if(topParamCount[i] != 0)
      topFilter = topFilter + "," + JSON.stringify(topQuery[i])
  }
  topFilter = topFilter.slice(1)
  
  let analyteQuery = {terms:{"analysisResults.dataResults.variable.keyword":analyte}}
  let analysisMethodQuery = {terms:{"analysisResults.dataResults.method.keyword":analysisMethod}}
  let nest2Query = [analyteQuery,analysisMethodQuery]
  
  let nest2Filter =""
  for(m=0; m<nest2ParamCount.length; m++){
    if(nest2ParamCount[m] != 0)
      nest2Filter = nest2Filter + "," + JSON.stringify(nest2Query[m])
  }
  nest2Filter = nest2Filter.slice(1)
  let queryNest2 = '{"nested":{"path":"analysisResults.dataResults","query":{"bool":{"must":[' + nest2Filter + ']}}}}'

  let nestFilter = '{"nested":{"path":"analysisResults","query":{"bool":{"must":['
  if(analizedMaterial.length>0){
    let qAM = ""
    for(k=0; k<analizedMaterial.length; k++) {
      let amType = '*' + analizedMaterial[k] + '*'
      let qtext = {wildcard:{"analysisResults.analizedMaterial.keyword":amType}}
      qAM = qAM + "," + JSON.stringify(qtext)
    }
    qAM = qAM.slice(1)
    let analizedMaterialQuery = '{"bool":{"should":[' + qAM + ']}}'
    
    nestFilter = nestFilter + analizedMaterialQuery + ',' + queryNest2 + ']}}}}'
  } else {
    nestFilter = nestFilter + queryNest2 + ']}}}}'
  }
  
  let queryObj = '{"must":[{"match":{"parentSpecimen.keyword": "NULL"}}'+',' + topFilter + ',' + nestFilter + ']}'
  

  
  let searchParams = {
    	size: 9999,
    	index: 'moondb_j',
    	type: 'specimen',
    	_source: ['analysisResults.citation.citationCode','analysisResults.datasetCode','analysisResults.analysisComment','analysisResults.analysisCode','analysisResults.analizedMaterial','analysisResults.dataResults'], 
        body: {
          query: {
            bool: JSON.parse(queryObj)
            
          }
        }  
      }
 
  client.search(searchParams).then(function (resp) {
    if (resp.hits.total == 0) {
      let msg = 'No data found!'
      res.send(msg)
    } else {
        let hits = resp.hits.hits
        res.send(parser.parseNestedAnalysisResults(hits,analizedMaterial,analyte,analysisMethod))
    }
  },function (err) {
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
