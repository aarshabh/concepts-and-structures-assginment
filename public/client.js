document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  const resultsTabBtns = document.querySelectorAll(".results-tab-btn")

  const countrySearch = document.getElementById("country-search")
  const countryList = document.getElementById("country-list")
  const countryResults = document.getElementById("country-results")
  const airlinesBody = document.getElementById("airlines-body")
  const airportsBody = document.getElementById("airports-body")
  const airlinesLoading = document.getElementById("airlines-loading")
  const airportsLoading = document.getElementById("airports-loading")
  const clearBtn = document.getElementById("clear-btn")

  //airline
  const airlineCode = document.getElementById("airline-code")
  const airlineSearchBtn = document.getElementById("airline-search-btn")
  const airlineResults = document.getElementById("airline-results")
  const airlineName = document.getElementById("airline-name")
  const airlineIata = document.getElementById("airline-iata")
  const airlineIcao = document.getElementById("airline-icao")
  const airlineCallsign = document.getElementById("airline-callsign")
  const airlineCountry = document.getElementById("airline-country")
  const airlineRoutesBody = document.getElementById("airline-routes-body")

  //airport
  const airportCode = document.getElementById("airport-code")
  const airportSearchBtn = document.getElementById("airport-search-btn")
  const airportResults = document.getElementById("airport-results")
  const airportName = document.getElementById("airport-name")
  const airportIata = document.getElementById("airport-iata")
  const airportIcao = document.getElementById("airport-icao")
  const airportCity = document.getElementById("airport-city")
  const airportCountry = document.getElementById("airport-country")
  const airportCoordinates = document.getElementById("airport-coordinates")
  const departuresBody = document.getElementById("departures-body")
  const arrivalsBody = document.getElementById("arrivals-body")
  const airportAirlinesBody = document.getElementById("airport-airlines-body")

  //routes
  const departureCode = document.getElementById("departure-code")
  const arrivalCode = document.getElementById("arrival-code")
  const routeSearchBtn = document.getElementById("route-search-btn")
  const routeResults = document.getElementById("route-results")
  const routeFrom = document.getElementById("route-from")
  const routeTo = document.getElementById("route-to")
  const routeDistanceValue = document.getElementById("route-distance-value")
  const routeAirlinesBody = document.getElementById("route-airlines-body")

  const airlineClearBtn = document.getElementById("airline-clear-btn")
  const airportClearBtn = document.getElementById("airport-clear-btn")
  const routeClearBtn = document.getElementById("route-clear-btn")

  let allCountries = []
  let hasData = false
  
  let hasCountryData = false
  let hasAirlineData = false
  let hasAirportData = false
  let hasRouteData = false

  async function loadCountries() {
    try {
      const response = await fetch("/countries")
      allCountries = await response.json()
      renderCountryButtons("")
    } catch (error) {
      console.error("Failed to load countries:", error)
    }
  }

  function renderCountryButtons(searchText) {
    const countryList = document.getElementById("country-list")
    countryList.innerHTML = ""

    let filtered = allCountries.filter((country) => country.name.toLowerCase().includes(searchText.toLowerCase()))

    if (searchText.length === 0) {
      filtered = []
    }

    filtered.slice(0, 20).forEach((country) => {
      const btn = document.createElement("button")
      btn.className = "country-btn"
      btn.textContent = `${country.name} (${country.code})`
      btn.dataset.code = country.code
    
      btn.addEventListener("click", () => {
        document.querySelectorAll(".country-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        fetchCountryData(country.code)
      })
    
      countryList.appendChild(btn)
    })      
  }

  countrySearch.addEventListener("input", (e) => {
    renderCountryButtons(e.target.value)
    updateClearButtonState()
  })

  clearBtn.addEventListener("click", () => {
    countrySearch.value = ""
    countryList.innerHTML = ""
    countryResults.style.display = "none"
    airlinesBody.innerHTML = ""
    airportsBody.innerHTML = ""
    hasData = false
    updateClearButtonState()
  })
  
  function updateClearButtonState() {
    clearBtn.disabled = !hasCountryData && countrySearch.value === ""
    airlineClearBtn.disabled = !hasAirlineData && airlineCode.value === ""
    airportClearBtn.disabled = !hasAirportData && airportCode.value === ""
    routeClearBtn.disabled = !hasRouteData && departureCode.value === "" && arrivalCode.value === ""
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab

      tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")

      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabId}-tab`) {
          content.classList.add("active")
        }
      })
    })
  })

  resultsTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.resultsTab

      const parentContainer = btn.closest(".results-container")

      parentContainer.querySelectorAll(".results-tab-btn").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")

      parentContainer.querySelectorAll(".results-tab-content").forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabId}-results`) {
          content.classList.add("active")
        }
      })
    })
  })
  
  airlineClearBtn.addEventListener("click", () => {
    airlineCode.value = ""
    airlineResults.style.display = "none"
    airlineRoutesBody.innerHTML = ""
    airlineName.textContent = "Airline Name"
    airlineIata.textContent = "--"
    airlineIcao.textContent = "--"
    airlineCallsign.textContent = "--"
    airlineCountry.textContent = "--"
    hasAirlineData = false
    updateClearButtonState()
  })

  airportClearBtn.addEventListener("click", () => {
    airportCode.value = ""
    airportResults.style.display = "none"
    departuresBody.innerHTML = ""
    arrivalsBody.innerHTML = ""
    airportAirlinesBody.innerHTML = ""
    airportName.textContent = "Airport Name"
    airportIata.textContent = "--"
    airportIcao.textContent = "--"
    airportCity.textContent = "--"
    airportCountry.textContent = "--"
    airportCoordinates.textContent = "--"
    hasAirportData = false
    updateClearButtonState()
  })

  routeClearBtn.addEventListener("click", () => {
    departureCode.value = ""
    arrivalCode.value = ""
    routeResults.style.display = "none"
    routeAirlinesBody.innerHTML = ""
    routeFrom.textContent = "JFK"
    routeTo.textContent = "LAX"
    routeDistanceValue.textContent = "-- km"
    hasRouteData = false
    updateClearButtonState()
  })

  async function fetchCountryData(countryCode) {
    countryResults.style.display = "block"
    airlinesLoading.style.display = "block"
    airportsLoading.style.display = "block"
    airlinesBody.innerHTML = ""
    airportsBody.innerHTML = ""

    try {
      const airlinesResponse = await fetch(`/airlines/${countryCode}`)
      if (airlinesResponse.ok) {
        const airlinesData = await airlinesResponse.json()
        renderAirlines(airlinesData)
        hasCountryData = airlinesData.length > 0
      } else {
        airlinesBody.innerHTML = '<tr><td colspan="4">No airlines found</td></tr>'
        hasCountryData = false
      }

      const airportsResponse = await fetch(`/airports/${countryCode}`)
      if (airportsResponse.ok) {
        const airportsData = await airportsResponse.json()
        renderAirports(airportsData)
        hasCountryData = hasCountryData || airportsData.length > 0
      } else {
        airportsBody.innerHTML = '<tr><td colspan="4">No airports found</td></tr>'
        if (!hasCountryData) hasCountryData = false
      }

      updateClearButtonState()
    } catch (error) {
      console.error("Error fetching data:", error)
      airlinesBody.innerHTML = '<tr><td colspan="4">Error loading airlines</td></tr>'
      airportsBody.innerHTML = '<tr><td colspan="4">Error loading airports</td></tr>'
      hasCountryData = false
      updateClearButtonState()
    } finally {
      airlinesLoading.style.display = "none"
      airportsLoading.style.display = "none"
    }
  }

  function renderAirlines(airlines) {
    if (airlines.length === 0) {
      airlinesBody.innerHTML = '<tr><td colspan="4">No airlines found</td></tr>'
      return
    }

    airlinesBody.innerHTML = ""
    airlines.forEach((airline) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${airline.name || "-"}</td>
                <td>${airline.iata || "-"}</td>
                <td>${airline.icao || "-"}</td>
                <td>${airline.callsign || "-"}</td>
            `
      airlinesBody.appendChild(row)
    })

    adjustTableHeight("airlines-table")
  }

  function renderAirports(airports) {
    if (airports.length === 0) {
      airportsBody.innerHTML = '<tr><td colspan="4">No airports found</td></tr>'
      return
    }

    airportsBody.innerHTML = ""
    airports.forEach((airport) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${airport.name || "-"}</td>
                <td>${airport.city || "-"}</td>
                <td>${airport.iata || "-"}</td>
                <td>${airport.icao || "-"}</td>
            `
      airportsBody.appendChild(row)
    })
    
    adjustTableHeight("airports-table")
  }

  function adjustTableHeight(tableId) {
    const table = document.getElementById(tableId)
    if (!table) return

    const tableContainer = table.closest(".table-container")
    if (!tableContainer) return

    const rowCount = table.querySelectorAll("tbody tr").length

    const calculatedHeight = Math.min(400, rowCount * 53 + 53 + 20)

    tableContainer.style.height = rowCount > 0 ? `${calculatedHeight}px` : "auto"
  }

  airlineCode.addEventListener("input", () => {
    updateClearButtonState()
  })

  airportCode.addEventListener("input", () => {
    updateClearButtonState()
  })

  departureCode.addEventListener("input", () => {
    updateClearButtonState()
  })

  arrivalCode.addEventListener("input", () => {
    updateClearButtonState()
  })

  airlineSearchBtn.addEventListener("click", async () => {
    const code = airlineCode.value.trim().toUpperCase()
    if (!code) {
      alert("Please enter an airline code")
      return
    }

    const codeType = document.querySelector('input[name="airline-code-type"]:checked').value

    try {
      const response = await fetch(`/airlines?${codeType}=${code}`)
      if (!response.ok) {
        throw new Error(`No airline found with ${codeType.toUpperCase()} code: ${code}`)
      }

      const data = await response.json()
      if (data.length === 0) {
        alert(`No airline found with ${codeType.toUpperCase()} code: ${code}`)
        return
      }

      const airline = data[0]

      airlineName.textContent = airline.name || "N/A"
      airlineIata.textContent = airline.iata || "N/A"
      airlineIcao.textContent = airline.icao || "N/A"
      airlineCallsign.textContent = airline.callsign || "N/A"
      airlineCountry.textContent = airline.country || "N/A"

      const routes = [
        { departure: "JFK", arrival: "LAX", aircraft: "B738" },
        { departure: "LAX", arrival: "SFO", aircraft: "A320" },
        { departure: "SFO", arrival: "JFK", aircraft: "B738" },
      ]

      airlineRoutesBody.innerHTML = ""
      routes.forEach((route) => {
        const row = document.createElement("tr")
        row.innerHTML = `
        <td>${route.departure}</td>
        <td>${route.arrival}</td>
        <td>${route.aircraft}</td>
      `
        airlineRoutesBody.appendChild(row)
      })

      adjustTableHeight("airline-routes-table")

      airlineResults.style.display = "block"
      hasAirlineData = true
      updateClearButtonState()
    } catch (error) {
      console.error("Error:", error)
      alert(error.message || "An error occurred")
      hasAirlineData = false
      updateClearButtonState()
    }
  })

  airportSearchBtn.addEventListener("click", async () => {
    const code = airportCode.value.trim().toUpperCase()
    if (!code) {
      alert("Please enter an airport code")
      return
    }

    const codeType = document.querySelector('input[name="airport-code-type"]:checked').value

    try {
      const response = await fetch(`/airports?${codeType}=${code}`)
      if (!response.ok) {
        throw new Error(`No airport found with ${codeType.toUpperCase()} code: ${code}`)
      }

      const data = await response.json()
      if (data.length === 0) {
        alert(`No airport found with ${codeType.toUpperCase()} code: ${code}`)
        return
      }

      const airport = data[0]

      airportName.textContent = airport.name || "N/A"
      airportIata.textContent = airport.iata || "N/A"
      airportIcao.textContent = airport.icao || "N/A"
      airportCity.textContent = airport.city || "N/A"
      airportCountry.textContent = airport.country || "N/A"
      airportCoordinates.textContent =
        airport.latitude && airport.longitude ? `${airport.latitude}, ${airport.longitude}` : "N/A"

      const departureRoutes = [
        { iata_code: "LAX", airport_name: "Los Angeles International Airport" },
        { iata_code: "SFO", airport_name: "San Francisco International Airport" },
        { iata_code: "ORD", airport_name: "O'Hare International Airport" },
      ]

      departuresBody.innerHTML = ""
      departureRoutes.forEach((route) => {
        const row = document.createElement("tr")
        row.innerHTML = `
        <td>${route.iata_code}</td>
        <td>${route.airport_name}</td>
      `
        departuresBody.appendChild(row)
      })

      adjustTableHeight("departures-table")

      const arrivalRoutes = [
        { iata_code: "MIA", airport_name: "Miami International Airport" },
        { iata_code: "DFW", airport_name: "Dallas/Fort Worth International Airport" },
        { iata_code: "ATL", airport_name: "Hartsfield-Jackson Atlanta International Airport" },
      ]

      arrivalsBody.innerHTML = ""
      arrivalRoutes.forEach((route) => {
        const row = document.createElement("tr")
        row.innerHTML = `
        <td>${route.iata_code}</td>
        <td>${route.airport_name}</td>
      `
        arrivalsBody.appendChild(row)
      })

      adjustTableHeight("arrivals-table")

      const airportAirlines = [
        { iata: "AA", name: "American Airlines" },
        { iata: "DL", name: "Delta Air Lines" },
        { iata: "UA", name: "United Airlines" },
      ]

      airportAirlinesBody.innerHTML = ""
      airportAirlines.forEach((airline) => {
        const row = document.createElement("tr")
        row.innerHTML = `
        <td>${airline.iata}</td>
        <td>${airline.name}</td>
      `
        airportAirlinesBody.appendChild(row)
      })

      adjustTableHeight("airport-airlines-table")

      airportResults.style.display = "block"
      hasAirportData = true
      updateClearButtonState()
    } catch (error) {
      console.error("Error:", error)
      alert(error.message || "An error occurred")
      hasAirportData = false
      updateClearButtonState()
    }
  })

  routeSearchBtn.addEventListener("click", async () => {
    const depCode = departureCode.value.trim().toUpperCase()
    const arrCode = arrivalCode.value.trim().toUpperCase()

    if (!depCode || !arrCode) {
      alert("Please enter both departure and arrival codes")
      return
    }

    if (depCode.length !== 3 || arrCode.length !== 3) {
      alert("IATA codes must be exactly 3 characters")
      return
    }

    try {
      const response = await fetch(`/routes?departure=${depCode}&arrival=${arrCode}`)
      if (!response.ok) {
        throw new Error(`No route found between ${depCode} and ${arrCode}`)
      }

      const data = await response.json()
      console.log(data);
      routeFrom.textContent = depCode
      routeTo.textContent = arrCode
      routeDistanceValue.textContent = data.distance ? `${Math.round(data.distance)} km` : "N/A"

      routeAirlinesBody.innerHTML = ""
      console.log(data.routes);
      if (data.routes && data.routes.length > 0) {
        data.routes.forEach((routes) => {
          const row = document.createElement("tr")
          row.innerHTML = `
          <td>${routes.airline}</td>
          <td>${routes.aircraft_types}</td>
        `
          routeAirlinesBody.appendChild(row)
        })
      } else {
        routeAirlinesBody.innerHTML = '<tr><td colspan="2">No airlines found for this route</td></tr>'
      }

      adjustTableHeight("route-airlines-table")

      routeResults.style.display = "block"
      hasRouteData = true
      updateClearButtonState()
    } catch (error) {
      console.error("Error:", error)
      alert(error.message || "An error occurred")
      hasRouteData = false
      updateClearButtonState()
    }
  })

  loadCountries()
})
