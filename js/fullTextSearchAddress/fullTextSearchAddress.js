function fullTextSearchAddress(text, options = {}, searchOptions = null) {
    // default setting
    let defaultDatabaseUrl = "https://7elven.github.io/js/fullTextSearchAddress/raw_database.json"
    let textSearch = text
    let dbUrl = options.url || defaultDatabaseUrl
    let zipFilter = options.zipFilter || false

    return new Promise(function (resolve, reject) {
        fetch(dbUrl)
            .then(function (response) {
                return response.json()
            })
            .then(function (result) {
                if (zipFilter) {
                    let regxpZip = textSearch.match(/\d{5}/)
                    result = filterByZip(result, parseInt(regxpZip[0]))
                }
                let fuseOptions = {
                    caseSensitive: true,
                    shouldSort: true,
                    tokenize: true,
                    includeScore: true,
                    threshold: 0.6,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 100,
                    minMatchCharLength: 1,
                    keys: [
                        "zipcode",
                        "district",
                        "amphoe",
                        "province"
                    ]
                }
                if (searchOptions !== null && typeof searchOptions === 'object') {
                    fuseOptions = searchOptions
                }
                let fuse = new Fuse(result, fuseOptions)
                let search = fuse.search(textSearch)
                if (options.limit) {
                    let limitSearch = limitResult(search, options.limit)
                    resolve(limitSearch)
                }
                resolve(search)
            })
    })
}

function limitResult(dataArr, limit = 30) {
    let result = []
    let length = (limit<dataArr.length)?limit:dataArr.length
    for (let i = 0; i < length; i++) {
        result.push(dataArr[i])
    }
    return result
}

function filterByZip(dataArr, zipcode) {
    let result = dataArr.filter(function (data) {
        return data.zipcode === zipcode
    })
    return result
}