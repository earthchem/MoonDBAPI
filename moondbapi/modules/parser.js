module.exports = {
  parseSpecimenList: function(hits) {
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
  },

  parseSpecimen: function(hits) {
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
  },

  parseLandmarks: function(hits) {
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
  },

  parseCitations: function(hits) {
    let results = [];
    hits.forEach(function (hit) {
      titleB = hit.title.buckets
      typeB = hit.type.buckets
      journalB = hit.journal.buckets
      if(journalB.length === 0) {
        journalTitle = null
      } else {
        journalTitle = journalB[0].key
      }
      let result = {
        "code": hit.key,
        "title": titleB[0].key,
        "type": typeB[0].key,
        "journal": journalTitle
      }
      results.push(result)
    })
    let CVList = {
      "count": hits.length,
      "result": results
    }
    return CVList
  },

  parseDatasets: function(hits) {
    let results = [];
    hits.forEach(function (hit) {
      titleB = hit.title.buckets
      if(titleB.length === 0) {
        titleT = null
      } else {
        titleT = titleB[0].key
      }
      let result = {
        "code": hit.key,
        "title": titleT
      }
      results.push(result)
    })
    let CVList = {
      "count": hits.length,
      "result": results
    }
    return CVList
  },

  parseCVList: function(hits) {
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
  },


  parseNestedAnalysisResults: function(hits, material, analyte, method) {
    let aResults = [];
    let count = 0;
    hits.forEach(function (hit) {
      analysisHits = hit._source.analysisResults;
      analysisHits.forEach(function (ahit) {
        if(material.length === 0) {
          let dResults = module.exports.parseNestedDataResults(ahit.dataResults,analyte,method)
          analysisResult = {
            "analysisCode": ahit.analysisCode,
            "analizedMaterial": ahit.analizedMaterial,
            "comment":  ahit.analysisComment,
            "dataset": ahit.datasetCode,
            "citation": ahit.citation.citationCode,
            "dataResults":  dResults
          };
          aResults.push(analysisResult)
          count += 1
        } else {
          for(i=0; i<material.length; i++){
            if (ahit.analizedMaterial.includes(material[i])) {
              let dResults = module.exports.parseNestedDataResults(ahit.dataResults,analyte,method)
              analysisResult = {
                "analysisCode": ahit.analysisCode,
                "analizedMaterial": ahit.analizedMaterial,
                "comment":  ahit.analysisComment,
                "dataset": ahit.datasetCode,
                "citation": ahit.citation.citationCode,
                "dataResults":  dResults
              };
              aResults.push(analysisResult)
              count += 1
            }
          }
        }
      })
    })

    let data = {
      "count": count,
      "results": aResults
    }
    return data
  },

  parseNestedDataResults: function(dataHits,analyte,method) {
    let dResults = []
    dataHits.forEach(function (dhit) {
      if (analyte.length === 0) {
        if(method.length === 0) {
          dResults.push(dhit)
        } else {
          for(k=0; k<method.length; k++) {
            if(dhit.method === method[k]) {
              dResults.push(dhit)
            }
          }
        }
      } else {
        for(j=0; j<analyte.length; j++) {
          if(dhit.variable === analyte[j]) {
            if(method.length === 0) {
              dResults.push(dhit)
            } else {
              for(k=0; k<method.length; k++) {
                if(dhit.method === method[k]) {
                  dResults.push(dhit)
                }
              }
            }
          }
        }
      }
    })
    return dResults
  },
  
  parseDataWithSpecimen: function(hits){
    let results = [];
    dataHits = hits[0]._source.analysisResults;
    dataHits.forEach(function (hit) {
      analysisResult = {
        "analysisCode": hit.analysisCode,
        "analizedMaterial": hit.analizedMaterial,
        "comment":  hit.analysisComment,
        "dataset":  hit.datasetCode,
        "citation": hit.citation.citationCode,
        "dataResults":  hit.dataResults
      };
      results.push(analysisResult)
    })

    let data = {
      "count": dataHits.length,
      "results": results
    }
    return data
  },

  parseDataWithCitation: function(hits, citationCode) {
    let results = [];
    let count = 0;
    hits.forEach(function (hit) {
      dataHits = hit._source.analysisResults;
      count = count + dataHits.length;
      dataHits.forEach(function (dhit) {
        if (dhit.citation.citationCode === citationCode) {
          analysisResult = {
            "analysisCode": dhit.analysisCode,
            "analizedMaterial": dhit.analizedMaterial,
            "comment":  dhit.analysisComment,
            "dataset": dhit.datasetCode,
            "citation": dhit.citation.citationCode,
            "dataResults":  dhit.dataResults
          };
          results.push(analysisResult)
        }
      })
    })

    let data = {
      "count": hits.length,
      "results": results
    }
    return data
  },

  parseDataWitham: function(hits, material) {
    let results = [];
    let count = 0;
    hits.forEach(function (hit) {
      dataHits = hit._source.analysisResults;
      count = count + dataHits.length;
      dataHits.forEach(function (dhit) {
        if (dhit.analizedMaterial.includes(material)) {
          analysisResult = {
            "analysisCode": dhit.analysisCode,
            "analizedMaterial": dhit.analizedMaterial,
            "comment":  dhit.analysisComment,
            "dataset": dhit.datasetCode,
            "citation": dhit.citation.citationCode,
            "dataResults":  dhit.dataResults
          };
          results.push(analysisResult)
        }
      })
    })

    let data = {
      "count": hits.length,
      "results": results
    }
    return data
  }
}

