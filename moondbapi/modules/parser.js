module.exports = {

//
//Reshape filter tree data like [{...,childeren[]},{...,childeren[]},..{...,childeren[]}]
//to include hierchical structure
//
  treeBuilder: function(list, topKey, topLabel, idAttr, parentAttr, childrenAttr) {
    if (!idAttr) idAttr = 'id';
    if (!parentAttr) parentAttr = 'parent_key';
    if (!childrenAttr) childrenAttr = 'items';
    let treeList = [];
    let  lookup = {};

    list.forEach(function (obj) {
      lookup[obj[idAttr]] = obj;
      obj[childrenAttr] = [];
    });

    list.forEach(function (obj) {
      if (obj[parentAttr] != null) {
        lookup[obj[parentAttr]][childrenAttr].push(obj);
      }
      else {
        treeList.push(obj);
      }
    });

    let CVList = {
      "id": topKey,
      "text": topLabel,
      "parent_key": null,
      "items": treeList
    }
    return CVList
   //return treeList;
  },

//Reshape filter tree data like [{},{},..{}] to include all required key and value.
// Data returned from formatFilterData is flat, not include hierchical structure.
//
  parseUIFilter: function(filterAry,type) {
    let nodes = [];
    filterAry.forEach(function (item) {
      let node = {};
      let pos = item.key.lastIndexOf("/");
      node.id = item.key;
      node.parent_key = (pos != -1) ? item.key.slice(0, pos) : null;
      node.text = item.key.slice(pos + 1);
      nodes.push(node);
      let isRootKeyExist = module.exports.rootKeyExist(nodes,node.parent_key);
      if (!isRootKeyExist && node.parent_key != null) {
        let root = {};
        let pos = node.parent_key.lastIndexOf("/");
        if (pos != -1){
          root.id = node.parent_key;
          root.text = node.parent_key.slice(pos + 1);
          root.parent_key = node.parent_key.slice(0,pos);
        } else {
          root.id = node.parent_key;
          root.text = node.parent_key;
          root.parent_key = null;
        };
        nodes.push(root);
      }
    });
    return nodes;
  },
  
  rootKeyExist: function(keyList, rootKey) {
    let flag = false;
    keyList.forEach(function (item) {
      if (rootKey === item.id)
        flag = true;
    });
    return flag;
  },
  
  parseUIFilters: function(hits) {
    let results = [];
    let analytes = module.exports.parseFilter2(hits.analytes.analytes.buckets,'analyte','Analytes');
    let missions = module.exports.parseFilter2(hits.missions.buckets,'mission','Missions');
    let landmarks = module.exports.parseFilter2(hits.landmarks.buckets,'landmark','Landmarks');
    let specimenTypes1 = module.exports.parseUIFilter(hits.specimenTypes.buckets, 'specimenType');
    specimenTypes = module.exports.treeBuilder(specimenTypes1,'specimenType','Specimen Types');
    let samplingTechniques = module.exports.parseFilter2(hits.samplingTechnique.buckets,'samplingTechnique','Sampling Techniques');
    let analyzedMaterials1 = module.exports.parseUIFilter(hits.analyzedMaterials.analyzedMaterials.buckets, 'analyzedMaterial');
    analyzedMaterials = module.exports.treeBuilder(analyzedMaterials1,'analyzedMaterial','Analyzed Materials');
    let analysisMethods = module.exports.parseFilter2(hits.analysisMethods.analysisMethods.buckets,'analysisMethod','Analysis Methods');
    results.push(missions);
    results.push(landmarks);
    results.push(specimenTypes);
    results.push(samplingTechniques);
    results.push(analyzedMaterials);
    results.push(analysisMethods);
    results.push(analytes);


    return results;
  },

    parseFilter2: function(hits, type, label) {
    let results = [];
    hits.forEach(function (hit) {
      let result = {
        "id": hit.key,
        "text": hit.key,
        "parent_key": type,
        "items": []
      }
      results.push(result)
    })
    let CVList = {
      "id": type,
      "text": label,
      "parent_key": null,
      "items": results
    }
    return CVList
  },

   parseFilter: function(hits, type, label) {
    let results = [];
    hits.forEach(function (hit) {
      let result = {
        "name": hit.key,
        "enable": false
      }
      results.push(result)
    })
    let CVList = {
      "type": type,
      "label": label,
      "selected": false,
      "expanded": false,
      "children": results
    }
    return CVList
  },

  parseFilters: function(hits) {
    let results = [];
    let analytes = module.exports.parseFilter(hits.analytes.analytes.buckets,'analyte','Analytes');
    let missions = module.exports.parseFilter(hits.missions.buckets,'mission','Missions');
    let landmarks = module.exports.parseFilter(hits.landmarks.buckets,'landmark','Landmarks');
    let specimenTypes = module.exports.parseFilter(hits.specimenTypes.buckets,'specimenType','Specimen Types');
    let samplingTechniques = module.exports.parseFilter(hits.samplingTechnique.buckets,'samplingTechnique','Sampling Techniques');
    let analyzedMaterials = module.exports.parseFilter(hits.analyzedMaterials.analyzedMaterials.buckets,'analyzedMaterial','Analyzed Materials');
    let analysisMethods = module.exports.parseFilter(hits.analysisMethods.analysisMethods.buckets,'analysisMethod','Analysis Methods');
    results.push(missions);
    results.push(landmarks);
    results.push(specimenTypes);
    results.push(samplingTechniques);
    results.push(analyzedMaterials);
    results.push(analysisMethods);
    results.push(analytes);
    
    
    let filter = {
      "name": "Filters",
      "selected": false,
      "expanded": true,
      "children": results
    }
    return results;
  },

  parseTopSpecimenList: function(hits) {
    let results = []
    hits.forEach(function (hit) {
      specimen = {
        "specimenCode": hit._source.specimenCode,
        "specimenName": hit._source.specimenName,
        "specimenType": hit._source.specimenType,
        "childSpecimens": hit._source.childSpecimens,
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
    let landmarkList = {
      "count": hits.length,
      "results": results
    }
    return landmarkList
  },

  parseCitations: function(hits) {
    let results = [];
    hits.forEach(function (hit){
      titleB = hit.title.buckets
      typeB = hit.type.buckets
      journalB = hit.journal.buckets
      issueB = hit.issue.buckets
      volumeB = hit.volume.buckets
      yearB = hit.year.buckets
      pagesB = hit.pages.buckets
      doiB   = hit.doi.buckets
      
      let authors = []
     
      authorsHit = hit.authoragg.authors.buckets
      authorsHit.forEach(function (hit){
        orderB = hit.order.buckets
        authors[orderB[0].key-1] = hit.key
      })

      let datasets = []
      
      datasetsHit = hit.datasetagg.datasets.buckets
      datasetsHit.forEach(function (hit){
        dttitleB = hit.dttitle.buckets
        if(dttitleB.length === 0) {
          dtTitle = null
        } else {
        dtTitle = dttitleB[0].key
        }
        let dataset = {
          "code": hit.key,
          "title": dtTitle
        }
        datasets.push(dataset)
      })

      if(journalB.length === 0) {
        journalTitle = null
      } else {
        journalTitle = journalB[0].key
      }

      if(issueB.length === 0) {
        issue = null
      } else {
        issue = issueB[0].key
      }

      if(volumeB.length === 0) {
        volume = null
      } else {
        volume = volumeB[0].key
      }

      if(yearB.length === 0) {
        year = null
      } else {
        year = yearB[0].key
      }
      
      if(pagesB.length === 0) {
        pages = null
      } else {
        pages = pagesB[0].key
      }
 
      if(doiB.length === 0) {
        doi = null
        link = null
      } else {
        doi = doiB[0].key
        link = "https://doi.org/" + doiB[0].key
      }

      let result = {
        "code": hit.key,
        "title": titleB[0].key,
        "type": typeB[0].key,
        "journal": journalTitle,
        "pages": pages,
        "year" : year,
        "issue" : issue,
        "volume" : volume,
        "DOI" : doi,
        "link" : link,
        "authors": authors,
        "datasets": datasets
      }
      results.push(result)
    })
    let CitationList = {
      "count": hits.length,
      "results": results
    }
    return CitationList
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
    let datasetList = {
      "count": hits.length,
      "results": results
    }
    return datasetList
  },

  parseMethods: function(hits) {
    let results = [];
    hits.forEach(function (hit) {
      titleB = hit.fullName.buckets
      if(titleB.length === 0) {
        titleT = null
      } else {
        titleT = titleB[0].key
      }
      let result = {
        "code": hit.key,
        "name": titleT
      }
      results.push(result)
    })
    let methodList = {
      "count": hits.length,
      "results": results
    }
    return methodList
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
      "results": results
    }
    return CVList
  },


  parseNestedAnalysisResults: function(hits, material, analyte, method) {
    let aResults = [];
    let count = 0;
    hits.forEach(function (hit) {
      specimenType = hit._source.specimenType;
      analysisHits = hit._source.analysisResults;
      analysisHits.forEach(function (ahit) {
        if(material.length === 0) {
          let dResults = module.exports.parseNestedDataResults(ahit.dataResults,analyte,method)
          if(dResults.length != 0){
            analysisResult = {
              "analysisCode": ahit.analysisCode,
              "specimenType": specimenType,
              "analyzedMaterial": ahit.analyzedMaterialName,
              "comment":  ahit.analysisComment,
              "dataset": ahit.datasetCode,
              "citation": ahit.citation.citationCode,
              "dataResults":  dResults
            };
            aResults.push(analysisResult)
            count += 1
          }
        } else {
          for(i=0; i<material.length; i++){
            if (ahit.analyzedMaterialName.includes(material[i])) {
              let dResults = module.exports.parseNestedDataResults(ahit.dataResults,analyte,method)
              if(dResults.length != 0) {
                analysisResult = {
                  "analysisCode": ahit.analysisCode,
                  "specimenType": specimenType,
                  "analyzedMaterial": ahit.analyzedMaterialName,
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
            if(dhit.methodCode === method[k]) {
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
                if(dhit.methodCode === method[k]) {
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
    let count = 0;
    let results = [];
    if(hits.length != 0) {
    specimenType = hits[0]._source.specimenType;
    dataHits = hits[0]._source.analysisResults;
    count = count + dataHits.length;
    dataHits.forEach(function (hit) {
      analysisResult = {
        "analysisCode": hit.analysisCode,
        "specimenType": specimenType,
        "analyzedMaterial": hit.analyzedMaterialName,
        "comment":  hit.analysisComment,
        "dataset":  hit.datasetCode,
        "citation": hit.citation.citationCode,
        "dataResults":  hit.dataResults
      };
      results.push(analysisResult)
    })
  }
    let data = {
      "count": count,
      "results": results
    }
    return data
  },

  parseDataWithCitation: function(hits, citationCode) {
    let results = [];
    let count = 0;
    hits.forEach(function (hit) {
      specimenType = hit._source.specimenType,
      dataHits = hit._source.analysisResults;
      count = count + dataHits.length;
      dataHits.forEach(function (dhit) {
        if (dhit.citation.citationCode === citationCode) {
          analysisResult = {
            "analysisCode": dhit.analysisCode,
            "specimenType": specimenType,
            "analyzedMaterial": dhit.analyzedMaterialName,
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
      "count": count,
      "results": results
    }
    return data
  },

  parseDataWitham: function(hits, material) {
    let results = [];
    let count = 0;
    hits.forEach(function (hit) {
      specimenType = hit._source.specimenType;
      dataHits = hit._source.analysisResults;
      count = count + dataHits.length;
      dataHits.forEach(function (dhit) {
        if (dhit.analyzedMaterialName.includes(material)) {
          analysisResult = {
            "analysisCode": dhit.analysisCode,
            "specimenType": specimenType,
            "analyzedMaterial": dhit.analyzedMaterialName,
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
      "count": count,
      "results": results
    }
    return data
  }
}

