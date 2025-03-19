const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data", "processed_energy_data.json");
let energyData = [];

try {
  const rawData = fs.readFileSync(dataPath);
  energyData = JSON.parse(rawData);
  console.log("Energy data loaded successfully!");
} catch (error) {
  console.error("Error loading energy data:", error);
}

// API: Get all country names for the Map
app.get("/countries", (req, res) => {
  const countryNames = energyData.map((entry) => entry.Country);
  res.json(countryNames);
});

// API: Get energy data for a specific country for Piechart
app.get("/energy/:country", (req, res) => {
  const { country } = req.params;
  const countryData = energyData.find((entry) => entry.Country === country);

  if (countryData) {
    res.json({
      Country: countryData.Country,
      TotalRenewable: countryData["Total Renewable"],
      TotalNonRenewable: countryData["Total Non-Renewable"],
      TotalEnergy: countryData["Total Energy"],
    });
  } else {
    res.status(404).json({ error: "Country not found" });
  }
});

// API: Get TotalRenewable Energy Data from all countries for Violin Chart
app.get("/total-renewable", (req, res) => {
  try {
    const totalRenewableArray = energyData.map(
      (entry) => entry["Total Renewable"] || 0
    );
    res.json(totalRenewableArray);
  } catch (error) {
    console.error("Error fetching total renewable energy data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Get TotalNoNRenewable Energy Data from all countries for Violin Chart
app.get("/total-nonrenewable", (req, res) => {
  try {
    const totalRenewableArray = energyData.map(
      (entry) => entry["Total Non-Renewable"] || 0
    );
    res.json(totalRenewableArray);
  } catch (error) {
    console.error("Error fetching total renewable energy data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Get Total Energy Data from all countries for Violin Chart
app.get("/total-energy", (req, res) => {
  try {
    const totalRenewableArray = energyData.map(
      (entry) => entry["Total Energy"] || 0
    );
    res.json(totalRenewableArray);
  } catch (error) {
    console.error("Error fetching total renewable energy data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Get all regions for filter in Map
app.get("/regions", (req, res) => {
  try {
    // Get unique regions from the dataset
    const regions = [...new Set(energyData.map((entry) => entry.Region))];
    res.json(regions);
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Get countries by region for filter in Map
app.get("/countries/:region", (req, res) => {
  const { region } = req.params;
  try {
    const countriesInRegion = energyData.filter(
      (entry) => entry.Region === region
    );
    const countryNames = countriesInRegion.map((entry) => entry.Country);
    res.json(countryNames);
  } catch (error) {
    console.error("Error fetching countries by region:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// API: Get Average Energy Data for Bar chart
app.get("/energy-averages", (req, res) => {
  try {
    const totalCountries = energyData.length;

    if (totalCountries === 0) {
      return res.status(404).json({ error: "No data available" });
    }

    const totalRenewableSum = energyData.reduce(
      (sum, entry) => sum + (entry["Total Renewable"] || 0),
      0
    );
    const totalNonRenewableSum = energyData.reduce(
      (sum, entry) => sum + (entry["Total Non-Renewable"] || 0),
      0
    );
    const totalEnergySum = energyData.reduce(
      (sum, entry) => sum + (entry["Total Energy"] || 0),
      0
    );

    const avgRenewable = totalRenewableSum / totalCountries;
    const avgNonRenewable = totalNonRenewableSum / totalCountries;
    const avgTotalEnergy = totalEnergySum / totalCountries;

    res.json({
      AverageTotalRenewable: avgRenewable,
      AverageTotalNonRenewable: avgNonRenewable,
      AverageTotalEnergy: avgTotalEnergy,
    });
  } catch (error) {
    console.error("Error calculating energy averages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
